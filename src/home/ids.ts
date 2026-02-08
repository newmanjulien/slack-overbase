import type { GenericId as StorageId } from "convex/values";
import type { Id } from "../../convex/_generated/dataModel.js";

// Convex only documents these as URL-safe base32 strings, no runtime validator.
const CONVEX_ID_PATTERN = /^[a-z0-9]+$/i;

export const isConvexId = (value: unknown): value is string =>
  typeof value === "string" && CONVEX_ID_PATTERN.test(value);

export const toStorageId = (value: string): StorageId<"_storage"> => {
  if (!isConvexId(value)) {
    throw new Error(`Invalid Convex storage id: ${value}`);
  }
  return value as StorageId<"_storage">;
};

export const toRecurringId = (value: unknown): Id<"recurringQuestions"> | null => {
  if (!isConvexId(value)) return null;
  return value as Id<"recurringQuestions">;
};
