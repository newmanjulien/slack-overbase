import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

const statusValue = v.union(v.literal("active"), v.literal("inactive"));

export const getAllConnectors = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, { teamId }) => {
    const connectors = await ctx.db
      .query("connectors")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    return connectors.map((connector) => ({
      _id: connector._id,
      connectorId: connector.connectorId,
      title: connector.title,
      logo: connector.logo ?? null,
      status: connector.status,
    }));
  },
});

export const upsertConnector = mutation({
  args: {
    teamId: v.string(),
    connectorId: v.string(),
    title: v.string(),
    logo: v.optional(v.string()),
    status: statusValue,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("connectors")
      .withIndex("byTeamConnector", (q) =>
        q.eq("teamId", args.teamId).eq("connectorId", args.connectorId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        logo: args.logo,
        status: args.status,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("connectors", {
      teamId: args.teamId,
      connectorId: args.connectorId,
      title: args.title,
      logo: args.logo,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});
