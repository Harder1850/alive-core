// @ts-nocheck
import { recommendReset } from "../../memory/reset/recommendReset";

const NOW = 1_700_000_000_000;

test("reset recommendation has no side effects", () => {
  const input = {
    now: NOW,
    working: {
      contradictionCount: 10,
      contradictionRate: 1,
      assumptionCount: 5,
      assumptionTurnoverRate: 1,
      meanConfidence: { value: 0.1 },
    },
    stream: {
      eventRate: 1,
      lastChangeAt: NOW - 10_000,
    },
    longTerm: {
      itemCount: 100,
      weakItemRatio: 0.9,
      conflictRatio: 0.9,
      meanConfidence: { value: 0.2 },
    },
  };

  const before = JSON.stringify(input);
  recommendReset(input);
  const after = JSON.stringify(input);

  expect(after).toEqual(before);
});