import { describe, it, expect } from "vitest";
import {
  multiPhaseWithRiskStrategy,
  calculatePhaseCompletion,
  calculateRiskCompliance,
} from "../multi-phase-with-risk";
import type { MultiPhaseWithRiskConfig } from "../../types";

function makeConfig(overrides?: Partial<MultiPhaseWithRiskConfig>): MultiPhaseWithRiskConfig {
  return {
    workstreams: [
      {
        id: "ws-1",
        name: "Workstream 1",
        weight: 60,
        phases: [
          { id: "p1", name: "Impact Mapping", status: "COMPLETED", completedAt: 1000 },
          { id: "p2", name: "Policy Adjustment", status: "IN_PROGRESS" },
          { id: "p3", name: "Systems Integration", status: "NOT_STARTED" },
          { id: "p4", name: "Full Certification", status: "NOT_STARTED" },
        ],
      },
      {
        id: "ws-2",
        name: "Workstream 2",
        weight: 40,
        phases: [
          { id: "p5", name: "Phase A", status: "COMPLETED", completedAt: 1000 },
          { id: "p6", name: "Phase B", status: "COMPLETED", completedAt: 2000 },
        ],
      },
    ],
    phaseWeight: 0.7,
    riskWeight: 0.3,
    criticalIncidents: [],
    maxTolerableIncidents: 0,
    ...overrides,
  };
}

describe("multiPhaseWithRiskStrategy", () => {
  describe("calculatePhaseCompletion", () => {
    it("calculates weighted phase completion", () => {
      const config = makeConfig();
      const completion = calculatePhaseCompletion(config.workstreams);
      // WS1: 1/4 * 60 = 15, WS2: 2/2 * 40 = 40
      // Total weight: 100, weighted: (15 + 40) / 100 = 0.55
      expect(completion).toBeCloseTo(0.55, 2);
    });

    it("returns 0 for empty workstreams", () => {
      expect(calculatePhaseCompletion([])).toBe(0);
    });
  });

  describe("calculateRiskCompliance", () => {
    it("returns 1 when no incidents", () => {
      expect(calculateRiskCompliance([], 0)).toBe(1);
    });

    it("returns 1 when incidents within tolerance", () => {
      expect(
        calculateRiskCompliance(
          [{ id: "i1", description: "Test", occurredAt: 1000, severity: "CRITICAL", resolved: false }],
          1
        )
      ).toBe(1);
    });

    it("reduces compliance for excess critical incidents", () => {
      expect(
        calculateRiskCompliance(
          [
            { id: "i1", description: "A", occurredAt: 1000, severity: "CRITICAL", resolved: false },
            { id: "i2", description: "B", occurredAt: 2000, severity: "CRITICAL", resolved: false },
          ],
          0
        )
      ).toBe(0.5); // 1 - 2*0.25
    });

    it("ignores resolved incidents", () => {
      expect(
        calculateRiskCompliance(
          [{ id: "i1", description: "A", occurredAt: 1000, severity: "CRITICAL", resolved: true }],
          0
        )
      ).toBe(1);
    });

    it("ignores non-critical incidents", () => {
      expect(
        calculateRiskCompliance(
          [{ id: "i1", description: "A", occurredAt: 1000, severity: "HIGH", resolved: false }],
          0
        )
      ).toBe(1);
    });
  });

  describe("calculateProgress", () => {
    it("calculates weighted combination of phase and risk", () => {
      const config = makeConfig();
      const progress = multiPhaseWithRiskStrategy.calculateProgress({
        currentValue: 0,
        initialValue: 0,
        targetValue: 100,
        typeConfig: config,
      });
      // Phase: 0.55, Risk: 1.0
      // (0.55 * 0.7 + 1.0 * 0.3) * 100 = (0.385 + 0.3) * 100 = 68.5 → 69
      expect(progress).toBe(69);
    });

    it("reduces progress when critical incidents exist", () => {
      const config = makeConfig({
        criticalIncidents: [
          { id: "i1", description: "Breach", occurredAt: 1000, severity: "CRITICAL", resolved: false },
          { id: "i2", description: "Breach 2", occurredAt: 2000, severity: "CRITICAL", resolved: false },
        ],
      });
      const progress = multiPhaseWithRiskStrategy.calculateProgress({
        currentValue: 0,
        initialValue: 0,
        targetValue: 100,
        typeConfig: config,
      });
      // Phase: 0.55, Risk: 0.5 (2 unresolved, max 0)
      // (0.55 * 0.7 + 0.5 * 0.3) * 100 = (0.385 + 0.15) * 100 = 53.5 → 54
      expect(progress).toBe(54);
    });
  });

  describe("calculateHealth", () => {
    const baseParams = {
      currentValue: 0,
      initialValue: 0,
      targetValue: 100,
      typeConfig: makeConfig(),
      phasingEntries: [
        { date: "2024-03-31", plannedValue: 1 },
        { date: "2024-06-30", plannedValue: 1 },
        { date: "2024-09-30", plannedValue: 1 },
        { date: "2024-12-31", plannedValue: 1 },
      ],
      currentDate: "2024-07-15",
      hasProgress: true,
    };

    it("returns LATE when critical incidents exceed tolerance", () => {
      const configWithIncidents = makeConfig({
        criticalIncidents: [
          { id: "i1", description: "A", occurredAt: 1000, severity: "CRITICAL", resolved: false },
        ],
      });
      expect(
        multiPhaseWithRiskStrategy.calculateHealth({
          ...baseParams,
          typeConfig: configWithIncidents,
        })
      ).toBe("LATE");
    });

    it("returns NOT_STARTED when no work begun", () => {
      const emptyConfig = makeConfig({
        workstreams: [
          {
            id: "ws-1",
            name: "WS1",
            weight: 100,
            phases: [
              { id: "p1", name: "P1", status: "NOT_STARTED" },
              { id: "p2", name: "P2", status: "NOT_STARTED" },
            ],
          },
        ],
      });
      expect(
        multiPhaseWithRiskStrategy.calculateHealth({
          ...baseParams,
          hasProgress: false,
          typeConfig: emptyConfig,
        })
      ).toBe("NOT_STARTED");
    });
  });

  describe("validateConfig", () => {
    it("accepts valid config", () => {
      expect(
        multiPhaseWithRiskStrategy.validateConfig(makeConfig()).valid
      ).toBe(true);
    });

    it("rejects when phaseWeight + riskWeight don't sum to 1", () => {
      expect(
        multiPhaseWithRiskStrategy.validateConfig(
          makeConfig({ phaseWeight: 0.5, riskWeight: 0.3 })
        ).valid
      ).toBe(false);
    });

    it("allows empty workstreams on creation", () => {
      expect(
        multiPhaseWithRiskStrategy.validateConfig(
          makeConfig({ workstreams: [] })
        ).valid
      ).toBe(true);
    });

    it("rejects negative maxTolerableIncidents", () => {
      expect(
        multiPhaseWithRiskStrategy.validateConfig(
          makeConfig({ maxTolerableIncidents: -1 })
        ).valid
      ).toBe(false);
    });
  });

  it("has correct metadata", () => {
    expect(multiPhaseWithRiskStrategy.supportsPhasing).toBe(true);
    expect(multiPhaseWithRiskStrategy.supportsDirection).toBe(false);
    expect(multiPhaseWithRiskStrategy.label).toBe("Roadmap Multifase");
  });
});
