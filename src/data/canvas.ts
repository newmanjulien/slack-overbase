import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export const persistCanvasAnswer = async (
  userId: string,
  teamContext: TeamContext,
  payload: {
    canvasId: string;
    questionText?: string;
    markdown?: string;
    summary?: string;
    keyPoints?: string[];
    entities?: string[];
    sentAt: number;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.slack.canvas.storeAnswer, {
    userId,
    teamId: teamContext.teamId,
    ...payload,
  });
};
