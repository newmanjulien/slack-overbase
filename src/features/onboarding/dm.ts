import type { KnownBlock } from "@slack/types";
import type { GenericId as StorageId } from "convex/values";
import { toStorageId } from "../../home/ids.js";

export type OnboardingImages = {
  message?: string | null;
};

const ONBOARDING_IMAGE_ID_STRINGS = {
  message: "kg23m8z50ypv4qaphta8aekvt180q0qq",
} as const satisfies Record<keyof OnboardingImages, string>;

export const ONBOARDING_IMAGE_IDS = {
  message: toStorageId(ONBOARDING_IMAGE_ID_STRINGS.message),
} as const satisfies Record<keyof OnboardingImages, StorageId<"_storage">>;

export const getOnboardingImageIds = (): Record<keyof OnboardingImages, StorageId<"_storage">> =>
  ONBOARDING_IMAGE_IDS;

export const buildOnboardingDm = (
  imageUrl?: string | null,
): { text: string; blocks: KnownBlock[] } => {
  const blocks: KnownBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome to Overbase*\nI'm your personal analyst and I'll give you reliable answers to any question. Even when the data is in multiple disconnected databases or systems\n\nJust ask me in plain English right here",
      },
    },
  ];

  if (imageUrl) {
    blocks.push({
      type: "image",
      image_url: imageUrl,
      alt_text: "Ask a question",
    });
  }

  return {
    text: "Welcome! Just send me a DM with any question to get started.",
    blocks,
  };
};
