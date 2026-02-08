import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string(), teamId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("recurring")
      .withIndex("byTeamUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId),
      )
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { userId: v.string(), teamId: v.string(), id: v.id("recurring") },
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
    frequency: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("quarterly")),
    frequencyLabel: v.string(),
    delivery: v.union(
      v.literal("weekly_su"),
      v.literal("weekly_mo"),
      v.literal("weekly_tu"),
      v.literal("weekly_we"),
      v.literal("weekly_th"),
      v.literal("weekly_fr"),
      v.literal("weekly_sa"),
      v.literal("monthly_first_day"),
      v.literal("monthly_first_monday"),
      v.literal("monthly_second_monday"),
      v.literal("monthly_third_monday"),
      v.literal("monthly_fourth_monday"),
      v.literal("monthly_last_day"),
      v.literal("quarterly_first_day"),
      v.literal("quarterly_first_monday"),
      v.literal("quarterly_last_monday"),
      v.literal("quarterly_last_day"),
      v.null(),
    ),
    dataSelection: v.union(
      v.literal("data_prev_week"),
      v.literal("data_prev_month"),
      v.literal("data_prev_two_months"),
      v.literal("data_prev_quarter"),
      v.literal("data_prev_two_quarters"),
      v.literal("data_prev_year"),
      v.null(),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("recurring", {
      userId: args.userId,
      teamId: args.teamId,
      question: args.question,
      title: args.title,
      frequency: args.frequency,
      frequencyLabel: args.frequencyLabel,
      delivery: args.delivery ?? null,
      dataSelection: args.dataSelection ?? null,
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
    id: v.id("recurring"),
    question: v.string(),
    title: v.string(),
    frequency: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("quarterly")),
    frequencyLabel: v.string(),
    delivery: v.union(
      v.literal("weekly_su"),
      v.literal("weekly_mo"),
      v.literal("weekly_tu"),
      v.literal("weekly_we"),
      v.literal("weekly_th"),
      v.literal("weekly_fr"),
      v.literal("weekly_sa"),
      v.literal("monthly_first_day"),
      v.literal("monthly_first_monday"),
      v.literal("monthly_second_monday"),
      v.literal("monthly_third_monday"),
      v.literal("monthly_fourth_monday"),
      v.literal("monthly_last_day"),
      v.literal("quarterly_first_day"),
      v.literal("quarterly_first_monday"),
      v.literal("quarterly_last_monday"),
      v.literal("quarterly_last_day"),
      v.null(),
    ),
    dataSelection: v.union(
      v.literal("data_prev_week"),
      v.literal("data_prev_month"),
      v.literal("data_prev_two_months"),
      v.literal("data_prev_quarter"),
      v.literal("data_prev_two_quarters"),
      v.literal("data_prev_year"),
      v.null(),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Recurring question not found");
    }
    if (existing.teamId !== args.teamId || existing.userId !== args.userId) {
      throw new Error("Recurring question not found");
    }
    await ctx.db.patch(existing._id, {
      question: args.question,
      title: args.title,
      frequency: args.frequency,
      frequencyLabel: args.frequencyLabel,
      delivery: args.delivery ?? null,
      dataSelection: args.dataSelection ?? null,
      updatedAt: Date.now(),
    });
    return ctx.db.get(existing._id);
  },
});

export const remove = mutation({
  args: { userId: v.string(), teamId: v.string(), id: v.id("recurring") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Recurring question not found");
    }
    if (existing.teamId !== args.teamId || existing.userId !== args.userId) {
      throw new Error("Recurring question not found");
    }
    await ctx.db.delete(existing._id);
    return { deleted: true };
  },
});
