import type { App, OverflowAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import {
  getRecurringQuestion,
  createRecurringQuestion,
  updateRecurringQuestion,
  deleteRecurringQuestion,
} from "../../data/recurring.js";
import {
  buildAddRecurringQuestionModal,
  buildEditRecurringQuestionModal,
} from "../../features/recurring/modals.js";
import { logger } from "../../lib/logger.js";
import type { Id } from "../../../convex/_generated/dataModel.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs, HomeCommandArgs, HomeViewArgs } from "./types.js";

const toRecurringId = (value: string): Id<"recurringQuestions"> | null => {
  if (!value) return null;
  return value as Id<"recurringQuestions">;
};

export const registerHomeRecurringHandlers = (app: App, publishHome: PublishHome) => {
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
    },
  );

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
