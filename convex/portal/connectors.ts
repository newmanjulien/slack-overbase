import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { requireSession } from "./session.js";

const statusValue = v.union(v.literal("active"), v.literal("inactive"));

export const getAllConnectors = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await requireSession(ctx.db, token);
    const connectors = await ctx.db
      .query("connectors")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
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
    token: v.string(),
    connectorId: v.string(),
    title: v.string(),
    logo: v.optional(v.string()),
    status: statusValue,
  },
  handler: async (ctx, { token, connectorId, title, logo, status }) => {
    const session = await requireSession(ctx.db, token);
    const trimmedId = connectorId.trim();
    const trimmedTitle = title.trim();
    if (!trimmedId) {
      throw new Error("Connector id is required");
    }
    if (!trimmedTitle) {
      throw new Error("Connector title is required");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("connectors")
      .withIndex("byTeamConnector", (q) =>
        q.eq("teamId", session.teamId).eq("connectorId", trimmedId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: trimmedTitle,
        logo,
        status,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("connectors", {
      teamId: session.teamId,
      connectorId: trimmedId,
      title: trimmedTitle,
      logo,
      status,
      createdAt: now,
      updatedAt: now,
    });
  },
});
