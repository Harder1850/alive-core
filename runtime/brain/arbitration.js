// runtime/brain/arbitration.js
// Phase 20 — Intent Arbitration (Lawful Elimination, No Execution)
//
// Deterministic only. No IO. No execution. No spine authority.

function isRecord(v) {
  return typeof v === "object" && v !== null;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}

/**
 * Phase 20 arbitration.
 *
 * Rules (applied in order):
 * R1 Structural validity: eliminate intents missing required fields.
 * R2 Explicit constraint violation: only if constraintsSnapshot explicitly rejects.
 * R3 Hard exclusivity: if two intents declare the same exclusiveKey, keep the first.
 *
 * No sorting/ranking/scoring. Preserves input order.
 */
export function arbitrateIntents({
  candidateIntents,
  workspaceSnapshot,
  constraintsSnapshot,
  capabilitiesSnapshot,
} = {}) {
  // Inputs are read-only; workspaceSnapshot/capabilitiesSnapshot are accepted but unused in Phase 20.
  void workspaceSnapshot;
  void capabilitiesSnapshot;

  const failures = [];
  const eliminated = [];

  const intents = Array.isArray(candidateIntents) ? candidateIntents : [];
  const survivingIntents = [];

  const seenExclusiveKeys = new Set();

  for (let i = 0; i < intents.length; i++) {
    const intent = intents[i];

    // R1 — Structural Validity
    const validShape =
      isRecord(intent)
      && isNonEmptyString(intent.id)
      && ("source" in intent)
      && typeof intent.priority === "number"
      && Number.isFinite(intent.priority)
      && isRecord(intent.payload);

    if (!validShape) {
      const intentId = isRecord(intent) && isNonEmptyString(intent.id) ? intent.id : "(unknown)";
      eliminated.push({ intentId, reason: "invalid_intent_shape" });
      continue;
    }

    // R2 — Explicit Constraint Violation
    // Only act on explicit flags; no inference.
    const explicitlyRejected = isRecord(constraintsSnapshot)
      && Array.isArray(constraintsSnapshot.rejectedIntentIds)
      && constraintsSnapshot.rejectedIntentIds.includes(intent.id);

    if (explicitlyRejected) {
      eliminated.push({ intentId: intent.id, reason: "constraint_violation" });
      continue;
    }

    // R3 — Hard Exclusivity
    const exclusiveKey = isNonEmptyString(intent.exclusiveKey) ? intent.exclusiveKey : null;
    if (exclusiveKey) {
      if (seenExclusiveKeys.has(exclusiveKey)) {
        eliminated.push({ intentId: intent.id, reason: "exclusive_key_conflict" });
        continue;
      }
      seenExclusiveKeys.add(exclusiveKey);
    }

    survivingIntents.push(intent);
  }

  return { survivingIntents, eliminated, failures, inputCount: intents.length };
}
