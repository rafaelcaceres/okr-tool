import type { KrTypeStrategy } from "../strategy";
import {
  ratioProgress,
  cumulativePhasingHealth,
} from "../strategy";
import type { CumulativeNumericConfig, ValidationResult } from "../types";

export const cumulativeNumericStrategy: KrTypeStrategy = {
  label: "KPI Cumulativo",
  description:
    "Acumula valor mês a mês com phasing cumulativo (ex: receita, leads, volume)",
  supportsPhasing: true,
  supportsDirection: true,

  calculateProgress({ currentValue, initialValue, targetValue, typeConfig }) {
    const config = typeConfig as CumulativeNumericConfig;
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
    const config = typeConfig as CumulativeNumericConfig;
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

    if (typeof c.unit !== "string" || c.unit.trim().length === 0) {
      errors.push("Unidade é obrigatória.");
    }

    if (c.currency !== undefined && typeof c.currency !== "string") {
      errors.push("Moeda deve ser uma string.");
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
