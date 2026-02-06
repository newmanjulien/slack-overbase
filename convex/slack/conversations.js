import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
export const listRecentMessages = query({
    args: { userId: v.string(), teamId: v.string(), limit: v.number() },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("conversationMessages")
            .withIndex("byTeamUserCreatedAt", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .order("desc")
            .take(args.limit);
        return messages.reverse();
    },
});
export const addMessage = mutation({
    args: {
        userId: v.string(),
        teamId: v.string(),
        role: v.string(),
        content: v.string(),
        source: v.optional(v.string()),
        hasBot24: v.optional(v.boolean()),
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
export const getMeta = query({
    args: { userId: v.string(), teamId: v.string() },
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
export const updateSummary = mutation({
    args: { userId: v.string(), teamId: v.string(), summary: v.string() },
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
export const updateLastMessageAt = mutation({
    args: { userId: v.string(), teamId: v.string(), lastMessageAt: v.number() },
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
