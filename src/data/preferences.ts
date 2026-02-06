import { getConvexClient } from "./convex";
import { api } from "../../convex/_generated/api";
import { requireTeamContext, TeamContext } from "../lib/teamContext";

export type RecommendationSettings = {
  pastQuestions: boolean;
  similarExecs: boolean;
};

export type UserPreferences = {
  allowlist: string[];
  homeTab: string;
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
    homeTab: result?.homeTab || "welcome",
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
    homeTab: string;
    templateSection: string;
    recommendationsPastQuestionsEnabled: boolean;
    recommendationsSimilarExecsEnabled: boolean;
    onboardingSent: boolean;
  }>,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.preferences.update, {
    userId,
    teamId: teamContext.teamId,
    ...updates,
  });
};
