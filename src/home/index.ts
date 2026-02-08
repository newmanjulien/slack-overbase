import type {
  AllMiddlewareArgs,
  App,
  BlockAction,
  BlockElementAction,
  ButtonAction,
  CheckboxesAction,
  MultiUsersSelectAction,
  OverflowAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewMiddlewareArgs,
  StaticSelectAction,
  ViewSubmitAction,
} from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import type { HomeView } from "@slack/types";
import { getTeamContext } from "../lib/teamContext.js";
import { getOrCreatePreferences, updatePreferences } from "../data/preferences.js";
import { updateDatasources } from "../data/datasources.js";
import { getTemplateById, updateTemplateBody } from "../data/templates.js";
import {
  getRecurringQuestion,
  createRecurringQuestion,
  updateRecurringQuestion,
  deleteRecurringQuestion,
} from "../data/recurring.js";
import {
  buildHomeCompositionBlocks,
  loadHomeComposition,
  normalizeHomeSection,
} from "./composition/index.js";
import type { HomeSection } from "./home.js";
import { buildEditTemplateModal } from "../features/templates/modals.js";
import {
  buildAddRecurringQuestionModal,
  buildEditRecurringQuestionModal,
} from "../features/recurring/modals.js";
import { logger } from "../lib/logger.js";
import type { Id } from "../../convex/_generated/dataModel.js";

type HomeEventArgs<T extends string> = SlackEventMiddlewareArgs<T> & AllMiddlewareArgs;
type HomeActionArgs<T extends BlockElementAction> =
  SlackActionMiddlewareArgs<BlockAction<T>> & AllMiddlewareArgs;
type HomeViewArgs = SlackViewMiddlewareArgs<ViewSubmitAction> & AllMiddlewareArgs;
type HomeCommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;

const toRecurringId = (value: string): Id<"recurringQuestions"> | null => {
  if (!value) return null;
  return value as Id<"recurringQuestions">;
};

const getUserProfile = async (client: WebClient, userId: string) => {
  try {
    const userInfo = await client.users.info({ user: userId });
    const profile = userInfo?.user?.profile || {};
    const fallbackName =
      profile.display_name ||
      profile.real_name ||
      userInfo?.user?.real_name ||
      userInfo?.user?.name ||
      "there";
    return {
      firstName: profile.first_name || fallbackName.split(" ")[0] || "there",
      name: fallbackName,
      avatar: profile.image_192 || profile.image_512 || profile.image_72,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch user info");
    return { firstName: "there", name: undefined, avatar: undefined };
  }
};

const getTeamName = async (client: WebClient, teamId: string) => {
  try {
    const teamInfo = await client.team.info({ team: teamId });
    return teamInfo?.team?.name || undefined;
  } catch (error) {
    logger.error({ error }, "Failed to fetch team info");
    return undefined;
  }
};

const publishHome = async (
  client: WebClient,
  userId: string,
  teamContext: { teamId: string },
  options?: { homeSection?: HomeSection },
) => {
  const preferences = await getOrCreatePreferences(userId, teamContext);
  const profile = await getUserProfile(client, userId);
  const teamName = await getTeamName(client, teamContext.teamId);
  const homeSection = options?.homeSection ?? "welcome";
  const homeState = await loadHomeComposition(
    {
      homeSection,
      userName: profile.firstName,
    },
    {
      userId,
      teamContext,
      preferences,
      profile,
      teamName,
    },
  );

  const view: HomeView = {
    type: "home",
    blocks: buildHomeCompositionBlocks(homeState),
  };

  await client.views.publish({
    user_id: userId,
    view,
  });
};

export const registerHomeHandlers = (app: App) => {
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
  });

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
      await publishHome(client, userId, teamContext);
    } catch (error) {
      logger.error({ error }, "allowlist_select failed");
    }
  });

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
      await publishHome(client, userId, teamContext);
    } catch (error) {
      logger.error({ error }, "settings_recommendations failed");
    }
  });

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
      await client.views.open({
        trigger_id: triggerId,
        view: buildEditTemplateModal({
          templateId: template.templateId,
          title: template.title,
          body: template.body,
        }),
      });
    } catch (error) {
      logger.error({ error }, "template_edit action failed");
    }
  });

  app.view(
    { callback_id: "template_edit", type: "view_submission" },
    async ({ ack, body, view, client }: HomeViewArgs) => {
      await ack();
      try {
        const teamContext = getTeamContext({ body });
        const metadata = JSON.parse(view.private_metadata || "{}");
        const templateId = metadata.templateId;
        const newBody = view.state.values?.body?.value?.value || "";
        if (!templateId) return;
        await updateTemplateBody(body.user.id, teamContext, templateId, newBody);
        await publishHome(client, body.user.id, teamContext);
      } catch (error) {
        logger.error({ error }, "template_edit view submit failed");
      }
    },
  );

  app.command("/recurring", async ({ ack, body, client }: HomeCommandArgs) => {
    await ack();
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildAddRecurringQuestionModal({ source: "slash" }),
      });
    } catch (error) {
      logger.error({ error }, "recurring command failed");
    }
  });

  app.view(
    { callback_id: "recurring_add", type: "view_submission" },
    async ({ ack, body, view, client }: HomeViewArgs) => {
      await ack();
      try {
        const teamContext = getTeamContext({ body });
        const question = view.state.values?.question?.value?.value || "";
        const title = view.state.values?.title?.value?.value || "";
        const frequency = view.state.values?.frequency?.value?.selected_option?.value || "weekly";
        const frequencyLabel =
          view.state.values?.frequency?.value?.selected_option?.text?.text || "Weekly";

      await createRecurringQuestion(body.user.id, teamContext, {
        question,
        title,
        frequency,
        frequencyLabel,
        delivery: undefined,
        dataSelection: undefined,
      });
        await publishHome(client, body.user.id, teamContext);
      } catch (error) {
        logger.error({ error }, "recurring_add submit failed");
      }
    },
  );

  app.action(
    "recurring_actions",
    async ({ ack, action, body, client }: HomeActionArgs<OverflowAction>) => {
    await ack();
    try {
      const selected = action.selected_option?.value || "";
      const userId = body.user.id;
      const triggerId = body.trigger_id;
      if (!userId) return;
      const [actionType, id] = selected.split(":");
      const teamContext = getTeamContext({ body });
      const recurringId = toRecurringId(id);
      if (!recurringId) return;

      if (actionType === "delete") {
        await deleteRecurringQuestion(userId, teamContext, recurringId);
        await publishHome(client, userId, teamContext);
        return;
      }

      if (actionType === "edit") {
        if (!triggerId) return;
        const recurring = await getRecurringQuestion(userId, teamContext, recurringId);
        if (!recurring) return;
        await client.views.open({
          trigger_id: triggerId,
          view: buildEditRecurringQuestionModal({
            id: recurring.id,
            question: recurring.question,
            title: recurring.title,
            frequency: recurring.frequency,
            frequencyLabel: recurring.frequencyLabel,
          }),
        });
      }
    } catch (error) {
      logger.error({ error }, "recurring_actions failed");
    }
  });

  app.view(
    { callback_id: "recurring_edit", type: "view_submission" },
    async ({ ack, body, view, client }: HomeViewArgs) => {
      await ack();
      try {
        const teamContext = getTeamContext({ body });
        const metadata = JSON.parse(view.private_metadata || "{}");
        const id = toRecurringId(metadata.id);
        if (!id) return;
        const question = view.state.values?.question?.value?.value || "";
        const title = view.state.values?.title?.value?.value || "";
        const frequency = view.state.values?.frequency?.value?.selected_option?.value || "weekly";
        const frequencyLabel =
          view.state.values?.frequency?.value?.selected_option?.text?.text || "Weekly";

        await updateRecurringQuestion(body.user.id, teamContext, id, {
          question,
          title,
          frequency,
          frequencyLabel,
        });
        await publishHome(client, body.user.id, teamContext);
      } catch (error) {
        logger.error({ error }, "recurring_edit submit failed");
      }
    },
  );
};
