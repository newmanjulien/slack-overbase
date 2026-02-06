import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string(), teamId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("recurringQuestions")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { userId: v.string(), teamId: v.string(), id: v.id("recurringQuestions") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) return null;
    if (record.teamId !== args.teamId || record.userId !== args.userId) {
      return null;
    }
    return record;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    question: v.string(),
    title: v.string(),
    frequency: v.string(),
    frequencyLabel: v.string(),
    delivery: v.union(v.string(), v.null()),
    dataSelection: v.union(v.string(), v.null()),
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

export const update = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    id: v.id("recurringQuestions"),
    question: v.optional(v.string()),
    title: v.optional(v.string()),
    frequency: v.optional(v.string()),
    frequencyLabel: v.optional(v.string()),
    delivery: v.optional(v.union(v.string(), v.null())),
    dataSelection: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return { ok: false };
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

export const remove = mutation({
  args: { userId: v.string(), teamId: v.string(), id: v.id("recurringQuestions") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return { ok: true };
    if (existing.teamId !== args.teamId || existing.userId !== args.userId) {
      return { ok: false };
    }
    await ctx.db.delete(existing._id);
    return { ok: true };
  },
});
