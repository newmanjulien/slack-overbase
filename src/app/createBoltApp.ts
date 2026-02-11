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

  app.use(async (args) => {
    const body = args.body as {
      type?: string;
      team?: { id?: string };
      user?: { id?: string };
      actions?: Array<{ action_id?: string; block_id?: string; type?: string }>;
      view?: { callback_id?: string };
      trigger_id?: string;
    };
    const type = body?.type;
    const isInteractive =
      type === "block_actions" ||
      type === "view_submission" ||
      type === "view_closed" ||
      type === "shortcut" ||
      type === "message_action";
    if (isInteractive) {
      const actions = Array.isArray(body.actions) ? body.actions : [];
      logger.info(
        {
          type,
          teamId: body?.team?.id,
          userId: body?.user?.id,
          actionIds: actions.map((action) => action.action_id).filter(Boolean),
          blockIds: actions.map((action) => action.block_id).filter(Boolean),
          actionTypes: actions.map((action) => action.type).filter(Boolean),
          callbackId: body?.view?.callback_id,
          triggerId: body?.trigger_id,
        },
        "Slack interactive payload received",
      );
    }
    if (typeof args.next === "function") {
      const start = Date.now();
      try {
        await args.next();
      } finally {
        if (isInteractive) {
          logger.info(
            {
              type,
              elapsedMs: Date.now() - start,
            },
            "Slack interactive payload processed",
          );
        }
      }
    }
  });

  registerHandlers(app);

  receiver.app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return { app, receiver };
};
