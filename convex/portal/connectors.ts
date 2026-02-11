import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { requireSession } from "./session.js";

export const getAllConnectors = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await requireSession(ctx.db, token);
    return ctx.db
      .query("connectors")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
      .collect();
  },
});

export const upsertConnector = mutation({
  args: {
    token: v.string(),
    connectorId: v.string(),
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireSession(ctx.db, args.token);
    const existing = await ctx.db
      .query("connectors")
      .withIndex("byTeamConnectorId", (q) =>
        q.eq("teamId", session.teamId).eq("connectorId", args.connectorId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        status: args.status,
        logo: args.logo,
        updatedAt: now,
      });
      return existing._id;
    }
    return ctx.db.insert("connectors", {
      teamId: session.teamId,
      connectorId: args.connectorId,
      title: args.title,
      status: args.status,
      logo: args.logo,
      createdAt: now,
      updatedAt: now,
    });
  },
});
