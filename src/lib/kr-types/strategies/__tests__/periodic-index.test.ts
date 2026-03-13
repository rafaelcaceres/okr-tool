import { describe, it, expect } from "vitest";
import { periodicIndexStrategy } from "../periodic-index";

describe("periodicIndexStrategy", () => {
  describe("calculateProgress", () => {
    it("calculates engagement index progress (7.1 → 7.9)", () => {
      // Model D: 7.1 → 7.3 → 7.6 → 7.9, current = 7.3
      const progress = periodicIndexStrategy.calculateProgress({
        currentValue: 7.3,
        initialValue: 7.1,
        targetValue: 7.9,
        typeConfig: { direction: "INCREASING", unit: "pontos" },
      });
      // (7.3-7.1)/(7.9-7.1)*100 = 0.2/0.8*100 = 25
      expect(progress).toBe(25);
    });

    it("handles oscillation (value drops below initial)", () => {
      const progress = periodicIndexStrategy.calculateProgress({
        currentValue: 6.9,
        initialValue: 7.1,
        targetValue: 7.9,
        typeConfig: { direction: "INCREASING", unit: "pontos" },
      });
      // Negative, clamped to 0
      expect(progress).toBe(0);
    });
  });

  describe("calculateHealth", () => {
    const baseParams = {
      currentValue: 7.3,
      initialValue: 7.1,
      targetValue: 7.9,
      typeConfig: { direction: "INCREASING", unit: "pontos" },
      phasingEntries: [
        { date: "2024-03-31", plannedValue: 7.1 },
        { date: "2024-06-30", plannedValue: 7.3 },
        { date: "2024-09-30", plannedValue: 7.6 },
        { date: "2024-12-31", plannedValue: 7.9 },
      ],
      currentDate: "2024-07-15",
      hasProgress: true,
    };

    it("returns ON_TRACK when current >= planned for period", () => {
      expect(
        periodicIndexStrategy.calculateHealth({
          ...baseParams,
          currentValue: 7.3,
        })
      ).toBe("ON_TRACK");
    });

    it("returns AT_RISK when slightly below planned", () => {
      // Planned for current period: 7.3
      // Planned delta from initial: 7.3 - 7.1 = 0.2
      // 85% of 0.2 = 0.17, so threshold = 7.1 + 0.17 = 7.27
      expect(
        periodicIndexStrategy.calculateHealth({
          ...baseParams,
          currentValue: 7.28,
        })
      ).toBe("AT_RISK");
    });

    it("returns LATE when far below planned", () => {
      expect(
        periodicIndexStrategy.calculateHealth({
          ...baseParams,
          currentValue: 7.1,
        })
      ).toBe("LATE");
    });

    it("returns NOT_STARTED when no progress", () => {
      expect(
        periodicIndexStrategy.calculateHealth({
          ...baseParams,
          hasProgress: false,
        })
      ).toBe("NOT_STARTED");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid config", () => {
      expect(
        periodicIndexStrategy.validateConfig({
          direction: "INCREASING",
          unit: "pontos",
        }).valid
      ).toBe(true);
    });

    it("rejects missing unit", () => {
      expect(
        periodicIndexStrategy.validateConfig({
          direction: "INCREASING",
        }).valid
      ).toBe(false);
    });
  });

  it("has correct metadata", () => {
    expect(periodicIndexStrategy.supportsPhasing).toBe(true);
    expect(periodicIndexStrategy.supportsDirection).toBe(true);
    expect(periodicIndexStrategy.label).toBe("Índice Periódico");
  });
});
