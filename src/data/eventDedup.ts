// Slack can send the same event more than once. If we process duplicates, we can
// reply twice, create duplicate records, or trigger the same workflow again.
// This helper marks an event ID as "seen" in Convex before we do any work. That
// way the first delivery proceeds and later deliveries are skipped. There isn't
// a truly robust alternative without some durable "seen events" store, so this
// guard is the simplest reliable option
import { getConvexClient } from "../lib/convexClient.js";
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
