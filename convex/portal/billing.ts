import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { requireSession } from "./session.js";

const defaultTiers = [
  {
    tierId: "starter",
    name: "Starter",
    priceLabel: "$0",
    description: "For early testing",
    features: ["Limited usage", "Email support"],
  },
  {
    tierId: "pro",
    name: "Pro",
    priceLabel: "$49",
    description: "For growing teams",
    features: ["Higher usage", "Priority support"],
  },
  {
    tierId: "enterprise",
    name: "Enterprise",
    priceLabel: "Contact us",
    description: "For large organizations",
    features: ["Custom usage", "Dedicated support"],
  },
];

export const getTiers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("tiers").withIndex("byTierId").collect();
  },
});

export const seedTiers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tiers").take(1);
    if (existing.length > 0) {
      return { inserted: 0 };
    }
    const now = Date.now();
    for (const tier of defaultTiers) {
      await ctx.db.insert("tiers", {
        ...tier,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { inserted: defaultTiers.length };
  },
});

export const getBilling = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await requireSession(ctx.db, token);
    const billing = await ctx.db
      .query("billing")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
      .unique();
    if (!billing) {
      return null;
    }
    return { tierId: billing.tierId };
  },
});

export const setTier = mutation({
  args: { token: v.string(), tierId: v.string() },
  handler: async (ctx, { token, tierId }) => {
    const session = await requireSession(ctx.db, token);
    const existing = await ctx.db
      .query("billing")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { tierId, updatedAt: now });
      return existing._id;
    }
    return ctx.db.insert("billing", {
      teamId: session.teamId,
      tierId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
