import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const MAX_HISTORY = 24;

export const listRecentMessages = async (
  userId: string,
  teamContext: TeamContext,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const messages = await client.query(api.slack.conversations.listRecentMessages, {
    userId,
    teamId: teamContext.teamId,
    limit: MAX_HISTORY,
  });
  return Array.isArray(messages)
    ? messages.map((message) => ({
        role: message.role as ConversationMessage["role"],
        content: message.content as string,
      }))
    : [];
};

export const addMessage = async (
  userId: string,
  teamContext: TeamContext,
  message: ConversationMessage & { source?: string; hasBot24?: boolean },
) => {
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
) => {
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
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  await client.mutation(api.slack.conversations.updateLastMessageAt, {
    userId,
    teamId: teamContext.teamId,
    lastMessageAt: timestamp,
  });
};
