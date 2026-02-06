import { getConvexClient } from "./convex.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export const claimSlackEvent = async (
  teamContext: TeamContext,
  eventId: string | undefined,
  userId?: string,
) => {
  if (!eventId) {
    return { claimed: true, skipped: true };
  }
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.events.claimEvent, {
    teamId: teamContext.teamId,
    eventId,
    userId,
  });
};
