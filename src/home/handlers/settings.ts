import type { App, ButtonAction, CheckboxesAction, MultiUsersSelectAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import { updateDatasources } from "../../data/datasources.js";
import { updatePreferences } from "../../data/preferences.js";
import { logger } from "../../lib/logger.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs } from "./types.js";
import { getHomeSectionFromMetadata, parseMetadata } from "./viewState.js";

export const registerHomeSettingsHandlers = (app: App, publishHome: PublishHome) => {
  app.action(
    "allowlist_select",
    async ({ ack, action, body, client }: HomeActionArgs<MultiUsersSelectAction>) => {
      await ack();
      try {
        const selectedUsers = action.selected_users || [];
        const userId = body.user.id;
        if (!userId) return;
        const teamContext = getTeamContext({ body });
        await updateDatasources(userId, teamContext, { allowlist: selectedUsers });
        const metadata = parseMetadata(body.view?.private_metadata);
        const homeSection = getHomeSectionFromMetadata(metadata);
        await publishHome(
          client,
          userId,
          teamContext,
          homeSection ? { homeSection } : undefined,
        );
      } catch (error) {
        logger.error({ error }, "allowlist_select failed");
      }
    },
  );

  app.action(
    "settings_recommendations",
    async ({ ack, action, body, client }: HomeActionArgs<CheckboxesAction>) => {
      await ack();
      try {
        const selectedValues = (action.selected_options || [])
          .map((option) => option.value)
          .filter((value): value is string => typeof value === "string");
        const userId = body.user.id;
        if (!userId) return;
        const teamContext = getTeamContext({ body });
        await updatePreferences(userId, teamContext, {
          recommendPastQuestions: selectedValues.includes("past_questions"),
          recommendSimilarExecs: selectedValues.includes("similar_execs"),
        });
        const metadata = parseMetadata(body.view?.private_metadata);
        const homeSection = getHomeSectionFromMetadata(metadata);
        await publishHome(
          client,
          userId,
          teamContext,
          homeSection ? { homeSection } : undefined,
        );
      } catch (error) {
        logger.error({ error }, "settings_recommendations failed");
      }
    },
  );

  app.action("manage_payments", async ({ ack }: HomeActionArgs<ButtonAction>) => {
    await ack();
  });
};
