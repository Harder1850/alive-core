// runtime/recall/recallTask.js

import {
  listMemory
} from "../../memory/store/memoryStore.js";

import {
  recordEvent
} from "../../experience/recorder.js";

export function runRecallTask({
  category = "any",
  query,
  limit = 5,
  output
}) {
  // Step 1 — Load all intentional memory
  const all = listMemory({ type: "intentional_memory" }) || [];

  // Step 2 — Apply filters
  let results = all;

  if (category !== "any") {
    results = results.filter(m => m.category === category);
  }

  if (query && typeof query === "string") {
    const q = query.toLowerCase();
    results = results.filter(m =>
      JSON.stringify(m.content).toLowerCase().includes(q)
    );
  }

  // Step 3 — Limit results
  results = results.slice(0, limit);

  // Step 4 — Build report
  const report = {
    type: "recall_report",
    count: results.length,
    results
  };

  // Step 5 — Emit output
  output.emit(formatRecallReport(report));

  // Step 6 — Record experience
  recordEvent({
    source: "user",
    type: "recall",
    payload: {
      category,
      query,
      count: results.length
    }
  });

  return report;
}

function formatRecallReport(report) {
  if (!report.count) {
    return "I don’t have anything remembered that matches that.";
  }

  let lines = ["Here’s what I remember:\n"]; 

  report.results.forEach((entry, i) => {
    lines.push(
      `${i + 1}. [${entry.category}] (${entry.importance}) — ${entry.content}`
    );
  });

  return lines.join("\n").trim();
}

