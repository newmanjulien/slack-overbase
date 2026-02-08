import { getOpenAIClient } from "../../lib/openai.js";
import { extractOutputText } from "../../lib/openaiResponse.js";

const sanitizeTitle = (title: string | null | undefined): string => {
  if (!title) return "";
  let sanitized = title.split("\n")[0].trim();
  sanitized = sanitized.replace(/^[\"']+|[\"']+$/g, "");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  sanitized = sanitized.replace(/[.!?]+$/g, "");
  if (sanitized.length > 80) {
    sanitized = sanitized.slice(0, 80).trim();
  }
  return sanitized;
};

const buildPrompt = ({
  questionText,
  frequencyLabel,
  dataSelection,
}: {
  questionText: string;
  frequencyLabel?: string | null;
  dataSelection?: string | null;
}): string => {
  const parts = [`Question: ${questionText}`];
  if (frequencyLabel) parts.push(`Cadence: ${frequencyLabel}`);
  if (dataSelection) parts.push(`Data selection: ${dataSelection}`);
  return parts.join("\n");
};

export const generateRecurringTitle = async ({
  questionText,
  frequencyLabel,
  dataSelection,
}: {
  questionText: string;
  frequencyLabel?: string | null;
  dataSelection?: string | null;
}): Promise<string | null> => {
  const trimmedQuestion = (questionText || "").trim();
  if (!trimmedQuestion) return null;

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions:
      "Create a short, clear title (3-6 words) for a recurring question. Return only the title text. No quotes, no bullet points, no trailing punctuation.",
    input: buildPrompt({
      questionText: trimmedQuestion,
      frequencyLabel: frequencyLabel ?? undefined,
      dataSelection: dataSelection ?? undefined,
    }),
    temperature: 0.2,
    max_output_tokens: 24,
  });

  const outputText = extractOutputText(response);
  const title = sanitizeTitle(outputText);
  return title || null;
};
