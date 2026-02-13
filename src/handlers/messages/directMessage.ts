import type { App, AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "../../lib/logger.js";
import { getTeamContext } from "../../lib/teamContext.js";
import { claimSlackEvent } from "../../data/eventDedup.js";
import { getEventId, getEventTimeMs, isDirectUserMessage } from "../../gateways/slack.js";
import { dispatchInboundRelay, enqueueInboundRelay } from "../../data/relay.js";
import { addMessage, updateLastMessageAt } from "../../data/conversations.js";
import { buildRelayKey, SOURCE_WORKSPACE_USER_APP } from "../../../shared/relay/types.js";

const MAX_RETRY_AGE_MS = 30000;

type DirectMessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;

export const registerDirectMessageHandler = (app: App) => {
  app.message(async ({ message, say, context, body }: DirectMessageArgs) => {
    if (!message || !isDirectUserMessage(message)) {
      return;
    }

    const eventId = getEventId(body, message);
    const eventTimeMs = getEventTimeMs(body);
    let teamContext;
    try {
      teamContext = getTeamContext({ context, message });
    } catch (error) {
      logger.error({ error }, "Failed to resolve team context");
      return;
    }

    if (context?.retryNum && typeof eventTimeMs === "number") {
      const eventAgeMs = Date.now() - eventTimeMs;
      if (eventAgeMs > MAX_RETRY_AGE_MS) {
        return;
      }
    }

    try {
      const claim = await claimSlackEvent(teamContext, eventId, message.user);
      if (claim?.claimed === false) {
        return;
      }
    } catch (error) {
      logger.error({ error }, "Failed to claim DM event");
    }

    const userText = typeof message.text === "string" ? message.text.trim() : "";
    if (!userText && !Array.isArray(message.files)) {
      return;
    }

    try {
      let files;
      if (Array.isArray(message.files) && message.files.length > 0) {
        const resolved = await Promise.all(
          message.files.map(async (file) => {
            if (typeof file.id !== "string") return null;
            const filename = typeof file.name === "string" ? file.name : undefined;
            const mimeType = typeof file.mimetype === "string" ? file.mimetype : undefined;
            return {
              filename,
              mimeType,
              sourceFileId: file.id,
              sourceWorkspace: SOURCE_WORKSPACE_USER_APP,
              size: typeof file.size === "number" ? file.size : undefined,
            };
          }),
        );
        files = resolved.filter((file): file is NonNullable<typeof file> =>
          Boolean(file && file.sourceFileId),
        );
        if (files.length === 0) {
          files = undefined;
        }
      }

      const relayKey = buildRelayKey([
        teamContext.teamId,
        message.user,
        eventId || (typeof message.ts === "string" ? message.ts : undefined),
      ]);
      const result = await enqueueInboundRelay(message.user, teamContext, {
        relayKey,
        text: userText || undefined,
        files,
        externalId: eventId,
      });

      try {
        await dispatchInboundRelay({
          relayKey,
          teamId: teamContext.teamId,
          userId: message.user,
          text: userText || undefined,
          files,
          messageId: (result as { id?: string }).id,
        });
      } catch (error) {
        logger.warn({ error }, "Relay inbound dispatch failed");
      }

      if (userText) {
        await addMessage(message.user, teamContext, {
          role: "user",
          content: userText,
        });
      }
      await updateLastMessageAt(message.user, teamContext, Date.now());
    } catch (error) {
      logger.error({ error }, "Relay enqueue failed");
    }
  });
};
