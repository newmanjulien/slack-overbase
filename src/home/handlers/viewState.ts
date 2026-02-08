import { normalizeHomeSection, type HomeSection } from "../home.js";

export type ViewStateField = {
  value?: string;
  selected_option?: {
    value?: string;
    text?: { text?: string };
  };
};

type ViewStateValues = Record<string, Record<string, unknown>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getField = (
  values: unknown,
  blockId: string,
  actionId: string,
): ViewStateField | null => {
  if (!isRecord(values)) return null;
  const block = values[blockId];
  if (!isRecord(block)) return null;
  const field = block[actionId];
  if (!isRecord(field)) return null;
  return field as ViewStateField;
};

export const getTextValue = (
  values: unknown,
  blockId: string,
  actionId: string,
  fallback = "",
): string => {
  const field = getField(values, blockId, actionId);
  return typeof field?.value === "string" ? field.value : fallback;
};

export const getSelectedOptionValue = (
  values: unknown,
  blockId: string,
  actionId: string,
  fallback = "",
): string => {
  const field = getField(values, blockId, actionId);
  const option = field?.selected_option;
  return typeof option?.value === "string" ? option.value : fallback;
};

export const getSelectedOptionLabel = (
  values: unknown,
  blockId: string,
  actionId: string,
  fallback = "",
): string => {
  const field = getField(values, blockId, actionId);
  const label = field?.selected_option?.text?.text;
  return typeof label === "string" ? label : fallback;
};

export const parseMetadata = (raw?: string): Record<string, unknown> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const getHomeSectionFromMetadata = (
  metadata: Record<string, unknown>,
): HomeSection | undefined => {
  const raw = metadata.homeSection;
  if (typeof raw !== "string") return undefined;
  return normalizeHomeSection(raw);
};
