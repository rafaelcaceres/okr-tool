import type { KrTypeStrategy, HealthParams } from "../strategy";
import { clampProgress } from "../strategy";
import type {
  StageGateConfig,
  StageGateStage,
  ValidationResult,
} from "../types";

function countCompleted(stages: StageGateStage[]): number {
  return stages.filter((s) => s.status === "COMPLETED").length;
}

export const stageGateStrategy: KrTypeStrategy = {
  label: "Milestones Sequenciais",
  description:
    "Estágios sequenciais com dependências lógicas (ex: marcos de projeto, entregas)",
  supportsPhasing: true,
  supportsDirection: false,

  calculateProgress({ typeConfig }) {
    const config = typeConfig as StageGateConfig;
    const total = config.stages.length;
    if (total === 0) return 0;
    const completed = countCompleted(config.stages);
    return clampProgress(Math.round((completed / total) * 100));
  },

  calculateHealth(params: HealthParams) {
    const config = params.typeConfig as StageGateConfig;
    const total = config.stages.length;
    if (total === 0) return "NOT_STARTED";

    const completed = countCompleted(config.stages);
    if (completed === total) return "COMPLETED";
    if (
      completed === 0 &&
      config.stages.every((s) => s.status === "NOT_STARTED")
    ) {
      if (!params.hasProgress) return "NOT_STARTED";
    }

    // Each phasing entry represents a stage target date (ordered)
    // Compare completed stages vs expected stages by current date
    if (params.phasingEntries.length === 0) return "ON_TRACK";

    const sorted = [...params.phasingEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let expectedCompleted = 0;
    for (const entry of sorted) {
      if (entry.date <= params.currentDate) {
        expectedCompleted++;
      }
    }
    expectedCompleted = Math.min(expectedCompleted, total);

    if (expectedCompleted === 0) return "ON_TRACK";

    const ratio = completed / expectedCompleted;
    if (ratio >= 1) return "ON_TRACK";
    if (ratio >= 0.85) return "AT_RISK";
    return "LATE";
  },

  validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];
    const c = config as Record<string, unknown>;

    if (!c || typeof c !== "object") {
      return { valid: false, errors: ["Configuração inválida."] };
    }

    const stages = c.stages;
    if (!Array.isArray(stages)) {
      errors.push("stages deve ser um array.");
      return { valid: false, errors };
    }

    // Empty stages allowed on creation (configured post-creation)
    // Validate sequential dependency: no stage after a NOT_STARTED can be IN_PROGRESS/COMPLETED
    let foundIncomplete = false;
    for (const stage of stages as StageGateStage[]) {
      if (!stage.id || typeof stage.id !== "string") {
        errors.push("Cada estágio deve ter um ID.");
      }
      if (!stage.name || typeof stage.name !== "string") {
        errors.push("Cada estágio deve ter um nome.");
      }
      if (
        foundIncomplete &&
        (stage.status === "IN_PROGRESS" || stage.status === "COMPLETED")
      ) {
        errors.push(
          `Estágio "${stage.name}" não pode avançar antes do anterior ser concluído.`
        );
      }
      if (stage.status !== "COMPLETED") {
        foundIncomplete = true;
      }
    }

    return { valid: errors.length === 0, errors };
  },

  validateProgressUpdate() {
    // Stage gate progress is updated via stage status transitions, not raw values
    return { valid: true, errors: [] };
  },
};
