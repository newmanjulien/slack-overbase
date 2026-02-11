import { getConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import crypto from "crypto";

const DEFAULT_PORTAL_BASE_URL = "https://admin.overbase.app";
const PORTAL_PATHS = {
  connectors: "/connectors",
  people: "/people",
  payments: "/payments",
};
const PORTAL_URL_KEYS = {
  connectors: "connectorsUrl",
  people: "peopleUrl",
  payments: "paymentsUrl",
} as const;
type PortalPathKey = keyof typeof PORTAL_PATHS;
type PortalLinks = {
  connectorsUrl?: string;
  peopleUrl?: string;
  paymentsUrl?: string;
};

const normalizeBaseUrl = (rawBaseUrl?: string) => {
  const baseUrl = rawBaseUrl || DEFAULT_PORTAL_BASE_URL;
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl.replace(/\/$/, "");
  }
  return `https://${baseUrl.replace(/^\/+/, "").replace(/\/$/, "")}`;
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

export const getPortalLinks = async (payload: {
  teamId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  teamName?: string;
}): Promise<PortalLinks> => {
  return getPortalLinksForPaths({ ...payload, paths: ["connectors", "people", "payments"] });
};

export const getPortalLinksForPaths = async (payload: {
  teamId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  teamName?: string;
  paths: PortalPathKey[];
}): Promise<PortalLinks> => {
  try {
    const config = getConfig();
    const appBaseUrl = normalizeBaseUrl(config.APP_BASE_URL);
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
    const fallbackEntries = payload.paths.map((path) => [
      PORTAL_URL_KEYS[path],
      `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS[path]}`,
    ]);
    return Object.fromEntries(fallbackEntries) as PortalLinks;
  }
};
