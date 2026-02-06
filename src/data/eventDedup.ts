import { getConvexClient } from "./convex";
import { requireTeamContext, TeamContext } from "../lib/teamContext";

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
  return client.mutation("slack/events:claimEvent", {
    teamId: teamContext.teamId,
    eventId,
    userId,
  });
};
