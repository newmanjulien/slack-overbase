import { getPortalLinksForPaths } from "../../features/portal/links.js";
import { buildSettingsBlocks } from "../views/settings.js";
import type { HomeSectionSpec } from "../types.js";

export const settingsSection: HomeSectionSpec<"settings"> = {
  load: async ({ userId, teamContext, preferences, profile, teamName }) => {
    const portalLinks = await getPortalLinksForPaths({
      teamId: teamContext.teamId,
      userId,
      userName: profile.name,
      userAvatar: profile.avatar,
      teamName,
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
