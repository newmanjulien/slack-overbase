import { mutation } from "../_generated/server.js";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { userId: v.string(), teamId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preferences")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("preferences", {
      userId: args.userId,
      teamId: args.teamId,
      allowlist: [],
      templateSection: null,
      recommendPastQuestions: true,
      recommendSimilarExecs: true,
      onboardingSent: false,
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
    templateSection: v.optional(v.union(v.string(), v.null())),
    recommendPastQuestions: v.optional(v.boolean()),
    recommendSimilarExecs: v.optional(v.boolean()),
    onboardingSent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preferences")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();
    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("preferences", {
        userId: args.userId,
      teamId: args.teamId,
      allowlist: args.allowlist ?? [],
      templateSection: typeof args.templateSection === "undefined" ? null : args.templateSection,
      recommendPastQuestions: args.recommendPastQuestions ?? true,
      recommendSimilarExecs: args.recommendSimilarExecs ?? true,
      onboardingSent: args.onboardingSent ?? false,
      createdAt: now,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.patch(existing._id, {
      ...(typeof args.allowlist !== "undefined" ? { allowlist: args.allowlist } : {}),
      ...(typeof args.templateSection !== "undefined" ? { templateSection: args.templateSection } : {}),
      ...(typeof args.recommendPastQuestions === "boolean"
        ? { recommendPastQuestions: args.recommendPastQuestions }
        : {}),
      ...(typeof args.recommendSimilarExecs === "boolean"
        ? { recommendSimilarExecs: args.recommendSimilarExecs }
        : {}),
      ...(typeof args.onboardingSent === "boolean" ? { onboardingSent: args.onboardingSent } : {}),
      updatedAt: now,
    });
    return { ok: true };
  },
});
