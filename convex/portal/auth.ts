import { internalMutation, mutation, query } from "../_generated/server.js";
import { v } from "convex/values";
import { getValidSession } from "./session.js";

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const generateCode = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}${random}`;
};

const generateToken = () => {
  const random = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36);
  return `${time}${random}`;
};

export const issueCode = mutation({
  args: {
    teamId: v.string(),
    slackUserId: v.string(),
    teamName: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = generateCode();
    const now = Date.now();
    await ctx.db.insert("codes", {
      code,
      teamId: args.teamId,
      slackUserId: args.slackUserId,
      issuedAt: now,
      expiresAt: now + CODE_TTL_MS,
      usedAt: undefined,
    });
    return { code };
  },
});

export const consumeCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, { code }) => {
    const now = Date.now();
    const match = await ctx.db
      .query("codes")
      .withIndex("byCode", (q) => q.eq("code", code))
      .unique();

    if (!match) {
      throw new Error("Invalid code");
    }

    if (match.usedAt) {
      throw new Error("Code already used");
    }

    if (match.expiresAt <= now) {
      throw new Error("Code expired");
    }

    await ctx.db.patch(match._id, { usedAt: now });

    const token = generateToken();
    const expiresAt = now + SESSION_TTL_MS;
    await ctx.db.insert("sessions", {
      token,
      teamId: match.teamId,
      slackUserId: match.slackUserId,
      issuedAt: now,
      expiresAt,
      revokedAt: undefined,
    });

    return {
      token,
      expiresAt,
      teamId: match.teamId,
      slackUserId: match.slackUserId,
    };
  },
});

export const getSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    return getValidSession(ctx.db, token);
  },
});

export const cleanupExpiredCodes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let deleted = 0;
    while (true) {
      const expired = await ctx.db
        .query("codes")
        .withIndex("byExpiresAt", (q) => q.lt("expiresAt", now))
        .take(100);
      if (expired.length === 0) {
        break;
      }
      for (const doc of expired) {
        await ctx.db.delete(doc._id);
      }
      deleted += expired.length;
      if (expired.length < 100) {
        break;
      }
    }
    return { deleted };
  },
});

export const cleanupExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let deleted = 0;
    while (true) {
      const expired = await ctx.db
        .query("sessions")
        .withIndex("byExpiresAt", (q) => q.lt("expiresAt", now))
        .take(100);
      if (expired.length === 0) {
        break;
      }
      for (const doc of expired) {
        await ctx.db.delete(doc._id);
      }
      deleted += expired.length;
      if (expired.length < 100) {
        break;
      }
    }
    return { deleted };
  },
});
