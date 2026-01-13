// runtime/summarizer.js
// Meaning compression (no ML): last N events -> 1–3 sentence narrative summary.

import fs from "fs";

function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function normalizeText(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ");
}

function compressToSentences({ nameSet, openedApps, commandsRun }) {
  const sentences = [];

  if (nameSet) {
    sentences.push(`You set your name to ${nameSet}.`);
  }

  if (openedApps.length > 0) {
    const unique = Array.from(new Set(openedApps));
    const pretty = unique.join(", ");
    sentences.push(`You opened ${pretty}.`);
  }

  if (commandsRun.length > 0) {
    const unique = Array.from(new Set(commandsRun));
    // Keep this short; just note that commands were run.
    const head = unique.slice(0, 2).join("; ");
    sentences.push(`You ran commands (${head}${unique.length > 2 ? "; …" : ""}).`);
  }

  // If nothing happened, keep summary empty (don’t manufacture meaning).
  return sentences.slice(0, 3).join(" ");
}

/**
 * summarizeRecentEvents
 *
 * Reads last N events from the log and overwrites memory summary.
 *
 * @param {import("../memory/PersistentMemory.js").PersistentMemory} memory
 * @param {{ tail?: number }} opts
 */
export function summarizeRecentEvents(memory, opts = {}) {
  const tail = opts.tail ?? 10;

  const eventsFile = memory.eventsFile; // intentional: v0.1, no abstraction
  if (!eventsFile || !fs.existsSync(eventsFile)) return;

  const raw = fs.readFileSync(eventsFile, "utf-8");
  const lines = raw.split("\n").filter(Boolean);
  const last = lines.slice(-tail).map(safeJsonParse).filter(Boolean);

  let nameSet = null;
  const openedApps = [];
  const commandsRun = [];

  for (const e of last) {
    const type = normalizeText(e.type);
    const content = normalizeText(e.content);

    // Identity
    if (type === "output") {
      const m = content.match(/Your name is\s+(.+)\.$/i);
      if (m && m[1]) nameSet = normalizeText(m[1]);
    }

    // Actions (boring string heuristics)
    if (type === "action") {
      const m = content.match(/^openApp:(.+)$/i);
      if (m && m[1]) openedApps.push(normalizeText(m[1]));
    }

    if (type === "command") {
      commandsRun.push(content);
    }
  }

  const summary = compressToSentences({ nameSet, openedApps, commandsRun });
  if (summary) memory.updateSummary(summary);
}
