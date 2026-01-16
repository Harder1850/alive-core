// experience/policy.js
//
// Phase 27 — Authorization Confirmation
// Descriptive-only adapter selection policy.
//
// This file is intentionally inert:
// - no IO
// - no runtime coupling
// - no callables returned
// - deterministic only

/**
 * Default (and only) Phase 27 policy: lexicographic-first.
 *
 * @param {string[]} eligibleAdapterIds
 * @returns {string|null}
 */
export function selectAdapterIdLexicographicFirst(eligibleAdapterIds) {
  try {
    const ids = Array.isArray(eligibleAdapterIds) ? eligibleAdapterIds.filter(x => typeof x === "string") : [];
    if (ids.length === 0) return null;
    return ids.slice().sort()[0] || null;
  } catch {
    return null;
  }
}

