import { getConvexClient } from "./convex";
import { api } from "../../convex/_generated/api";
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
  return client.mutation(api.slack.canvas.storeAnswer, {
    userId,
    teamId: teamContext.teamId,
    ...payload,
  });
};
