import { getOpenAIClient } from "../../lib/openai.js";
import { extractOutputText } from "../../lib/openaiResponse.js";
import {
  addMessage,
  getConversationMeta,
  listRecentMessages,
  updateConversationSummary,
  updateLastMessageAt,
  ConversationMessage,
} from "../../data/conversations.js";
import { getDatasourcesForUser } from "../datasources/index.js";
import { SYSTEM_PROMPT, SUMMARY_PROMPT } from "./prompt.js";
import { logger } from "../../lib/logger.js";
import { TeamContext } from "../../lib/teamContext.js";
import type { ResponseInputItem } from "openai/resources/responses/responses";

const HISTORY_WINDOW = 10;
const SUMMARY_DEBOUNCE_MS = 60_000;
const summaryQueue = new Map<string, { inFlight: boolean; lastScheduledAt: number }>();

const buildSummaryKey = (userId: string, teamContext: TeamContext) =>
  `${teamContext.teamId}:${userId}`;

const systemMessage = (content: string): ConversationMessage => ({
  role: "system",
  content,
});

const toResponseInputItems = (messages: ConversationMessage[]): ResponseInputItem[] =>
  messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

const userMessage = (content: string): ResponseInputItem => ({
  role: "user",
  content,
});

const summarizeHistory = async (
  existingSummary: string,
  olderMessages: ConversationMessage[],
) => {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      systemMessage(SUMMARY_PROMPT),
      ...(existingSummary
        ? [systemMessage(`Existing summary: ${existingSummary}`)]
        : []),
      ...toResponseInputItems(olderMessages),
    ],
  });
  return extractOutputText(response);
};

const formatDatasourcesContext = (datasources: {
  connectors?: Array<{ id: string; name?: string; type?: string }>;
  people?: Array<{ id: string; name?: string; role?: string }>;
} | null) => {
  if (!datasources) return "User datasources: none.";
  const connectors = datasources.connectors ?? [];
  const people = datasources.people ?? [];
  if (connectors.length === 0 && people.length === 0) {
    return "User datasources: none.";
  }
  const connectorList = connectors
    .map((connector) => [connector.name, connector.type].filter(Boolean).join(" - "))
    .filter(Boolean);
  const peopleList = people
    .map((person) => [person.name, person.role].filter(Boolean).join(" - "))
    .filter(Boolean);
  const connectorLine = connectorList.length
    ? `Connectors: ${connectorList.join(", ")}.`
    : "Connectors: none.";
  const peopleLine = peopleList.length
    ? `People: ${peopleList.join(", ")}.`
    : "People: none.";
  return `User datasources. ${connectorLine} ${peopleLine}`.trim();
};

export const handleDirectMessage = async (payload: {
  userId: string;
  teamContext: TeamContext;
  text: string;
  source?: string;
}) => {
  const { userId, teamContext, text, source } = payload;
  const [history, meta, datasources] = await Promise.all([
    listRecentMessages(userId, teamContext),
    getConversationMeta(userId, teamContext),
    getDatasourcesForUser(userId, teamContext),
  ]);

  const summary = meta.summary;
  let historyForLlm: ConversationMessage[] = history;

  if (history.length > HISTORY_WINDOW) {
    const older = history.slice(0, -HISTORY_WINDOW);
    const recent = history.slice(-HISTORY_WINDOW);

    const summaryKey = buildSummaryKey(userId, teamContext);
    const summaryState = summaryQueue.get(summaryKey) || {
      inFlight: false,
      lastScheduledAt: 0,
    };
    const nowMs = Date.now();

    if (!summaryState.inFlight && nowMs - summaryState.lastScheduledAt > SUMMARY_DEBOUNCE_MS) {
      summaryState.inFlight = true;
      summaryState.lastScheduledAt = nowMs;
      summaryQueue.set(summaryKey, summaryState);

      setImmediate(() => {
        summarizeHistory(summary, older)
          .then((updated) => {
            if (updated && updated !== summary) {
              return updateConversationSummary(userId, teamContext, updated);
            }
            return null;
          })
          .catch((error) => {
            logger.warn({ error }, "Conversation summarization failed");
          })
          .finally(() => {
            const latest = summaryQueue.get(summaryKey);
            if (latest) {
              latest.inFlight = false;
              summaryQueue.set(summaryKey, latest);
            }
          });
      });
    }

    historyForLlm = [
      ...(summary ? [systemMessage(`Conversation summary: ${summary}`)] : []),
      ...recent,
    ];
  } else if (summary) {
    historyForLlm = [systemMessage(`Conversation summary: ${summary}`), ...history];
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      systemMessage(SYSTEM_PROMPT),
      systemMessage(formatDatasourcesContext(datasources)),
      ...toResponseInputItems(historyForLlm),
      userMessage(text),
    ],
  });

  const reply = extractOutputText(response) || "Sorry, I could not generate a response just now.";

  await addMessage(userId, teamContext, {
    role: "user",
    content: text,
    source,
  });
  await addMessage(userId, teamContext, {
    role: "assistant",
    content: reply,
    source,
    hasBot24: reply.includes("24"),
  });
  await updateLastMessageAt(userId, teamContext, Date.now());

  return reply;
};
