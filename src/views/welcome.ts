import type { KnownBlock } from "@slack/types";

export const buildWelcomeBlocks = (): KnownBlock[] => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Welcome to Overbase! Ask me questions in Messages, or explore templates and recurring questions here.",
    },
  },
];
