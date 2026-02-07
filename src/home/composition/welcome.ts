import { getAssetUrlById } from "../../data/assets.js";
import { buildWelcomeBlocks, getWelcomeImageIds } from "../views/welcome.js";
import type { HomeSectionDataMap, HomeSectionSpec } from "../types.js";

const loadWelcomeSection = async (): Promise<HomeSectionDataMap["welcome"]> => {
  const welcomeImageIds = getWelcomeImageIds();
  const [messageImageUrl, templatesImageUrl, datasourcesImageUrl] = await Promise.all([
    getAssetUrlById(welcomeImageIds.message),
    getAssetUrlById(welcomeImageIds.templates),
    getAssetUrlById(welcomeImageIds.datasources),
  ]);

  return {
    welcomeImages: {
      message: messageImageUrl,
      templates: templatesImageUrl,
      datasources: datasourcesImageUrl,
    },
  };
};

export const welcomeSection: HomeSectionSpec<"welcome"> = {
  load: () => loadWelcomeSection(),
  view: (state) => buildWelcomeBlocks(state.welcomeImages),
};
