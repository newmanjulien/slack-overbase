import type { GenericId as Id } from "convex/values";
import { getConvexClient } from "./convex.js";
import { logger } from "../lib/logger.js";

export const getAssetUrlById = async (
  imageId: Id<"_storage">,
): Promise<string | null> => {
  try {
    const client = getConvexClient();
    const result = await client.query("portal/assets:getAssetUrlById", { imageId });
    return result?.imageUrl ?? null;
  } catch (error) {
    logger.error({ error, imageId }, "Failed to fetch asset url");
    return null;
  }
};
