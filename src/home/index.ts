import type { App } from "@slack/bolt";
import { publishHome } from "./publish.js";
import { registerHomeOpenedHandler } from "./handlers/homeOpened.js";
import { registerHomeSectionHandlers } from "./handlers/sections.js";
import { registerHomeSettingsHandlers } from "./handlers/settings.js";
import { registerHomeTemplateHandlers } from "./handlers/templates.js";
import { registerHomeRecurringHandlers } from "./handlers/recurring.js";

export const registerHomeHandlers = (app: App) => {
  registerHomeOpenedHandler(app, publishHome);
  registerHomeSectionHandlers(app, publishHome);
  registerHomeSettingsHandlers(app, publishHome);
  registerHomeTemplateHandlers(app, publishHome);
  registerHomeRecurringHandlers(app, publishHome);
};
