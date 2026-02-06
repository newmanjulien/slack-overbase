import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  installations: defineTable({
    teamId: v.string(),
    installation: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  userPreferences: defineTable({
    userId: v.string(),
    teamId: v.string(),
    allowlist: v.array(v.string()),
    homeTab: v.string(),
    templateSection: v.optional(v.string()),
    recommendationsPastQuestionsEnabled: v.boolean(),
    recommendationsSimilarExecsEnabled: v.boolean(),
    onboardingSent: v.boolean(),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  conversationMessages: defineTable({
    userId: v.string(),
    teamId: v.string(),
    role: v.string(),
    content: v.string(),
    source: v.optional(v.string()),
    hasBot24: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("byTeamUserCreatedAt", ["teamId", "userId", "createdAt"]),

  conversations: defineTable({
    userId: v.string(),
    teamId: v.string(),
    summary: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  templates: defineTable({
    userId: v.string(),
    teamId: v.string(),
    templateId: v.string(),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    audiences: v.array(v.string()),
    updatedAt: v.string(),
    createdAt: v.number(),
    updatedAtMs: v.number(),
  })
    .index("byTeamUser", ["teamId", "userId"])
    .index("byTeamUserTemplateId", ["teamId", "userId", "templateId"]),

  recurringQuestions: defineTable({
    userId: v.string(),
    teamId: v.string(),
    question: v.string(),
    title: v.string(),
    frequency: v.string(),
    frequencyLabel: v.string(),
    delivery: v.union(v.string(), v.null()),
    dataSelection: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  canvasAnswers: defineTable({
    canvasId: v.string(),
    userId: v.string(),
    teamId: v.string(),
    sentAt: v.number(),
    questionText: v.optional(v.string()),
    markdown: v.optional(v.string()),
    summary: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    entities: v.optional(v.array(v.string())),
  }).index("byTeamUserSentAt", ["teamId", "userId", "sentAt"]),

  slackEventDedup: defineTable({
    teamId: v.string(),
    eventId: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("byTeamEventId", ["teamId", "eventId"]),

  oneTimeCodes: defineTable({
    code: v.string(),
    teamId: v.string(),
    slackUserId: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_team_user", ["teamId", "slackUserId"]),
});
