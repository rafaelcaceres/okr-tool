import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { krTypeValidator } from "../src/lib/kr-types/convex-validators";

export const cycleStatus = v.union(
  v.literal("PLANEJAMENTO"),
  v.literal("FINALIZADO"),
  v.literal("ATIVO"),
  v.literal("ENCERRADO")
);

export const objectiveStatus = v.union(
  v.literal("NOT_STARTED"),
  v.literal("IN_PROGRESS"),
  v.literal("COMPLETED"),
  v.literal("AT_RISK"),
  v.literal("LATE")
);

export const measurementType = v.union(
  v.literal("NUMERIC"),
  v.literal("PERCENTUAL"),
  v.literal("FINANCIAL"),
  v.literal("MILESTONE")
);

export const direction = v.union(
  v.literal("INCREASING"),
  v.literal("DECREASING")
);

export default defineSchema({
  cycles: defineTable({
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    status: cycleStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

  franchises: defineTable({
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),

  objectives: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    progress: v.number(),
    cycleId: v.optional(v.id("cycles")),
    franchiseId: v.optional(v.id("franchises")),
    ownerId: v.optional(v.string()), // Added owner field
    dueDate: v.optional(v.string()),
    status: objectiveStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_cycle", ["cycleId"])
    .index("by_franchise_cycle", ["franchiseId", "cycleId"]),

  keyResults: defineTable({
    objectiveId: v.id("objectives"),
    title: v.string(),
    description: v.optional(v.string()),
    currentValue: v.number(),
    targetValue: v.number(),
    initialValue: v.number(),
    unit: v.string(),
    // New domain-driven type system
    krType: v.optional(krTypeValidator),
    typeConfig: v.optional(v.any()),
    // Legacy fields (kept for migration compatibility)
    measurementType: v.optional(measurementType),
    direction: v.optional(direction),
    planningFrequency: v.optional(v.union(v.literal("MONTHLY"), v.literal("WEEKLY"), v.literal("QUARTERLY"))),
    currency: v.optional(v.string()),
    externalLink: v.optional(v.string()),
    hasProgress: v.boolean(),
    responsibles: v.optional(v.array(v.id("members"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_objective", ["objectiveId"]),

  phasing: defineTable({
    keyResultId: v.id("keyResults"),
    date: v.optional(v.string()), // New field (YYYY-MM-DD)
    month: v.optional(v.string()), // Legacy field (YYYY-MM)
    plannedValue: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_keyResult", ["keyResultId"])
    .index("by_keyResult_date", ["keyResultId", "date"]),

  progressEntries: defineTable({
    keyResultId: v.id("keyResults"),
    value: v.number(),
    recordedAt: v.number(),
    source: v.union(v.literal("MANUAL"), v.literal("INTEGRATION")),
  })
    .index("by_keyResult", ["keyResultId"])
    .index("by_keyResult_date", ["keyResultId", "recordedAt"]),

  comments: defineTable({
    keyResultId: v.id("keyResults"),
    text: v.string(),
    isRecordedDecision: v.boolean(),
    decisionMarkedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_keyResult", ["keyResultId"])
    .index("by_keyResult_date", ["keyResultId", "createdAt"]),

  milestones: defineTable({
    keyResultId: v.id("keyResults"),
    description: v.string(),
    completed: v.boolean(),
    order: v.number(),
    updatedAt: v.number(),
  })
    .index("by_keyResult", ["keyResultId"]),

  members: defineTable({
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),
});
