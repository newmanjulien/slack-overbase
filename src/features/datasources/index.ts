import { TeamContext } from "../../lib/teamContext.js";

export const getDatasourcesForUser = async (
  _userId: string,
  _teamContext: TeamContext,
) => {
  return {
    connectors: [],
    people: [],
  };
};
