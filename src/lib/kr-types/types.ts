// ─── KR Type Enum ───────────────────────────────────────────────────────────

export const KR_TYPES = [
  "CUMULATIVE_NUMERIC",
  "PROGRESSIVE_PERCENTAGE",
  "STAGE_GATE",
  "PERIODIC_INDEX",
  "CHECKLIST_COMPLIANCE",
  "MULTI_PHASE_WITH_RISK",
] as const;

export type KrType = (typeof KR_TYPES)[number];

// ─── Health Status ──────────────────────────────────────────────────────────

export type HealthStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "LATE"
  | "NOT_STARTED"
  | "COMPLETED";

// ─── Direction ──────────────────────────────────────────────────────────────

export type Direction = "INCREASING" | "DECREASING";

// ─── Stage Status (for STAGE_GATE) ─────────────────────────────────────────

export type StageStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

// ─── Incident Severity (for MULTI_PHASE_WITH_RISK) ─────────────────────────

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ─── Evaluation Frequency ───────────────────────────────────────────────────

export type EvaluationFrequency = "MONTHLY" | "QUARTERLY";

// ─── Type-Specific Configs ──────────────────────────────────────────────────

export interface CumulativeNumericConfig {
  direction: Direction;
  unit: string;
  currency?: string;
}

export interface ProgressivePercentageConfig {
  direction: Direction;
}

export interface StageGateStage {
  id: string;
  name: string;
  description?: string;
  status: StageStatus;
  completedAt?: number;
  evidence?: string;
}

export interface StageGateConfig {
  stages: StageGateStage[];
}

export interface PeriodicIndexConfig {
  direction: Direction;
  unit: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  compliant: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistComplianceConfig {
  categories: ChecklistCategory[];
  evaluationFrequency: EvaluationFrequency;
}

export interface WorkstreamPhase {
  id: string;
  name: string;
  status: StageStatus;
  completedAt?: number;
}

export interface Workstream {
  id: string;
  name: string;
  weight: number;
  phases: WorkstreamPhase[];
}

export interface CriticalIncident {
  id: string;
  description: string;
  occurredAt: number;
  severity: IncidentSeverity;
  resolved: boolean;
}

export interface MultiPhaseWithRiskConfig {
  workstreams: Workstream[];
  phaseWeight: number;
  riskWeight: number;
  criticalIncidents: CriticalIncident[];
  maxTolerableIncidents: number;
}

// ─── Discriminated Union ────────────────────────────────────────────────────

export type KrTypeConfigMap = {
  CUMULATIVE_NUMERIC: CumulativeNumericConfig;
  PROGRESSIVE_PERCENTAGE: ProgressivePercentageConfig;
  STAGE_GATE: StageGateConfig;
  PERIODIC_INDEX: PeriodicIndexConfig;
  CHECKLIST_COMPLIANCE: ChecklistComplianceConfig;
  MULTI_PHASE_WITH_RISK: MultiPhaseWithRiskConfig;
};

export type KrTypeConfig<T extends KrType = KrType> = KrTypeConfigMap[T];

// ─── Validation ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Phasing Entry (shared) ─────────────────────────────────────────────────

export interface PhasingEntry {
  date: string;
  plannedValue: number;
}

// ─── Progress Entry (shared) ────────────────────────────────────────────────

export interface ProgressEntry {
  value: number;
  recordedAt: number;
}
