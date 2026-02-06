import type { App } from "@slack/bolt";

export const registerHelloMessageHandler = (app: App) => {
  app.message("hello", async ({ message, say }) => {
    if (message?.channel_type === "im") {
      return;
    }
    await say(`Hey there <@${message.user}>! 👋`);
  });
};
