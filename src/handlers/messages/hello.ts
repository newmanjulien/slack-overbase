import type { App, AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { isUserMessage } from "../../gateways/slack.js";

type HelloMessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;

export const registerHelloMessageHandler = (app: App) => {
  app.message("hello", async ({ message, say }: HelloMessageArgs) => {
    if (!message || !isUserMessage(message) || message.channel_type === "im") {
      return;
    }
    await say(`Hey there <@${message.user}>! 👋`);
  });
};
