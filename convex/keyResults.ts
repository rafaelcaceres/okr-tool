import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { krTypeValidator } from "../src/lib/kr-types/convex-validators";
import { calculateKrProgress } from "../src/lib/kr-types/progress";
import { calculateKrHealth } from "../src/lib/kr-types/health";
import { validateKrConfig, validateKrProgressUpdate } from "../src/lib/kr-types/validation";
import type { HealthStatus, KrType } from "../src/lib/kr-types/types";

export type { HealthStatus };

// ─── Backward Compatibility ─────────────────────────────────────────────────

/** Resolve krType from a KR document, falling back to legacy measurementType */
function resolveKrType(kr: Doc<"keyResults">): KrType {
  if (kr.krType) return kr.krType as KrType;

  // Legacy fallback
  switch (kr.measurementType) {
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

/** Resolve typeConfig from a KR document, falling back to legacy fields */
function resolveTypeConfig(kr: Doc<"keyResults">): Record<string, unknown> {
  if (kr.typeConfig) return kr.typeConfig as Record<string, unknown>;

  // Legacy fallback: build config from flat fields
  const direction = kr.direction ?? "INCREASING";
  switch (kr.measurementType) {
    case "FINANCIAL":
      return { direction, unit: kr.currency ?? kr.unit, currency: kr.currency };
    case "PERCENTUAL":
      return { direction };
    case "MILESTONE":
      return { stages: [] }; // Milestones are in separate table for legacy KRs
    case "NUMERIC":
    default:
      return { direction, unit: kr.unit };
  }
}

// ─── Domain-integrated health computation ───────────────────────────────────

export function computeKrHealth(
  kr: Doc<"keyResults">,
  phasingEntries: Doc<"phasing">[],
  currentDate: string
): HealthStatus {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);

  // Normalize phasing dates
  const normalizedPhasing = phasingEntries
    .map((e) => {
      let d = e.date;
      if (!d && e.month) {
        const [yearStr, monthStr] = e.month.split("-");
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const date = new Date(year, month, 0);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        d = `${y}-${m}-${day}`;
      }
      return { date: d || "", plannedValue: e.plannedValue };
    })
    .filter((e) => e.date);

  return calculateKrHealth({
    krType,
    currentValue: kr.currentValue,
    initialValue: kr.initialValue,
    targetValue: kr.targetValue,
    typeConfig,
    phasingEntries: normalizedPhasing,
    currentDate,
    hasProgress: kr.hasProgress,
  });
}

// ─── Queries ────────────────────────────────────────────────────────────────

async function getKrWithHealth(ctx: QueryCtx, kr: Doc<"keyResults">, currentDate: string) {
  const phasingEntries = await ctx.db
    .query("phasing")
    .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
    .collect();

  return {
    ...kr,
    health: computeKrHealth(kr, phasingEntries, currentDate),
  };
}

export const getKeyResults = query({
  args: { objectiveId: v.id("objectives") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("keyResults")
      .withIndex("by_objective", (q) => q.eq("objectiveId", args.objectiveId))
      .collect();
  },
});

export const getKeyResultsWithHealth = query({
  args: {
    objectiveId: v.id("objectives"),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const krs = await ctx.db
      .query("keyResults")
      .withIndex("by_objective", (q) => q.eq("objectiveId", args.objectiveId))
      .collect();

    return Promise.all(krs.map((kr) => getKrWithHealth(ctx, kr, args.currentDate)));
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const createKeyResult = mutation({
  args: {
    objectiveId: v.id("objectives"),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.number(),
    unit: v.string(),
    initialValue: v.optional(v.number()),
    // New domain-driven fields
    krType: v.optional(krTypeValidator),
    typeConfig: v.optional(v.any()),
    // Legacy fields (still accepted for backward compatibility)
    measurementType: v.optional(
      v.union(
        v.literal("NUMERIC"),
        v.literal("PERCENTUAL"),
        v.literal("FINANCIAL"),
        v.literal("MILESTONE")
      )
    ),
    planningFrequency: v.optional(
      v.union(v.literal("MONTHLY"), v.literal("WEEKLY"))
    ),
    direction: v.optional(
      v.union(v.literal("INCREASING"), v.literal("DECREASING"))
    ),
    currency: v.optional(v.string()),
    responsibles: v.optional(v.array(v.id("members"))),
  },
  handler: async (ctx, args) => {
    const objective = await ctx.db.get(args.objectiveId);
    if (!objective) throw new Error("Objetivo não encontrado.");

    const initialValue = args.initialValue ?? 0;
    const freq = args.planningFrequency ?? "MONTHLY";

    // Determine krType and typeConfig
    let krType = args.krType as KrType | undefined;
    let typeConfig = args.typeConfig as Record<string, unknown> | undefined;

    if (!krType) {
      // Legacy path: derive from measurementType
      const mType = args.measurementType ?? "NUMERIC";
      const dir = args.direction ?? "INCREASING";
      switch (mType) {
        case "FINANCIAL":
          krType = "CUMULATIVE_NUMERIC";
          typeConfig = { direction: dir, unit: args.currency ?? args.unit, currency: args.currency };
          break;
        case "PERCENTUAL":
          krType = "PROGRESSIVE_PERCENTAGE";
          typeConfig = { direction: dir };
          break;
        case "MILESTONE":
          krType = "STAGE_GATE";
          typeConfig = { stages: [] };
          break;
        default:
          krType = "CUMULATIVE_NUMERIC";
          typeConfig = { direction: dir, unit: args.unit };
      }
    }

    // Validate typeConfig
    if (typeConfig) {
      const validation = validateKrConfig(krType, typeConfig);
      if (!validation.valid) {
        throw new Error(
          `Configuração inválida: ${validation.errors.join("; ")}`
        );
      }
    }

    const krId = await ctx.db.insert("keyResults", {
      objectiveId: args.objectiveId,
      title: args.title,
      description: args.description,
      currentValue: initialValue,
      targetValue: args.targetValue,
      initialValue,
      unit: args.unit,
      krType,
      typeConfig,
      measurementType: args.measurementType,
      direction: args.direction,
      planningFrequency: freq,
      currency: args.currency,
      responsibles: args.responsibles,
      hasProgress: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return krId;
  },
});

export const updateKeyResult = mutation({
  args: {
    id: v.id("keyResults"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    initialValue: v.optional(v.number()),
    direction: v.optional(
      v.union(v.literal("INCREASING"), v.literal("DECREASING"))
    ),
    planningFrequency: v.optional(
      v.union(v.literal("MONTHLY"), v.literal("WEEKLY"))
    ),
    currency: v.optional(v.string()),
    externalLink: v.optional(v.string()),
    responsibles: v.optional(v.array(v.id("members"))),
    typeConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (args.title.trim().length < 2) {
        throw new Error("O título deve ter pelo menos 2 caracteres.");
      }
      const siblings = await ctx.db
        .query("keyResults")
        .withIndex("by_objective", (q) => q.eq("objectiveId", kr.objectiveId))
        .collect();
      if (siblings.some((s) => s.title === args.title && s._id !== args.id)) {
        throw new Error("Já existe um Key Result com este título neste objetivo.");
      }
      updates.title = args.title.trim();
    }

    if (args.description !== undefined) updates.description = args.description;
    if (args.unit !== undefined) updates.unit = args.unit;
    if (args.currency !== undefined) updates.currency = args.currency;

    if (args.externalLink !== undefined) {
      if (args.externalLink && args.externalLink.length > 2048) {
        throw new Error("O link deve ter no máximo 2048 caracteres.");
      }
      if (args.externalLink && !/^https?:\/\/.+/.test(args.externalLink)) {
        throw new Error("O link deve começar com http:// ou https://.");
      }
      updates.externalLink = args.externalLink || undefined;
    }

    if (args.targetValue !== undefined) updates.targetValue = args.targetValue;
    if (args.initialValue !== undefined) {
      updates.initialValue = args.initialValue;
      if (!kr.hasProgress) {
        updates.currentValue = args.initialValue;
      }
    }
    if (args.direction !== undefined) updates.direction = args.direction;
    if (args.planningFrequency !== undefined) updates.planningFrequency = args.planningFrequency;
    if (args.responsibles !== undefined) updates.responsibles = args.responsibles;

    if (args.typeConfig !== undefined) {
      const krType = resolveKrType(kr);
      const validation = validateKrConfig(krType, args.typeConfig);
      if (!validation.valid) {
        throw new Error(`Configuração inválida: ${validation.errors.join("; ")}`);
      }
      updates.typeConfig = args.typeConfig;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const updateKeyResultProgress = mutation({
  args: {
    id: v.id("keyResults"),
    currentValue: v.number(),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    const typeConfig = resolveTypeConfig(kr);

    // Validate progress update
    const validation = validateKrProgressUpdate(krType, {
      newValue: args.currentValue,
      currentValue: kr.currentValue,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      typeConfig,
    });
    if (!validation.valid) {
      throw new Error(`Atualização inválida: ${validation.errors.join("; ")}`);
    }

    await ctx.db.patch(args.id, {
      currentValue: args.currentValue,
      hasProgress: true,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("progressEntries", {
      keyResultId: args.id,
      value: args.currentValue,
      recordedAt: Date.now(),
      source: "MANUAL",
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId, args.id, args.currentValue);
  },
});

// ─── Type-Specific Mutations ────────────────────────────────────────────────

export const updateStageStatus = mutation({
  args: {
    id: v.id("keyResults"),
    stageId: v.string(),
    status: v.union(
      v.literal("NOT_STARTED"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED")
    ),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    if (krType !== "STAGE_GATE") {
      throw new Error("Esta operação é válida apenas para KRs do tipo Portões de Estágio.");
    }

    const config = (kr.typeConfig ?? { stages: [] }) as {
      stages: Array<{
        id: string;
        name: string;
        status: string;
        completedAt?: number;
        evidence?: string;
        description?: string;
      }>;
    };
    const stageIndex = config.stages.findIndex((s) => s.id === args.stageId);
    if (stageIndex === -1) throw new Error("Estágio não encontrado.");

    // Update stage status
    config.stages[stageIndex].status = args.status;
    if (args.status === "COMPLETED") {
      config.stages[stageIndex].completedAt = Date.now();
    }

    // Validate sequential dependency
    const validation = validateKrConfig(krType, config);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    // Update currentValue to completed count
    const completedCount = config.stages.filter((s) => s.status === "COMPLETED").length;

    await ctx.db.patch(args.id, {
      typeConfig: config,
      currentValue: completedCount,
      hasProgress: true,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("progressEntries", {
      keyResultId: args.id,
      value: completedCount,
      recordedAt: Date.now(),
      source: "MANUAL",
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId, args.id, completedCount);
  },
});

export const updateChecklistItems = mutation({
  args: {
    id: v.id("keyResults"),
    categoryId: v.string(),
    itemId: v.string(),
    compliant: v.boolean(),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    if (krType !== "CHECKLIST_COMPLIANCE") {
      throw new Error("Esta operação é válida apenas para KRs do tipo Checklist de Compliance.");
    }

    const config = kr.typeConfig as {
      categories: Array<{
        id: string;
        name: string;
        items: Array<{ id: string; description: string; compliant: boolean }>;
      }>;
      evaluationFrequency: string;
    };

    const category = config.categories.find((c) => c.id === args.categoryId);
    if (!category) throw new Error("Categoria não encontrada.");

    const item = category.items.find((i) => i.id === args.itemId);
    if (!item) throw new Error("Item não encontrado.");

    item.compliant = args.compliant;

    // Calculate new compliance rate
    let totalItems = 0;
    let compliantItems = 0;
    for (const cat of config.categories) {
      for (const it of cat.items) {
        totalItems++;
        if (it.compliant) compliantItems++;
      }
    }
    const complianceRate = totalItems > 0 ? (compliantItems / totalItems) * 100 : 0;
    const roundedRate = Math.round(complianceRate * 100) / 100;

    await ctx.db.patch(args.id, {
      typeConfig: config,
      currentValue: roundedRate,
      hasProgress: true,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("progressEntries", {
      keyResultId: args.id,
      value: roundedRate,
      recordedAt: Date.now(),
      source: "MANUAL",
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId, args.id, complianceRate);
  },
});

export const addCriticalIncident = mutation({
  args: {
    id: v.id("keyResults"),
    incidentId: v.string(),
    description: v.string(),
    severity: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH"),
      v.literal("CRITICAL")
    ),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    if (krType !== "MULTI_PHASE_WITH_RISK") {
      throw new Error("Esta operação é válida apenas para KRs do tipo Multifase com Risco.");
    }

    const config = kr.typeConfig as Record<string, unknown>;
    const incidents = (config.criticalIncidents ?? []) as Array<Record<string, unknown>>;

    incidents.push({
      id: args.incidentId,
      description: args.description,
      occurredAt: Date.now(),
      severity: args.severity,
      resolved: false,
    });

    const updatedConfig = { ...config, criticalIncidents: incidents };

    await ctx.db.patch(args.id, {
      typeConfig: updatedConfig,
      hasProgress: true,
      updatedAt: Date.now(),
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId);
  },
});

export const updateWorkstreamPhaseStatus = mutation({
  args: {
    id: v.id("keyResults"),
    workstreamId: v.string(),
    phaseId: v.string(),
    status: v.union(
      v.literal("NOT_STARTED"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED")
    ),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    if (krType !== "MULTI_PHASE_WITH_RISK") {
      throw new Error("Esta operação é válida apenas para KRs do tipo Multifase com Risco.");
    }

    const config = kr.typeConfig as {
      workstreams: Array<{
        id: string;
        name: string;
        weight: number;
        phases: Array<{
          id: string;
          name: string;
          status: string;
          completedAt?: number;
        }>;
      }>;
      phaseWeight: number;
      riskWeight: number;
      criticalIncidents: Array<Record<string, unknown>>;
      maxTolerableIncidents: number;
    };

    const workstream = config.workstreams.find((ws) => ws.id === args.workstreamId);
    if (!workstream) throw new Error("Workstream não encontrado.");

    const phase = workstream.phases.find((p) => p.id === args.phaseId);
    if (!phase) throw new Error("Fase não encontrada.");

    phase.status = args.status;
    if (args.status === "COMPLETED") {
      phase.completedAt = Date.now();
    }

    // Recalculate progress using the domain layer
    const progress = calculateKrProgress({
      krType,
      currentValue: kr.currentValue,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      typeConfig: config,
    });
    const roundedProgress = Math.round(progress);

    await ctx.db.patch(args.id, {
      typeConfig: config,
      currentValue: roundedProgress,
      hasProgress: true,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("progressEntries", {
      keyResultId: args.id,
      value: roundedProgress,
      recordedAt: Date.now(),
      source: "MANUAL",
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId, args.id, roundedProgress);
  },
});

export const resolveIncident = mutation({
  args: {
    id: v.id("keyResults"),
    incidentId: v.string(),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const krType = resolveKrType(kr);
    if (krType !== "MULTI_PHASE_WITH_RISK") {
      throw new Error("Esta operação é válida apenas para KRs do tipo Multifase com Risco.");
    }

    const config = kr.typeConfig as Record<string, unknown>;
    const incidents = (config.criticalIncidents ?? []) as Array<Record<string, unknown>>;

    const incident = incidents.find((i) => i.id === args.incidentId);
    if (!incident) throw new Error("Incidente não encontrado.");

    incident.resolved = true;

    const updatedConfig = { ...config, criticalIncidents: incidents };

    await ctx.db.patch(args.id, {
      typeConfig: updatedConfig,
      updatedAt: Date.now(),
    });

    await recalculateObjectiveProgress(ctx, kr.objectiveId);
  },
});

// ─── Delete ─────────────────────────────────────────────────────────────────

export const deleteKeyResult = mutation({
  args: { id: v.id("keyResults") },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.id);
    if (!kr) throw new Error("Key Result não encontrado.");

    const objectiveId = kr.objectiveId;

    // Delete related phasing
    const phasingEntries = await ctx.db
      .query("phasing")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.id))
      .collect();
    for (const p of phasingEntries) {
      await ctx.db.delete(p._id);
    }

    // Delete related milestones
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.id))
      .collect();
    for (const m of milestones) {
      await ctx.db.delete(m._id);
    }

    // Delete related comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.id))
      .collect();
    for (const c of comments) {
      await ctx.db.delete(c._id);
    }

    await ctx.db.delete(args.id);

    // Recalculate objective progress after deletion
    const allKRs = await ctx.db
      .query("keyResults")
      .withIndex("by_objective", (q) => q.eq("objectiveId", objectiveId))
      .collect();

    const remainingKRs = allKRs.filter((k) => k._id !== args.id);
    const totalProgress = calculateAverageProgress(remainingKRs);

    await ctx.db.patch(objectiveId, {
      progress: Math.round(totalProgress),
      updatedAt: Date.now(),
    });
  },
});

// ─── Internal Helpers ───────────────────────────────────────────────────────

async function recalculateObjectiveProgress(
  ctx: { db: import("./_generated/server").MutationCtx["db"] },
  objectiveId: import("./_generated/dataModel").Id<"objectives">,
  updatedKrId?: import("./_generated/dataModel").Id<"keyResults">,
  updatedValue?: number
) {
  const allKRs = await ctx.db
    .query("keyResults")
    .withIndex("by_objective", (q) => q.eq("objectiveId", objectiveId))
    .collect();

  const krsWithUpdate = updatedKrId
    ? allKRs.map((k) =>
        k._id === updatedKrId ? { ...k, currentValue: updatedValue!, hasProgress: true } : k
      )
    : allKRs;

  const totalProgress = calculateAverageProgress(krsWithUpdate);

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];

  const healthStatuses: HealthStatus[] = [];
  for (const kr of krsWithUpdate) {
    const phasingEntries = await ctx.db
      .query("phasing")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
      .collect();
    healthStatuses.push(computeKrHealth(kr, phasingEntries, currentDate));
  }

  const objectiveStatus = deriveObjectiveStatus(healthStatuses, totalProgress);

  await ctx.db.patch(objectiveId, {
    progress: Math.round(totalProgress),
    status: objectiveStatus,
    updatedAt: Date.now(),
  });
}

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

function calculateAverageProgress(
  krs: Array<Doc<"keyResults">>
): number {
  if (krs.length === 0) return 0;

  const sumProgress = krs.reduce((acc, kr) => {
    const krType = resolveKrType(kr);
    const typeConfig = resolveTypeConfig(kr);

    const progress = calculateKrProgress({
      krType,
      currentValue: kr.currentValue,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      typeConfig,
    });

    return acc + progress;
  }, 0);

  return sumProgress / krs.length;
}
