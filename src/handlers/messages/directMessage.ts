import type { App, AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "../../lib/logger.js";
import { getTeamContext } from "../../lib/teamContext.js";
import { claimSlackEvent } from "../../data/eventDedup.js";
import { getEventId, getEventTimeMs, isDirectUserMessage } from "../../gateways/slack.js";
import { enqueueInboundRelay } from "../../data/relay.js";
import { addMessage, updateLastMessageAt } from "../../data/conversations.js";
import { getConfig } from "../../lib/config.js";
import { buildRelayFileProxyUrl } from "../../../shared/relay/contract.js";
import { createRelayFileToken } from "../../data/relayTokens.js";

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
        const { APP_BASE_URL, RELAY_WEBHOOK_SECRET } = getConfig();
        const expiresAt = Date.now() + 15 * 60 * 1000;
        const resolved = await Promise.all(
          message.files.map(async (file) => {
            if (typeof file.id !== "string") return null;
            if (typeof file.size !== "number") return null;
            const tokenResult = await createRelayFileToken({
              teamId: teamContext.teamId,
              fileId: file.id,
              expiresAt,
            });
            const token = tokenResult?.token;
            if (!token) return null;
            const filename = typeof file.name === "string" ? file.name : undefined;
            const mimeType = typeof file.mimetype === "string" ? file.mimetype : undefined;
            const size = typeof file.size === "number" ? file.size : undefined;
            return {
              filename,
              mimeType,
              size,
              sourceFileId: file.id,
              sourceWorkspace: teamContext.teamId,
              expiresAt,
              proxyUrl: buildRelayFileProxyUrl(
                {
                  teamId: teamContext.teamId,
                  fileId: file.id,
                  expiresAt,
                  filename,
                  mimeType,
                  size,
                  token,
                },
                RELAY_WEBHOOK_SECRET,
                APP_BASE_URL,
              ),
            };
          }),
        );
        files = resolved.filter((file) => file && file.sourceFileId);
        if (files.length === 0) {
          files = undefined;
        }
      }

      await enqueueInboundRelay(message.user, teamContext, {
        text: userText || undefined,
        files,
        externalId: eventId,
      });

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
