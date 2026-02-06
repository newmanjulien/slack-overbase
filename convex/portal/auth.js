"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueOneTimeCode = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
const TTL_MS = 10 * 60 * 1000;
const generateCode = () => {
    const random = Math.random().toString(36).slice(2, 10);
    const time = Date.now().toString(36);
    return `${time}${random}`;
};
exports.issueOneTimeCode = (0, server_1.mutation)({
    args: {
        teamId: values_1.v.string(),
        slackUserId: values_1.v.string(),
        teamName: values_1.v.optional(values_1.v.string()),
        name: values_1.v.optional(values_1.v.string()),
        avatarUrl: values_1.v.optional(values_1.v.string()),
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
