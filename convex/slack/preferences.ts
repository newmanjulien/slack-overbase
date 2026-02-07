import { mutation } from "../_generated/server.js";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { userId: v.string(), teamId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("userPreferences", {
      userId: args.userId,
      teamId: args.teamId,
      allowlist: [],
      templateSection: undefined,
      recommendationsPastQuestionsEnabled: true,
      recommendationsSimilarExecsEnabled: true,
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
    templateSection: v.optional(v.string()),
    recommendationsPastQuestionsEnabled: v.optional(v.boolean()),
    recommendationsSimilarExecsEnabled: v.optional(v.boolean()),
    onboardingSent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .first();
    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        teamId: args.teamId,
        allowlist: args.allowlist ?? [],
        templateSection: args.templateSection,
        recommendationsPastQuestionsEnabled: args.recommendationsPastQuestionsEnabled ?? true,
        recommendationsSimilarExecsEnabled: args.recommendationsSimilarExecsEnabled ?? true,
        onboardingSent: args.onboardingSent ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.patch(existing._id, {
      ...(typeof args.allowlist !== "undefined" ? { allowlist: args.allowlist } : {}),
      ...(typeof args.templateSection !== "undefined" ? { templateSection: args.templateSection } : {}),
      ...(typeof args.recommendationsPastQuestionsEnabled === "boolean"
        ? { recommendationsPastQuestionsEnabled: args.recommendationsPastQuestionsEnabled }
        : {}),
      ...(typeof args.recommendationsSimilarExecsEnabled === "boolean"
        ? { recommendationsSimilarExecsEnabled: args.recommendationsSimilarExecsEnabled }
        : {}),
      ...(typeof args.onboardingSent === "boolean" ? { onboardingSent: args.onboardingSent } : {}),
      updatedAt: now,
    });
    return { ok: true };
  },
});
