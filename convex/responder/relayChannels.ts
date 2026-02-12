import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

export const getChannelByTeamUser = query({
  args: { teamId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("relay_user_channels")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();
  },
});

export const setChannelForTeamUser = mutation({
  args: {
    teamId: v.string(),
    userId: v.string(),
    channelId: v.string(),
    channelName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("relay_user_channels")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();

    if (!existing) {
      const id = await ctx.db.insert("relay_user_channels", {
        teamId: args.teamId,
        userId: args.userId,
        channelId: args.channelId,
        channelName: args.channelName,
        createdAt: Date.now(),
      });
      return { ok: true, id };
    }

    await ctx.db.patch(existing._id, {
      channelId: args.channelId,
      channelName: args.channelName ?? existing.channelName,
    });
    return { ok: true, id: existing._id };
  },
});
