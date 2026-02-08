import type { ModalView } from "@slack/types";
import {
  buildRecurringDataOptions,
  buildRecurringDeliveryOptions,
  buildRecurringFrequencyOptions,
} from "../view.js";
import {
  buildRecurringMetadata,
  formatFirstDeliveryDate,
  getFirstDeliveryDate,
  resolveOption,
} from "./utils.js";
import type { RecurringFrequency } from "../../../data/recurring.js";

export const buildAddRecurringQuestionModal = ({
  frequency,
  delivery,
  dataSelection,
  questionText,
  timeZone,
  source,
}: {
  frequency?: RecurringFrequency;
  delivery?: string | null;
  dataSelection?: string | null;
  questionText?: string;
  timeZone?: string;
  source?: string;
} = {}): ModalView => {
  const frequencyOptions = buildRecurringFrequencyOptions();
  const selectedFrequency = frequency || (frequencyOptions[0]?.value as RecurringFrequency);
  const deliveryOptions = buildRecurringDeliveryOptions(selectedFrequency);
  const dataOptions = buildRecurringDataOptions(selectedFrequency);
  const initialFrequencyOption = resolveOption(frequencyOptions, selectedFrequency);
  const initialDeliveryOption = resolveOption(deliveryOptions, delivery);
  const initialDataOption = resolveOption(dataOptions, dataSelection);
  const userTimeZone = timeZone || "UTC";
  const firstDeliveryText = formatFirstDeliveryDate(
    getFirstDeliveryDate(
      new Date(),
      selectedFrequency,
      initialDeliveryOption?.value,
      userTimeZone,
    ),
    userTimeZone,
  );

  return {
    type: "modal",
    callback_id: "recurring_question_modal",
    private_metadata: buildRecurringMetadata({ source }),
    title: { type: "plain_text", text: "New recurring question" },
    submit: { type: "plain_text", text: "Create" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "recurring_question_text",
        label: { type: "plain_text", text: "Question" },
        element: {
          type: "plain_text_input",
          action_id: "recurring_question_input",
          initial_value: questionText || "",
          multiline: true,
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
      ...(firstDeliveryText
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `First answer: *${firstDeliveryText}*` },
            },
          ]
        : []),
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
    ],
  };
};
