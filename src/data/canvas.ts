import { getConvexClient } from "./convex";
import { requireTeamContext, TeamContext } from "../lib/teamContext";

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
  return client.mutation("slack/canvas:storeAnswer", {
    userId,
    teamId: teamContext.teamId,
    ...payload,
  });
};
