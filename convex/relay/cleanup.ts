import { internalMutation } from "../_generated/server.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const cleanupRelayMessages: ReturnType<typeof internalMutation> = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - 14 * DAY_MS;
    const queued = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "queued").eq("direction", "inbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of queued) {
      await ctx.db.delete(row._id);
    }
    const queuedOut = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "queued").eq("direction", "outbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of queuedOut) {
      await ctx.db.delete(row._id);
    }
    const stale = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "delivered").eq("direction", "inbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of stale) {
      await ctx.db.delete(row._id);
    }
    const staleOut = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "delivered").eq("direction", "outbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of staleOut) {
      await ctx.db.delete(row._id);
    }
    const failed = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "failed").eq("direction", "inbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of failed) {
      await ctx.db.delete(row._id);
    }
    const failedOut = await ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "failed").eq("direction", "outbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    for (const row of failedOut) {
      await ctx.db.delete(row._id);
    }
    return { ok: true };
  },
});

export const cleanupRelayLocks: ReturnType<typeof internalMutation> = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now();
    const rows = await ctx.db
      .query("relay_dispatch_locks")
      .withIndex("byExpiresAt", (q) => q.lt("expiresAt", cutoff))
      .collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return { ok: true };
  },
});

export const cleanupRelayRateLimits: ReturnType<typeof internalMutation> = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    const rows = await ctx.db
      .query("relay_rate_limits")
      .withIndex("byUpdatedAt", (q) => q.lt("updatedAt", cutoff))
      .collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return { ok: true };
  },
});
