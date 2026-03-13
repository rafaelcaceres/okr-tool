import { describe, it, expect } from "vitest";
import {
  checklistComplianceStrategy,
  calculateComplianceRate,
} from "../checklist-compliance";
import type { ChecklistComplianceConfig } from "../../types";

function makeConfig(
  compliantCounts: number[],
  totalPerCategory: number = 5
): ChecklistComplianceConfig {
  return {
    categories: compliantCounts.map((compliant, i) => ({
      id: `cat-${i}`,
      name: `Category ${i + 1}`,
      items: Array.from({ length: totalPerCategory }, (_, j) => ({
        id: `item-${i}-${j}`,
        description: `Item ${j + 1}`,
        compliant: j < compliant,
      })),
    })),
    evaluationFrequency: "QUARTERLY",
  };
}

describe("checklistComplianceStrategy", () => {
  describe("calculateComplianceRate", () => {
    it("calculates 100% when all compliant", () => {
      const config = makeConfig([5, 5]);
      expect(calculateComplianceRate(config.categories)).toBe(100);
    });

    it("calculates 50% when half compliant", () => {
      const config = makeConfig([5, 0], 5);
      expect(calculateComplianceRate(config.categories)).toBe(50);
    });

    it("returns 0 for empty categories", () => {
      expect(calculateComplianceRate([])).toBe(0);
    });
  });

  describe("calculateProgress", () => {
    it("calculates progress toward compliance target", () => {
      // Start at 88%, target 96%, currently at 94%
      const progress = checklistComplianceStrategy.calculateProgress({
        currentValue: 94,
        initialValue: 88,
        targetValue: 96,
        typeConfig: makeConfig([4, 5], 5),
      });
      // (94-88)/(96-88)*100 = 6/8*100 = 75
      expect(progress).toBe(75);
    });
  });

  describe("calculateHealth", () => {
    const baseParams = {
      currentValue: 94,
      initialValue: 88,
      targetValue: 96,
      typeConfig: makeConfig([4, 5], 5),
      phasingEntries: [
        { date: "2024-03-31", plannedValue: 88 },
        { date: "2024-06-30", plannedValue: 94 },
        { date: "2024-09-30", plannedValue: 96 },
        { date: "2024-12-31", plannedValue: 95 },
      ],
      currentDate: "2024-07-15",
      hasProgress: true,
    };

    it("returns ON_TRACK when compliance meets planned", () => {
      expect(
        checklistComplianceStrategy.calculateHealth({
          ...baseParams,
          currentValue: 94,
        })
      ).toBe("ON_TRACK");
    });

    it("returns AT_RISK when slightly below", () => {
      // Planned: 94, delta from initial: 94-88 = 6
      // 85% of 6 = 5.1 → threshold = 88 + 5.1 = 93.1
      expect(
        checklistComplianceStrategy.calculateHealth({
          ...baseParams,
          currentValue: 93.5,
        })
      ).toBe("AT_RISK");
    });

    it("returns LATE when far below", () => {
      expect(
        checklistComplianceStrategy.calculateHealth({
          ...baseParams,
          currentValue: 89,
        })
      ).toBe("LATE");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid config", () => {
      expect(
        checklistComplianceStrategy.validateConfig(makeConfig([3, 4])).valid
      ).toBe(true);
    });

    it("allows empty categories on creation", () => {
      expect(
        checklistComplianceStrategy.validateConfig({
          categories: [],
          evaluationFrequency: "QUARTERLY",
        }).valid
      ).toBe(true);
    });

    it("rejects invalid frequency", () => {
      const config = makeConfig([3]);
      expect(
        checklistComplianceStrategy.validateConfig({
          ...config,
          evaluationFrequency: "YEARLY",
        }).valid
      ).toBe(false);
    });
  });

  it("has correct metadata", () => {
    expect(checklistComplianceStrategy.supportsPhasing).toBe(true);
    expect(checklistComplianceStrategy.supportsDirection).toBe(false);
    expect(checklistComplianceStrategy.label).toBe("Checklist de Compliance");
  });
});
