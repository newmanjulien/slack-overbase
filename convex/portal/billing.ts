import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

const seedData = [
  {
    tierId: "starter",
    name: "Starter",
    priceLabel: "$49",
    description: "For small teams getting started.",
    features: ["Answer up to 100 questions", "Slack support", "Core templates"],
  },
  {
    tierId: "growth",
    name: "Growth",
    priceLabel: "$199",
    description: "For growing teams with more volume.",
    features: ["Answer up to 1,000 questions", "Priority support", "All templates"],
  },
  {
    tierId: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    description: "For large teams with custom needs.",
    features: ["Unlimited questions", "Dedicated support", "Custom onboarding"],
  },
];

export const getTiers = query({
  args: {},
  handler: async (ctx) => {
    const tiers = await ctx.db.query("tiers").collect();
    return tiers
      .map((tier) => ({
        tierId: tier.tierId,
        name: tier.name,
        priceLabel: tier.priceLabel,
        description: tier.description,
        features: tier.features,
      }))
      .sort((a, b) => a.tierId.localeCompare(b.tierId));
  },
});

export const seedTiers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tiers").collect();
    if (existing.length > 0) {
      return { inserted: 0 };
    }
    const now = Date.now();
    await Promise.all(
      seedData.map((tier) =>
        ctx.db.insert("tiers", {
          ...tier,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
    return { inserted: seedData.length };
  },
});

export const getBilling = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, { teamId }) => {
    const billing = await ctx.db
      .query("billing")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .first();

    if (!billing) {
      return null;
    }

    return { tierId: billing.tierId };
  },
});

export const setTier = mutation({
  args: {
    teamId: v.string(),
    tierId: v.string(),
    updatedBySlackUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const tier = await ctx.db
      .query("tiers")
      .withIndex("byTierId", (q) => q.eq("tierId", args.tierId))
      .unique();

    if (!tier) {
      throw new Error("Unknown tier");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("billing")
      .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tierId: args.tierId,
        updatedBySlackUserId: args.updatedBySlackUserId,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("billing", {
      teamId: args.teamId,
      tierId: args.tierId,
      updatedBySlackUserId: args.updatedBySlackUserId,
      updatedAt: now,
    });
  },
});
