import { getStrategy } from "./registry";
import type { KrType, ProgressEntry } from "./types";

export function calculateKrProgress(params: {
  krType: KrType;
  currentValue: number;
  initialValue: number;
  targetValue: number;
  typeConfig: unknown;
  progressEntries?: ProgressEntry[];
}): number {
  const strategy = getStrategy(params.krType);
  return strategy.calculateProgress(params);
}
