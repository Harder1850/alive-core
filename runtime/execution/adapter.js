// runtime/execution/adapter.js
//
// Phase 23: Execution Adapters (Zero Autonomy, Lawful Plumbing Only)
//
// This module is an inert sink for AUTHORIZED intents.
// It MUST NOT execute, invoke procedures, call capabilities, schedule work,
// perform IO, or mutate inputs.

/**
 * @typedef {Object} ReceiveAuthorizedIntentsParams
 * @property {any} intents
 * @property {any} tickId
 * @property {any} timestamp
 */

/**
 * @typedef {Object} RejectedIntent
 * @property {string} intentId
 * @property {string} reason
 */

/**
 * Adapter interface (exact):
 *
 * export function receiveAuthorizedIntents({ intents, tickId, timestamp }) {
 *   return {
 *     acceptedCount: number,
 *     rejected: { intentId, reason }[],
 *     note: "Execution adapters are inert in Phase 23"
 *   }
 * }
 */
export function receiveAuthorizedIntents({ intents, tickId, timestamp } = {}) {
  // Never throw.
  try {
    const NOTE = "Execution adapters are inert in Phase 23";

    // Deterministic validation: do not inspect external state.
    // tickId/timestamp are accepted but unused in Phase 23.
    void tickId;
    void timestamp;

    if (!Array.isArray(intents)) {
      return {
        acceptedCount: 0,
        rejected: [
          {
            intentId: "(unknown)",
            reason: "invalid_intents_array",
          },
        ],
        note: NOTE,
      };
    }

    /** @type {RejectedIntent[]} */
    const rejected = [];
    let acceptedCount = 0;

    // Preserve input order. Do not mutate items.
    for (let i = 0; i < intents.length; i++) {
      const intent = intents[i];

      // Minimal deterministic shape checks.
      if (!intent || typeof intent !== "object") {
        rejected.push({ intentId: "(unknown)", reason: "invalid_intent_object" });
        continue;
      }

      const intentId = typeof intent.intentId === "string" ? intent.intentId : "(unknown)";
      if (intentId === "(unknown)") {
        rejected.push({ intentId, reason: "missing_intent_id" });
        continue;
      }

      // Authorization output should only include AUTHORIZED intents.
      // We still validate deterministically.
      if ("status" in intent && intent.status !== "AUTHORIZED") {
        rejected.push({ intentId, reason: "not_authorized" });
        continue;
      }

      // Phase 23 is inert: accept means "received" only.
      acceptedCount += 1;
    }

    return {
      acceptedCount,
      rejected,
      note: NOTE,
    };
  } catch {
    // Absolute safety: swallow all unexpected errors.
    return {
      acceptedCount: 0,
      rejected: [{ intentId: "(unknown)", reason: "adapter_internal_error" }],
      note: "Execution adapters are inert in Phase 23",
    };
  }
}

