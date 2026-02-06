import { App, ExpressReceiver } from "@slack/bolt";
import { getConfig } from "../lib/config";
import { logger } from "../lib/logger";
import { registerHandlers } from "../handlers";
import { registerCanvasAdminRoutes } from "../features/canvas/adminRoutes";
import { installationStore } from "./installationStore";

export const createBoltApp = () => {
  const config = getConfig();
  const receiver = new ExpressReceiver({
    signingSecret: config.SLACK_SIGNING_SECRET,
    endpoints: "/slack/events",
    clientId: config.SLACK_CLIENT_ID,
    clientSecret: config.SLACK_CLIENT_SECRET,
    stateSecret: config.SLACK_STATE_SECRET,
    scopes: config.slackScopes,
    installationStore,
    processBeforeResponse: false,
    installerOptions: {
      installPath: "/slack/install",
      redirectUriPath: "/slack/oauth_redirect",
    },
    redirectUri: config.SLACK_REDIRECT_URI,
  });

  registerCanvasAdminRoutes({ receiver, installationStore, logger });

  const app = new App({ receiver });
  registerHandlers(app);

  receiver.app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return { app, receiver };
};
