// runtime/brain/intentGenerator.js
// Phase 19 — Goal → Intent Translation (Non-Executing)
//
// Deterministic only. No IO. No execution. No ranking. No inference.

function isRecord(v) {
  return typeof v === "object" && v !== null;
}

function toFiniteNumber(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/**
 * Phase 19 B3 — deterministic goal→intent translation.
 *
 * Translation Rule (fixed):
 * - for each goal where goal.status === "active": generate exactly one intent candidate
 * - preserve input order exactly
 * - never throw; failures are explicit artifacts returned upward
 */
export function generateFromGoals(goals) {
  // Phase 19 contract:
  // - return IntentCandidate[]
  // - if goals is empty => []
  // - if a goal is malformed => [] (and emit failure artifact, non-throwing)

  if (!Array.isArray(goals) || goals.length === 0) {
    const empty = [];
    Object.defineProperty(empty, "failures", { value: [], enumerable: false });
    return empty;
  }

  // Failures are stored on the returned array itself as a non-enumerated property.
  // This preserves the required return type (IntentCandidate[]), while still returning
  // an explicit artifact upward.
  const failures = [];
  const candidates = [];

  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];

    // Malformed goal semantics: return [] (no partial output), with explicit failure.
    if (!isRecord(goal) || typeof goal.id !== "string" || goal.id.length === 0) {
      failures.push({
        subsystem: "B3:IntentGeneration",
        code: "malformed_goal",
        message: "Goal set contained a malformed goal; produced no candidates",
        details: { index: i },
        recoverable: true,
      });

      Object.defineProperty(candidates, "failures", {
        value: failures,
        enumerable: false,
      });
      return candidates;
    }

    if (goal.status !== "active") continue;

    const strengthCurrent = isRecord(goal.strength) ? toFiniteNumber(goal.strength.current, 0) : 0;

    candidates.push({
      id: `intent:${goal.id}`,
      source: "goal-driven",
      confidence: strengthCurrent,
      priority: Math.floor(strengthCurrent * 100),
      payload: { kind: "pursue_goal", goalId: goal.id },
      rationale: "Mechanical translation: active goal -> pursue_goal intent",
    });
  }

  Object.defineProperty(candidates, "failures", {
    value: failures,
    enumerable: false,
  });
  return candidates;
}
