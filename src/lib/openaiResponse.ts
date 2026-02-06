import type OpenAI from "openai";

export const extractOutputText = (response: OpenAI.Responses.Response) => {
  const output = response.output || [];
  for (const item of output) {
    if (item.type === "message") {
      const content = item.content || [];
      for (const part of content) {
        if (part.type === "output_text" && part.text) {
          return part.text;
        }
      }
    }
  }
  return "";
};
