// experience/query.js
//
// Phase 26 — Intent → Adapter Eligibility Resolution
//
// Pure, read-only analysis over an in-memory experience event list.
// No IO. No runtime wiring. No execution.

import { selectAdapterIdLexicographicFirst } from "./policy.js";

/**
 * Resolve which registered execution adapters declare support for a given intent type.
 *
 * @param {string} intentType
 * @param {any[]} events
 * @returns {{ eligibleAdapterIds: string[], reason: "declared-compatibility" }}
 */
export function resolveEligibleExecutionAdapters(intentType, events) {
  try {
    if (typeof intentType !== "string" || !intentType.trim()) {
      return { eligibleAdapterIds: [], reason: "declared-compatibility" };
    }

    const list = Array.isArray(events) ? events : [];
    const eligible = new Set();

    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || typeof e !== "object") continue;
      if (e.type !== "execution_adapter_registered") continue;

      const p = e.payload;
      if (!p || typeof p !== "object") continue;

      const adapterId = typeof p.adapterId === "string" ? p.adapterId : "";
      if (!adapterId.trim()) continue;

      const acceptedIntentTypes = Array.isArray(p.acceptedIntentTypes) ? p.acceptedIntentTypes : null;
      if (!acceptedIntentTypes) continue;

      // Empty acceptedIntentTypes means "accepts nothing yet" and is NOT a wildcard.
      if (acceptedIntentTypes.length === 0) continue;

      for (let j = 0; j < acceptedIntentTypes.length; j++) {
        const t = acceptedIntentTypes[j];
        if (typeof t !== "string") continue;
        if (t === intentType) {
          eligible.add(adapterId);
          break;
        }
      }
    }

    return {
      eligibleAdapterIds: Array.from(eligible).sort(),
      reason: "declared-compatibility",
    };
  } catch {
    // Never throw.
    return { eligibleAdapterIds: [], reason: "declared-compatibility" };
  }
}

/**
 * Phase 27: adapter selection envelope.
 *
 * Selection is descriptive metadata only. It must not enable execution.
 * The envelope contains only primitive data.
 *
 * @param {string} intentType
 * @param {any[]} events
 * @returns {{
 *   intentType: string,
 *   eligibleAdapterIds: string[],
 *   selectedAdapterId: string|null,
 *   policy: "lexicographic-first",
 *   note: "Selection is descriptive only"
 * }}
 */
export function buildAdapterSelectionEnvelope(intentType, events) {
  try {
    const eligibility = resolveEligibleExecutionAdapters(intentType, events);
    const eligibleAdapterIds = Array.isArray(eligibility.eligibleAdapterIds) ? eligibility.eligibleAdapterIds : [];

    const selectedAdapterId = selectAdapterIdLexicographicFirst(eligibleAdapterIds);

    return {
      intentType: typeof intentType === "string" ? intentType : "",
      eligibleAdapterIds,
      selectedAdapterId,
      policy: "lexicographic-first",
      note: "Selection is descriptive only",
    };
  } catch {
    return {
      intentType: typeof intentType === "string" ? intentType : "",
      eligibleAdapterIds: [],
      selectedAdapterId: null,
      policy: "lexicographic-first",
      note: "Selection is descriptive only",
    };
  }
}
