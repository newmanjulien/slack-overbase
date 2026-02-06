import type { EasyInputMessage } from "openai/resources/responses/responses";
import { getOpenAIClient } from "../lib/openai";
import { extractOutputText } from "../lib/openaiResponse";

export type InputMessage = EasyInputMessage;

export const buildInputMessage = (
  role: InputMessage["role"],
  content: InputMessage["content"],
): InputMessage => ({ role, content });

export const createTextResponse = async (payload: {
  model: string;
  input: EasyInputMessage[];
}): Promise<string> => {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: payload.model,
    input: payload.input,
  });
  return extractOutputText(response);
};
