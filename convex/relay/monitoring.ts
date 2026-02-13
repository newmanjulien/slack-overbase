import { query } from "../_generated/server.js";
import { v } from "convex/values";

export const listRecentFailures = query({
  args: { limit: v.number() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "failed").eq("direction", "inbound"),
      )
      .order("desc")
      .take(args.limit),
});

export const listRecentFailuresOutbound = query({
  args: { limit: v.number() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "failed").eq("direction", "outbound"),
      )
      .order("desc")
      .take(args.limit),
});

export const listStuckQueued = query({
  args: { beforeMs: v.number(), limit: v.number() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "queued").eq("direction", "inbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), args.beforeMs))
      .order("asc")
      .take(args.limit),
});

export const listStuckQueuedOutbound = query({
  args: { beforeMs: v.number(), limit: v.number() },
  handler: async (ctx, args) =>
    ctx.db
      .query("relay_messages")
      .withIndex("byStatusDirectionCreatedAt", (q) =>
        q.eq("status", "queued").eq("direction", "outbound"),
      )
      .filter((q) => q.lt(q.field("createdAt"), args.beforeMs))
      .order("asc")
      .take(args.limit),
});
