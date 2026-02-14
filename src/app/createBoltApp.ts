import pkg from "@slack/bolt";
const { App, ExpressReceiver } = pkg;
import { getConfig } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { registerHandlers } from "../handlers/index.js";
import { registerPortalLinkRoutes } from "../features/portal-links/portalLinkRoutes.js";
import { registerRelayAdminRoutes } from "../features/relay/adminRoutes.js";
import { registerRelayOutboundRoutes } from "../features/relay/outboundRoutes.js";
import { installationStore } from "./installationStore.js";
import { slackScopes } from "../lib/slackScopes.js";

export const createBoltApp = () => {
  const config = getConfig();
  const receiver = new ExpressReceiver({
    signingSecret: config.SLACK_SIGNING_SECRET,
    endpoints: "/slack/events",
    clientId: config.SLACK_CLIENT_ID,
    clientSecret: config.SLACK_CLIENT_SECRET,
    stateSecret: config.SLACK_STATE_SECRET,
    scopes: slackScopes,
    installationStore,
    processBeforeResponse: false,
    installerOptions: {
      installPath: "/slack/install",
      redirectUriPath: "/slack/oauth_redirect",
    },
    redirectUri: config.SLACK_REDIRECT_URI,
  });

  registerPortalLinkRoutes({ receiver, logger });
  registerRelayAdminRoutes({ receiver });
  registerRelayOutboundRoutes({ receiver, installationStore, logger });

  const app = new App({ receiver });

  app.use(async (args) => {
    if (typeof args.next === "function") {
      await args.next();
    }
  });

  registerHandlers(app);

  receiver.app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return { app, receiver };
};
