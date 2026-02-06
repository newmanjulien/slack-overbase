import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
export const list = query({
    args: { userId: v.string(), teamId: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("templates")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});
export const getById = query({
    args: { userId: v.string(), teamId: v.string(), templateId: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("templates")
            .withIndex("byTeamUserTemplateId", (q) => q
            .eq("teamId", args.teamId)
            .eq("userId", args.userId)
            .eq("templateId", args.templateId))
            .first();
    },
});
export const updateBody = mutation({
    args: { userId: v.string(), teamId: v.string(), templateId: v.string(), body: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("templates")
            .withIndex("byTeamUserTemplateId", (q) => q
            .eq("teamId", args.teamId)
            .eq("userId", args.userId)
            .eq("templateId", args.templateId))
            .first();
        if (!existing)
            return { ok: false };
        await ctx.db.patch(existing._id, {
            body: args.body,
            updatedAt: new Date().toISOString(),
            updatedAtMs: Date.now(),
        });
        return { ok: true };
    },
});
