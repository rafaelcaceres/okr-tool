import type { KrTypeStrategy, HealthParams } from "../strategy";
import { clampProgress } from "../strategy";
import type {
  MultiPhaseWithRiskConfig,
  Workstream,
  CriticalIncident,
  ValidationResult,
} from "../types";

function calculatePhaseCompletion(workstreams: Workstream[]): number {
  if (workstreams.length === 0) return 0;

  let totalWeightedProgress = 0;
  let totalWeight = 0;

  for (const ws of workstreams) {
    const total = ws.phases.length;
    if (total === 0) continue;
    const completed = ws.phases.filter((p) => p.status === "COMPLETED").length;
    totalWeightedProgress += (completed / total) * ws.weight;
    totalWeight += ws.weight;
  }

  if (totalWeight === 0) return 0;
  return totalWeightedProgress / totalWeight;
}

function calculateRiskCompliance(
  incidents: CriticalIncident[],
  maxTolerable: number
): number {
  const unresolvedCritical = incidents.filter(
    (i) => i.severity === "CRITICAL" && !i.resolved
  ).length;

  if (unresolvedCritical <= maxTolerable) return 1;
  // Each excess incident reduces compliance by 25%
  return Math.max(0, 1 - (unresolvedCritical - maxTolerable) * 0.25);
}

export const multiPhaseWithRiskStrategy: KrTypeStrategy = {
  label: "Multifase com Risco",
  description:
    "Roadmap com múltiplos workstreams e rastreamento de incidentes críticos (ex: governança, regulatório)",
  supportsPhasing: true,
  supportsDirection: false,

  calculateProgress({ typeConfig }) {
    const config = typeConfig as MultiPhaseWithRiskConfig;

    const phaseCompletion = calculatePhaseCompletion(config.workstreams);
    const riskCompliance = calculateRiskCompliance(
      config.criticalIncidents,
      config.maxTolerableIncidents
    );

    const progress =
      (phaseCompletion * config.phaseWeight +
        riskCompliance * config.riskWeight) *
      100;

    return clampProgress(Math.round(progress));
  },

  calculateHealth(params: HealthParams) {
    const config = params.typeConfig as MultiPhaseWithRiskConfig;

    if (!params.hasProgress) {
      // Check if any work has started
      const anyStarted = config.workstreams.some((ws) =>
        ws.phases.some((p) => p.status !== "NOT_STARTED")
      );
      if (!anyStarted && config.criticalIncidents.length === 0) {
        return "NOT_STARTED";
      }
    }

    const progress = this.calculateProgress(params);
    if (progress >= 100) return "COMPLETED";

    // Unresolved critical incidents immediately impact health
    const unresolvedCritical = config.criticalIncidents.filter(
      (i) => i.severity === "CRITICAL" && !i.resolved
    ).length;

    if (unresolvedCritical > config.maxTolerableIncidents) return "LATE";

    // Check phase progress against planned timeline
    if (params.phasingEntries.length === 0) {
      return unresolvedCritical > 0 ? "AT_RISK" : "ON_TRACK";
    }

    const sorted = [...params.phasingEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Count how many phases should be done by now (across all workstreams)
    let expectedPhasesDone = 0;
    for (const entry of sorted) {
      if (entry.date <= params.currentDate) {
        expectedPhasesDone++;
      }
    }

    if (expectedPhasesDone === 0) {
      return unresolvedCritical > 0 ? "AT_RISK" : "ON_TRACK";
    }

    // Count actual phases completed across all workstreams
    let totalCompleted = 0;
    let totalPhases = 0;
    for (const ws of config.workstreams) {
      totalCompleted += ws.phases.filter(
        (p) => p.status === "COMPLETED"
      ).length;
      totalPhases += ws.phases.length;
    }

    const expectedRatio =
      totalPhases > 0
        ? Math.min(expectedPhasesDone / totalPhases, 1)
        : 0;
    const actualRatio = totalPhases > 0 ? totalCompleted / totalPhases : 0;

    if (expectedRatio === 0) {
      return unresolvedCritical > 0 ? "AT_RISK" : "ON_TRACK";
    }

    const completionRatio = actualRatio / expectedRatio;

    if (completionRatio >= 1) {
      return unresolvedCritical > 0 ? "AT_RISK" : "ON_TRACK";
    }
    if (completionRatio >= 0.85) return "AT_RISK";
    return "LATE";
  },

  validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];
    const c = config as Record<string, unknown>;

    if (!c || typeof c !== "object") {
      return { valid: false, errors: ["Configuração inválida."] };
    }

    const workstreams = c.workstreams;
    if (!Array.isArray(workstreams)) {
      errors.push("workstreams deve ser um array.");
    } else if (workstreams.length > 0) {
      let totalWeight = 0;
      for (const ws of workstreams as Workstream[]) {
        if (!ws.id || typeof ws.id !== "string") {
          errors.push("Cada workstream deve ter um ID.");
        }
        if (!ws.name || typeof ws.name !== "string") {
          errors.push("Cada workstream deve ter um nome.");
        }
        if (typeof ws.weight !== "number" || ws.weight <= 0 || ws.weight > 1) {
          errors.push(
            `Peso do workstream "${ws.name}" deve ser entre 0 e 1.`
          );
        }
        totalWeight += ws.weight || 0;
        if (!Array.isArray(ws.phases) || ws.phases.length === 0) {
          errors.push(
            `Workstream "${ws.name}" deve ter ao menos uma fase.`
          );
        }
      }
      if (Math.abs(totalWeight - 1) > 0.01) {
        errors.push("A soma dos pesos dos workstreams deve ser 1.");
      }
    }

    if (typeof c.phaseWeight !== "number" || typeof c.riskWeight !== "number") {
      errors.push("Pesos de fase e risco são obrigatórios.");
    } else if (
      Math.abs((c.phaseWeight as number) + (c.riskWeight as number) - 1) > 0.01
    ) {
      errors.push("A soma de phaseWeight e riskWeight deve ser 1.");
    }

    if (typeof c.maxTolerableIncidents !== "number" || c.maxTolerableIncidents < 0) {
      errors.push("maxTolerableIncidents deve ser um número >= 0.");
    }

    if (c.criticalIncidents !== undefined && !Array.isArray(c.criticalIncidents)) {
      errors.push("criticalIncidents deve ser um array.");
    }

    return { valid: errors.length === 0, errors };
  },

  validateProgressUpdate() {
    // Multi-phase progress is updated via phase transitions and incident management
    return { valid: true, errors: [] };
  },
};

export { calculatePhaseCompletion, calculateRiskCompliance };
