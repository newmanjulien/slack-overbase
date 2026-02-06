import { mutation } from "../_generated/server.js";
import { v } from "convex/values";
export const claimEvent = mutation({
    args: {
        teamId: v.string(),
        eventId: v.string(),
        userId: v.optional(v.string()),
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
