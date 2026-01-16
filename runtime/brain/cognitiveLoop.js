// runtime/brain/cognitiveLoop.js
// Phase 19 — B1 Cognitive Loop (proposal-only)
//
// Deterministic only. No IO. No execution. No spine routing.

import { generateFromGoals } from "./intentGenerator.js";
import { loadGoals } from "../../goals/store.js";
import { arbitrateIntents } from "./arbitration.js";

/**
 * Minimal B1 wiring for Phase 19.
 *
 * - Reads goals from the caller (B4 view)
 * - Calls B3 generator
 * - Returns proposal surface only
 */
export function brainTick({ goals }) {
  // Phase 19: read current goals from Phase 18 store.
  const currentGoals = Array.isArray(goals) ? goals : loadGoals();
  const candidateIntents = generateFromGoals(currentGoals);
  const failures = Array.isArray(candidateIntents) && Array.isArray(candidateIntents.failures)
    ? candidateIntents.failures
    : [];

  // Phase 20: lawful elimination only (no execution, no ranking).
  const arbitration = arbitrateIntents({
    candidateIntents,
    workspaceSnapshot: null,
    constraintsSnapshot: null,
    capabilitiesSnapshot: null,
  });

  return {
    reflections: [],
    candidateIntents: arbitration.survivingIntents,
    failures: [...failures, ...(arbitration.failures || [])],
    arbitration,
  };
}
