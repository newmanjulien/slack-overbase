import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  installations: defineTable({
    teamId: v.string(),
    installation: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  preferences: defineTable({
    userId: v.string(),
    teamId: v.string(),
    allowlist: v.array(v.string()),
    templateSection: v.optional(v.union(v.string(), v.null())),
    recommendPastQuestions: v.boolean(),
    recommendSimilarExecs: v.boolean(),
    onboardingSent: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamUser", ["teamId", "userId"]),

  datasources: defineTable({
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
    category: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamUser", ["teamId", "userId"])
    .index("byTeamUserTemplateId", ["teamId", "userId", "templateId"])
    .index("byTeamUserCategory", ["teamId", "userId", "category"]),

  recurring: defineTable({
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

  // Stores one row per processed Slack event so we can skip duplicates. Slack
  // retries on timeouts or slow responses, which means the same event ID can
  // arrive more than once. The `claimEvent` mutation checks this table before
  // doing any work, inserts a row on first sight, and skips repeats after that.
  dedup: defineTable({
    teamId: v.string(),
    eventId: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("byTeamEventId", ["teamId", "eventId"])
    .index("byCreatedAt", ["createdAt"]),

  codes: defineTable({
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

  sessions: defineTable({
    token: v.string(),
    teamId: v.string(),
    slackUserId: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("byToken", ["token"])
    .index("byTeamUser", ["teamId", "slackUserId"])
    .index("byExpiresAt", ["expiresAt"]),

  people: defineTable({
    teamId: v.string(),
    name: v.string(),
    slackUserId: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("ready"), v.literal("waiting"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  connectors: defineTable({
    teamId: v.string(),
    connectorId: v.string(),
    title: v.string(),
    logo: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamId", ["teamId"])
    .index("byTeamConnectorId", ["teamId", "connectorId"]),

  tiers: defineTable({
    tierId: v.string(),
    name: v.string(),
    priceLabel: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTierId", ["tierId"]),

  billing: defineTable({
    teamId: v.string(),
    tierId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  relay_messages: defineTable({
    teamId: v.string(),
    userId: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    relayKey: v.string(),
    text: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          filename: v.optional(v.string()),
          mimeType: v.optional(v.string()),
          size: v.optional(v.number()),
          sourceFileId: v.optional(v.string()),
          sourceWorkspace: v.optional(v.string()),
        }),
      ),
    ),
    status: v.union(v.literal("queued"), v.literal("delivered"), v.literal("failed")),
    createdAt: v.number(),
    lastSeenAt: v.number(),
    deliveredAt: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    externalId: v.optional(v.string()),
  })
    .index("byRelayKey", ["relayKey"])
    .index("byStatusDirectionCreatedAt", ["status", "direction", "createdAt"])
    .index("byTeamUser", ["teamId", "userId"])
    .index("byExternalId", ["externalId"]),

  relay_user_channels: defineTable({
    teamId: v.string(),
    userId: v.string(),
    channelId: v.string(),
    channelName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("byTeamUser", ["teamId", "userId"])
    .index("byChannelId", ["channelId"]),

  relay_dispatch_locks: defineTable({
    key: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("byKey", ["key"])
    .index("byExpiresAt", ["expiresAt"]),

  relay_rate_limits: defineTable({
    key: v.string(),
    windowMs: v.number(),
    windowStart: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  })
    .index("byKey", ["key"])
    .index("byUpdatedAt", ["updatedAt"]),
});
