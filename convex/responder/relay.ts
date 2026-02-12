import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

const nowMs = () => Date.now();

export const enqueueInbound = mutation({
  args: {
    teamId: v.string(),
    userId: v.string(),
    text: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          filename: v.optional(v.string()),
          mimeType: v.optional(v.string()),
          size: v.number(),
          proxyUrl: v.optional(v.string()),
          sourceFileId: v.optional(v.string()),
          sourceWorkspace: v.optional(v.string()),
          expiresAt: v.optional(v.number()),
        }),
      ),
    ),
    externalId: v.optional(v.string()),
    lockKey: v.optional(v.string()),
    lockTtlMs: v.optional(v.number()),
    rateLimitKey: v.optional(v.string()),
    rateLimitWindowMs: v.optional(v.number()),
    rateLimitMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lockKey = args.lockKey;
    const lockTtlMs = args.lockTtlMs;
    if (lockKey && lockTtlMs) {
      const existing = await ctx.db
        .query("relay_dispatch_locks")
        .withIndex("byKey", (q) => q.eq("key", lockKey))
        .first();
      const now = nowMs();
      if (existing && existing.expiresAt > now) {
        return { ok: false, rejected: "locked", expiresAt: existing.expiresAt };
      }
      const expiresAt = now + lockTtlMs;
      if (!existing) {
        await ctx.db.insert("relay_dispatch_locks", {
          key: lockKey,
          expiresAt,
          createdAt: now,
        });
      } else {
        await ctx.db.patch(existing._id, { expiresAt });
      }
    }

    const rateLimitKey = args.rateLimitKey;
    const rateLimitWindowMs = args.rateLimitWindowMs;
    const rateLimitMax = args.rateLimitMax;
    if (rateLimitKey && rateLimitWindowMs && rateLimitMax) {
      const existing = await ctx.db
        .query("relay_rate_limits")
        .withIndex("byKey", (q) => q.eq("key", rateLimitKey))
        .first();
      const now = nowMs();
      if (!existing) {
        await ctx.db.insert("relay_rate_limits", {
          key: rateLimitKey,
          windowMs: rateLimitWindowMs,
          windowStart: now,
          count: 1,
          updatedAt: now,
        });
      } else {
        const windowStart =
          now - existing.windowStart >= rateLimitWindowMs
            ? now
            : existing.windowStart;
        const count =
          windowStart === existing.windowStart ? existing.count + 1 : 1;
        if (count > rateLimitMax) {
          return {
            ok: false,
            rejected: "rate_limited",
            retryAfterMs:
              windowStart + rateLimitWindowMs - now,
          };
        }
        await ctx.db.patch(existing._id, {
          windowMs: rateLimitWindowMs,
          windowStart,
          count,
          updatedAt: now,
        });
      }
    }

    if (args.externalId) {
      const existing = await ctx.db
        .query("relay_messages")
        .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
        .first();
      if (existing) {
        return { ok: true, id: existing._id, deduped: true };
      }
    }

    const id = await ctx.db.insert("relay_messages", {
      teamId: args.teamId,
      userId: args.userId,
      direction: "inbound",
      text: args.text,
      files: args.files,
      status: "pending",
      createdAt: nowMs(),
      sentAt: undefined,
      error: undefined,
      externalId: args.externalId,
    });
    return { ok: true, id };
  },
});

export const enqueueOutbound = mutation({
  args: {
    teamId: v.string(),
    userId: v.string(),
    text: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          filename: v.optional(v.string()),
          mimeType: v.optional(v.string()),
          size: v.number(),
          proxyUrl: v.optional(v.string()),
          sourceFileId: v.optional(v.string()),
          sourceWorkspace: v.optional(v.string()),
          expiresAt: v.optional(v.number()),
        }),
      ),
    ),
    externalId: v.optional(v.string()),
    lockKey: v.optional(v.string()),
    lockTtlMs: v.optional(v.number()),
    rateLimitKey: v.optional(v.string()),
    rateLimitWindowMs: v.optional(v.number()),
    rateLimitMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lockKey = args.lockKey;
    const lockTtlMs = args.lockTtlMs;
    if (lockKey && lockTtlMs) {
      const existing = await ctx.db
        .query("relay_dispatch_locks")
        .withIndex("byKey", (q) => q.eq("key", lockKey))
        .first();
      const now = nowMs();
      if (existing && existing.expiresAt > now) {
        return { ok: false, rejected: "locked", expiresAt: existing.expiresAt };
      }
      const expiresAt = now + lockTtlMs;
      if (!existing) {
        await ctx.db.insert("relay_dispatch_locks", {
          key: lockKey,
          expiresAt,
          createdAt: now,
        });
      } else {
        await ctx.db.patch(existing._id, { expiresAt });
      }
    }

    const rateLimitKey = args.rateLimitKey;
    const rateLimitWindowMs = args.rateLimitWindowMs;
    const rateLimitMax = args.rateLimitMax;
    if (rateLimitKey && rateLimitWindowMs && rateLimitMax) {
      const existing = await ctx.db
        .query("relay_rate_limits")
        .withIndex("byKey", (q) => q.eq("key", rateLimitKey))
        .first();
      const now = nowMs();
      if (!existing) {
        await ctx.db.insert("relay_rate_limits", {
          key: rateLimitKey,
          windowMs: rateLimitWindowMs,
          windowStart: now,
          count: 1,
          updatedAt: now,
        });
      } else {
        const windowStart =
          now - existing.windowStart >= rateLimitWindowMs
            ? now
            : existing.windowStart;
        const count =
          windowStart === existing.windowStart ? existing.count + 1 : 1;
        if (count > rateLimitMax) {
          return {
            ok: false,
            rejected: "rate_limited",
            retryAfterMs:
              windowStart + rateLimitWindowMs - now,
          };
        }
        await ctx.db.patch(existing._id, {
          windowMs: rateLimitWindowMs,
          windowStart,
          count,
          updatedAt: now,
        });
      }
    }

    if (args.externalId) {
      const existing = await ctx.db
        .query("relay_messages")
        .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
        .first();
      if (existing) {
        return { ok: true, id: existing._id, deduped: true };
      }
    }

    if (Array.isArray(args.files)) {
      for (const file of args.files) {
        if (!file.proxyUrl || typeof file.size !== "number") {
          throw new Error("Outbound files require proxyUrl and size");
        }
      }
    }

    const id = await ctx.db.insert("relay_messages", {
      teamId: args.teamId,
      userId: args.userId,
      direction: "outbound",
      text: args.text,
      files: args.files,
      status: "pending",
      createdAt: nowMs(),
      sentAt: undefined,
      error: undefined,
      externalId: args.externalId,
    });
    return { ok: true, id };
  },
});

export const listPending = query({
  args: {
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "pending").eq("direction", args.direction),
      )
      .order("asc")
      .take(args.limit);
  },
});

export const markSent = mutation({
  args: { id: v.id("relay_messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: nowMs(),
      error: undefined,
    });
    return { ok: true };
  },
});

export const markFailed = mutation({
  args: { id: v.id("relay_messages"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "failed",
      error: args.error,
    });
    return { ok: true };
  },
});
