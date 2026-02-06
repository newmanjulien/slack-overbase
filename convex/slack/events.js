"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimEvent = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.claimEvent = (0, server_1.mutation)({
    args: {
        teamId: values_1.v.string(),
        eventId: values_1.v.string(),
        userId: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("slackEventDedup")
            .withIndex("byTeamEventId", (q) => q.eq("teamId", args.teamId).eq("eventId", args.eventId))
            .first();
        if (existing) {
            return { claimed: false };
        }
        await ctx.db.insert("slackEventDedup", {
            teamId: args.teamId,
            eventId: args.eventId,
            userId: args.userId,
            createdAt: Date.now(),
        });
        return { claimed: true };
    },
});
