import { mutation } from "../_generated/server.js";
import { v } from "convex/values";

export const storeAnswer = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    canvasId: v.string(),
    sentAt: v.number(),
    questionText: v.optional(v.string()),
    markdown: v.optional(v.string()),
    summary: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    entities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("canvas", {
      userId: args.userId,
      teamId: args.teamId,
      canvasId: args.canvasId,
      sentAt: args.sentAt,
      questionText: args.questionText,
      markdown: args.markdown,
      summary: args.summary,
      keyPoints: args.keyPoints,
      entities: args.entities,
    });
    return { ok: true, id };
  },
});
