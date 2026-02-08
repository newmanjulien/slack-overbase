import type { App, ButtonAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import { getTemplateById, updateTemplateBody } from "../../data/templates.js";
import { buildEditTemplateModal } from "../../features/templates/modals.js";
import { logger } from "../../lib/logger.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs, HomeViewArgs } from "./types.js";
import { getHomeSectionFromMetadata, getTextValue, parseMetadata } from "./viewState.js";

export const registerHomeTemplateHandlers = (app: App, publishHome: PublishHome) => {
  app.action(
    "template_edit",
    async ({ ack, action, body, client }: HomeActionArgs<ButtonAction>) => {
      await ack();
      try {
        const templateId = action.value;
        const userId = body.user.id;
        const triggerId = body.trigger_id;
        if (!userId || !triggerId) return;
        const teamContext = getTeamContext({ body });
        if (!templateId) return;
        const template = await getTemplateById(userId, teamContext, templateId);
        if (!template) return;
        const metadata = parseMetadata(body.view?.private_metadata);
        const homeSection = getHomeSectionFromMetadata(metadata);
        await client.views.open({
          trigger_id: triggerId,
          view: buildEditTemplateModal({
            templateId: template.templateId,
            title: template.title,
            body: template.body,
            homeSection,
          }),
        });
      } catch (error) {
        logger.error({ error }, "template_edit action failed");
      }
    },
  );

  app.view(
    { callback_id: "template_edit", type: "view_submission" },
    async ({ ack, body, view, client }: HomeViewArgs) => {
      await ack();
      try {
        const teamContext = getTeamContext({ body });
        const metadata = parseMetadata(view.private_metadata);
        const templateId = typeof metadata.templateId === "string" ? metadata.templateId : "";
        const homeSection = getHomeSectionFromMetadata(metadata);
        const newBody = getTextValue(view.state?.values, "body", "value");
        if (!templateId) return;
        await updateTemplateBody(body.user.id, teamContext, templateId, newBody);
        await publishHome(
          client,
          body.user.id,
          teamContext,
          homeSection ? { homeSection } : undefined,
        );
      } catch (error) {
        logger.error({ error }, "template_edit view submit failed");
      }
    },
  );
};
