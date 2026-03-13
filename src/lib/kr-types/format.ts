import { getStrategy } from "./registry";
import type {
  KrType,
  CumulativeNumericConfig,
  StageGateConfig,
  ChecklistComplianceConfig,
  MultiPhaseWithRiskConfig,
  PeriodicIndexConfig,
} from "./types";

/** Get Portuguese label for a KR type */
export function getKrTypeLabel(krType: KrType): string {
  return getStrategy(krType).label;
}

/** Get Portuguese description for a KR type */
export function getKrTypeDescription(krType: KrType): string {
  return getStrategy(krType).description;
}

/** Format a value for display based on KR type */
export function formatKrValue(
  krType: KrType,
  value: number,
  typeConfig: unknown
): string {
  switch (krType) {
    case "CUMULATIVE_NUMERIC": {
      const config = typeConfig as CumulativeNumericConfig;
      if (config.currency) {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: config.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      }
      return `${new Intl.NumberFormat("pt-BR").format(value)} ${config.unit}`;
    }

    case "PROGRESSIVE_PERCENTAGE":
      return `${value.toFixed(1)}%`;

    case "STAGE_GATE": {
      const config = typeConfig as StageGateConfig;
      const completed = config.stages.filter(
        (s) => s.status === "COMPLETED"
      ).length;
      return `${completed} de ${config.stages.length} estágios`;
    }

    case "PERIODIC_INDEX": {
      const config = typeConfig as PeriodicIndexConfig;
      return `${value.toFixed(1)} ${config.unit}`;
    }

    case "CHECKLIST_COMPLIANCE":
      return `${value.toFixed(1)}%`;

    case "MULTI_PHASE_WITH_RISK": {
      const config = typeConfig as MultiPhaseWithRiskConfig;
      let totalPhases = 0;
      let completedPhases = 0;
      for (const ws of config.workstreams) {
        totalPhases += ws.phases.length;
        completedPhases += ws.phases.filter(
          (p) => p.status === "COMPLETED"
        ).length;
      }
      const unresolvedCritical = config.criticalIncidents.filter(
        (i) => i.severity === "CRITICAL" && !i.resolved
      ).length;
      let formatted = `${completedPhases}/${totalPhases} fases`;
      if (unresolvedCritical > 0) {
        formatted += ` | ${unresolvedCritical} incidente(s) crítico(s)`;
      }
      return formatted;
    }

    default:
      return String(value);
  }
}

/** Format progress summary for display */
export function formatKrProgressSummary(
  krType: KrType,
  currentValue: number,
  targetValue: number,
  typeConfig: unknown
): string {
  const current = formatKrValue(krType, currentValue, typeConfig);
  const target = formatKrValue(krType, targetValue, typeConfig);
  return `${current} / ${target}`;
}
