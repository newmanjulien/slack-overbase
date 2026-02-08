import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type UserDatasources = {
  allowlist: string[];
};

export const getOrCreateDatasources = async (
  userId: string,
  teamContext: TeamContext,
): Promise<UserDatasources> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const result = await client.mutation(api.slack.datasources.getOrCreate, {
    userId,
    teamId: teamContext.teamId,
  });
  return {
    allowlist: result?.allowlist || [],
  };
};

export const updateDatasources = async (
  userId: string,
  teamContext: TeamContext,
  updates: Partial<{
    allowlist: string[];
  }>,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.datasources.update, {
    userId,
    teamId: teamContext.teamId,
    ...updates,
  });
};
