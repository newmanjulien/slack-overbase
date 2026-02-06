import type { KnownBlock } from "@slack/types";
import type { Id } from "../../convex/_generated/dataModel.js";

export const buildRecurringBlocks = (
  recurring: Array<{
    id: Id<"recurringQuestions">;
    title: string;
    question: string;
    frequencyLabel: string;
  }>,
): KnownBlock[] => {
  if (recurring.length === 0) {
    return [
      {
        type: "section",
        text: { type: "mrkdwn", text: "No recurring questions yet." },
      },
    ];
  }

  const blocks: KnownBlock[] = [];
  for (const item of recurring) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${item.title}* (${item.frequencyLabel})\n${item.question}`,
      },
      accessory: {
        type: "overflow",
        action_id: "recurring_actions",
        options: [
          {
            text: { type: "plain_text", text: "Edit" },
            value: `edit:${item.id}`,
          },
          {
            text: { type: "plain_text", text: "Delete" },
            value: `delete:${item.id}`,
          },
        ],
      },
    });
    blocks.push({ type: "divider" });
  }
  return blocks;
};
