import { query } from "./_generated/server";
import { v } from "convex/values";
import { computeKrHealth, HealthStatus } from "./keyResults";

export const getFranchiseReport = query({
  args: {
    franchiseId: v.id("franchises"),
    cycleId: v.id("cycles"),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franquia não encontrada.");

    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    // Get all objectives for this franchise+cycle
    const objectives = await ctx.db
      .query("objectives")
      .withIndex("by_franchise_cycle", (q) =>
        q.eq("franchiseId", args.franchiseId).eq("cycleId", args.cycleId)
      )
      .order("desc")
      .collect();

    // All members (for resolving responsible names)
    const allMembers = await ctx.db.query("members").collect();
    const memberMap = new Map(allMembers.map((m) => [m._id, m.name]));

    // Health summary counters
    const healthSummary: Record<HealthStatus, number> = {
      ON_TRACK: 0,
      AT_RISK: 0,
      LATE: 0,
      NOT_STARTED: 0,
      COMPLETED: 0,
    };
    let totalKRs = 0;

    // Build denormalized objectives
    const objectivesWithDetails = await Promise.all(
      objectives.map(async (objective) => {
        const krs = await ctx.db
          .query("keyResults")
          .withIndex("by_objective", (q) =>
            q.eq("objectiveId", objective._id)
          )
          .collect();

        const krsWithDetails = await Promise.all(
          krs.map(async (kr) => {
            // Phasing
            const phasing = await ctx.db
              .query("phasing")
              .withIndex("by_keyResult", (q) =>
                q.eq("keyResultId", kr._id)
              )
              .collect();

            // Progress entries (sorted desc by recordedAt)
            const progressEntries = await ctx.db
              .query("progressEntries")
              .withIndex("by_keyResult", (q) =>
                q.eq("keyResultId", kr._id)
              )
              .collect();
            progressEntries.sort((a, b) => b.recordedAt - a.recordedAt);

            // Milestones (legacy MILESTONE type or STAGE_GATE)
            const isMilestoneType =
              kr.measurementType === "MILESTONE" || kr.krType === "STAGE_GATE";
            const milestones = isMilestoneType
              ? await ctx.db
                  .query("milestones")
                  .withIndex("by_keyResult", (q) =>
                    q.eq("keyResultId", kr._id)
                  )
                  .collect()
              : [];

            // Comment count
            const comments = await ctx.db
              .query("comments")
              .withIndex("by_keyResult", (q) =>
                q.eq("keyResultId", kr._id)
              )
              .collect();

            // Decisions (comments marked as decision)
            const decisions = comments.filter((c) => c.isRecordedDecision);

            // Resolve responsible names
            const responsibleNames = (kr.responsibles ?? [])
              .map((id) => memberMap.get(id))
              .filter(Boolean) as string[];

            // Compute health
            const health = computeKrHealth(kr, phasing, args.currentDate);
            healthSummary[health]++;
            totalKRs++;

            return {
              ...kr,
              health,
              phasing,
              progressEntries,
              milestones,
              commentCount: comments.length,
              decisionCount: decisions.length,
              decisions: decisions.map((d) => ({
                text: d.text,
                markedAt: d.decisionMarkedAt,
              })),
              responsibleNames,
            };
          })
        );

        // Derive objective-level health distribution
        const krHealthCounts: Record<HealthStatus, number> = {
          ON_TRACK: 0,
          AT_RISK: 0,
          LATE: 0,
          NOT_STARTED: 0,
          COMPLETED: 0,
        };
        for (const kr of krsWithDetails) {
          krHealthCounts[kr.health]++;
        }

        return {
          ...objective,
          keyResults: krsWithDetails,
          krHealthCounts,
          krCount: krsWithDetails.length,
        };
      })
    );
    // Compute overall franchise progress (avg of objective progresses)
    const overallProgress =
      objectivesWithDetails.length > 0
        ? Math.round(
          objectivesWithDetails.reduce((sum, o) => sum + o.progress, 0) /
          objectivesWithDetails.length
        )
        : 0;

    // Build monthly progress timeline (planned vs actual)
    const progressTimeline = buildProgressTimeline(
      objectivesWithDetails,
      cycle.startDate,
      cycle.endDate
    );

    return {
      franchise,
      cycle,
      objectives: objectivesWithDetails,
      healthSummary,
      totalKRs,
      overallProgress,
      progressTimeline,
    };
  },
});

// --- Helper: build monthly planned vs actual timeline ---
function buildProgressTimeline(
  objectives: Array<{
    keyResults: Array<{
      initialValue: number;
      currentValue: number;
      targetValue: number;
      direction?: string;
      phasing: Array<{ date?: string; month?: string; plannedValue: number }>;
      progressEntries: Array<{ value: number; recordedAt: number }>;
    }>;
  }>,
  cycleStart: string,
  cycleEnd: string
): Array<{ month: string; planned: number; actual: number }> {
  // Collect all months in the cycle
  const months: string[] = [];
  const startParts = cycleStart.split("-");
  const endParts = cycleEnd.split("-");
  let y = parseInt(startParts[0]);
  let m = parseInt(startParts[1]);
  const endY = parseInt(endParts[0]);
  const endM = parseInt(endParts[1]);

  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }

  if (months.length === 0) return [];

  // For each KR, compute cumulative planned and actual per month
  const allKRs = objectives.flatMap((o) => o.keyResults);
  if (allKRs.length === 0) return months.map((mo) => ({ month: mo, planned: 0, actual: 0 }));

  const timeline = months.map((mo) => {
    // End of month date for comparison
    const [my, mm] = mo.split("-").map(Number);
    const lastDay = new Date(my, mm, 0).getDate();
    const monthEndDate = `${mo}-${String(lastDay).padStart(2, "0")}`;
    const monthEndTs = new Date(my, mm - 1, lastDay, 23, 59, 59).getTime();

    let totalPlannedPct = 0;
    let totalActualPct = 0;
    let krCount = 0;

    for (const kr of allKRs) {
      const range = Math.abs(kr.targetValue - kr.initialValue);
      if (range === 0) continue;
      krCount++;

      // Cumulative planned through this month
      let cumulativePlanned = kr.initialValue;
      const normalizedPhasing = kr.phasing
        .map((p) => {
          let d = p.date;
          if (!d && p.month) {
            const [py, pm] = p.month.split("-").map(Number);
            const ld = new Date(py, pm, 0).getDate();
            d = `${p.month}-${String(ld).padStart(2, "0")}`;
          }
          return { date: d || "", value: p.plannedValue };
        })
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date));

      for (const entry of normalizedPhasing) {
        if (entry.date <= monthEndDate) {
          if (kr.direction === "DECREASING") {
            cumulativePlanned -= entry.value;
          } else {
            cumulativePlanned += entry.value;
          }
        }
      }

      // Planned progress %
      let plannedPct: number;
      if (kr.direction === "DECREASING") {
        plannedPct =
          ((kr.initialValue - cumulativePlanned) /
            (kr.initialValue - kr.targetValue)) *
          100;
      } else {
        plannedPct =
          ((cumulativePlanned - kr.initialValue) /
            (kr.targetValue - kr.initialValue)) *
          100;
      }
      totalPlannedPct += Math.min(100, Math.max(0, plannedPct));

      // Actual: find latest progressEntry <= month end
      const relevant = kr.progressEntries.filter(
        (p) => p.recordedAt <= monthEndTs
      );
      let actualValue = kr.initialValue;
      if (relevant.length > 0) {
        relevant.sort((a, b) => a.recordedAt - b.recordedAt);
        actualValue = relevant[relevant.length - 1].value;
      }

      let actualPct: number;
      if (kr.direction === "DECREASING") {
        actualPct =
          ((kr.initialValue - actualValue) /
            (kr.initialValue - kr.targetValue)) *
          100;
      } else {
        actualPct =
          ((actualValue - kr.initialValue) /
            (kr.targetValue - kr.initialValue)) *
          100;
      }
      totalActualPct += Math.min(100, Math.max(0, actualPct));
    }

    return {
      month: mo,
      planned: krCount > 0 ? Math.round(totalPlannedPct / krCount) : 0,
      actual: krCount > 0 ? Math.round(totalActualPct / krCount) : 0,
    };
  });

  return timeline;
}

// --- Dashboard query for reports index page ---
export const getReportsDashboard = query({
  args: {
    cycleId: v.id("cycles"),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    const franchises = await ctx.db.query("franchises").collect();

    const globalHealth: Record<HealthStatus, number> = {
      ON_TRACK: 0, AT_RISK: 0, LATE: 0, NOT_STARTED: 0, COMPLETED: 0,
    };
    let globalTotalKRs = 0;

    const franchiseSummaries = await Promise.all(
      franchises.map(async (franchise) => {
        const objectives = await ctx.db
          .query("objectives")
          .withIndex("by_franchise_cycle", (q) =>
            q.eq("franchiseId", franchise._id).eq("cycleId", args.cycleId)
          )
          .collect();

        const healthCounts: Record<HealthStatus, number> = {
          ON_TRACK: 0, AT_RISK: 0, LATE: 0, NOT_STARTED: 0, COMPLETED: 0,
        };
        let krCount = 0;

        for (const obj of objectives) {
          const krs = await ctx.db
            .query("keyResults")
            .withIndex("by_objective", (q) => q.eq("objectiveId", obj._id))
            .collect();

          for (const kr of krs) {
            const phasing = await ctx.db
              .query("phasing")
              .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
              .collect();

            const health = computeKrHealth(kr, phasing, args.currentDate);
            healthCounts[health]++;
            globalHealth[health]++;
            krCount++;
            globalTotalKRs++;
          }
        }

        const avgProgress =
          objectives.length > 0
            ? Math.round(
              objectives.reduce((s, o) => s + o.progress, 0) /
              objectives.length
            )
            : 0;

        // Determine predominant health
        const predominant = (Object.entries(healthCounts) as [HealthStatus, number][])
          .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "NOT_STARTED";

        return {
          _id: franchise._id,
          name: franchise.name,
          objectiveCount: objectives.length,
          krCount,
          avgProgress,
          healthCounts,
          predominantHealth: predominant,
        };
      })
    );

    return {
      cycle,
      franchises: franchiseSummaries,
      globalHealth,
      globalTotalKRs,
    };
  },
});
