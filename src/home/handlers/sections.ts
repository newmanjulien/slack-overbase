import type { App, StaticSelectAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import { normalizeHomeSection } from "../composition/index.js";
import { logger } from "../../lib/logger.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs } from "./types.js";

export const registerHomeSectionHandlers = (app: App, publishHome: PublishHome) => {
  app.action(
    "home_section_select",
    async ({ ack, action, body, client }: HomeActionArgs<StaticSelectAction>) => {
      await ack();
      try {
        const selected = normalizeHomeSection(action.selected_option?.value);
        const userId = body.user.id;
        if (!userId) return;
        const teamContext = getTeamContext({ body });
        await publishHome(client, userId, teamContext, { homeSection: selected });
      } catch (error) {
        logger.error({ error }, "home_section_select failed");
      }
    },
  );
};
