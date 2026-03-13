import { getStrategy } from "./registry";
import type {
  HealthStatus,
  KrType,
  PhasingEntry,
  ProgressEntry,
} from "./types";

export function calculateKrHealth(params: {
  krType: KrType;
  currentValue: number;
  initialValue: number;
  targetValue: number;
  typeConfig: unknown;
  phasingEntries: PhasingEntry[];
  currentDate: string;
  hasProgress: boolean;
  progressEntries?: ProgressEntry[];
}): HealthStatus {
  const strategy = getStrategy(params.krType);
  return strategy.calculateHealth(params);
}
