// runtime/spineObserver.js
//
// Phase 11: Spine observability (read-only).
//
// This module must NOT change spine logic or outcomes.
// It only wraps a tick call and records a structured observation event.

/**
 * Observe a single spine tick.
 *
 * @param {object} args
 * @param {any} args.intent - the intent object passed to the spine
 * @param {any} args.spine - an object with a tick() method (e.g., new Spine())
 * @param {(evt: any) => (void|Promise<void>)} args.recordEvent - experience recorder
 * @returns {any} spineStateSnapshot
 */
export async function observeSpineTick({ intent, spine, recordEvent }) {
  const timestamp = Date.now();

  // Run the tick (no try/catch: failures should fail loudly).
  spine.tick(intent);

  // Capture returned state (if any) without interpretation.
  // If the spine doesn't expose anything, snapshot is null.
  const spineStateSnapshot = typeof spine.snapshot === "function" ? spine.snapshot() : null;

  await recordEvent({
    source: "system",
    type: "spine_tick_observed",
    payload: {
      intent,
      timestamp,
      spineStateSnapshot,
    },
  });

  return spineStateSnapshot;
}

