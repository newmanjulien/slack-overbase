import { ConvexHttpClient } from "convex/browser";
import { getConfig } from "../lib/config.js";

let cached: ConvexHttpClient | null = null;

export const getConvexClient = (): ConvexHttpClient => {
  if (cached) return cached;
  const { CONVEX_URL } = getConfig();
  cached = new ConvexHttpClient(CONVEX_URL);
  return cached;
};
