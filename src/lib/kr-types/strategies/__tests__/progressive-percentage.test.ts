import { describe, it, expect } from "vitest";
import { progressivePercentageStrategy } from "../progressive-percentage";

describe("progressivePercentageStrategy", () => {
  describe("calculateProgress", () => {
    it("calculates progress from 18% to 72%", () => {
      // Model B example: adoption 18% → 72%, currently at 37%
      const progress = progressivePercentageStrategy.calculateProgress({
        currentValue: 37,
        initialValue: 18,
        targetValue: 72,
        typeConfig: { direction: "INCREASING" },
      });
      // (37-18)/(72-18)*100 = 19/54*100 ≈ 35.19
      expect(progress).toBeCloseTo(35.19, 1);
    });

    it("calculates 100% when target reached", () => {
      expect(
        progressivePercentageStrategy.calculateProgress({
          currentValue: 72,
          initialValue: 18,
          targetValue: 72,
          typeConfig: { direction: "INCREASING" },
        })
      ).toBe(100);
    });
  });

  describe("calculateHealth", () => {
    it("compares against cumulative phasing", () => {
      const result = progressivePercentageStrategy.calculateHealth({
        currentValue: 37,
        initialValue: 18,
        targetValue: 72,
        typeConfig: { direction: "INCREASING" },
        phasingEntries: [
          { date: "2024-03-31", plannedValue: 19 }, // cumulative: 37
          { date: "2024-06-30", plannedValue: 19 }, // cumulative: 56
          { date: "2024-09-30", plannedValue: 16 }, // cumulative: 72
        ],
        currentDate: "2024-04-15",
        hasProgress: true,
      });
      // By April: cumulative planned = 18 + 19 = 37, actual = 37 → ON_TRACK
      expect(result).toBe("ON_TRACK");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid config", () => {
      expect(
        progressivePercentageStrategy.validateConfig({
          direction: "INCREASING",
        }).valid
      ).toBe(true);
    });

    it("rejects invalid direction", () => {
      expect(
        progressivePercentageStrategy.validateConfig({
          direction: "SIDEWAYS",
        }).valid
      ).toBe(false);
    });
  });

  it("has correct metadata", () => {
    expect(progressivePercentageStrategy.supportsPhasing).toBe(true);
    expect(progressivePercentageStrategy.supportsDirection).toBe(true);
    expect(progressivePercentageStrategy.label).toBe("Percentual Progressivo");
  });
});
