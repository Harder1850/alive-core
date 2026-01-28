// @ts-nocheck
import { rankRecall } from "../../memory/recall/rankRecall";

const NOW = 1_700_000_000_000;

test("recall always surfaces uncertainty", () => {
  const results = rankRecall(
    [
      {
        id: "x",
        content: "claim",
        confidence: { value: 0.8 },
        lastReinforcedAt: NOW,
        provenance: ["e1"],
      },
    ],
    { now: NOW }
  );

  expect(results[0]).toHaveProperty("uncertainty");
  expect(results[0].uncertainty).toBeCloseTo(0.2);
});