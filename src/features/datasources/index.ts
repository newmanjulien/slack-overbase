import { TeamContext } from "../../lib/teamContext.js";
import { getOrCreateDatasources } from "../../data/datasources.js";

export const getDatasourcesForUser = async (
  userId: string,
  teamContext: TeamContext,
) => {
  const datasources = await getOrCreateDatasources(userId, teamContext);
  return {
    connectors: [],
    people: datasources.allowlist.map((id) => ({ id, name: id })),
  };
};
