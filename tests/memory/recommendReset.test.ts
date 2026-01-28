// @ts-nocheck
import { recommendReset } from "../../memory/reset/recommendReset";

const NOW = 1_700_000_000_000; // fixed timestamp for determinism

function baseInput(overrides: Partial<any> = {}) {
  return {
    now: NOW,
    working: {
      contradictionCount: 0,
      contradictionRate: 0,
      assumptionCount: 0,
      assumptionTurnoverRate: 0,
      meanConfidence: { value: 0.9 },
    },
    stream: {
      eventRate: 0,
      lastChangeAt: NOW,
    },
    longTerm: {
      itemCount: 10,
      weakItemRatio: 0.1,
      conflictRatio: 0.05,
      meanConfidence: { value: 0.85 },
    },
    ...overrides,
  };
}

describe("recommendReset()", () => {
  test("returns none when system is coherent", () => {
    const result = recommendReset(baseInput());

    expect(result.level).toBe("none");
    expect(result.confidence).toBe(0);
    expect(result.reasons).toHaveLength(0);
    expect(result.evidence).toHaveLength(0);
  });

  test("recommends soft reset for persistent contradictions", () => {
    const result = recommendReset(
      baseInput({
        working: {
          contradictionCount: 4,
          contradictionRate: 0.1,
          assumptionCount: 3,
          assumptionTurnoverRate: 0.05,
          meanConfidence: { value: 0.6 },
        },
      })
    );

    expect(result.level).toBe("soft");
    expect(result.reasons).toContain("persistent_contradictions");
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  test("recommends soft reset for memory stagnation", () => {
    const result = recommendReset(
      baseInput({
        stream: {
          eventRate: 0.5,
          lastChangeAt: NOW - 10 * 60 * 1000,
        },
      })
    );

    expect(result.level).toBe("soft");
    expect(result.reasons).toContain("memory_stagnation");
  });

  test("recommends hard reset for confidence collapse", () => {
    const result = recommendReset(
      baseInput({
        working: {
          contradictionCount: 1,
          contradictionRate: 0.01,
          assumptionCount: 5,
          assumptionTurnoverRate: 0.05,
          meanConfidence: { value: 0.2 },
        },
      })
    );

    expect(result.level).toBe("hard");
    expect(result.reasons).toContain("confidence_collapse");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("recommends hard reset for long-term memory pollution", () => {
    const result = recommendReset(
      baseInput({
        longTerm: {
          itemCount: 50,
          weakItemRatio: 0.6,
          conflictRatio: 0.4,
          meanConfidence: { value: 0.3 },
        },
      })
    );

    expect(result.level).toBe("hard");
    expect(result.reasons).toContain("long_term_pollution");
  });

  test("is deterministic for identical inputs", () => {
    const input = baseInput({
      working: {
        contradictionCount: 3,
        contradictionRate: 0.08,
        assumptionCount: 4,
        assumptionTurnoverRate: 0.25,
        meanConfidence: { value: 0.4 },
      },
    });

    const r1 = recommendReset(input);
    const r2 = recommendReset(input);

    expect(r1).toEqual(r2);
  });

  test("does not trigger reset when only one weak signal exists", () => {
    const result = recommendReset(
      baseInput({
        working: {
          contradictionCount: 1,
          contradictionRate: 0.01,
          assumptionCount: 2,
          assumptionTurnoverRate: 0.05,
          meanConfidence: { value: 0.8 },
        },
      })
    );

    expect(result.level).toBe("none");
  });
});