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
  "cleanup relay messages",
  { hours: 24 },
  internal.relay.cleanup.cleanupRelayMessages,
  {},
);

crons.interval(
  "cleanup relay locks",
  { hours: 1 },
  internal.relay.cleanup.cleanupRelayLocks,
  {},
);

crons.interval(
  "cleanup relay rate limits",
  { hours: 6 },
  internal.relay.cleanup.cleanupRelayRateLimits,
  {},
);

export default crons;
