import type { Doc } from "../../../convex/_generated/dataModel";
import type {
  KrType,
  KrTypeConfigMap,
  StageGateConfig,
  ChecklistComplianceConfig,
  MultiPhaseWithRiskConfig,
} from "./types";
import { getStrategy } from "./registry";
import { calculateKrProgress } from "./progress";
import { formatKrValue } from "./format";
import type { KrTypeStrategy } from "./strategy";

// ─── Type Resolution ────────────────────────────────────────────────────────

/** Resolve the canonical KR type, falling back from legacy measurementType */
export function resolveKrType(kr: Doc<"keyResults">): KrType {
  if (kr.krType) return kr.krType as KrType;
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

/** Resolve type-specific config, reconstructing from legacy fields if needed */
export function resolveTypeConfig(kr: Doc<"keyResults">): KrTypeConfigMap[KrType] {
  if (kr.typeConfig) return kr.typeConfig as KrTypeConfigMap[KrType];
  const direction = kr.direction ?? "INCREASING";
  switch (kr.measurementType) {
    case "FINANCIAL":
      return { direction, unit: kr.currency ?? kr.unit, currency: kr.currency } as KrTypeConfigMap["CUMULATIVE_NUMERIC"];
    case "PERCENTUAL":
      return { direction } as KrTypeConfigMap["PROGRESSIVE_PERCENTAGE"];
    case "MILESTONE":
      return { stages: [] } as StageGateConfig;
    default:
      return { direction, unit: kr.unit } as KrTypeConfigMap["CUMULATIVE_NUMERIC"];
  }
}

// ─── Resolved KR ────────────────────────────────────────────────────────────

export interface ResolvedKr {
  krType: KrType;
  typeConfig: KrTypeConfigMap[KrType];
  strategy: KrTypeStrategy;
  progress: number;
  isDecreasing: boolean;
}

/** Resolve all derived KR properties in one place */
export function resolveKr(kr: Doc<"keyResults">): ResolvedKr {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);
  const strategy = getStrategy(krType);
  const progress = Math.round(
    calculateKrProgress({
      krType,
      currentValue: kr.currentValue,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      typeConfig,
    })
  );
  const isDecreasing =
    strategy.supportsDirection &&
    (typeConfig as { direction?: string }).direction === "DECREASING";

  return { krType, typeConfig, strategy, progress, isDecreasing };
}

/** Format a value for display using resolved KR type info */
export function formatResolvedValue(kr: Doc<"keyResults">, value: number): string {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);
  return formatKrValue(krType, value, typeConfig);
}

// ─── Type-narrowing helpers ─────────────────────────────────────────────────

export function isStageGateConfig(
  config: KrTypeConfigMap[KrType]
): config is StageGateConfig {
  return "stages" in config;
}

export function isChecklistConfig(
  config: KrTypeConfigMap[KrType]
): config is ChecklistComplianceConfig {
  return "categories" in config;
}

export function isMultiPhaseConfig(
  config: KrTypeConfigMap[KrType]
): config is MultiPhaseWithRiskConfig {
  return "workstreams" in config;
}
