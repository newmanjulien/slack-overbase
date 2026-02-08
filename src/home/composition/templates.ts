import { listTemplatesByCategory } from "../../data/templates.js";
import { getDefaultTemplateSection, templateSectionOptions } from "../../features/templates/options.js";
import { buildTemplatesBlocks } from "../views/templates.js";
import type { HomeSectionSpec } from "../types.js";

export const templatesSection: HomeSectionSpec<"templates"> = {
  load: async ({ userId, teamContext, preferences }) => {
    const templateSection = preferences.templateSection || getDefaultTemplateSection();
    const templates = await listTemplatesByCategory(userId, teamContext, templateSection);
    return {
      templateSection,
      sectionOptions: templateSectionOptions,
      templates,
    };
  },
  view: (state) =>
    buildTemplatesBlocks(state.templates, state.templateSection, state.sectionOptions),
};
