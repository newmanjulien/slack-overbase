import { getConvexClient } from "./convex";
import { api } from "../../convex/_generated/api";
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
  return client.mutation(api.slack.events.claimEvent, {
    teamId: teamContext.teamId,
    eventId,
    userId,
  });
};
