import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";
import type { HomeSection } from "../home/home.js";
import { normalizeHomeSection } from "../home/home.js";

export type RecommendationSettings = {
  pastQuestions: boolean;
  similarExecs: boolean;
};

export type UserPreferences = {
  allowlist: string[];
  homeSection: HomeSection;
  templateSection?: string;
  recommendations: RecommendationSettings;
  onboardingSent: boolean;
};

export const getOrCreatePreferences = async (
  userId: string,
  teamContext: TeamContext,
): Promise<UserPreferences> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const result = await client.mutation(api.slack.preferences.getOrCreate, {
    userId,
    teamId: teamContext.teamId,
  });
  return {
    allowlist: result?.allowlist || [],
    homeSection: normalizeHomeSection(result?.homeTab),
    templateSection: result?.templateSection || undefined,
    recommendations: {
      pastQuestions: result?.recommendationsPastQuestionsEnabled ?? true,
      similarExecs: result?.recommendationsSimilarExecsEnabled ?? true,
    },
    onboardingSent: result?.onboardingSent === true,
  };
};

export const updatePreferences = async (
  userId: string,
  teamContext: TeamContext,
  updates: Partial<{
    allowlist: string[];
    homeSection: HomeSection;
    templateSection: string;
    recommendationsPastQuestionsEnabled: boolean;
    recommendationsSimilarExecsEnabled: boolean;
    onboardingSent: boolean;
  }>,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const { homeSection, ...rest } = updates;
  return client.mutation(api.slack.preferences.update, {
    userId,
    teamId: teamContext.teamId,
    ...(typeof homeSection !== "undefined" ? { homeTab: homeSection } : {}),
    ...rest,
  });
};
