import { internalMutation, mutation } from "../_generated/server.js";
import { v } from "convex/values";

const generateToken = () => {
  const globalCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  if (globalCrypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalCrypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  const random = Math.random().toString(36).slice(2, 12);
  const time = Date.now().toString(36);
  return `${time}${random}`;
};

export const createToken = mutation({
  args: {
    teamId: v.string(),
    fileId: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const token = generateToken();
    const now = Date.now();
    await ctx.db.insert("relay_file_tokens", {
      token,
      teamId: args.teamId,
      fileId: args.fileId,
      expiresAt: args.expiresAt,
      usedAt: undefined,
      createdAt: now,
    });
    return { ok: true, token };
  },
});

export const consumeToken = mutation({
  args: {
    teamId: v.string(),
    fileId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("relay_file_tokens")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .first();
    if (!entry) return { ok: false, error: "not_found" };
    const now = Date.now();
    if (entry.usedAt) return { ok: false, error: "used" };
    if (entry.expiresAt <= now) return { ok: false, error: "expired" };
    if (entry.teamId !== args.teamId || entry.fileId !== args.fileId) {
      return { ok: false, error: "mismatch" };
    }
    await ctx.db.patch(entry._id, { usedAt: now });
    return { ok: true };
  },
});

export const claimToken = mutation({
  args: {
    teamId: v.string(),
    fileId: v.string(),
    token: v.string(),
    ttlMs: v.number(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("relay_file_tokens")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .first();
    if (!entry) return { ok: false, error: "not_found" };
    const now = Date.now();
    if (entry.usedAt) return { ok: false, error: "used" };
    if (entry.expiresAt <= now) return { ok: false, error: "expired" };
    if (entry.teamId !== args.teamId || entry.fileId !== args.fileId) {
      return { ok: false, error: "mismatch" };
    }
    if (entry.claimedAt && now - entry.claimedAt < args.ttlMs) {
      return { ok: false, error: "claimed" };
    }
    await ctx.db.patch(entry._id, { claimedAt: now });
    return { ok: true };
  },
});

export const finalizeToken = mutation({
  args: {
    teamId: v.string(),
    fileId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("relay_file_tokens")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .first();
    if (!entry) return { ok: false, error: "not_found" };
    const now = Date.now();
    if (entry.usedAt) return { ok: false, error: "used" };
    if (entry.expiresAt <= now) return { ok: false, error: "expired" };
    if (entry.teamId !== args.teamId || entry.fileId !== args.fileId) {
      return { ok: false, error: "mismatch" };
    }
    await ctx.db.patch(entry._id, { usedAt: now, claimedAt: undefined });
    return { ok: true };
  },
});

export const releaseToken = mutation({
  args: {
    teamId: v.string(),
    fileId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("relay_file_tokens")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .first();
    if (!entry) return { ok: false, error: "not_found" };
    if (entry.teamId !== args.teamId || entry.fileId !== args.fileId) {
      return { ok: false, error: "mismatch" };
    }
    await ctx.db.patch(entry._id, { claimedAt: undefined });
    return { ok: true };
  },
});

export const cleanupExpiredTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let deleted = 0;
    while (true) {
      const expired = await ctx.db
        .query("relay_file_tokens")
        .withIndex("byExpiresAt", (q) => q.lt("expiresAt", now))
        .take(100);
      if (expired.length === 0) break;
      for (const doc of expired) {
        await ctx.db.delete(doc._id);
      }
      deleted += expired.length;
      if (expired.length < 100) break;
    }
    return { deleted };
  },
});
