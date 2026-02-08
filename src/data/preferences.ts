import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type RecommendationSettings = {
  pastQuestions: boolean;
  similarExecs: boolean;
};

export type UserPreferences = {
  allowlist: string[];
  templateSection: string | null;
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
    templateSection: typeof result?.templateSection === "string" ? result.templateSection : null,
    recommendations: {
      pastQuestions: result?.recommendPastQuestions ?? true,
      similarExecs: result?.recommendSimilarExecs ?? true,
    },
    onboardingSent: result?.onboardingSent === true,
  };
};

export const updatePreferences = async (
  userId: string,
  teamContext: TeamContext,
  updates: Partial<{
    allowlist: string[];
    templateSection: string | null;
    recommendPastQuestions: boolean;
    recommendSimilarExecs: boolean;
    onboardingSent: boolean;
  }>,
): Promise<void> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  await client.mutation(api.slack.preferences.update, {
    userId,
    teamId: teamContext.teamId,
    ...updates,
  });
};
