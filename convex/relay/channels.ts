import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

export const getChannelByTeamUser = query({
  args: { teamId: v.string(), userId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_user_channels")
      .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first(),
});

export const getChannelById = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_user_channels")
      .withIndex("byChannelId", (q) => q.eq("channelId", args.channelId))
      .first(),
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
      .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        channelId: args.channelId,
        channelName: args.channelName,
        updatedAt: now,
      });
      return { ok: true, id: existing._id };
    }
    const id = await ctx.db.insert("relay_user_channels", {
      teamId: args.teamId,
      userId: args.userId,
      channelId: args.channelId,
      channelName: args.channelName,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true, id };
  },
});
