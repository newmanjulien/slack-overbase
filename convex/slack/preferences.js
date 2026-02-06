"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getOrCreate = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.getOrCreate = (0, server_1.mutation)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userPreferences")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        if (existing)
            return existing;
        const now = Date.now();
        const id = await ctx.db.insert("userPreferences", {
            userId: args.userId,
            teamId: args.teamId,
            allowlist: [],
            homeTab: "welcome",
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
exports.update = (0, server_1.mutation)({
    args: {
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        allowlist: values_1.v.optional(values_1.v.array(values_1.v.string())),
        homeTab: values_1.v.optional(values_1.v.string()),
        templateSection: values_1.v.optional(values_1.v.string()),
        recommendationsPastQuestionsEnabled: values_1.v.optional(values_1.v.boolean()),
        recommendationsSimilarExecsEnabled: values_1.v.optional(values_1.v.boolean()),
        onboardingSent: values_1.v.optional(values_1.v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userPreferences")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        const now = Date.now();
        if (!existing) {
            await ctx.db.insert("userPreferences", {
                userId: args.userId,
                teamId: args.teamId,
                allowlist: args.allowlist ?? [],
                homeTab: args.homeTab ?? "welcome",
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
            ...(typeof args.homeTab !== "undefined" ? { homeTab: args.homeTab } : {}),
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
