import { extractTeamId, SlackPayload } from "./slackPayload.js";

export type TeamContext = {
  teamId: string;
};

export const requireTeamContext = (teamContext?: TeamContext): TeamContext => {
  if (!teamContext?.teamId) {
    throw new Error("Missing team context");
  }
  return teamContext;
};

export const getTeamContext = (payload: SlackPayload): TeamContext => {
  const teamId = extractTeamId(payload);
  if (!teamId) {
    throw new Error("Unable to resolve teamId");
  }
  return { teamId };
};
