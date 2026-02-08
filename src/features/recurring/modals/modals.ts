import type { ModalView } from "@slack/types";
import { buildAddRecurringQuestionModal } from "./addRecurring.js";
import { buildEditRecurringQuestionModal } from "./editRecurring.js";
import { buildRecurringMetadata } from "./utils.js";

export const buildRecurringSuccessModal = (): ModalView => ({
  type: "modal",
  callback_id: "recurring_question_success",
  title: { type: "plain_text", text: "Question accepted" },
  close: { type: "plain_text", text: "Close" },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Your recurring question has been accepted. It's displayed in the Recurring section of your Home tab",
      },
    },
  ],
});

export const buildRecurringDeleteConfirmModal = ({
  questionId,
  source,
}: {
  questionId?: string;
  source?: string;
} = {}): ModalView => ({
  type: "modal",
  callback_id: "recurring_question_delete_confirm",
  private_metadata: buildRecurringMetadata({ questionId, source }),
  title: { type: "plain_text", text: "Delete question" },
  submit: { type: "plain_text", text: "Delete" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "section",
      text: { type: "mrkdwn", text: "This will remove the recurring question." },
    },
  ],
});

export {
  buildAddRecurringQuestionModal,
  buildEditRecurringQuestionModal,
  buildRecurringMetadata,
};
