import type { DatabaseReader, DatabaseWriter } from "../_generated/server.js";
import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { seedTemplates } from "./templatesSeed.js";

const listUserTemplates = async (db: DatabaseReader, userId: string, teamId: string) => {
  return db
    .query("templates")
    .withIndex("byTeamUser", (q) => q.eq("teamId", teamId).eq("userId", userId))
    .collect();
};

const listUserTemplatesByCategory = async (
  db: DatabaseReader,
  userId: string,
  teamId: string,
  category: string,
) => {
  if (category === "all") {
    return listUserTemplates(db, userId, teamId);
  }
  return db
    .query("templates")
    .withIndex("byTeamUserCategory", (q) =>
      q.eq("teamId", teamId).eq("userId", userId).eq("category", category),
    )
    .collect();
};

const findUserTemplate = async (
  db: DatabaseReader,
  userId: string,
  teamId: string,
  templateId: string,
) => {
  return db
    .query("templates")
    .withIndex("byTeamUserTemplateId", (q) =>
      q.eq("teamId", teamId).eq("userId", userId).eq("templateId", templateId),
    )
    .first();
};

const seedUserTemplates = async (db: DatabaseWriter, userId: string, teamId: string) => {
  const now = Date.now();
  for (const template of seedTemplates) {
    await db.insert("templates", {
      userId,
      teamId,
      templateId: template.templateId,
      title: template.title,
      summary: template.summary,
      body: template.body,
      category: template.category,
      createdAt: now,
      updatedAt: now,
    });
  }
};

export const getOrCreateUserTemplates = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await listUserTemplates(ctx.db, args.userId, args.teamId);
    if (existing.length === 0) {
      await seedUserTemplates(ctx.db, args.userId, args.teamId);
    }
    return listUserTemplatesByCategory(ctx.db, args.userId, args.teamId, args.category);
  },
});

export const list = query({
  args: { userId: v.string(), teamId: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    return listUserTemplatesByCategory(ctx.db, args.userId, args.teamId, args.category);
  },
});

export const getById = query({
  args: { userId: v.string(), teamId: v.string(), templateId: v.string() },
  handler: async (ctx, args) => {
    return findUserTemplate(ctx.db, args.userId, args.teamId, args.templateId);
  },
});

export const updateBody = mutation({
  args: { userId: v.string(), teamId: v.string(), templateId: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    let existing = await findUserTemplate(ctx.db, args.userId, args.teamId, args.templateId);
    if (!existing) {
      const seeded = await listUserTemplates(ctx.db, args.userId, args.teamId);
      if (seeded.length === 0) {
        await seedUserTemplates(ctx.db, args.userId, args.teamId);
      }
      existing = await findUserTemplate(ctx.db, args.userId, args.teamId, args.templateId);
    }

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      body: args.body,
      updatedAt: Date.now(),
    });
    return ctx.db.get(existing._id);
  },
});
