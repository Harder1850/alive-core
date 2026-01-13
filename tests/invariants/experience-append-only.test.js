import fs from "fs";
import assert from "assert";

import { initializeRecorder, recordEvent, getEventsFilePath } from "../../experience/recorder.js";

// Use a test-specific data dir to avoid polluting local state
initializeRecorder({ dataDir: ".alive-data-test", filename: "events.jsonl" });

const eventsFile = getEventsFilePath();

function readLines() {
  const txt = fs.readFileSync(eventsFile, "utf8");
  return txt.split("\n").filter(Boolean);
}

const beforeLines = readLines();
const beforeCount = beforeLines.length;
const beforeFirstLine = beforeLines[0] || null;

await recordEvent({ source: "test", type: "state", payload: { n: 1 }, importance: 0.1 });
await recordEvent({ source: "test", type: "state", payload: { n: 2 }, importance: 0.1 });
await recordEvent({ source: "test", type: "state", payload: { n: 3 }, importance: 0.1 });

const afterLines = readLines();
const afterCount = afterLines.length;

assert.strictEqual(
  afterCount,
  beforeCount + 3,
  `Invariant violation: expected line count +3 (before=${beforeCount}, after=${afterCount})`
);

if (beforeFirstLine !== null) {
  assert.strictEqual(
    afterLines[0],
    beforeFirstLine,
    "Invariant violation: first line changed (append-only violated)"
  );
}

// ensure ordering by timestamp is non-decreasing
const events = afterLines.map(l => JSON.parse(l));
for (let i = 1; i < events.length; i++) {
  assert(
    events[i].timestamp >= events[i - 1].timestamp,
    "Invariant violation: event timestamps decreased (ordering violated)"
  );
}

console.log("✔ experience-append-only invariant holds");
