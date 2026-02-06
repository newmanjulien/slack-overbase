import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: { teamId: v.string(), installation: v.any() },
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

export const get = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("installations")
      .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
      .first();
    return existing?.installation || null;
  },
});

export const remove = mutation({
  args: { teamId: v.string() },
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
