// runtime/wake/wakeTask.js

import {
  getRecentSegments
} from "../../experience/stream.js";

import {
  buildBriefSummary
} from "../../experience/narrative.js";

import {
  listAvailable
} from "../../capabilities/registry.js";

import {
  recordEvent
} from "../../experience/recorder.js";

export function runWakeTask({ output }) {
  // Step 1 — Load recent experience
  const recent = getRecentSegments() || [];

  // Step 2 — Build narrative
  const narrative = buildBriefSummary(recent);

  // Step 3 — List capabilities
  const capabilities = listAvailable().map(c => c.id);

  // Step 4 — Build report
  const report = {
    type: "wake_report",
    narrative,
    capabilities,
    open_threads: [],
    needs: []
  };

  // Step 5 — Emit output (console or voice)
  output.emit(formatWakeReport(report));

  // Step 6 — Record experience (append-only)
  recordEvent({
    source: "system",
    type: "wake_report",
    payload: report
  });

  return report;
}

function formatWakeReport(report) {
  return `
I'm awake.

Here's what I remember:
${report.narrative || "Nothing significant yet."}

Right now, I can do:
${report.capabilities.length
  ? report.capabilities.join(", ")
  : "No capabilities available."
}
`.trim();
}

