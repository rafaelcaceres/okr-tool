import { mutation } from "./_generated/server";
import { computeKrHealth, HealthStatus } from "./keyResults";
import { calculateKrProgress } from "../src/lib/kr-types/progress";
import type { KrType } from "../src/lib/kr-types/types";

function deriveObjectiveStatus(
  healthStatuses: HealthStatus[],
  progress: number
): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "AT_RISK" | "LATE" {
  if (healthStatuses.length === 0) return "NOT_STARTED";
  if (progress >= 100) return "COMPLETED";

  const allNotStarted = healthStatuses.every((h) => h === "NOT_STARTED");
  if (allNotStarted) return "NOT_STARTED";

  if (healthStatuses.some((h) => h === "LATE")) return "LATE";
  if (healthStatuses.some((h) => h === "AT_RISK")) return "AT_RISK";

  return "IN_PROGRESS";
}

export const recalculateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const objectives = await ctx.db.query("objectives").collect();
    const currentDate = new Date().toISOString().split("T")[0];

    let count = 0;

    for (const obj of objectives) {
      const krs = await ctx.db
        .query("keyResults")
        .withIndex("by_objective", (q) => q.eq("objectiveId", obj._id))
        .collect();

      if (krs.length === 0) continue;

      const healthStatuses: HealthStatus[] = [];
      let sumProgress = 0;

      for (const kr of krs) {
        const phasingEntries = await ctx.db
          .query("phasing")
          .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
          .collect();
        const health = computeKrHealth(kr, phasingEntries, currentDate);
        healthStatuses.push(health);

        // Use domain layer for progress calculation
        const krType = (kr.krType ?? inferKrType(kr.measurementType)) as KrType;
        const typeConfig = kr.typeConfig ?? inferTypeConfig(kr);
        const p = calculateKrProgress({
          krType,
          currentValue: kr.currentValue,
          initialValue: kr.initialValue,
          targetValue: kr.targetValue,
          typeConfig: typeConfig as Record<string, unknown>,
        });
        sumProgress += p;
      }

      const avgProgress = Math.round(sumProgress / krs.length);
      const newStatus = deriveObjectiveStatus(healthStatuses, avgProgress);

      if (obj.status !== newStatus || obj.progress !== avgProgress) {
        await ctx.db.patch(obj._id, {
          status: newStatus,
          progress: avgProgress,
          updatedAt: Date.now(),
        });
        count++;
      }
    }
    return `Updated ${count} objectives`;
  },
});

// ─── KR Type Migration ─────────────────────────────────────────────────────

export const migrateKrTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const allKRs = await ctx.db.query("keyResults").collect();
    let migrated = 0;

    for (const kr of allKRs) {
      // Skip already-migrated
      if (kr.krType) continue;

      const krType = inferKrType(kr.measurementType);
      let typeConfig: Record<string, unknown>;

      if (kr.measurementType === "MILESTONE") {
        // Pull existing milestones into stages
        const milestones = await ctx.db
          .query("milestones")
          .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
          .collect();
        milestones.sort((a, b) => a.order - b.order);

        typeConfig = {
          stages: milestones.map((m) => ({
            id: String(m._id),
            name: m.description,
            status: m.completed ? "COMPLETED" : "NOT_STARTED",
            completedAt: m.completed ? m.updatedAt : undefined,
          })),
        };

        // Update targetValue to match stage count
        if (milestones.length > 0) {
          await ctx.db.patch(kr._id, {
            targetValue: milestones.length,
          });
        }
      } else {
        typeConfig = inferTypeConfig(kr);
      }

      await ctx.db.patch(kr._id, {
        krType: krType as "CUMULATIVE_NUMERIC" | "PROGRESSIVE_PERCENTAGE" | "STAGE_GATE" | "PERIODIC_INDEX" | "CHECKLIST_COMPLIANCE" | "MULTI_PHASE_WITH_RISK",
        typeConfig,
        updatedAt: Date.now(),
      });
      migrated++;
    }

    return `Migrated ${migrated} key results`;
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function inferKrType(measurementType: string | undefined): KrType {
  switch (measurementType) {
    case "FINANCIAL":
    case "NUMERIC":
      return "CUMULATIVE_NUMERIC";
    case "PERCENTUAL":
      return "PROGRESSIVE_PERCENTAGE";
    case "MILESTONE":
      return "STAGE_GATE";
    default:
      return "CUMULATIVE_NUMERIC";
  }
}

function inferTypeConfig(kr: {
  measurementType?: string;
  direction?: string;
  unit: string;
  currency?: string;
}): Record<string, unknown> {
  const direction = kr.direction ?? "INCREASING";
  switch (kr.measurementType) {
    case "FINANCIAL":
      return { direction, unit: kr.currency ?? kr.unit, currency: kr.currency };
    case "PERCENTUAL":
      return { direction };
    case "MILESTONE":
      return { stages: [] };
    case "NUMERIC":
    default:
      return { direction, unit: kr.unit };
  }
}
