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
    templateSection: v.optional(v.string()),
    recommendPastQuestions: v.boolean(),
    recommendSimilarExecs: v.boolean(),
    onboardingSent: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  userDatasources: defineTable({
    userId: v.string(),
    teamId: v.string(),
    allowlist: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("byTeamUser", ["teamId", "userId"]),

  templates: defineTable({
    userId: v.string(),
    teamId: v.string(),
    templateId: v.string(),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    audiences: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
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
    delivery: v.optional(v.string()),
    dataSelection: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  canvasAnswers: defineTable({
    canvasId: v.string(),
    userId: v.string(),
    teamId: v.string(),
    questionText: v.optional(v.string()),
    markdown: v.optional(v.string()),
    summary: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    entities: v.optional(v.array(v.string())),
    sentAt: v.number(),
  }).index("byTeamUserSentAt", ["teamId", "userId", "sentAt"]),

  // Stores one row per processed Slack event so we can skip duplicates. Slack
  // retries on timeouts or slow responses, which means the same event ID can
  // arrive more than once. The `claimEvent` mutation checks this table before
  // doing any work, inserts a row on first sight, and skips repeats after that.
  slackEventDedup: defineTable({
    teamId: v.string(),
    eventId: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("byTeamEventId", ["teamId", "eventId"]),

  oneTimeCodes: defineTable({
    teamId: v.string(),
    slackUserId: v.string(),
    code: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("byCode", ["code"])
    .index("byTeamUser", ["teamId", "slackUserId"])
    .index("byExpiresAt", ["expiresAt"]),
});
