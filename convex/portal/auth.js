import { mutation } from "../_generated/server.js";
import { v } from "convex/values";
const TTL_MS = 10 * 60 * 1000;
const generateCode = () => {
    const random = Math.random().toString(36).slice(2, 10);
    const time = Date.now().toString(36);
    return `${time}${random}`;
};
export const issueOneTimeCode = mutation({
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
        await ctx.db.insert("oneTimeCodes", {
            code,
            teamId: args.teamId,
            slackUserId: args.slackUserId,
            issuedAt: now,
            expiresAt: now + TTL_MS,
            usedAt: undefined,
        });
        return { code };
    },
});
