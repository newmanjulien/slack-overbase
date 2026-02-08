import type { App } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import { getOrCreatePreferences, updatePreferences } from "../../data/preferences.js";
import { logger } from "../../lib/logger.js";
import type { PublishHome } from "../publish.js";
import type { HomeEventArgs } from "./types.js";

export const registerHomeOpenedHandler = (app: App, publishHome: PublishHome) => {
  app.event("app_home_opened", async ({ event, client, context }: HomeEventArgs<"app_home_opened">) => {
    try {
      if (event.tab && event.tab !== "home") return;
      if (context?.retryNum && context.retryNum > 0) return;
      const teamContext = getTeamContext({ context, event });
      await publishHome(client, event.user, teamContext);

      const preferences = await getOrCreatePreferences(event.user, teamContext);
      if (!preferences.onboardingSent) {
        await updatePreferences(event.user, teamContext, { onboardingSent: true });
        const dmOpen = await client.conversations.open({ users: event.user });
        const channel = dmOpen.channel?.id || event.user;
        await client.chat.postMessage({
          channel,
          text: "Welcome to Overbase! Ask me anything here and check Home for templates and recurring questions.",
        });
      }
    } catch (error) {
      logger.error({ error }, "app_home_opened failed");
    }
  });
};
