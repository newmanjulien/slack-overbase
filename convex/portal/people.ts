import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { requireSession } from "./session.js";

export const getAllPeople = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await requireSession(ctx.db, token);
    return ctx.db
      .query("people")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
      .collect();
  },
});

export const addPerson = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("ready"), v.literal("waiting"))),
  },
  handler: async (ctx, args) => {
    const session = await requireSession(ctx.db, args.token);
    return ctx.db.insert("people", {
      teamId: session.teamId,
      name: args.name,
      avatarUrl: args.avatarUrl,
      slackUserId: session.slackUserId,
      status: args.status ?? "waiting",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deletePeople = mutation({
  args: { token: v.string(), ids: v.array(v.id("people")) },
  handler: async (ctx, { token, ids }) => {
    const session = await requireSession(ctx.db, token);
    let deleted = 0;
    for (const id of ids) {
      const doc = await ctx.db.get(id);
      if (doc && doc.teamId === session.teamId) {
        await ctx.db.delete(id);
        deleted += 1;
      }
    }
    return { deleted };
  },
});
