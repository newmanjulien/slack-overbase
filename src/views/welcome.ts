import type { KnownBlock } from "@slack/types";

export const buildWelcomeBlocks = (): KnownBlock[] => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "Ask me questions",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "I'll get reliable answers from even the most disconnected data",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Ask questions*\nGo to the Messages tab and send me a DM with any question you might have",
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Learn more",
      },
      action_id: "welcome_action",
      value: "learn_more",
    },
  },
  {
    type: "image",
    image_url:
      "https://images.weserv.nl/?url=raw.githubusercontent.com/newmanjulien/overbase/main/public/images/message_pointer.png&w=1600&h=900&fit=cover&output=png",
    alt_text: "Welcome",
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Use templates*\nSee what questions other revenue execs have asked and how they asked them",
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Learn more",
      },
      action_id: "welcome_action",
      value: "learn_more",
    },
  },
  {
    type: "image",
    image_url:
      "https://images.weserv.nl/?url=raw.githubusercontent.com/newmanjulien/overbase/main/public/images/templates_pointer.png&w=1600&h=900&fit=cover&output=png",
    alt_text: "Welcome",
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Add datasources*\nI'll answer your questions using any datasource with 0 migration or cleanup",
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Learn more",
      },
      action_id: "welcome_action",
      value: "learn_more",
    },
  },
  {
    type: "image",
    image_url:
      "https://images.weserv.nl/?url=raw.githubusercontent.com/newmanjulien/overbase/main/public/images/datasources_pointer.png&w=1600&h=900&fit=cover&output=png",
    alt_text: "Welcome",
  },
];
