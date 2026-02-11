import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

crons.interval(
  "cleanup expired one-time codes",
  { hours: 24 },
  internal.portal.auth.cleanupExpiredOneTimeCodes,
);

export default crons;
