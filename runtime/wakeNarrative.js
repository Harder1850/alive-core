// runtime/wakeNarrative.js
//
// Phase 6: deterministic wake narrative.
// Read-only mapping from experience → short past-tense sentence(s).

/**
 * Build a deterministic wake narrative from a list of experience events.
 * Only considers meaningful event types.
 *
 * @param {Array<any>} events
 * @returns {string}
 */
export function buildWakeNarrative(events = []) {
  if (!Array.isArray(events) || events.length === 0) {
    return "I’m awake. This is my first run.";
  }

  // Most recent meaningful event: procedure_executed
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (!e || typeof e !== "object") continue;
    if (e.type !== "procedure_executed") continue;

    const intent = e?.payload?.intent;
    const result = e?.payload?.result;

    if (intent === "organize_downloads" && result && typeof result === "object") {
      const moved = Number(result.moved ?? 0);
      return `I’m awake. Last time, I organized your Downloads folder and moved ${moved} files.`;
    }

    return "I’m awake. Last time, I completed a task.";
  }

  return "I’m awake. I didn’t complete any tasks last time.";
}

