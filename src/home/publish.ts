import type { WebClient } from "@slack/web-api";
import type { HomeView } from "@slack/types";
import { getOrCreatePreferences } from "../data/preferences.js";
import {
  buildHomeCompositionBlocks,
  loadHomeComposition,
} from "./composition/index.js";
import type { HomeSection } from "./home.js";
import { logger } from "../lib/logger.js";

export type PublishHome = typeof publishHome;

type TeamContextRef = { teamId: string };

const getUserProfile = async (client: WebClient, userId: string) => {
  try {
    const userInfo = await client.users.info({ user: userId });
    const profile = userInfo?.user?.profile || {};
    const fallbackName =
      profile.display_name ||
      profile.real_name ||
      userInfo?.user?.real_name ||
      userInfo?.user?.name ||
      "there";
    return {
      firstName: profile.first_name || fallbackName.split(" ")[0] || "there",
      name: fallbackName,
      avatar: profile.image_192 || profile.image_512 || profile.image_72,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch user info");
    return { firstName: "there", name: undefined, avatar: undefined };
  }
};

const getTeamName = async (client: WebClient, teamId: string) => {
  try {
    const teamInfo = await client.team.info({ team: teamId });
    return teamInfo?.team?.name || undefined;
  } catch (error) {
    logger.error({ error }, "Failed to fetch team info");
    return undefined;
  }
};

export const publishHome = async (
  client: WebClient,
  userId: string,
  teamContext: TeamContextRef,
  options?: { homeSection?: HomeSection },
) => {
  const preferences = await getOrCreatePreferences(userId, teamContext);
  const profile = await getUserProfile(client, userId);
  const teamName = await getTeamName(client, teamContext.teamId);
  const homeSection = options?.homeSection ?? "welcome";
  const homeState = await loadHomeComposition(
    {
      homeSection,
      userName: profile.firstName,
    },
    {
      userId,
      teamContext,
      preferences,
      profile,
      teamName,
    },
  );

  const view: HomeView = {
    type: "home",
    blocks: buildHomeCompositionBlocks(homeState),
  };

  await client.views.publish({
    user_id: userId,
    view,
  });
};
