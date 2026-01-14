// runtime/sessionContext.js

// Phase 9 (authoritative): read-only session replay.
//
// Allowed:
// - Read events
// - Filter recent session turns
// - Return a compact object
//
// Not allowed:
// - Writing, summarization, intent guessing, or any side effects

export function loadSessionContext(events, options = {}) {
  const { maxTurns = 3 } = options;

  // We only care about completed turns
  const completedTurns = (Array.isArray(events) ? events : [])
    .filter(e => e.type === "session_turn_ended")
    .slice(-maxTurns);

  const recentIntents = completedTurns.map(e => e.payload.intent);
  const recentResults = completedTurns.map(e => e.payload.result);

  return {
    recentTurns: completedTurns,
    recentIntents,
    recentResults,
    turnCount: completedTurns.length,
  };
}
