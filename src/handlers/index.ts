import type { App } from "@slack/bolt";
import { registerDirectMessageHandler } from "./messages/directMessage.js";
import { registerHelloMessageHandler } from "./messages/hello.js";
import { registerHomeHandlers } from "../home/index.js";

export const registerHandlers = (app: App) => {
  registerDirectMessageHandler(app);
  registerHelloMessageHandler(app);
  registerHomeHandlers(app);
};
