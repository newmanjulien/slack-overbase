import { mutation, query } from "../_generated/server.js";
import { v } from "convex/values";

const nowMs = () => Date.now();

const applyLock = async (ctx: any, args: {
  lockKey?: string;
  lockTtlMs?: number;
}) => {
  const lockKey = args.lockKey;
  const lockTtlMs = args.lockTtlMs;
  if (!lockKey || !lockTtlMs) return { ok: true } as const;

  const existing = await ctx.db
    .query("relay_dispatch_locks")
    .withIndex("byKey", (q: any) => q.eq("key", lockKey))
    .first();
  const now = nowMs();
  if (existing && existing.expiresAt > now) {
    return { ok: false, rejected: "locked", expiresAt: existing.expiresAt } as const;
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
  return { ok: true } as const;
};

const applyRateLimit = async (ctx: any, args: {
  rateLimitKey?: string;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
}) => {
  const rateLimitKey = args.rateLimitKey;
  const rateLimitWindowMs = args.rateLimitWindowMs;
  const rateLimitMax = args.rateLimitMax;
  if (!rateLimitKey || !rateLimitWindowMs || !rateLimitMax) {
    return { ok: true } as const;
  }

  const existing = await ctx.db
    .query("relay_rate_limits")
    .withIndex("byKey", (q: any) => q.eq("key", rateLimitKey))
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
    return { ok: true } as const;
  }

  const windowStart =
    now - existing.windowStart >= rateLimitWindowMs ? now : existing.windowStart;
  const count = windowStart === existing.windowStart ? existing.count + 1 : 1;
  if (count > rateLimitMax) {
    return {
      ok: false,
      rejected: "rate_limited",
      retryAfterMs: windowStart + rateLimitWindowMs - now,
    } as const;
  }

  await ctx.db.patch(existing._id, {
    windowMs: rateLimitWindowMs,
    windowStart,
    count,
    updatedAt: now,
  });
  return { ok: true } as const;
};

export const enqueueRelay = mutation({
  args: {
    relayKey: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    teamId: v.string(),
    userId: v.string(),
    text: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          filename: v.optional(v.string()),
          mimeType: v.optional(v.string()),
          size: v.optional(v.number()),
          sourceFileId: v.optional(v.string()),
          sourceWorkspace: v.optional(v.string()),
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
    const lockResult = await applyLock(ctx, args);
    if (!lockResult.ok) return lockResult;

    const rateLimitResult = await applyRateLimit(ctx, args);
    if (!rateLimitResult.ok) return rateLimitResult;

    const existing = await ctx.db
      .query("relay_messages")
      .withIndex("byRelayKey", (q) => q.eq("relayKey", args.relayKey))
      .first();
    const now = nowMs();
    if (existing) {
      if (existing.direction !== args.direction) {
        throw new Error("relay_direction_mismatch");
      }
      if (existing.status === "delivered") {
        return { ok: true, id: existing._id, deduped: true, delivered: true };
      }
      const updates: Record<string, unknown> = {
        lastSeenAt: now,
        status: "queued",
        errorCode: undefined,
        errorMessage: undefined,
      };
      if (args.text && !existing.text) updates.text = args.text;
      if (args.files && !existing.files) updates.files = args.files;
      if (args.externalId && !existing.externalId) updates.externalId = args.externalId;
      await ctx.db.patch(existing._id, updates);
      return { ok: true, id: existing._id, deduped: true };
    }

    if (Array.isArray(args.files)) {
      for (const file of args.files) {
        if (!file.sourceFileId || !file.sourceWorkspace) {
          throw new Error("relay_files_require_source");
        }
      }
    }

    const id = await ctx.db.insert("relay_messages", {
      teamId: args.teamId,
      userId: args.userId,
      direction: args.direction,
      relayKey: args.relayKey,
      text: args.text,
      files: args.files,
      status: "queued",
      createdAt: now,
      lastSeenAt: now,
      deliveredAt: undefined,
      errorCode: undefined,
      errorMessage: undefined,
      externalId: args.externalId,
    });
    return { ok: true, id };
  },
});

export const listQueued = query({
  args: {
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    limit: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "queued").eq("direction", args.direction),
      )
      .order("asc")
      .take(args.limit),
});

export const markDelivered = mutation({
  args: { id: v.id("relay_messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "delivered",
      deliveredAt: nowMs(),
      errorCode: undefined,
      errorMessage: undefined,
    });
    return { ok: true };
  },
});

export const markFailed = mutation({
  args: {
    id: v.id("relay_messages"),
    errorCode: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "failed",
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
    });
    return { ok: true };
  },
});
