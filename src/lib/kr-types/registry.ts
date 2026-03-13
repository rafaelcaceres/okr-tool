import type { KrTypeStrategy } from "./strategy";
import type { KrType } from "./types";
import { cumulativeNumericStrategy } from "./strategies/cumulative-numeric";
import { progressivePercentageStrategy } from "./strategies/progressive-percentage";
import { stageGateStrategy } from "./strategies/stage-gate";
import { periodicIndexStrategy } from "./strategies/periodic-index";
import { checklistComplianceStrategy } from "./strategies/checklist-compliance";
import { multiPhaseWithRiskStrategy } from "./strategies/multi-phase-with-risk";

/**
 * Strategy registry — the single extension point.
 *
 * To add a new KR type:
 * 1. Add the type to KR_TYPES in types.ts
 * 2. Add its config interface to KrTypeConfigMap in types.ts
 * 3. Create a strategy file in strategies/
 * 4. Register it here
 */
const strategies: Record<KrType, KrTypeStrategy> = {
  CUMULATIVE_NUMERIC: cumulativeNumericStrategy,
  PROGRESSIVE_PERCENTAGE: progressivePercentageStrategy,
  STAGE_GATE: stageGateStrategy,
  PERIODIC_INDEX: periodicIndexStrategy,
  CHECKLIST_COMPLIANCE: checklistComplianceStrategy,
  MULTI_PHASE_WITH_RISK: multiPhaseWithRiskStrategy,
};

export function getStrategy(krType: KrType): KrTypeStrategy {
  const strategy = strategies[krType];
  if (!strategy) {
    throw new Error(`Tipo de KR desconhecido: ${krType}`);
  }
  return strategy;
}

export function getAllStrategies(): Record<KrType, KrTypeStrategy> {
  return strategies;
}
