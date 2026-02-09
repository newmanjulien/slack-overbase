import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

const statusValue = v.union(v.literal("ready"), v.literal("waiting"));

export const getAllPeople = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, { teamId }) => {
    const people = await ctx.db
      .query("people")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    return people.map((person) => ({
      _id: person._id,
      name: person.name,
      slackUserId: person.slackUserId,
      avatarUrl: person.avatarUrl ?? null,
      status: person.status ?? null,
    }));
  },
});

export const addPerson = mutation({
  args: {
    teamId: v.string(),
    slackUserId: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.optional(statusValue),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }
    const now = Date.now();
    const id = await ctx.db.insert("people", {
      teamId: args.teamId,
      slackUserId: args.slackUserId,
      name,
      avatarUrl: args.avatarUrl,
      status: args.status ?? "ready",
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const deletePeople = mutation({
  args: {
    teamId: v.string(),
    ids: v.array(v.id("people")),
  },
  handler: async (ctx, { teamId, ids }) => {
    let deleted = 0;
    for (const id of ids) {
      const person = await ctx.db.get(id);
      if (!person || person.teamId !== teamId) {
        continue;
      }
      await ctx.db.delete(id);
      deleted += 1;
    }
    return { deleted };
  },
});
