"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.get = exports.store = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.store = (0, server_1.mutation)({
    args: { teamId: values_1.v.string(), installation: values_1.v.any() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("installations")
            .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
            .first();
        const now = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                installation: args.installation,
                updatedAt: now,
            });
            return { ok: true, id: existing._id };
        }
        const id = await ctx.db.insert("installations", {
            teamId: args.teamId,
            installation: args.installation,
            createdAt: now,
            updatedAt: now,
        });
        return { ok: true, id };
    },
});
exports.get = (0, server_1.query)({
    args: { teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("installations")
            .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
            .first();
        return existing?.installation || null;
    },
});
exports.remove = (0, server_1.mutation)({
    args: { teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("installations")
            .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
            .first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
        return { ok: true };
    },
});
