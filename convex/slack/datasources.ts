import { mutation } from "../_generated/server.js";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { userId: v.string(), teamId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("datasources")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("datasources", {
      userId: args.userId,
      teamId: args.teamId,
      allowlist: [],
      createdAt: now,
      updatedAt: now,
    });

    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    allowlist: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("datasources")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();
    const now = Date.now();

    if (!existing) {
      await ctx.db.insert("datasources", {
        userId: args.userId,
        teamId: args.teamId,
        allowlist: args.allowlist ?? [],
        createdAt: now,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.patch(existing._id, {
      ...(typeof args.allowlist !== "undefined" ? { allowlist: args.allowlist } : {}),
      updatedAt: now,
    });
    return { ok: true };
  },
});
