import express from "express";
import { getConfig } from "../../lib/config.js";
import { getConvexClient } from "../../lib/convexClient.js";
import { api } from "../../../convex/_generated/api.js";

export const registerRelayAdminRoutes = (payload: {
  receiver: { app: express.Application };
}) => {
  const { receiver } = payload;

  receiver.app.get("/relay/admin", async (req, res) => {
    const { ADMIN_API_KEY } = getConfig();
    const provided =
      req.get("x-admin-key") || req.get("authorization")?.replace("Bearer ", "");
    if (!ADMIN_API_KEY || !provided || provided !== ADMIN_API_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const client = getConvexClient();
    const beforeMs = Date.now() - 5 * 60 * 1000;
    const [failedIn, failedOut, stuckIn, stuckOut] = await Promise.all([
      client.query(api.relay.monitoring.listRecentFailures, { limit: 20 }),
      client.query(api.relay.monitoring.listRecentFailuresOutbound, { limit: 20 }),
      client.query(api.relay.monitoring.listStuckQueued, { beforeMs, limit: 20 }),
      client.query(api.relay.monitoring.listStuckQueuedOutbound, {
        beforeMs,
        limit: 20,
      }),
    ]);

    return res.json({
      ok: true,
      failedInbound: failedIn,
      failedOutbound: failedOut,
      stuckInbound: stuckIn,
      stuckOutbound: stuckOut,
    });
  });
};
