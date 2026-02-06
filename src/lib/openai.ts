import OpenAI from "openai";
import { getConfig } from "./config";

let cached: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (cached) return cached;
  const { OPENAI_API_KEY } = getConfig();
  cached = new OpenAI({ apiKey: OPENAI_API_KEY });
  return cached;
};
