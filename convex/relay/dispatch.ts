import { action } from "../_generated/server.js";
import { v } from "convex/values";

export const dispatchOutbound = action({
  args: {
    relayKey: v.string(),
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
    messageId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const baseUrl = process.env.RELAY_OUTBOUND_WEBHOOK_URL;
    const secret = process.env.RELAY_WEBHOOK_SECRET;
    if (!baseUrl || !secret) {
      throw new Error("Missing relay outbound webhook configuration");
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-relay-key": secret,
      },
      body: JSON.stringify({
        relayKey: args.relayKey,
        teamId: args.teamId,
        userId: args.userId,
        text: args.text,
        files: args.files,
        messageId: args.messageId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Relay outbound failed: ${response.status} ${errorText}`);
    }

    return { ok: true };
  },
});

export const dispatchInbound = action({
  args: {
    relayKey: v.string(),
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
    messageId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const baseUrl = process.env.RESPONDER_INBOUND_WEBHOOK_URL;
    const secret = process.env.RELAY_WEBHOOK_SECRET;
    if (!baseUrl || !secret) {
      throw new Error("Missing responder inbound webhook configuration");
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-relay-key": secret,
      },
      body: JSON.stringify({
        relayKey: args.relayKey,
        teamId: args.teamId,
        userId: args.userId,
        text: args.text,
        files: args.files,
        messageId: args.messageId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Relay inbound failed: ${response.status} ${errorText}`);
    }

    return { ok: true };
  },
});
