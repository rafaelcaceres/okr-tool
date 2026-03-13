import { getStrategy } from "./registry";
import type { KrType, ValidationResult } from "./types";

export function validateKrConfig(
  krType: KrType,
  config: unknown
): ValidationResult {
  const strategy = getStrategy(krType);
  return strategy.validateConfig(config);
}

export function validateKrProgressUpdate(
  krType: KrType,
  params: {
    newValue: number;
    currentValue: number;
    initialValue: number;
    targetValue: number;
    typeConfig: unknown;
  }
): ValidationResult {
  const strategy = getStrategy(krType);
  return strategy.validateProgressUpdate(params);
}
