import { query } from "../_generated/server.js";
import { v } from "convex/values";

export const getUserAppBotToken = query({
  args: { teamId: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.RELAY_WEBHOOK_SECRET || args.secret !== process.env.RELAY_WEBHOOK_SECRET) {
      throw new Error("unauthorized");
    }
    const existing = await ctx.db
      .query("installations")
      .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
      .first();
    const token = (existing?.installation as { bot?: { token?: string } } | undefined)?.bot?.token;
    if (!token) {
      return { ok: false, error: "missing_bot_token" };
    }
    return { ok: true, token };
  },
});
