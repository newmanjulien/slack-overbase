import type { Installation, InstallationQuery, InstallationStore } from "@slack/bolt";
import { getConvexClient } from "../data/convex.js";
import { api } from "../../convex/_generated/api.js";

export const installationStore: InstallationStore = {
  storeInstallation: async (installation: Installation) => {
    const teamId = installation.team?.id;
    if (!teamId) {
      throw new Error("Missing teamId for installation");
    }
    const client = getConvexClient();
    await client.mutation(api.slack.installations.store, {
      teamId,
      installation,
    });
  },
  fetchInstallation: async (query: InstallationQuery<boolean>) => {
    const teamId = query.teamId;
    if (!teamId) {
      throw new Error("Missing teamId for installation fetch");
    }
    const client = getConvexClient();
    const installation = await client.query(api.slack.installations.get, {
      teamId,
    });
    return installation as Installation;
  },
  deleteInstallation: async (query: InstallationQuery<boolean>) => {
    const teamId = query.teamId;
    if (!teamId) {
      throw new Error("Missing teamId for installation delete");
    }
    const client = getConvexClient();
    await client.mutation(api.slack.installations.remove, {
      teamId,
    });
  },
};
