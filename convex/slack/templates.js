"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBody = exports.getById = exports.list = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.list = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("templates")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});
exports.getById = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), templateId: values_1.v.string() },
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
exports.updateBody = (0, server_1.mutation)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), templateId: values_1.v.string(), body: values_1.v.string() },
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
