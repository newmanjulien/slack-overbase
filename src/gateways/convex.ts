import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";
import type { Id } from "../../convex/_generated/dataModel.js";
import { getConfig } from "../lib/config.js";

let cached: ConvexHttpClient | null = null;

const getClient = (): ConvexHttpClient => {
  if (cached) return cached;
  const { CONVEX_URL } = getConfig();
  cached = new ConvexHttpClient(CONVEX_URL);
  return cached;
};

export const convex = {
  conversations: {
    listRecentMessages: (args: {
      userId: string;
      teamId: string;
      limit: number;
    }) => getClient().query(api.slack.conversations.listRecentMessages, args),
    addMessage: (args: {
      userId: string;
      teamId: string;
      role: string;
      content: string;
      source?: string;
      hasBot24?: boolean;
    }) => getClient().mutation(api.slack.conversations.addMessage, args),
    getMeta: (args: { userId: string; teamId: string }) =>
      getClient().query(api.slack.conversations.getMeta, args),
    updateSummary: (args: { userId: string; teamId: string; summary: string }) =>
      getClient().mutation(api.slack.conversations.updateSummary, args),
    updateLastMessageAt: (args: {
      userId: string;
      teamId: string;
      lastMessageAt: number;
    }) => getClient().mutation(api.slack.conversations.updateLastMessageAt, args),
  },
  recurring: {
    list: (args: { userId: string; teamId: string }) =>
      getClient().query(api.slack.recurring.list, args),
    getById: (args: { userId: string; teamId: string; id: Id<"recurringQuestions"> }) =>
      getClient().query(api.slack.recurring.getById, args),
    create: (args: {
      userId: string;
      teamId: string;
      question: string;
      title: string;
      frequency: string;
      frequencyLabel: string;
      delivery?: string;
      dataSelection?: string;
    }) => getClient().mutation(api.slack.recurring.create, args),
    update: (args: {
      userId: string;
      teamId: string;
      id: Id<"recurringQuestions">;
      question?: string;
      title?: string;
      frequency?: string;
      frequencyLabel?: string;
      delivery?: string;
      dataSelection?: string;
    }) => getClient().mutation(api.slack.recurring.update, args),
    remove: (args: { userId: string; teamId: string; id: Id<"recurringQuestions"> }) =>
      getClient().mutation(api.slack.recurring.remove, args),
  },
  templates: {
    list: (args: { userId: string; teamId: string }) =>
      getClient().query(api.slack.templates.list, args),
    getById: (args: { userId: string; teamId: string; templateId: string }) =>
      getClient().query(api.slack.templates.getById, args),
    updateBody: (args: { userId: string; teamId: string; templateId: string; body: string }) =>
      getClient().mutation(api.slack.templates.updateBody, args),
  },
  preferences: {
    getOrCreate: (args: { userId: string; teamId: string }) =>
      getClient().mutation(api.slack.preferences.getOrCreate, args),
    update: (args: {
      userId: string;
      teamId: string;
      allowlist?: string[];
      templateSection?: string;
      recommendationsPastQuestionsEnabled?: boolean;
      recommendationsSimilarExecsEnabled?: boolean;
      onboardingSent?: boolean;
    }) => {
      return getClient().mutation(api.slack.preferences.update, {
        ...args,
      });
    },
  },
  events: {
    claimEvent: (args: { teamId: string; eventId: string; userId?: string }) =>
      getClient().mutation(api.slack.events.claimEvent, args),
  },
  canvas: {
    storeAnswer: (args: {
      userId: string;
      teamId: string;
      canvasId: string;
      questionText?: string;
      markdown?: string;
      summary?: string;
      keyPoints?: string[];
      entities?: string[];
      sentAt: number;
    }) => getClient().mutation(api.slack.canvas.storeAnswer, args),
  },
  installations: {
    store: (args: { teamId: string; installation: unknown }) =>
      getClient().mutation(api.slack.installations.store, args),
    get: (args: { teamId: string }) => getClient().query(api.slack.installations.get, args),
    remove: (args: { teamId: string }) =>
      getClient().mutation(api.slack.installations.remove, args),
  },
  portal: {
    issueOneTimeCode: (args: {
      teamId: string;
      slackUserId: string;
      teamName?: string;
      name?: string;
      avatarUrl?: string;
    }) => getClient().mutation(api.portal.auth.issueOneTimeCode, args),
  },
};
