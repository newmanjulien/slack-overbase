"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLastMessageAt = exports.updateSummary = exports.getMeta = exports.addMessage = exports.listRecentMessages = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.listRecentMessages = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), limit: values_1.v.number() },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("conversationMessages")
            .withIndex("byTeamUserCreatedAt", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .order("desc")
            .take(args.limit);
        return messages.reverse();
    },
});
exports.addMessage = (0, server_1.mutation)({
    args: {
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        role: values_1.v.string(),
        content: values_1.v.string(),
        source: values_1.v.optional(values_1.v.string()),
        hasBot24: values_1.v.optional(values_1.v.boolean()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("conversationMessages", {
            userId: args.userId,
            teamId: args.teamId,
            role: args.role,
            content: args.content,
            source: args.source,
            hasBot24: args.hasBot24,
            createdAt: Date.now(),
        });
    },
});
exports.getMeta = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("conversations")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        return {
            summary: existing?.summary || "",
            lastMessageAt: existing?.lastMessageAt || null,
        };
    },
});
exports.updateSummary = (0, server_1.mutation)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), summary: values_1.v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("conversations")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        const now = Date.now();
        if (!existing) {
            await ctx.db.insert("conversations", {
                userId: args.userId,
                teamId: args.teamId,
                summary: args.summary,
                lastMessageAt: undefined,
                createdAt: now,
                updatedAt: now,
            });
            return;
        }
        await ctx.db.patch(existing._id, {
            summary: args.summary,
            updatedAt: now,
        });
    },
});
exports.updateLastMessageAt = (0, server_1.mutation)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), lastMessageAt: values_1.v.number() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("conversations")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        const now = Date.now();
        if (!existing) {
            await ctx.db.insert("conversations", {
                userId: args.userId,
                teamId: args.teamId,
                summary: "",
                lastMessageAt: args.lastMessageAt,
                createdAt: now,
                updatedAt: now,
            });
            return;
        }
        await ctx.db.patch(existing._id, {
            lastMessageAt: args.lastMessageAt,
            updatedAt: now,
        });
    },
});
