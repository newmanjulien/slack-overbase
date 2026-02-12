import pkg from "@slack/bolt";
const { App, ExpressReceiver } = pkg;
import { getConfig } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { registerHandlers } from "../handlers/index.js";
import { registerCanvasAdminRoutes } from "../features/canvas/adminRoutes.js";
import { registerPortalLinkRoutes } from "../features/portal/portalLinkRoutes.js";
import { registerRelayOutboundRoutes } from "../features/relay/outboundRoutes.js";
import { registerRelayFileProxyRoutes } from "../features/relay/fileProxyRoutes.js";
import { installationStore } from "./installationStore.js";

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
  registerPortalLinkRoutes({ receiver, logger });
  registerRelayOutboundRoutes({ receiver, installationStore, logger });
  registerRelayFileProxyRoutes({ receiver, installationStore });

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
