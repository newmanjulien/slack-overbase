import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";

export type Template = {
  templateId: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  updatedAt: number;
};

type TemplateRecord = {
  templateId: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  updatedAt: number;
};

const mapTemplate = (template: TemplateRecord | null | undefined): Template | null => {
  if (!template) return null;
  return {
    templateId: template.templateId,
    title: template.title,
    summary: template.summary,
    body: template.body,
    category: template.category,
    updatedAt: template.updatedAt,
  };
};

export const listTemplatesByCategory = async (
  userId: string,
  teamContext: TeamContext,
  category: string,
): Promise<Template[]> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const templates = await client.mutation(api.slack.templates.getOrCreateUserTemplates, {
    userId,
    teamId: teamContext.teamId,
    category,
  });
  if (!Array.isArray(templates)) return [];
  return templates
    .map((template) => mapTemplate(template))
    .filter((template): template is Template => Boolean(template));
};

export const getTemplateById = async (
  userId: string,
  teamContext: TeamContext,
  templateId: string,
): Promise<Template | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const template = await client.query(api.slack.templates.getById, {
    userId,
    teamId: teamContext.teamId,
    templateId,
  });
  return mapTemplate(template);
};

export const updateTemplateBody = async (
  userId: string,
  teamContext: TeamContext,
  templateId: string,
  body: string,
): Promise<Template | null> => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  const updated = await client.mutation(api.slack.templates.updateBody, {
    userId,
    teamId: teamContext.teamId,
    templateId,
    body,
  });
  return mapTemplate(updated);
};
