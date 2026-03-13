import type { KrTypeStrategy } from "../strategy";
import { ratioProgress } from "../strategy";
import type { PeriodicIndexConfig, ValidationResult } from "../types";

export const periodicIndexStrategy: KrTypeStrategy = {
  label: "Índice Periódico",
  description:
    "Métrica baseada em coleta periódica que pode oscilar (ex: survey de engajamento, NPS)",
  supportsPhasing: true,
  supportsDirection: true,

  calculateProgress({ currentValue, initialValue, targetValue, typeConfig }) {
    const config = typeConfig as PeriodicIndexConfig;
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
    const config = typeConfig as PeriodicIndexConfig;
    const progress = ratioProgress(currentValue, initialValue, targetValue, config.direction);
    if (progress >= 100) return "COMPLETED";

    // For periodic index, compare latest reading vs planned for current period
    if (phasingEntries.length === 0) return "ON_TRACK";

    const sorted = [...phasingEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Find the most recent phasing entry that has passed
    let currentPlanned: number | null = null;
    for (const entry of sorted) {
      if (entry.date <= currentDate) {
        currentPlanned = entry.plannedValue;
      }
    }

    if (currentPlanned === null) return "ON_TRACK";

    // Compare current reading vs planned for this period
    if (config.direction === "DECREASING") {
      if (currentValue <= currentPlanned) return "ON_TRACK";
      const plannedDelta = Math.abs(initialValue - currentPlanned);
      if (plannedDelta === 0) return "ON_TRACK";
      const actualDelta = Math.abs(initialValue - currentValue);
      const ratio = actualDelta / plannedDelta;
      if (ratio >= 0.85) return "AT_RISK";
      return "LATE";
    } else {
      if (currentValue >= currentPlanned) return "ON_TRACK";
      const plannedDelta = Math.abs(currentPlanned - initialValue);
      if (plannedDelta === 0) return "ON_TRACK";
      const actualDelta = currentValue - initialValue;
      const ratio = actualDelta / plannedDelta;
      if (ratio >= 0.85) return "AT_RISK";
      return "LATE";
    }
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
