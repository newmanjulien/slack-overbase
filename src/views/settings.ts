import type { KnownBlock, PlainTextOption } from "@slack/types";

export const buildSettingsBlocks = (
  recommendations: { pastQuestions: boolean; similarExecs: boolean },
  portalLinks: { paymentsUrl?: string },
): KnownBlock[] => {
  const options: PlainTextOption[] = [
    {
      text: { type: "plain_text", text: "Use past questions" },
      value: "past_questions",
    },
    {
      text: { type: "plain_text", text: "Use similar execs" },
      value: "similar_execs",
    },
  ];
  const initialOptions: PlainTextOption[] = [
    ...(recommendations.pastQuestions ? [options[0]] : []),
    ...(recommendations.similarExecs ? [options[1]] : []),
  ];

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Recommendation settings:",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "checkboxes",
          action_id: "settings_recommendations",
          options,
          initial_options: initialOptions,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Payments and billing: <${portalLinks.paymentsUrl || ""}|Open billing>`,
      },
    },
  ];
};
