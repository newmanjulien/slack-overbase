import crypto from "crypto";
import express from "express";
import { getConfig } from "../../lib/config.js";
import { getConvexClient } from "../../lib/convexClient.js";
import { api } from "../../../convex/_generated/api.js";
import { PORTAL_ALLOWED_NEXT, type PortalPath } from "@newmanjulien/overbase-contracts";

const buildSignature = (secret: string, payload: string) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const safeEqual = (left: string, right: string) => {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return crypto.timingSafeEqual(leftBuf, rightBuf);
};

export const registerPortalLinkRoutes = (payload: {
  receiver: { app: express.Application };
  logger: { error: (meta: unknown, msg?: string) => void };
}) => {
  const { receiver, logger } = payload;

  receiver.app.get("/portal-link", async (req, res) => {
    try {
      const { PORTAL_BASE_URL, PORTAL_LINK_SECRET } = getConfig();
      const teamId = String(req.query.teamId || "");
      const userId = String(req.query.userId || "");
      const next = String(req.query.next || "");
      const sig = String(req.query.sig || "");

      if (!teamId || !userId || !next || !sig) {
        return res.status(400).json({ ok: false, error: "missing_params" });
      }

      if (!PORTAL_ALLOWED_NEXT.has(next as PortalPath)) {
        return res.status(400).json({ ok: false, error: "invalid_next" });
      }

      const payloadString = `${teamId}:${userId}:${next}`;
      const expectedSig = buildSignature(PORTAL_LINK_SECRET, payloadString);
      if (!safeEqual(expectedSig, sig)) {
        return res.status(401).json({ ok: false, error: "invalid_signature" });
      }

      const client = getConvexClient();
      const result = await client.mutation(api.portal.auth.issueCode, {
        teamId,
        slackUserId: userId,
      });

      const code = result?.code;
      if (!code) {
        return res.status(500).json({ ok: false, error: "missing_code" });
      }

      const baseUrl = PORTAL_BASE_URL || "https://admin.overbase.app";
      const redirectUrl = new URL("/auth/consume", baseUrl);
      redirectUrl.searchParams.set("code", code);
      redirectUrl.searchParams.set("next", next);

      return res.redirect(302, redirectUrl.toString());
    } catch (error) {
      logger.error({ error }, "portal-link failed");
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  });
};
