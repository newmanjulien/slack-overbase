import type { KnownBlock } from "@slack/types";
import type { Id } from "../../convex/_generated/dataModel.js";
import type { RecommendationSettings, UserPreferences } from "../data/preferences.js";
import type { TeamContext } from "../lib/teamContext.js";
import type { WelcomeImages } from "./views/welcome.js";
import type { HomeSection } from "./home.js";

export type HomeBaseState = {
  homeSection: HomeSection;
  userName?: string;
};

export type HomeSectionDataMap = {
  welcome: {
    welcomeImages: WelcomeImages;
  };
  templates: {
    templates: Array<{ templateId: string; title: string; summary: string; category: string }>;
    templateSection: string;
    sectionOptions: Array<{ value: string; label: string }>;
  };
  recurring: {
    recurring: Array<{
      id: Id<"recurringQuestions">;
      title: string;
      question: string;
      frequencyLabel: string;
    }>;
  };
  datasources: {
    allowlist: string[];
    portalLinks: { connectorsUrl?: string; peopleUrl?: string };
  };
  settings: {
    recommendations: RecommendationSettings;
    portalLinks: { paymentsUrl?: string };
  };
};

export type HomeSectionState = {
  [K in HomeSection]: HomeBaseState & { homeSection: K } & HomeSectionDataMap[K];
}[HomeSection];

export type HomeSectionContext = {
  userId: string;
  teamContext: TeamContext;
  preferences: UserPreferences;
  profile: { firstName: string; name?: string; avatar?: string };
  teamName?: string;
};

export type HomeSectionSpec<K extends HomeSection = HomeSection> = {
  load: (ctx: HomeSectionContext) => Promise<HomeSectionDataMap[K]>;
  view: (state: HomeBaseState & { homeSection: K } & HomeSectionDataMap[K]) => KnownBlock[];
};

export type HomeSectionSpecMap = {
  [K in HomeSection]: HomeSectionSpec<K>;
};
