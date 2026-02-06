import type { App } from "@slack/bolt";
import type { MessageEvent } from "@slack/types";

export const registerHelloMessageHandler = (app: App) => {
  app.message("hello", async ({ message, say }) => {
    const msg = message as MessageEvent | undefined;
    if (!msg || msg.channel_type === "im") {
      return;
    }
    if (!("user" in msg) || typeof msg.user !== "string") {
      return;
    }
    await say(`Hey there <@${msg.user}>! 👋`);
  });
};
