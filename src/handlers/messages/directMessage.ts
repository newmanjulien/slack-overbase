import type { App } from "@slack/bolt";
import { logger } from "../../lib/logger";
import { getTeamContext } from "../../lib/teamContext";
import { claimSlackEvent } from "../../data/eventDedup";
import { handleDirectMessage } from "../../features/messaging/service";
import { getConversationMeta } from "../../data/conversations";

const MESSAGE_DEBOUNCE_MS = 3000;
const MAX_RETRY_AGE_MS = 30000;

export const registerDirectMessageHandler = (app: App) => {
  app.message(async ({ message, say, context, body, event }) => {
    if (!message || !message.user || message.subtype === "bot_message") {
      return;
    }

    if (message.channel_type !== "im") {
      return;
    }

    const eventId = body?.event_id || event?.event_id || message?.ts;
    const eventTime = body?.event_time || event?.event_time;
    let teamContext;
    try {
      teamContext = getTeamContext({ context, message });
    } catch (error) {
      logger.error({ error }, "Failed to resolve team context");
      return;
    }

    if (context?.retryNum && typeof eventTime === "number") {
      const eventAgeMs = Date.now() - eventTime * 1000;
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
