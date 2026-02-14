import { getConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { PORTAL_PATHS, type PortalPathKey } from "@newmanjulien/overbase-contracts";
import crypto from "crypto";

const PORTAL_URL_KEYS: Record<PortalPathKey, keyof PortalLinks> = {
  connectors: "connectorsUrl",
  people: "peopleUrl",
  payments: "paymentsUrl",
};
type PortalLinks = {
  connectorsUrl?: string;
  peopleUrl?: string;
  paymentsUrl?: string;
};

const normalizeAppBaseUrl = (rawBaseUrl?: string) => {
  if (!rawBaseUrl) {
    throw new Error("Missing APP_BASE_URL");
  }
  if (rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")) {
    return rawBaseUrl.replace(/\/$/, "");
  }
  return `https://${rawBaseUrl.replace(/^\/+/, "").replace(/\/$/, "")}`;
};

const buildSignature = (secret: string, payload: string) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const buildPortalLinkUrl = (
  appBaseUrl: string,
  payload: { teamId: string; userId: string; next: string; sig: string },
) => {
  const params = new URLSearchParams(payload);
  return `${appBaseUrl}/portal-link?${params.toString()}`;
};

export const getPortalLinksForPaths = async (payload: {
  teamId: string;
  userId: string;
  paths: PortalPathKey[];
}): Promise<PortalLinks> => {
  try {
    const config = getConfig();
    const appBaseUrl = normalizeAppBaseUrl(config.APP_BASE_URL);
    const results = await Promise.all(
      payload.paths.map(async (path) => {
        const payloadString = `${payload.teamId}:${payload.userId}:${PORTAL_PATHS[path]}`;
        const sig = buildSignature(config.PORTAL_LINK_SECRET, payloadString);
        const url = buildPortalLinkUrl(appBaseUrl, {
          teamId: payload.teamId,
          userId: payload.userId,
          next: PORTAL_PATHS[path],
          sig,
        });
        return [PORTAL_URL_KEYS[path], url] as const;
      }),
    );
    return Object.fromEntries(results) as PortalLinks;
  } catch (error) {
    logger.error(
      {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to build portal links",
    );
    const fallbackEntries = payload.paths.map((path) => [PORTAL_URL_KEYS[path], undefined]);
    return Object.fromEntries(fallbackEntries) as PortalLinks;
  }
};
