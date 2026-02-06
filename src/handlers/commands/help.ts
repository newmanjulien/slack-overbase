import type { App } from "@slack/bolt";

export const registerHelpCommand = (app: App) => {
  app.command("/help", async ({ ack }) => {
    await ack({
      response_type: "ephemeral",
      text:
        "*Overbase help*\n• Ask me questions in the Messages tab (here)\n• Set up datasources so I can answer you in Home → Datasources\n• Try templates: open Home → Templates\n• Add a recurring question with `/recurring`\n• Legal + payments live in Home → Settings\n• For customer support email julien@overbase.app\n• Use `/help` anytime to see this again",
      mrkdwn: true,
    });
  });
};
