"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAnswer = void 0;
const server_1 = require("../_generated/server");
const values_1 = require("convex/values");
exports.storeAnswer = (0, server_1.mutation)({
    args: {
        userId: values_1.v.string(),
        teamId: values_1.v.string(),
        canvasId: values_1.v.string(),
        sentAt: values_1.v.number(),
        questionText: values_1.v.optional(values_1.v.string()),
        markdown: values_1.v.optional(values_1.v.string()),
        summary: values_1.v.optional(values_1.v.string()),
        keyPoints: values_1.v.optional(values_1.v.array(values_1.v.string())),
        entities: values_1.v.optional(values_1.v.array(values_1.v.string())),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("canvasAnswers", {
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
