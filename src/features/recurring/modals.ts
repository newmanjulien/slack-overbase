import type { ModalView } from "@slack/types";
import type { Id } from "../../../convex/_generated/dataModel";

export const buildAddRecurringQuestionModal = (payload: {
  timeZone?: string;
  source?: string;
}): ModalView => {
  return {
    type: "modal",
    callback_id: "recurring_add",
    title: { type: "plain_text", text: "Add recurring" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    private_metadata: JSON.stringify(payload),
    blocks: [
      {
        type: "input",
        block_id: "question",
        label: { type: "plain_text", text: "Question" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          multiline: true,
        },
      },
      {
        type: "input",
        block_id: "title",
        label: { type: "plain_text", text: "Title" },
        element: {
          type: "plain_text_input",
          action_id: "value",
        },
      },
      {
        type: "input",
        block_id: "frequency",
        label: { type: "plain_text", text: "Frequency" },
        element: {
          type: "static_select",
          action_id: "value",
          options: [
            { text: { type: "plain_text", text: "Daily" }, value: "daily" },
            { text: { type: "plain_text", text: "Weekly" }, value: "weekly" },
            { text: { type: "plain_text", text: "Monthly" }, value: "monthly" },
          ],
        },
      },
    ],
  };
};

export const buildEditRecurringQuestionModal = (payload: {
  id: Id<"recurringQuestions">;
  question: string;
  title: string;
  frequency: string;
  frequencyLabel: string;
}): ModalView => {
  return {
    type: "modal",
    callback_id: "recurring_edit",
    title: { type: "plain_text", text: "Edit recurring" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    private_metadata: JSON.stringify({ id: payload.id }),
    blocks: [
      {
        type: "input",
        block_id: "question",
        label: { type: "plain_text", text: "Question" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          multiline: true,
          initial_value: payload.question,
        },
      },
      {
        type: "input",
        block_id: "title",
        label: { type: "plain_text", text: "Title" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          initial_value: payload.title,
        },
      },
      {
        type: "input",
        block_id: "frequency",
        label: { type: "plain_text", text: "Frequency" },
        element: {
          type: "static_select",
          action_id: "value",
          options: [
            { text: { type: "plain_text", text: "Daily" }, value: "daily" },
            { text: { type: "plain_text", text: "Weekly" }, value: "weekly" },
            { text: { type: "plain_text", text: "Monthly" }, value: "monthly" },
          ],
          initial_option: {
            text: { type: "plain_text", text: payload.frequencyLabel },
            value: payload.frequency,
          },
        },
      },
    ],
  };
};
