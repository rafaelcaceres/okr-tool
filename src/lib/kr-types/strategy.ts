import type {
  HealthStatus,
  KrType,
  PhasingEntry,
  ProgressEntry,
  ValidationResult,
} from "./types";

// ─── Strategy Params ────────────────────────────────────────────────────────

export interface ProgressParams {
  currentValue: number;
  initialValue: number;
  targetValue: number;
  typeConfig: unknown;
  progressEntries?: ProgressEntry[];
}

export interface HealthParams extends ProgressParams {
  phasingEntries: PhasingEntry[];
  currentDate: string;
  hasProgress: boolean;
}

export interface ProgressUpdateParams {
  newValue: number;
  currentValue: number;
  initialValue: number;
  targetValue: number;
  typeConfig: unknown;
}

// ─── Strategy Interface ─────────────────────────────────────────────────────

export interface KrTypeStrategy {
  /** Calculate progress percentage [0-100] */
  calculateProgress(params: ProgressParams): number;

  /** Calculate health status given phasing data */
  calculateHealth(params: HealthParams): HealthStatus;

  /** Validate type-specific configuration */
  validateConfig(config: unknown): ValidationResult;

  /** Validate a progress update for this type */
  validateProgressUpdate(params: ProgressUpdateParams): ValidationResult;

  /** Whether this type supports phasing planning */
  supportsPhasing: boolean;

  /** Whether this type supports direction (INCREASING/DECREASING) */
  supportsDirection: boolean;

  /** Portuguese display label */
  label: string;

  /** Portuguese description */
  description: string;
}

// ─── Helpers for strategies ─────────────────────────────────────────────────

/** Standard ratio-based progress for numeric types with direction support */
export function ratioProgress(
  currentValue: number,
  initialValue: number,
  targetValue: number,
  direction: string
): number {
  const range = Math.abs(targetValue - initialValue);
  if (range === 0) return 0;

  let progress: number;
  if (direction === "DECREASING") {
    progress =
      ((initialValue - currentValue) / (initialValue - targetValue)) * 100;
  } else {
    progress =
      ((currentValue - initialValue) / (targetValue - initialValue)) * 100;
  }

  return clampProgress(progress);
}

/** Clamp progress to [0, 100] */
export function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Standard cumulative phasing health calculation.
 * Compares actual progress vs cumulative planned progress at current date.
 * Returns ON_TRACK (ratio >= 1), AT_RISK (>= 0.85), or LATE (< 0.85).
 */
export function cumulativePhasingHealth(
  currentValue: number,
  initialValue: number,
  targetValue: number,
  direction: string,
  phasingEntries: PhasingEntry[],
  currentDate: string
): HealthStatus {
  if (phasingEntries.length === 0) return "ON_TRACK";

  const sorted = [...phasingEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Before first phasing period
  if (currentDate < sorted[0].date) return "ON_TRACK";

  // Calculate cumulative planned value up to current date
  let cumulativePlanned = initialValue;
  for (const entry of sorted) {
    if (entry.date < currentDate) {
      if (direction === "DECREASING") {
        cumulativePlanned -= entry.plannedValue;
      } else {
        cumulativePlanned += entry.plannedValue;
      }
    }
  }

  // After last phasing date, compare against target
  if (currentDate > sorted[sorted.length - 1].date) {
    cumulativePlanned = targetValue;
  }

  // Compare actual vs planned
  if (direction === "DECREASING") {
    const distanceFromInitial = Math.abs(initialValue - cumulativePlanned);
    if (distanceFromInitial === 0) return "ON_TRACK";

    if (currentValue <= cumulativePlanned) return "ON_TRACK";
    const actualDistance = Math.abs(initialValue - currentValue);
    const ratio = actualDistance / distanceFromInitial;
    if (ratio >= 0.85) return "AT_RISK";
    return "LATE";
  } else {
    const plannedDistance = Math.abs(cumulativePlanned - initialValue);
    if (plannedDistance === 0) return "ON_TRACK";

    const actualDistance = currentValue - initialValue;
    const ratio = actualDistance / plannedDistance;
    if (ratio >= 1) return "ON_TRACK";
    if (ratio >= 0.85) return "AT_RISK";
    return "LATE";
  }
}
