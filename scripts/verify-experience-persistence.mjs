// scripts/verify-experience-persistence.mjs
//
// Purpose:
// Verify that the experience stream is persisted to disk and remains append-only
// across multiple process runs.
//
// This is NOT learning. This is NOT consolidation.
// It is a deterministic audit of persistence behavior.

import fs from "node:fs";
import { initializeRecorder, recordEvent, getEventsFilePath } from "../experience/recorder.js";

initializeRecorder({ dataDir: process.env.ALIVE_DATA_DIR || ".alive-data" });

const eventsFile = getEventsFilePath();
const before = fs.existsSync(eventsFile)
  ? fs.readFileSync(eventsFile, "utf8").split("\n").filter(Boolean).length
  : 0;

await recordEvent({
  source: "verify",
  type: "persistence_check",
  payload: {
    cwd: process.cwd(),
    note: "Run this script twice; line count must increase by 1 each run.",
  },
  importance: 0.0,
});

const after = fs.readFileSync(eventsFile, "utf8").split("\n").filter(Boolean).length;

console.log("eventsFile:", eventsFile);
console.log("before:", before);
console.log("after:", after);
console.log("delta:", after - before);

if (after !== before + 1) {
  console.error("FAIL: expected append-only +1 line");
  process.exitCode = 1;
} else {
  console.log("OK: append-only persistence verified for this run");
}

