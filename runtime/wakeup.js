/**
 * runtime/wakeup.js
 *
 * Handles system wake-up behavior.
 * Builds a brief narrative from recent experience.
 *
 * NOTE:
 * - No imports from /spine
 * - Purely observational
 */

import {
  isInitialized,
  getRecentSegments,
  buildBriefSummary,
} from "../experience/index.js";

export function wakeUp() {
  // If experience system isn’t initialized yet, nothing to recall
  if (!isInitialized()) {
    console.log("I'm awake for the first time.");
    return;
  }

  // Load recent experience segments
  const segments = getRecentSegments({
    windowMs: 60_000,
    count: 3,
  });

  if (!segments || segments.length === 0) {
    console.log("I'm back, but I don't have any prior experiences yet.");
    return;
  }

  // Build a short narrative summary
  const summary = buildBriefSummary(segments);

  console.log("I'm back.");
  console.log("Here's what I remember:");
  console.log(summary);
}

