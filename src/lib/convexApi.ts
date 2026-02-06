import { anyApi, componentsGeneric } from "convex/server";
import type {
  api as GeneratedApi,
  internal as GeneratedInternal,
  components as GeneratedComponents,
} from "../../convex/_generated/api";

// Runtime-safe Convex API helpers for CommonJS builds.
export const api = anyApi as typeof GeneratedApi;
export const internal = anyApi as typeof GeneratedInternal;
export const components = componentsGeneric() as typeof GeneratedComponents;
