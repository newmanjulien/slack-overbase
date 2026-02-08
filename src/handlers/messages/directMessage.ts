import type { App, AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "../../lib/logger.js";
import { getTeamContext } from "../../lib/teamContext.js";
import { claimSlackEvent } from "../../data/eventDedup.js";
import { handleDirectMessage } from "../../features/messaging/service.js";
import { getConversationMeta } from "../../data/conversations.js";
import { getEventId, getEventTimeMs, isDirectUserMessage } from "../../gateways/slack.js";

const MESSAGE_DEBOUNCE_MS = 3000;
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

    const meta = await getConversationMeta(message.user, teamContext);
    if (
      typeof meta.lastMessageAt === "number" &&
      Date.now() - meta.lastMessageAt < MESSAGE_DEBOUNCE_MS
    ) {
      return;
    }

    const userText = typeof message.text === "string" ? message.text.trim() : "";
    if (!userText) {
      return;
    }

    try {
      const reply = await handleDirectMessage({
        userId: message.user,
        teamContext,
        text: userText,
      });
      await say(reply);
    } catch (error) {
      logger.error({ error }, "OpenAI response failed");
      await say("Sorry, I hit an error while responding. Please try again.");
    }
  });
};
