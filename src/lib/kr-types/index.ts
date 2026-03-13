// Re-export everything from the domain layer
export { KR_TYPES } from "./types";
export type {
  KrType,
  HealthStatus,
  Direction,
  KrTypeConfig,
  KrTypeConfigMap,
  CumulativeNumericConfig,
  ProgressivePercentageConfig,
  StageGateConfig,
  StageGateStage,
  PeriodicIndexConfig,
  ChecklistComplianceConfig,
  ChecklistCategory,
  ChecklistItem,
  MultiPhaseWithRiskConfig,
  Workstream,
  WorkstreamPhase,
  CriticalIncident,
  ValidationResult,
  PhasingEntry,
  ProgressEntry,
} from "./types";

export type { KrTypeStrategy } from "./strategy";

export { getStrategy, getAllStrategies } from "./registry";
export { calculateKrProgress } from "./progress";
export { calculateKrHealth } from "./health";
export { validateKrConfig, validateKrProgressUpdate } from "./validation";
export {
  getKrTypeLabel,
  getKrTypeDescription,
  formatKrValue,
  formatKrProgressSummary,
} from "./format";

export {
  resolveKrType,
  resolveTypeConfig,
  resolveKr,
  formatResolvedValue,
  isStageGateConfig,
  isChecklistConfig,
  isMultiPhaseConfig,
} from "./resolve";
export type { ResolvedKr } from "./resolve";
