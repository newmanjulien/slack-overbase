import pkg from "@slack/bolt";
const { App, ExpressReceiver } = pkg;
import { getConfig } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { registerHandlers } from "../handlers/index.js";
import { registerCanvasAdminRoutes } from "../features/canvas/adminRoutes.js";
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

  const app = new App({ receiver });

  app.use(async (args, next) => {
    if (typeof args.ack === "function") {
      let acked = false;
      const originalAck = args.ack.bind(args);
      args.ack = async (...ackArgs) => {
        acked = true;
        return originalAck(...ackArgs);
      };

      const body: any = (args as any).body;
      const eventType = body?.event?.type;
      const actionId = body?.actions?.[0]?.action_id;
      const viewCallbackId = body?.view?.callback_id;
      const command = body?.command;

      setTimeout(() => {
        if (!acked) {
          logger.error(
            {
              eventType,
              actionId,
              viewCallbackId,
              command,
              bodyType: body?.type,
            },
            "Ack not called within 3 seconds",
          );
        }
      }, 3000);
    }

    await next();
  });

  registerHandlers(app);

  receiver.app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return { app, receiver };
};
