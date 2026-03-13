import type { KrTypeStrategy } from "../strategy";
import { ratioProgress } from "../strategy";
import type {
  ChecklistComplianceConfig,
  ChecklistCategory,
  ValidationResult,
} from "../types";

function calculateComplianceRate(categories: ChecklistCategory[]): number {
  let totalItems = 0;
  let compliantItems = 0;
  for (const category of categories) {
    for (const item of category.items) {
      totalItems++;
      if (item.compliant) compliantItems++;
    }
  }
  if (totalItems === 0) return 0;
  return (compliantItems / totalItems) * 100;
}

export const checklistComplianceStrategy: KrTypeStrategy = {
  label: "Checklist de Compliance",
  description:
    "Score de compliance baseado em checklist estruturado com avaliação recorrente (ex: readiness, auditoria)",
  supportsPhasing: true,
  supportsDirection: false,

  calculateProgress({ currentValue, initialValue, targetValue }) {
    // currentValue stores the current compliance %, calculated from checklist
    return ratioProgress(currentValue, initialValue, targetValue, "INCREASING");
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
    const progress = ratioProgress(currentValue, initialValue, targetValue, "INCREASING");
    if (progress >= 100) return "COMPLETED";

    // Compare current compliance vs planned for current period
    if (phasingEntries.length === 0) return "ON_TRACK";

    const sorted = [...phasingEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Find the most recent planned value
    let currentPlanned: number | null = null;
    for (const entry of sorted) {
      if (entry.date <= currentDate) {
        currentPlanned = entry.plannedValue;
      }
    }

    if (currentPlanned === null) return "ON_TRACK";

    // Compliance is always INCREASING direction
    if (currentValue >= currentPlanned) return "ON_TRACK";
    const plannedDelta = Math.abs(currentPlanned - initialValue);
    if (plannedDelta === 0) return "ON_TRACK";
    const actualDelta = currentValue - initialValue;
    const ratio = actualDelta / plannedDelta;
    if (ratio >= 0.85) return "AT_RISK";
    return "LATE";
  },

  validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];
    const c = config as Record<string, unknown>;

    if (!c || typeof c !== "object") {
      return { valid: false, errors: ["Configuração inválida."] };
    }

    const categories = c.categories;
    if (!Array.isArray(categories)) {
      errors.push("categories deve ser um array.");
      return { valid: false, errors };
    }

    // Empty categories allowed on creation (configured post-creation)
    for (const category of categories as ChecklistCategory[]) {
      if (!category.id || typeof category.id !== "string") {
        errors.push("Cada categoria deve ter um ID.");
      }
      if (!category.name || typeof category.name !== "string") {
        errors.push("Cada categoria deve ter um nome.");
      }
      if (!Array.isArray(category.items) || category.items.length === 0) {
        errors.push(`Categoria "${category.name}" deve ter ao menos um item.`);
      }
    }

    if (
      c.evaluationFrequency !== "MONTHLY" &&
      c.evaluationFrequency !== "QUARTERLY"
    ) {
      errors.push("Frequência de avaliação deve ser MONTHLY ou QUARTERLY.");
    }

    return { valid: errors.length === 0, errors };
  },

  validateProgressUpdate() {
    // Compliance progress is updated via checklist item toggles
    return { valid: true, errors: [] };
  },
};

export { calculateComplianceRate };
