// @ts-nocheck
import { deriveWorkingMemory } from "../../memory/working/workingMemory";

const NOW = 1_700_000_000_000;

test("confidence does not increase without reinforcement", () => {
  const events = [
    {
      id: "a",
      type: "assumption",
      timestamp: NOW - 1000,
      payload: { text: "X", confidence: { value: 0.7 } },
    },
  ];

  const wm1 = deriveWorkingMemory(events, null, NOW);
  const wm2 = deriveWorkingMemory(events, null, NOW + 10_000);

  const c1 = wm1.summary.assumptions[0]?.confidence?.value ?? 0;
  const c2 = wm2.summary.assumptions[0]?.confidence?.value ?? 0;

  expect(c2).toBeLessThanOrEqual(c1);
});