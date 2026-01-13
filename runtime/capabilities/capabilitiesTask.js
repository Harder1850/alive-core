// runtime/capabilities/capabilitiesTask.js

import {
  listCapabilities
} from "../../capabilities/registry.js";

import {
  recordEvent
} from "../../experience/recorder.js";

export function runCapabilitiesTask({ output }) {
  // Step 1 — Query registry
  const all = listCapabilities() || [];

  // Step 2 — Group by type
  const grouped = groupByType(all);

  // Step 3 — Build report
  const report = {
    type: "capabilities_report",
    total: all.length,
    by_type: Object.keys(grouped),
    capabilities: grouped
  };

  // Step 4 — Emit output
  output.emit(formatCapabilitiesReport(report));

  // Step 5 — Record experience
  recordEvent({
    source: "system",
    type: "capabilities_report",
    payload: report
  });

  return report;
}

function groupByType(capabilities) {
  return capabilities.reduce((acc, cap) => {
    const type = cap.type || "unknown";
    acc[type] = acc[type] || [];
    acc[type].push(cap.id);
    return acc;
  }, {});
}

function formatCapabilitiesReport(report) {
  if (!report.total) {
    return "Right now, I don't have any available capabilities.";
  }

  let lines = ["Right now, I can do the following things:\n"]; 

  for (const type of Object.keys(report.capabilities)) {
    lines.push(`• ${type}:`);
    report.capabilities[type].forEach(id => {
      lines.push(`  - ${id}`);
    });
    lines.push("");
  }

  return lines.join("\n").trim();
}

