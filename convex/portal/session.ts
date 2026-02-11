import type { DatabaseReader } from "../_generated/server.js";

export type PortalSession = {
  teamId: string;
  slackUserId: string;
  expiresAt: number;
};

export const getValidSession = async (
  db: DatabaseReader,
  token: string,
): Promise<PortalSession | null> => {
  const session = await db
    .query("sessions")
    .withIndex("byToken", (q) => q.eq("token", token))
    .unique();
  if (!session) {
    return null;
  }
  if (session.expiresAt <= Date.now()) {
    return null;
  }
  return {
    teamId: session.teamId,
    slackUserId: session.slackUserId,
    expiresAt: session.expiresAt,
  };
};

export const requireSession = async (
  db: DatabaseReader,
  token: string,
): Promise<PortalSession> => {
  const session = await getValidSession(db, token);
  if (!session) {
    throw new Error("Invalid session");
  }
  return session;
};
