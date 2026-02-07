import { query } from "../_generated/server.js";
import { v } from "convex/values";

export const getAssetUrlById = query({
  args: { imageId: v.id("_storage") },
  handler: async (ctx, { imageId }) => {
    const imageUrl = await ctx.storage.getUrl(imageId);
    return { imageUrl };
  },
});
