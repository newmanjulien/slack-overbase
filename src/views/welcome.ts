import type { KnownBlock } from "@slack/types";
import type { GenericId as StorageId } from "convex/values";

type WelcomeImages = {
  message?: string | null;
  templates?: string | null;
  datasources?: string | null;
};

export const WELCOME_IMAGE_IDS = {
  message: "kg2b0w0rssjfhb8srtbw5vpr9980pmqs",
  templates: "kg23146r4hh01cse72ccs1skjx80qsrk",
  datasources: "kg27wz50agyn4ras5f5qcxcmws80q3ag",
} as const satisfies Record<keyof WelcomeImages, string>;

export const getWelcomeImageIds = (): Record<
  keyof WelcomeImages,
  StorageId<"_storage">
> => ({
  message: WELCOME_IMAGE_IDS.message as StorageId<"_storage">,
  templates: WELCOME_IMAGE_IDS.templates as StorageId<"_storage">,
  datasources: WELCOME_IMAGE_IDS.datasources as StorageId<"_storage">,
});

export const buildWelcomeBlocks = (images?: WelcomeImages): KnownBlock[] => {
  const blocks: KnownBlock[] = [
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
        text: "Ask me any question about your internal data and I'll get reliable answers from even the most disconnected datasources",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Ask questions*\nGo to the Messages tab and send me a DM with any question about your internal data",
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
  ];

  if (images?.message) {
    blocks.push({
      type: "image",
      image_url: images.message,
      alt_text: "Welcome",
    });
  }

  blocks.push({
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
  });

  if (images?.templates) {
    blocks.push({
      type: "image",
      image_url: images.templates,
      alt_text: "Welcome",
    });
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Add datasources*\nI'll answer using any of your internal datasources no matter how disconnected or dirty they are\n\nAdd any datasource with 0 migration or cleanup. And without needing IT's help. I can use structured data, unstructured data, and even people data that lives in the heads of your team members",
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
  });

  if (images?.datasources) {
    blocks.push({
      type: "image",
      image_url: images.datasources,
      alt_text: "Welcome",
    });
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Use /help*\nType `/help` in any channel or DM to see what I can do and get details on how to use me",
    },
  });

  return blocks;
};
