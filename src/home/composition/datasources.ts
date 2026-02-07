import { getPortalLinksForPaths } from "../../features/portal/links.js";
import { buildDatasourcesBlocks } from "../views/datasources.js";
import type { HomeSectionSpec } from "../types.js";

export const datasourcesSection: HomeSectionSpec<"datasources"> = {
  load: async ({ userId, teamContext, preferences, profile, teamName }) => {
    const portalLinks = await getPortalLinksForPaths({
      teamId: teamContext.teamId,
      userId,
      userName: profile.name,
      userAvatar: profile.avatar,
      teamName,
      paths: ["connectors", "people"],
    });

    return {
      allowlist: preferences.allowlist,
      portalLinks: {
        connectorsUrl: portalLinks.connectorsUrl,
        peopleUrl: portalLinks.peopleUrl,
      },
    };
  },
  view: (state) => buildDatasourcesBlocks(state.allowlist, state.portalLinks),
};
