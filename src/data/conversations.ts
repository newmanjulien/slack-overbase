import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const MAX_HISTORY = 24;
const isConversationRole = (value: unknown): value is ConversationMessage["role"] =>
  value === "user" || value === "assistant" || value === "system";

export const listRecentMessages = async (
  userId: string,
  teamContext: TeamContext,
): Promise<ConversationMessage[]> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const messages = await client.query(api.slack.conversations.listRecentMessages, {
    userId,
    teamId: teamContext.teamId,
    limit: MAX_HISTORY,
  });
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => ({
      role: isConversationRole(message.role) ? message.role : null,
      content: typeof message.content === "string" ? message.content : "",
    }))
    .filter(
      (message): message is ConversationMessage =>
        Boolean(message.role) && message.content.length > 0,
    );
};

export const addMessage = async (
  userId: string,
  teamContext: TeamContext,
  message: ConversationMessage & { source?: string; hasBot24?: boolean },
): Promise<void> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  await client.mutation(api.slack.conversations.addMessage, {
    userId,
    teamId: teamContext.teamId,
    role: message.role,
    content: message.content,
    source: message.source,
    hasBot24: message.hasBot24 ? true : undefined,
  });
};

export const getConversationMeta = async (
  userId: string,
  teamContext: TeamContext,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const result = await client.query(api.slack.conversations.getMeta, {
    userId,
    teamId: teamContext.teamId,
  });
  return {
    summary: typeof result?.summary === "string" ? result.summary : "",
    lastMessageAt: typeof result?.lastMessageAt === "number" ? result.lastMessageAt : null,
  };
};

export const updateConversationSummary = async (
  userId: string,
  teamContext: TeamContext,
  summary: string,
): Promise<void> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  await client.mutation(api.slack.conversations.updateSummary, {
    userId,
    teamId: teamContext.teamId,
    summary,
  });
};

export const updateLastMessageAt = async (
  userId: string,
  teamContext: TeamContext,
  timestamp: number,
): Promise<void> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  await client.mutation(api.slack.conversations.updateLastMessageAt, {
    userId,
    teamId: teamContext.teamId,
    lastMessageAt: timestamp,
  });
};
