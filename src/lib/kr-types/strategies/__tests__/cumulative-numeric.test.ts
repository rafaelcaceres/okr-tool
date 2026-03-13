import { describe, it, expect } from "vitest";
import { cumulativeNumericStrategy } from "../cumulative-numeric";

describe("cumulativeNumericStrategy", () => {
  describe("calculateProgress", () => {
    it("calculates increasing progress correctly", () => {
      expect(
        cumulativeNumericStrategy.calculateProgress({
          currentValue: 500,
          initialValue: 0,
          targetValue: 1000,
          typeConfig: { direction: "INCREASING", unit: "unidades" },
        })
      ).toBe(50);
    });

    it("calculates decreasing progress correctly", () => {
      expect(
        cumulativeNumericStrategy.calculateProgress({
          currentValue: 50,
          initialValue: 100,
          targetValue: 0,
          typeConfig: { direction: "DECREASING", unit: "bugs" },
        })
      ).toBe(50);
    });

    it("clamps progress at 0", () => {
      expect(
        cumulativeNumericStrategy.calculateProgress({
          currentValue: -10,
          initialValue: 0,
          targetValue: 100,
          typeConfig: { direction: "INCREASING", unit: "unidades" },
        })
      ).toBe(0);
    });

    it("clamps progress at 100", () => {
      expect(
        cumulativeNumericStrategy.calculateProgress({
          currentValue: 200,
          initialValue: 0,
          targetValue: 100,
          typeConfig: { direction: "INCREASING", unit: "unidades" },
        })
      ).toBe(100);
    });

    it("returns 0 when range is zero", () => {
      expect(
        cumulativeNumericStrategy.calculateProgress({
          currentValue: 50,
          initialValue: 50,
          targetValue: 50,
          typeConfig: { direction: "INCREASING", unit: "unidades" },
        })
      ).toBe(0);
    });
  });

  describe("calculateHealth", () => {
    const baseParams = {
      currentValue: 50,
      initialValue: 0,
      targetValue: 100,
      typeConfig: { direction: "INCREASING", unit: "unidades" },
      phasingEntries: [
        { date: "2024-03-31", plannedValue: 25 },
        { date: "2024-06-30", plannedValue: 25 },
        { date: "2024-09-30", plannedValue: 25 },
        { date: "2024-12-31", plannedValue: 25 },
      ],
      currentDate: "2024-07-15",
      hasProgress: true,
    };

    it("returns NOT_STARTED when no progress", () => {
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          hasProgress: false,
        })
      ).toBe("NOT_STARTED");
    });

    it("returns COMPLETED when progress >= 100", () => {
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          currentValue: 100,
        })
      ).toBe("COMPLETED");
    });

    it("returns ON_TRACK when actual >= planned", () => {
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          currentValue: 55,
        })
      ).toBe("ON_TRACK");
    });

    it("returns AT_RISK when actual is 85-99% of planned", () => {
      // Planned cumulative by July: 0 + 25 + 25 = 50
      // 85% of planned distance (50) = 42.5
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          currentValue: 44,
        })
      ).toBe("AT_RISK");
    });

    it("returns LATE when actual < 85% of planned", () => {
      // Planned cumulative by July: 50, 85% = 42.5
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          currentValue: 30,
        })
      ).toBe("LATE");
    });

    it("returns ON_TRACK when before first phasing date", () => {
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          currentDate: "2024-01-15",
          currentValue: 5,
        })
      ).toBe("ON_TRACK");
    });

    it("returns ON_TRACK when no phasing defined", () => {
      expect(
        cumulativeNumericStrategy.calculateHealth({
          ...baseParams,
          phasingEntries: [],
          currentValue: 10,
        })
      ).toBe("ON_TRACK");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid config", () => {
      const result = cumulativeNumericStrategy.validateConfig({
        direction: "INCREASING",
        unit: "unidades",
      });
      expect(result.valid).toBe(true);
    });

    it("accepts config with currency", () => {
      const result = cumulativeNumericStrategy.validateConfig({
        direction: "INCREASING",
        unit: "BRL",
        currency: "BRL",
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing direction", () => {
      const result = cumulativeNumericStrategy.validateConfig({
        unit: "unidades",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("rejects empty unit", () => {
      const result = cumulativeNumericStrategy.validateConfig({
        direction: "INCREASING",
        unit: "",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects null config", () => {
      const result = cumulativeNumericStrategy.validateConfig(null);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateProgressUpdate", () => {
    it("accepts valid number", () => {
      const result = cumulativeNumericStrategy.validateProgressUpdate({
        newValue: 42,
        currentValue: 30,
        initialValue: 0,
        targetValue: 100,
        typeConfig: { direction: "INCREASING", unit: "u" },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects NaN", () => {
      const result = cumulativeNumericStrategy.validateProgressUpdate({
        newValue: NaN,
        currentValue: 30,
        initialValue: 0,
        targetValue: 100,
        typeConfig: { direction: "INCREASING", unit: "u" },
      });
      expect(result.valid).toBe(false);
    });
  });

  it("has correct metadata", () => {
    expect(cumulativeNumericStrategy.supportsPhasing).toBe(true);
    expect(cumulativeNumericStrategy.supportsDirection).toBe(true);
    expect(cumulativeNumericStrategy.label).toBe("Numérico Cumulativo");
  });
});
