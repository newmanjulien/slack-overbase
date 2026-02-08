import type { App, BlockElementAction } from "@slack/bolt";
import { getTeamContext } from "../../lib/teamContext.js";
import {
  createRecurringQuestion,
  deleteRecurringQuestion,
  getRecurringQuestion,
  updateRecurringQuestion,
} from "../../data/recurring.js";
import {
  buildAddRecurringQuestionModal,
  buildEditRecurringQuestionModal,
  buildRecurringDeleteConfirmModal,
  buildRecurringSuccessModal,
} from "../../features/recurring/modals/modals.js";
import { generateRecurringTitle } from "../../features/recurring/title.js";
import {
  isRecurringDataSelection,
  isRecurringDelivery,
  isRecurringFrequency,
} from "../../features/recurring/view.js";
import { logger } from "../../lib/logger.js";
import type { Id } from "../../../convex/_generated/dataModel.js";
import type { PublishHome } from "../publish.js";
import type { HomeActionArgs, HomeCommandArgs, HomeViewArgs } from "./types.js";
import { parseMetadata } from "./viewState.js";

const parseRecurringMetadata = (view: { private_metadata?: string } | undefined) => {
  const parsed = parseMetadata(view?.private_metadata);
  const questionId = typeof parsed.questionId === "string" ? parsed.questionId : "";
  const source = typeof parsed.source === "string" ? parsed.source : "home";
  return { questionId, source };
};

type RecurringModalValues = {
  questionText: string;
  titleText: string;
  selectedFrequency: string;
  selectedDelivery?: string;
  selectedData?: string;
};

const getRecurringModalValues = (values: Record<string, any> = {}): RecurringModalValues => ({
  questionText: values.recurring_question_text?.recurring_question_input?.value || "",
  titleText: values.recurring_question_title?.recurring_question_title_input?.value || "",
  selectedFrequency:
    values.recurring_question_frequency?.recurring_frequency_select?.selected_option?.value ||
    "weekly",
  selectedDelivery:
    values.recurring_question_delivery?.recurring_delivery_select?.selected_option?.value,
  selectedData: values.recurring_question_data?.recurring_data_select?.selected_option?.value,
});

const buildRecurringModalView = ({
  metadata,
  values,
  selectedFrequency,
  selectedDelivery,
  selectedData,
  timeZone,
}: {
  metadata: { questionId: string; source: string };
  values: Record<string, any>;
  selectedFrequency?: string;
  selectedDelivery?: string;
  selectedData?: string;
  timeZone?: string;
}) => {
  const {
    questionText,
    titleText,
    selectedFrequency: fallbackFrequency,
    selectedDelivery: fallbackDelivery,
    selectedData: fallbackData,
  } = getRecurringModalValues(values);

  const frequency = selectedFrequency || fallbackFrequency || "weekly";
  const delivery = selectedDelivery ?? fallbackDelivery ?? null;
  const dataSelection = selectedData ?? fallbackData ?? null;

  const commonArgs = {
    questionText,
    titleText,
    frequency: isRecurringFrequency(frequency) ? frequency : "weekly",
    delivery: delivery && isRecurringDelivery(delivery) ? delivery : null,
    dataSelection: dataSelection && isRecurringDataSelection(dataSelection) ? dataSelection : null,
    timeZone,
    source: metadata.source,
  };

  return metadata.questionId
    ? buildEditRecurringQuestionModal({
        question: { id: metadata.questionId },
        ...commonArgs,
      })
    : buildAddRecurringQuestionModal(commonArgs);
};

export const registerHomeRecurringHandlers = (app: App, publishHome: PublishHome) => {
  const openRecurringQuestionModal = async ({
    client,
    triggerId,
    timeZone,
    question,
    source,
  }: {
    client: any;
    triggerId: string;
    timeZone?: string;
    question?: {
      id?: string;
      question?: string;
      title?: string;
      frequency?: "weekly" | "monthly" | "quarterly";
      delivery?: string | null;
      dataSelection?: string | null;
    };
    source?: string;
  }) => {
    await client.views.open({
      trigger_id: triggerId,
      view: question
        ? buildEditRecurringQuestionModal({
            question,
            frequency: question.frequency,
            delivery: question.delivery ?? null,
            dataSelection: question.dataSelection ?? null,
            questionText: question.question,
            titleText: question.title,
            source,
          })
        : buildAddRecurringQuestionModal({ timeZone, source }),
    });
  };

  app.command("/recurring", async ({ ack, body, client }: HomeCommandArgs) => {
    await ack();
    try {
      const timeZone = (body.user as { tz?: string } | undefined)?.tz;
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildAddRecurringQuestionModal({
          timeZone,
          source: "slash",
        }),
      });
    } catch (error) {
      logger.error({ error }, "recurring command failed");
    }
  });

  app.action(
    "add_recurring_question",
    async ({ ack, body, client }: HomeActionArgs<BlockElementAction>) => {
      await ack();
      try {
        const timeZone = (body.user as { tz?: string } | undefined)?.tz;
        await openRecurringQuestionModal({
          client,
          triggerId: body.trigger_id,
          timeZone,
          source: "home",
        });
      } catch (error) {
        logger.error({ error }, "add recurring question failed");
      }
    },
  );

  app.action(
    "edit_recurring_question",
    async ({ ack, body, client, action }: HomeActionArgs<BlockElementAction>) => {
      await ack();
      try {
        const questionId = "value" in action ? (action.value as string) : "";
        if (!questionId) return;
        const teamContext = getTeamContext({ body });
        const question = await getRecurringQuestion(
          body.user.id,
          teamContext,
          questionId as Id<"recurringQuestions">,
        );
        if (!question) return;
        await openRecurringQuestionModal({
          client,
          triggerId: body.trigger_id,
          timeZone: (body.user as { tz?: string } | undefined)?.tz,
          question: {
            id: question.id,
            question: question.question,
            title: question.title,
            frequency: question.frequency,
            delivery: question.delivery,
            dataSelection: question.dataSelection,
          },
          source: "home",
        });
      } catch (error) {
        logger.error({ error }, "edit recurring question failed");
      }
    },
  );

  app.action(
    "delete_recurring_question",
    async ({ ack, body, action, client }: HomeActionArgs<BlockElementAction>) => {
      await ack();
      try {
        const questionId = "value" in action ? (action.value as string) : "";
        if (!questionId) return;
        const teamContext = getTeamContext({ body });
        await deleteRecurringQuestion(
          body.user.id,
          teamContext,
          questionId as Id<"recurringQuestions">,
        );
        await publishHome(client, body.user.id, teamContext, { homeSection: "recurring" });
      } catch (error) {
        logger.error({ error }, "Failed to delete recurring question");
      }
    },
  );

  app.action(
    "delete_recurring_question_modal",
    async ({ ack, body, client }: HomeActionArgs<BlockElementAction>) => {
      const metadata = parseRecurringMetadata(body.view);
      if (!metadata.questionId) {
        await ack();
        return;
      }

      await ack();
      await client.views.push({
        trigger_id: body.trigger_id,
        view: buildRecurringDeleteConfirmModal({
          questionId: metadata.questionId,
          source: metadata.source,
        }),
      });
    },
  );

  app.view(
    "recurring_question_delete_confirm",
    async ({ ack, body, client }: HomeViewArgs) => {
      const metadata = parseRecurringMetadata(body.view);

      await ack({ response_action: "clear" });

      if (!metadata.questionId) return;
      const teamContext = getTeamContext({ body });
      try {
        await deleteRecurringQuestion(
          body.user.id,
          teamContext,
          metadata.questionId as Id<"recurringQuestions">,
        );
        await publishHome(client, body.user.id, teamContext, { homeSection: "recurring" });
      } catch (error) {
        logger.error({ error }, "Failed to delete recurring question from modal");
      }
    },
  );

  app.action(
    "recurring_frequency_select",
    async ({ ack, body, client }: HomeActionArgs<BlockElementAction>) => {
      await ack();
      const metadata = parseRecurringMetadata(body.view);
      const values = body.view?.state?.values || {};
      const selectedFrequency =
        (body.actions?.[0] as any)?.selected_option?.value ||
        getRecurringModalValues(values).selectedFrequency;
      await client.views.update({
        view_id: body.view?.id,
        hash: body.view?.hash,
        view: buildRecurringModalView({
          metadata,
          values,
          selectedFrequency,
          timeZone: (body.user as { tz?: string } | undefined)?.tz,
        }),
      });
    },
  );

  app.action(
    "recurring_delivery_select",
    async ({ ack, body, client }: HomeActionArgs<BlockElementAction>) => {
      await ack();
      const metadata = parseRecurringMetadata(body.view);
      const values = body.view?.state?.values || {};
      const selectedDelivery =
        (body.actions?.[0] as any)?.selected_option?.value ||
        getRecurringModalValues(values).selectedDelivery;
      await client.views.update({
        view_id: body.view?.id,
        hash: body.view?.hash,
        view: buildRecurringModalView({
          metadata,
          values,
          selectedDelivery,
          timeZone: (body.user as { tz?: string } | undefined)?.tz,
        }),
      });
    },
  );

  app.view("recurring_question_modal", async ({ ack, body, view, client }: HomeViewArgs) => {
    const metadata = parseRecurringMetadata(view);
    const teamContext = getTeamContext({ body });
    const values = view.state?.values || {};
    const { questionText, titleText } = getRecurringModalValues(values);
    const frequencyOption =
      values.recurring_question_frequency?.recurring_frequency_select?.selected_option;
    const deliveryOption =
      values.recurring_question_delivery?.recurring_delivery_select?.selected_option;
    const dataOption = values.recurring_question_data?.recurring_data_select?.selected_option;
    const frequency =
      (frequencyOption?.value && isRecurringFrequency(frequencyOption.value)
        ? frequencyOption.value
        : "weekly");
    const delivery =
      deliveryOption?.value && isRecurringDelivery(deliveryOption.value)
        ? deliveryOption.value
        : null;
    const dataSelection =
      dataOption?.value && isRecurringDataSelection(dataOption.value)
        ? dataOption.value
        : null;
    const frequencyLabel = `${frequencyOption?.text?.text || "Weekly"} · ${deliveryOption?.text?.text || "Mondays"}`;
    const manualTitle = titleText.trim().slice(0, 60);
    let generatedTitle: string | null = null;

    if (!manualTitle) {
      try {
        generatedTitle = await generateRecurringTitle({
          questionText,
          frequencyLabel,
          dataSelection,
        });
      } catch (error) {
        logger.error({ error }, "Failed to generate recurring title");
      }
    }

    const payload = {
      question: questionText,
      frequency,
      frequencyLabel,
      delivery,
      dataSelection,
      title: manualTitle || generatedTitle || questionText || "Recurring Question",
    };

    if (metadata.questionId) {
      await updateRecurringQuestion(
        body.user.id,
        teamContext,
        metadata.questionId as Id<"recurringQuestions">,
        payload,
      );
    } else {
      await createRecurringQuestion(body.user.id, teamContext, payload);
    }

    if (metadata.source === "slash") {
      await ack({ response_action: "update", view: buildRecurringSuccessModal() });
      return;
    }

    await ack();
    try {
      await publishHome(client, body.user.id, teamContext, { homeSection: "recurring" });
    } catch (error) {
      logger.error({ error }, "Failed to publish home after recurring submit");
    }
  });
};
