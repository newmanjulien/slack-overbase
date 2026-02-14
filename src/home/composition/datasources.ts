import { getPortalLinksForPaths } from "../../features/portal-links/links.js";
import { getOrCreateDatasources } from "../../data/datasources.js";
import { buildDatasourcesBlocks } from "../views/datasources.js";
import type { HomeSectionSpec } from "../types.js";

export const datasourcesSection: HomeSectionSpec<"datasources"> = {
  load: async ({ userId, teamContext }) => {
    const datasources = await getOrCreateDatasources(userId, teamContext);
    const portalLinks = await getPortalLinksForPaths({
      teamId: teamContext.teamId,
      userId,
      paths: ["connectors", "people"],
    });

    return {
      allowlist: datasources.allowlist,
      portalLinks: {
        connectorsUrl: portalLinks.connectorsUrl,
        peopleUrl: portalLinks.peopleUrl,
      },
    };
  },
  view: (state) => buildDatasourcesBlocks(state.allowlist, state.portalLinks),
};
