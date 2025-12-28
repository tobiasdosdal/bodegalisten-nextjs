import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired check-ins every hour
crons.interval(
  "cleanup expired check-ins",
  { hours: 1 },
  internal.checkIns.cleanupExpired
);

export default crons;
