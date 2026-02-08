import type { ModalView } from "@slack/types";
import {
  buildRecurringDataOptions,
  buildRecurringDeliveryOptions,
  buildRecurringFrequencyOptions,
} from "../view.js";
import { buildRecurringMetadata, resolveOption } from "./utils.js";
import type { RecurringFrequency } from "../../../data/recurring.js";

export const buildEditRecurringQuestionModal = ({
  question,
  frequency,
  delivery,
  dataSelection,
  questionText,
  titleText,
  source,
}: {
  question?: { id?: string; question?: string; title?: string; frequency?: RecurringFrequency };
  frequency?: RecurringFrequency;
  delivery?: string | null;
  dataSelection?: string | null;
  questionText?: string;
  titleText?: string;
  source?: string;
} = {}): ModalView => {
  const frequencyOptions = buildRecurringFrequencyOptions();
  const selectedFrequency =
    frequency || question?.frequency || (frequencyOptions[0]?.value as RecurringFrequency);
  const deliveryOptions = buildRecurringDeliveryOptions(selectedFrequency);
  const dataOptions = buildRecurringDataOptions(selectedFrequency);
  const initialFrequencyOption = resolveOption(frequencyOptions, selectedFrequency);
  const initialDeliveryOption = resolveOption(deliveryOptions, delivery);
  const initialDataOption = resolveOption(dataOptions, dataSelection);

  return {
    type: "modal",
    callback_id: "recurring_question_modal",
    private_metadata: buildRecurringMetadata({
      questionId: question?.id,
      source,
    }),
    title: { type: "plain_text", text: "Edit recurring question" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "recurring_question_text",
        label: { type: "plain_text", text: "Question" },
        element: {
          type: "plain_text_input",
          action_id: "recurring_question_input",
          initial_value: questionText || question?.question || "",
          multiline: true,
        },
      },
      {
        type: "input",
        block_id: "recurring_question_title",
        label: { type: "plain_text", text: "Title" },
        element: {
          type: "plain_text_input",
          action_id: "recurring_question_title_input",
          initial_value: titleText || question?.title || "",
          max_length: 60,
        },
      },
      {
        type: "section",
        block_id: "recurring_question_frequency",
        text: { type: "mrkdwn", text: "*How often?*" },
        accessory: {
          type: "static_select",
          action_id: "recurring_frequency_select",
          options: frequencyOptions,
          initial_option: initialFrequencyOption,
        },
      },
      {
        type: "section",
        block_id: "recurring_question_delivery",
        text: { type: "mrkdwn", text: "*When should we deliver?*" },
        accessory: {
          type: "static_select",
          action_id: "recurring_delivery_select",
          options: deliveryOptions,
          initial_option: initialDeliveryOption,
        },
      },
      {
        type: "section",
        block_id: "recurring_question_data",
        text: { type: "mrkdwn", text: "*What data should we use?*" },
        accessory: {
          type: "static_select",
          action_id: "recurring_data_select",
          options: dataOptions,
          initial_option: initialDataOption,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "Delete this recurring question" },
        accessory: {
          type: "button",
          text: { type: "plain_text", text: "Delete" },
          style: "danger",
          action_id: "delete_recurring_question_modal",
        },
      },
    ],
  };
};
