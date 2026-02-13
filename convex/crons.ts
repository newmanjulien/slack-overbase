import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

crons.interval(
  "cleanup expired codes",
  { hours: 24 },
  internal.portal.auth.cleanupExpiredCodes,
);

crons.interval(
  "cleanup expired sessions",
  { hours: 24 },
  internal.portal.auth.cleanupExpiredSessions,
);

crons.interval(
  "cleanup old dedup",
  { hours: 168 },
  internal.slack.dedup.cleanupOldDedup,
  {},
);

crons.interval(
  "cleanup expired relay tokens",
  { hours: 24 },
  internal.responder.relayTokens.cleanupExpiredTokens,
  {},
);

export default crons;
