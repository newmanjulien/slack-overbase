import { normalizeHomeSection, type HomeSection } from "../home.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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
