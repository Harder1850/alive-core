// procedures/store.js
//
// Minimal procedure store.
// - Loads known procedures.
// - Returns by intent.
// - Tracks executions + last_used (in-memory only).
//
// No learning. No background work. No auto-selection.

import { organizeDownloadsProcedure } from "./organizeDownloads.js";
import { generateDemoSiteProcedure } from "./generateDemoSite.js";

/** @type {Array<any>} */
const procedures = [organizeDownloadsProcedure, generateDemoSiteProcedure];

/** @type {Map<string, { executions: number, last_used: number | null }>} */
const stats = new Map();

export function listProcedures() {
  return procedures.slice();
}

export function getProcedureByIntent(intent) {
  if (!intent) return null;
  return procedures.find(p => p.intent === intent) || null;
}

export function recordProcedureExecution(procedureId) {
  if (!procedureId) return;
  const prev = stats.get(procedureId) || { executions: 0, last_used: null };
  stats.set(procedureId, {
    executions: prev.executions + 1,
    last_used: Date.now(),
  });
}

export function getProcedureStats(procedureId) {
  return stats.get(procedureId) || { executions: 0, last_used: null };
}
