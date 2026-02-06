import { getConvexClient } from "../../data/convex";
import { api } from "../../../convex/_generated/api";
import { getConfig } from "../../lib/config";
import { logger } from "../../lib/logger";

const DEFAULT_PORTAL_BASE_URL = "https://admin.overbase.app";
const PORTAL_PATHS = {
  connectors: "/connectors",
  people: "/people",
  payments: "/payments",
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
  const result = await client.mutation(api.portal.auth.issueOneTimeCode, payload);
  return result?.code as string | undefined;
};

export const getPortalLinks = async (payload: {
  teamId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  teamName?: string;
}) => {
  try {
    const config = getConfig();
    const baseUrl = normalizeBaseUrl(config.PORTAL_BASE_URL);
    const [connectorsCode, peopleCode, paymentsCode] = await Promise.all([
      issueCode({
        teamId: payload.teamId,
        slackUserId: payload.userId,
        teamName: payload.teamName,
        name: payload.userName,
        avatarUrl: payload.userAvatar,
      }),
      issueCode({
        teamId: payload.teamId,
        slackUserId: payload.userId,
        teamName: payload.teamName,
        name: payload.userName,
        avatarUrl: payload.userAvatar,
      }),
      issueCode({
        teamId: payload.teamId,
        slackUserId: payload.userId,
        teamName: payload.teamName,
        name: payload.userName,
        avatarUrl: payload.userAvatar,
      }),
    ]);

    return {
      connectorsUrl: connectorsCode
        ? buildPortalUrl(baseUrl, connectorsCode, PORTAL_PATHS.connectors)
        : `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.connectors}`,
      peopleUrl: peopleCode
        ? buildPortalUrl(baseUrl, peopleCode, PORTAL_PATHS.people)
        : `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.people}`,
      paymentsUrl: paymentsCode
        ? buildPortalUrl(baseUrl, paymentsCode, PORTAL_PATHS.payments)
        : `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.payments}`,
    };
  } catch (error) {
    logger.error({ error }, "Failed to build portal links");
    return {
      connectorsUrl: `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.connectors}`,
      peopleUrl: `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.people}`,
      paymentsUrl: `${DEFAULT_PORTAL_BASE_URL}${PORTAL_PATHS.payments}`,
    };
  }
};
