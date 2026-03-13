import { describe, it, expect } from "vitest";
import { stageGateStrategy } from "../stage-gate";
import type { StageGateConfig } from "../../types";

function makeStages(statuses: Array<"NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">): StageGateConfig {
  return {
    stages: statuses.map((status, i) => ({
      id: `stage-${i}`,
      name: `Stage ${i + 1}`,
      status,
    })),
  };
}

describe("stageGateStrategy", () => {
  describe("calculateProgress", () => {
    it("returns 0 when no stages completed", () => {
      expect(
        stageGateStrategy.calculateProgress({
          currentValue: 0,
          initialValue: 0,
          targetValue: 4,
          typeConfig: makeStages(["NOT_STARTED", "NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]),
        })
      ).toBe(0);
    });

    it("returns 50 when half completed", () => {
      expect(
        stageGateStrategy.calculateProgress({
          currentValue: 2,
          initialValue: 0,
          targetValue: 4,
          typeConfig: makeStages(["COMPLETED", "COMPLETED", "NOT_STARTED", "NOT_STARTED"]),
        })
      ).toBe(50);
    });

    it("returns 100 when all completed", () => {
      expect(
        stageGateStrategy.calculateProgress({
          currentValue: 4,
          initialValue: 0,
          targetValue: 4,
          typeConfig: makeStages(["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED"]),
        })
      ).toBe(100);
    });

    it("returns 0 for empty stages", () => {
      expect(
        stageGateStrategy.calculateProgress({
          currentValue: 0,
          initialValue: 0,
          targetValue: 0,
          typeConfig: { stages: [] },
        })
      ).toBe(0);
    });
  });

  describe("calculateHealth", () => {
    const baseParams = {
      currentValue: 0,
      initialValue: 0,
      targetValue: 4,
      phasingEntries: [
        { date: "2024-03-31", plannedValue: 1 },
        { date: "2024-06-30", plannedValue: 1 },
        { date: "2024-09-30", plannedValue: 1 },
        { date: "2024-12-31", plannedValue: 1 },
      ],
      currentDate: "2024-07-15",
      hasProgress: true,
    };

    it("returns ON_TRACK when ahead of schedule", () => {
      expect(
        stageGateStrategy.calculateHealth({
          ...baseParams,
          typeConfig: makeStages(["COMPLETED", "COMPLETED", "IN_PROGRESS", "NOT_STARTED"]),
        })
      ).toBe("ON_TRACK");
    });

    it("returns LATE when behind schedule", () => {
      // By July, 2 stages should be done (Q1 + Q2 passed)
      expect(
        stageGateStrategy.calculateHealth({
          ...baseParams,
          typeConfig: makeStages(["COMPLETED", "NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]),
        })
      ).toBe("LATE");
    });

    it("returns NOT_STARTED when no stages started", () => {
      expect(
        stageGateStrategy.calculateHealth({
          ...baseParams,
          hasProgress: false,
          typeConfig: makeStages(["NOT_STARTED", "NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]),
        })
      ).toBe("NOT_STARTED");
    });

    it("returns COMPLETED when all done", () => {
      expect(
        stageGateStrategy.calculateHealth({
          ...baseParams,
          typeConfig: makeStages(["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED"]),
        })
      ).toBe("COMPLETED");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid sequential stages", () => {
      expect(
        stageGateStrategy.validateConfig(
          makeStages(["COMPLETED", "IN_PROGRESS", "NOT_STARTED"])
        ).valid
      ).toBe(true);
    });

    it("rejects out-of-order stages", () => {
      const result = stageGateStrategy.validateConfig(
        makeStages(["NOT_STARTED", "COMPLETED", "NOT_STARTED"])
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("não pode avançar"))).toBe(true);
    });

    it("allows empty stages on creation", () => {
      expect(
        stageGateStrategy.validateConfig({ stages: [] }).valid
      ).toBe(true);
    });
  });

  it("has correct metadata", () => {
    expect(stageGateStrategy.supportsPhasing).toBe(true);
    expect(stageGateStrategy.supportsDirection).toBe(false);
    expect(stageGateStrategy.label).toBe("Milestones Sequenciais");
  });
});
