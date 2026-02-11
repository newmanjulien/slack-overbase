import { getConvexClient } from "../../lib/convexClient.js";
import { api } from "../../../convex/_generated/api.js";
import { getConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";

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

const buildPortalUrl = (baseUrl: string, code: string, nextPath: string) => {
  const encodedCode = encodeURIComponent(code);
  const encodedNext = encodeURIComponent(nextPath);
  return `${baseUrl}/auth/consume?code=${encodedCode}&next=${encodedNext}`;
};

const issueCode = async (payload: {
  teamId: string;
  slackUserId: string;
  teamName?: string;
  name?: string;
  avatarUrl?: string;
}) => {
  const client = getConvexClient();
  const result = await client.mutation(api.portal.auth.issueCode, payload);
  return result?.code as string | undefined;
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
    const baseUrl = normalizeBaseUrl(config.PORTAL_BASE_URL);
    logger.info(
      {
        portalBaseUrl: config.PORTAL_BASE_URL,
        normalizedPortalBaseUrl: baseUrl,
        requestedPaths: payload.paths,
      },
      "Building portal links",
    );
    const results = await Promise.all(
      payload.paths.map(async (path) => {
        const code = await issueCode({
          teamId: payload.teamId,
          slackUserId: payload.userId,
          teamName: payload.teamName,
          name: payload.userName,
          avatarUrl: payload.userAvatar,
        });
        logger.info(
          {
            portalPath: path,
            hasCode: Boolean(code),
          },
          "Portal link code issued",
        );
        const url = code
          ? buildPortalUrl(baseUrl, code, PORTAL_PATHS[path])
          : `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS[path]}`;
        logger.info(
          {
            portalPath: path,
            portalUrl: url,
          },
          "Portal link resolved",
        );
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
