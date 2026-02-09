import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { requireSession } from "./session.js";

const statusValue = v.union(v.literal("ready"), v.literal("waiting"));

export const getAllPeople = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await requireSession(ctx.db, token);
    const people = await ctx.db
      .query("people")
      .withIndex("byTeamId", (q) => q.eq("teamId", session.teamId))
      .collect();

    return people.map((person) => ({
      _id: person._id,
      name: person.name,
      slackUserId: person.slackUserId ?? null,
      avatarUrl: person.avatarUrl ?? null,
      status: person.status ?? null,
    }));
  },
});

export const addPerson = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.optional(statusValue),
  },
  handler: async (ctx, { token, name, avatarUrl, status }) => {
    const session = await requireSession(ctx.db, token);
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 80) {
      throw new Error("Name is required");
    }
    const now = Date.now();
    const id = await ctx.db.insert("people", {
      teamId: session.teamId,
      slackUserId: undefined,
      name: trimmed,
      avatarUrl,
      status: status ?? "ready",
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const deletePeople = mutation({
  args: {
    token: v.string(),
    ids: v.array(v.id("people")),
  },
  handler: async (ctx, { token, ids }) => {
    if (ids.length < 1 || ids.length > 100) {
      throw new Error("Invalid ids");
    }
    const session = await requireSession(ctx.db, token);
    let deleted = 0;
    for (const id of ids) {
      const person = await ctx.db.get(id);
      if (!person || person.teamId !== session.teamId) {
        continue;
      }
      await ctx.db.delete(id);
      deleted += 1;
    }
    return { deleted };
  },
});
