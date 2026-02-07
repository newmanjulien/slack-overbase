import { listTemplates } from "../../data/templates.js";
import { buildTemplatesBlocks } from "../views/templates.js";
import type { HomeSectionSpec } from "../types.js";

export const templatesSection: HomeSectionSpec<"templates"> = {
  load: async ({ userId, teamContext }) => {
    const templates = await listTemplates(userId, teamContext);
    return {
      templates: templates.map((template) => ({
        templateId: template.templateId,
        title: template.title,
        summary: template.summary,
      })),
    };
  },
  view: (state) => buildTemplatesBlocks(state.templates),
};
