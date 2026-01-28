// @ts-nocheck
import { deriveLongTermStore } from "../../memory/long_term/derivedStore";

const NOW = 1_700_000_000_000;
const OLD = NOW - 1000 * 60 * 60 * 24 * 365;

test("stale memories are forgotten via demotion", () => {
  const events = [
    {
      id: "old_1",
      type: "learning",
      timestamp: OLD,
      payload: { label: "stale", confidence: { value: 0.3 } },
    },
    {
      id: "old_2",
      type: "learning",
      timestamp: OLD + 1,
      payload: { label: "stale", confidence: { value: 0.3 } },
    },
    {
      id: "old_3",
      type: "learning",
      timestamp: OLD + 2,
      payload: { label: "stale", confidence: { value: 0.3 } },
    },
  ];

  const store = deriveLongTermStore(events, NOW, {
    promotionWindowMs: 2 * 365 * 24 * 60 * 60 * 1000,
    demotionAgeMs: 24 * 60 * 60 * 1000,
    maxEntries: 10,
  });

  expect(store.entries.length).toBe(0);
});