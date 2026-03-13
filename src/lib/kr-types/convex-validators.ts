import { v } from "convex/values";

export const krTypeValidator = v.union(
  v.literal("CUMULATIVE_NUMERIC"),
  v.literal("PROGRESSIVE_PERCENTAGE"),
  v.literal("STAGE_GATE"),
  v.literal("PERIODIC_INDEX"),
  v.literal("CHECKLIST_COMPLIANCE"),
  v.literal("MULTI_PHASE_WITH_RISK")
);
