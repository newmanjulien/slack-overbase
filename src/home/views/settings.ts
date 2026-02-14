import type { Checkboxes, KnownBlock, PlainTextOption } from "@slack/types";
import type { HomeSectionDataMap } from "../types.js";

const pastQuestionsOption: PlainTextOption = {
  text: { type: "plain_text", text: "Based on your past questions" },
  value: "past_questions",
};

const similarExecsOption: PlainTextOption = {
  text: {
    type: "plain_text",
    text: "Based on questions asked by similar execs",
  },
  value: "similar_execs",
};

const legalLinks =
  "• <https://example.com/terms-of-service|Terms of Service>\n" +
  "• <https://example.com/privacy-policy|Privacy Policy>\n" +
  "• <https://example.com/data-processing-addendum|Data Processing Addendum>";

const buildRecommendationsElement = (
  recommendations: HomeSectionDataMap["settings"]["recommendations"],
) => {
  const initialOptions: PlainTextOption[] = [
    ...(recommendations.pastQuestions ? [pastQuestionsOption] : []),
    ...(recommendations.similarExecs ? [similarExecsOption] : []),
  ];

  const element: Checkboxes = {
    type: "checkboxes" as const,
    action_id: "settings_recommendations",
    options: [pastQuestionsOption, similarExecsOption],
  };

  if (initialOptions.length > 0) {
    element.initial_options = initialOptions;
  }

  return element;
};

export const buildSettingsBlocks = (
  recommendations: HomeSectionDataMap["settings"]["recommendations"],
  portalLinks: HomeSectionDataMap["settings"]["portalLinks"],
): KnownBlock[] => {
  const paymentsBlock: KnownBlock = portalLinks.paymentsUrl
    ? {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Manage payments" },
            action_id: "manage_payments",
            url: portalLinks.paymentsUrl,
          },
        ],
      }
    : {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Portal link unavailable. Please try again later._",
        },
      };
  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Payments" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "You're currently on the on the pay per question plan",
      },
    },
    paymentsBlock,
    {
      type: "header",
      text: { type: "plain_text", text: "Recommendations" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Control your recommendations and notifications",
      },
    },
    {
      type: "section",
      block_id: "settings_recommendations_block",
      text: { type: "mrkdwn", text: "*Recommendations*" },
      accessory: buildRecommendationsElement(recommendations),
    },
    {
      type: "header",
      text: { type: "plain_text", text: "Legal agreements" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "Review our legal agreements:" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: legalLinks },
    },
  ];
};
