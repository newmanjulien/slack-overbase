import "dotenv/config";
import { createBoltApp } from "./app/createBoltApp";
import { getConfig } from "./lib/config";
import { logger } from "./lib/logger";

const { app } = createBoltApp();
const { port } = getConfig();

if (require.main === module) {
  (async () => {
    await app.start(port);
    logger.info({ port }, "⚡️ Slack Overbase app is running");
  })();
}

export { app };
