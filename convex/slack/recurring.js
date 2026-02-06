"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.list = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.list = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("recurringQuestions")
            .withIndex("byTeamUser", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});
exports.getById = (0, server_1.query)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), id: values_1.v.id("recurringQuestions") },
    handler: async (ctx, args) => {
        const record = await ctx.db.get(args.id);
        if (!record)
            return null;
        if (record.teamId !== args.teamId || record.userId !== args.userId) {
            return null;
        }
        return record;
    },
});
exports.create = (0, server_1.mutation)({
    args: {
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        question: values_1.v.string(),
        title: values_1.v.string(),
        frequency: values_1.v.string(),
        frequencyLabel: values_1.v.string(),
        delivery: values_1.v.union(values_1.v.string(), values_1.v.null()),
        dataSelection: values_1.v.union(values_1.v.string(), values_1.v.null()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const id = await ctx.db.insert("recurringQuestions", {
            userId: args.userId,
            teamId: args.teamId,
            question: args.question,
            title: args.title,
            frequency: args.frequency,
            frequencyLabel: args.frequencyLabel,
            delivery: args.delivery,
            dataSelection: args.dataSelection,
            createdAt: now,
            updatedAt: now,
        });
        return { id };
    },
});
exports.update = (0, server_1.mutation)({
    args: {
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        id: values_1.v.id("recurringQuestions"),
        question: values_1.v.optional(values_1.v.string()),
        title: values_1.v.optional(values_1.v.string()),
        frequency: values_1.v.optional(values_1.v.string()),
        frequencyLabel: values_1.v.optional(values_1.v.string()),
        delivery: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        dataSelection: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing)
            return { ok: false };
        if (existing.teamId !== args.teamId || existing.userId !== args.userId) {
            return { ok: false };
        }
        await ctx.db.patch(existing._id, {
            ...(args.question ? { question: args.question } : {}),
            ...(args.title ? { title: args.title } : {}),
            ...(args.frequency ? { frequency: args.frequency } : {}),
            ...(args.frequencyLabel ? { frequencyLabel: args.frequencyLabel } : {}),
            ...(typeof args.delivery !== "undefined" ? { delivery: args.delivery } : {}),
            ...(typeof args.dataSelection !== "undefined" ? { dataSelection: args.dataSelection } : {}),
            updatedAt: Date.now(),
        });
        return { ok: true };
    },
});
exports.remove = (0, server_1.mutation)({
    args: { userId: values_1.v.string(), teamId: values_1.v.string(), id: values_1.v.id("recurringQuestions") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing)
            return { ok: true };
        if (existing.teamId !== args.teamId || existing.userId !== args.userId) {
            return { ok: false };
        }
        await ctx.db.delete(existing._id);
        return { ok: true };
    },
});
