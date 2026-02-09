import { mutation } from "../_generated/server.js";
import { v } from "convex/values";

// Slack uses at-least-once delivery and will retry on timeouts, network errors,
// or slow 2xx responses. That means the same event ID can show up again
// (sometimes minutes later or in parallel). We record (teamId, eventId) in
// `dedup` (indexed by `byTeamEventId`) so the first delivery runs and
// later deliveries get skipped. This is the only reliable, server-side way to
// avoid duplicate side effects across retries or restarts. `claimEvent`
// implements that gate: it checks for an existing record, inserts one if none
// exists, and returns whether the caller should proceed (`claimed: true`) or
// stop (`claimed: false`).
export const claimEvent = mutation({
  args: {
    teamId: v.string(),
    eventId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dedup")
      .withIndex("byTeamEventId", (q) =>
        q.eq("teamId", args.teamId).eq("eventId", args.eventId),
      )
      .first();

    if (existing) {
      return { claimed: false };
    }

    await ctx.db.insert("dedup", {
      teamId: args.teamId,
      eventId: args.eventId,
      userId: args.userId,
      createdAt: Date.now(),
    });

    return { claimed: true };
  },
});
