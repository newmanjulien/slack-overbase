import { internalMutation } from "../_generated/server.js";
import { v } from "convex/values";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 30;

export const cleanupOldDedup = internalMutation({
  args: {
    retentionDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const retentionDays = args.retentionDays ?? DEFAULT_RETENTION_DAYS;
    const cutoff = Date.now() - retentionDays * DAY_MS;
    let deleted = 0;

    while (true) {
      const stale = await ctx.db
        .query("dedup")
        .withIndex("byCreatedAt", (q) => q.lt("createdAt", cutoff))
        .take(100);

      if (stale.length === 0) {
        break;
      }

      for (const doc of stale) {
        await ctx.db.delete(doc._id);
      }

      deleted += stale.length;
      if (stale.length < 100) {
        break;
      }
    }

    return { deleted, retentionDays };
  },
});
