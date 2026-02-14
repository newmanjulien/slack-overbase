import { getPortalLinksForPaths } from "../../features/portal-links/links.js";
import { buildSettingsBlocks } from "../views/settings.js";
import type { HomeSectionSpec } from "../types.js";

export const settingsSection: HomeSectionSpec<"settings"> = {
  load: async ({ userId, teamContext, preferences }) => {
    const portalLinks = await getPortalLinksForPaths({
      teamId: teamContext.teamId,
      userId,
      paths: ["payments"],
    });

    return {
      recommendations: preferences.recommendations,
      portalLinks: {
        paymentsUrl: portalLinks.paymentsUrl,
      },
    };
  },
  view: (state) => buildSettingsBlocks(state.recommendations, state.portalLinks),
};
