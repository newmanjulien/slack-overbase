"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    installations: (0, server_1.defineTable)({
        teamId: values_1.v.string(),
        installation: values_1.v.any(),
        createdAt: values_1.v.number(),
        updatedAt: values_1.v.number(),
    }).index("byTeamId", ["teamId"]),
    userPreferences: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        allowlist: values_1.v.array(values_1.v.string()),
        homeTab: values_1.v.string(),
        templateSection: values_1.v.optional(values_1.v.string()),
        recommendationsPastQuestionsEnabled: values_1.v.boolean(),
        recommendationsSimilarExecsEnabled: values_1.v.boolean(),
        onboardingSent: values_1.v.boolean(),
        updatedAt: values_1.v.number(),
        createdAt: values_1.v.number(),
    }).index("byTeamUser", ["teamId", "userId"]),
    conversationMessages: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        role: values_1.v.string(),
        content: values_1.v.string(),
        source: values_1.v.optional(values_1.v.string()),
        hasBot24: values_1.v.optional(values_1.v.boolean()),
        createdAt: values_1.v.number(),
    }).index("byTeamUserCreatedAt", ["teamId", "userId", "createdAt"]),
    conversations: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        summary: values_1.v.optional(values_1.v.string()),
        lastMessageAt: values_1.v.optional(values_1.v.number()),
        updatedAt: values_1.v.number(),
        createdAt: values_1.v.number(),
    }).index("byTeamUser", ["teamId", "userId"]),
    templates: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        templateId: values_1.v.string(),
        title: values_1.v.string(),
        summary: values_1.v.string(),
        body: values_1.v.string(),
        audiences: values_1.v.array(values_1.v.string()),
        updatedAt: values_1.v.string(),
        createdAt: values_1.v.number(),
        updatedAtMs: values_1.v.number(),
    })
        .index("byTeamUser", ["teamId", "userId"])
        .index("byTeamUserTemplateId", ["teamId", "userId", "templateId"]),
    recurringQuestions: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        question: values_1.v.string(),
        title: values_1.v.string(),
        frequency: values_1.v.string(),
        frequencyLabel: values_1.v.string(),
        delivery: values_1.v.union(values_1.v.string(), values_1.v.null()),
        dataSelection: values_1.v.union(values_1.v.string(), values_1.v.null()),
        createdAt: values_1.v.number(),
        updatedAt: values_1.v.number(),
    }).index("byTeamUser", ["teamId", "userId"]),
    canvasAnswers: (0, server_1.defineTable)({
        canvasId: values_1.v.string(),
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        sentAt: values_1.v.number(),
        questionText: values_1.v.optional(values_1.v.string()),
        markdown: values_1.v.optional(values_1.v.string()),
        summary: values_1.v.optional(values_1.v.string()),
        keyPoints: values_1.v.optional(values_1.v.array(values_1.v.string())),
        entities: values_1.v.optional(values_1.v.array(values_1.v.string())),
    }).index("byTeamUserSentAt", ["teamId", "userId", "sentAt"]),
    slackEventDedup: (0, server_1.defineTable)({
        teamId: values_1.v.string(),
        eventId: values_1.v.string(),
        userId: values_1.v.optional(values_1.v.string()),
        createdAt: values_1.v.number(),
    }).index("byTeamEventId", ["teamId", "eventId"]),
    oneTimeCodes: (0, server_1.defineTable)({
        code: values_1.v.string(),
        teamId: values_1.v.string(),
        slackUserId: values_1.v.string(),
        issuedAt: values_1.v.number(),
        expiresAt: values_1.v.number(),
        usedAt: values_1.v.optional(values_1.v.number()),
    })
        .index("by_code", ["code"])
        .index("by_team_user", ["teamId", "slackUserId"]),
});
