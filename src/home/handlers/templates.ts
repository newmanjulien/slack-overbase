import type { App, ButtonAction, StaticSelectAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import { handleDirectMessage } from "../../features/messaging/service.js";
import { updatePreferences } from "../../data/preferences.js";
import { getTemplateById, updateTemplateBody } from "../../data/templates.js";
import {
  buildEditTemplateModal,
  buildTemplateDmBlocks,
  buildViewTemplateModal,
} from "../../features/templates/modals.js";
import { logger } from "../../lib/logger.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs, HomeViewArgs } from "./types.js";

export const registerHomeTemplateHandlers = (app: App, publishHome: PublishHome) => {
  app.action(
    "view_template",
    async ({ ack, action, body, client }: HomeActionArgs<ButtonAction>) => {
      await ack();
      try {
        const templateId = action.value;
        const userId = body.user.id;
        const triggerId = body.trigger_id;
        if (!userId || !triggerId) return;
        if (!templateId) return;
        const teamContext = getTeamContext({ body });
        const template = await getTemplateById(userId, teamContext, templateId);
        if (!template) return;
        await client.views.open({
          trigger_id: triggerId,
          view: buildViewTemplateModal(template),
        });
      } catch (error) {
        logger.error({ error }, "view_template action failed");
      }
    },
  );

  app.action(
    "edit_view_template",
    async ({ ack, body, action, client }: HomeActionArgs<ButtonAction>) => {
      await ack();
      try {
        const templateId = action.value;
        if (!templateId) return;
        const userId = body.user.id;
        if (!userId) return;
        const teamContext = getTeamContext({ body });
        const template = await getTemplateById(userId, teamContext, templateId);
        if (!template) return;
        if (!body.view?.id) return;
        await client.views.update({
          view_id: body.view.id,
          hash: body.view.hash,
          view: buildEditTemplateModal(template),
        });
      } catch (error) {
        logger.error({ error }, "edit_view_template action failed");
      }
    },
  );

  app.view("view_template_modal", async ({ ack, body, client }: HomeViewArgs) => {
    await ack();
    const runTemplateFlow = async () => {
      const templateId = body.view?.private_metadata || "";
      const teamContext = getTeamContext({ body });
      const template = await getTemplateById(body.user.id, teamContext, templateId);
      if (!template) return;
      const templateText = typeof template.body === "string" ? template.body.trim() : "";
      if (!templateText) return;

      let dmChannelId = body.user.id;
      try {
        const dmOpen = await client.conversations.open({ users: body.user.id });
        dmChannelId = dmOpen.channel?.id || dmChannelId;
      } catch (error) {
        logger.error({ error }, "Failed to open DM channel");
      }

      try {
        await client.chat.postMessage({
          channel: dmChannelId,
          text: templateText,
          blocks: buildTemplateDmBlocks(template),
        });
      } catch (error) {
        logger.error({ error }, "Template DM failed");
      }

      try {
        const reply = await handleDirectMessage({
          userId: body.user.id,
          teamContext,
          text: templateText,
          source: "template",
        });
        if (reply) {
          await client.chat.postMessage({
            channel: dmChannelId,
            text: reply,
          });
        }
      } catch (error) {
        logger.error({ error }, "Template OpenAI response failed");
        await client.chat.postMessage({
          channel: dmChannelId,
          text: "Sorry, I hit an error while responding. Please try again.",
        });
      }
    };

    void runTemplateFlow().catch((error) => {
      logger.error({ error }, "Template submit flow failed");
    });
  });

  app.view("edit_view_template_modal", async ({ ack, body, view }: HomeViewArgs) => {
    try {
      const templateId = view.private_metadata || "";
      if (!templateId) {
        await ack();
        return;
      }
      const teamContext = getTeamContext({ body });
      const template = await getTemplateById(body.user.id, teamContext, templateId);
      if (!template) {
        await ack();
        return;
      }
      const editedText =
        view.state?.values?.template_body?.template_body_input?.value || template.body;
      const updated =
        (await updateTemplateBody(body.user.id, teamContext, templateId, editedText)) ||
        template;
      await ack({
        response_action: "update",
        view: buildViewTemplateModal(updated),
      });
    } catch (error) {
      logger.error({ error }, "edit_view_template_modal view submit failed");
      await ack();
    }
  });

  app.action(
    "template_section",
    async ({ ack, action, body, client }: HomeActionArgs<StaticSelectAction>) => {
      await ack();
      try {
        const selectedSection = action.selected_option?.value || "cro";
        const userId = body.user.id;
        if (!userId) return;
        const teamContext = getTeamContext({ body });
        await updatePreferences(userId, teamContext, { templateSection: selectedSection });
        await publishHome(client, userId, teamContext, { homeSection: "templates" });
      } catch (error) {
        logger.error({ error }, "template_section action failed");
      }
    },
  );
};
