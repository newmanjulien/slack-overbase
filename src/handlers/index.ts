import type { App } from "@slack/bolt";
import { registerDirectMessageHandler } from "./messages/directMessage";
import { registerHelloMessageHandler } from "./messages/hello";
import { registerHelpCommand } from "./commands/help";
import { registerHomeHandlers } from "../home";

export const registerHandlers = (app: App) => {
  registerDirectMessageHandler(app);
  registerHelloMessageHandler(app);
  registerHelpCommand(app);
  registerHomeHandlers(app);
};
