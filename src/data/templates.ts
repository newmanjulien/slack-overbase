import { getConvexClient } from "./convex";
import { requireTeamContext, TeamContext } from "../lib/teamContext";

export type Template = {
  templateId: string;
  title: string;
  summary: string;
  body: string;
  audiences: string[];
  updatedAt: string;
};

export const listTemplates = async (
  userId: string,
  teamContext: TeamContext,
): Promise<Template[]> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const templates = await client.query("slack/templates:list", {
    userId,
    teamId: teamContext.teamId,
  });
  return Array.isArray(templates) ? templates : [];
};

export const getTemplateById = async (
  userId: string,
  teamContext: TeamContext,
  templateId: string,
): Promise<Template | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const template = await client.query("slack/templates:getById", {
    userId,
    teamId: teamContext.teamId,
    templateId,
  });
  return template || null;
};

export const updateTemplateBody = async (
  userId: string,
  teamContext: TeamContext,
  templateId: string,
  body: string,
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation("slack/templates:updateBody", {
    userId,
    teamId: teamContext.teamId,
    templateId,
    body,
  });
};
