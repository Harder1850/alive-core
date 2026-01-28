// @ts-nocheck
import { deriveLongTermStore } from "../../memory/long_term/derivedStore";

const NOW = 1_700_000_000_000;

function makeEvents(labels: number, repeats = 3) {
  const events = [];
  for (let i = 0; i < labels; i += 1) {
    for (let r = 0; r < repeats; r += 1) {
      events.push({
        id: `e${i}_${r}`,
        type: "learning",
        timestamp: NOW - r,
        payload: { label: `item_${i}`, confidence: { value: 0.8 } },
      });
    }
  }
  return events;
}

test("long-term memory never exceeds configured maxEntries", () => {
  const events = makeEvents(200);

  const store = deriveLongTermStore(events, NOW, {
    maxEntries: 50,
    promotionWindowMs: 365 * 24 * 60 * 60 * 1000,
  });

  expect(store.entries.length).toBeLessThanOrEqual(50);
});