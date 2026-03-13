import type { KrTypeStrategy } from "../strategy";
import {
  ratioProgress,
  cumulativePhasingHealth,
} from "../strategy";
import type { ProgressivePercentageConfig, ValidationResult } from "../types";

export const progressivePercentageStrategy: KrTypeStrategy = {
  label: "Percentual Progressivo",
  description:
    "Percentual com evolução progressiva e breakpoints não lineares (ex: adoção, cobertura)",
  supportsPhasing: true,
  supportsDirection: true,

  calculateProgress({ currentValue, initialValue, targetValue, typeConfig }) {
    const config = typeConfig as ProgressivePercentageConfig;
    return ratioProgress(currentValue, initialValue, targetValue, config.direction);
  },

  calculateHealth({
    currentValue,
    initialValue,
    targetValue,
    typeConfig,
    phasingEntries,
    currentDate,
    hasProgress,
  }) {
    if (!hasProgress) return "NOT_STARTED";
    const config = typeConfig as ProgressivePercentageConfig;
    const progress = ratioProgress(currentValue, initialValue, targetValue, config.direction);
    if (progress >= 100) return "COMPLETED";
    return cumulativePhasingHealth(
      currentValue,
      initialValue,
      targetValue,
      config.direction,
      phasingEntries,
      currentDate
    );
  },

  validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];
    const c = config as Record<string, unknown>;

    if (!c || typeof c !== "object") {
      return { valid: false, errors: ["Configuração inválida."] };
    }

    if (c.direction !== "INCREASING" && c.direction !== "DECREASING") {
      errors.push("Direção deve ser INCREASING ou DECREASING.");
    }

    return { valid: errors.length === 0, errors };
  },

  validateProgressUpdate({ newValue }) {
    const errors: string[] = [];
    if (typeof newValue !== "number" || isNaN(newValue)) {
      errors.push("Valor deve ser um número válido.");
    }
    return { valid: errors.length === 0, errors };
  },
};
