import type { KnownBlock } from "@slack/types";
import { buildHomeBaseBlocks } from "../views/home.js";
import { datasourcesSection } from "./datasources.js";
import { recurringSection } from "./recurring.js";
import { settingsSection } from "./settings.js";
import { templatesSection } from "./templates.js";
import { welcomeSection } from "./welcome.js";
import type { HomeBaseState, HomeSectionState, HomeSectionContext, HomeSectionSpecMap } from "../types.js";
import { normalizeHomeSection } from "../home.js";

export const compositionRegistry = {
  welcome: welcomeSection,
  templates: templatesSection,
  recurring: recurringSection,
  datasources: datasourcesSection,
  settings: settingsSection,
} as const satisfies HomeSectionSpecMap;

export { normalizeHomeSection };

const assertNever = (value: never): never => {
  throw new Error(`Unhandled home section: ${String(value)}`);
};

export const buildHomeCompositionBlocks = (state: HomeSectionState): KnownBlock[] => {
  const baseBlocks = buildHomeBaseBlocks(state);
  switch (state.homeSection) {
    case "welcome":
      return [...baseBlocks, ...compositionRegistry.welcome.view(state)];
    case "templates":
      return [...baseBlocks, ...compositionRegistry.templates.view(state)];
    case "recurring":
      return [...baseBlocks, ...compositionRegistry.recurring.view(state)];
    case "datasources":
      return [...baseBlocks, ...compositionRegistry.datasources.view(state)];
    case "settings":
      return [...baseBlocks, ...compositionRegistry.settings.view(state)];
    default:
      return assertNever(state);
  }
};

export const loadHomeComposition = async (
  baseState: HomeBaseState,
  ctx: HomeSectionContext,
): Promise<HomeSectionState> => {
  switch (baseState.homeSection) {
    case "welcome":
      return {
        ...baseState,
        homeSection: "welcome",
        ...(await compositionRegistry.welcome.load(ctx)),
      };
    case "templates":
      return {
        ...baseState,
        homeSection: "templates",
        ...(await compositionRegistry.templates.load(ctx)),
      };
    case "recurring":
      return {
        ...baseState,
        homeSection: "recurring",
        ...(await compositionRegistry.recurring.load(ctx)),
      };
    case "datasources":
      return {
        ...baseState,
        homeSection: "datasources",
        ...(await compositionRegistry.datasources.load(ctx)),
      };
    case "settings":
      return {
        ...baseState,
        homeSection: "settings",
        ...(await compositionRegistry.settings.load(ctx)),
      };
    default:
      const _exhaustive: never = baseState.homeSection;
      return assertNever(_exhaustive);
  }
};
