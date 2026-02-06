export const buildSettingsBlocks = (
  recommendations: { pastQuestions: boolean; similarExecs: boolean },
  portalLinks: { paymentsUrl?: string },
) => [
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
        options: [
          {
            text: { type: "plain_text", text: "Use past questions" },
            value: "past_questions",
          },
          {
            text: { type: "plain_text", text: "Use similar execs" },
            value: "similar_execs",
          },
        ],
        initial_options: [
          ...(recommendations.pastQuestions
            ? [
                {
                  text: { type: "plain_text", text: "Use past questions" },
                  value: "past_questions",
                },
              ]
            : []),
          ...(recommendations.similarExecs
            ? [
                {
                  text: { type: "plain_text", text: "Use similar execs" },
                  value: "similar_execs",
                },
              ]
            : []),
        ],
      },
    ],
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Payments and billing: <${portalLinks.paymentsUrl || ""}|Open billing>`
    }
  }
];
