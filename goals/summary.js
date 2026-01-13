// goals/summary.js

import { loadGoals } from "./store.js";
import { generateSuggestions } from "../background/suggestions.js";

export function getGoalSummary() {
  const goals = loadGoals();
  const activeGoals = goals.filter(g => g.status === "active");
  const lastProgress = activeGoals
    .map(g => ({ id: g.id, note: g.last_progress_note || "" }))
    .filter(x => x.note);

  const pendingSuggestions = generateSuggestions(goals);

  return {
    activeGoals,
    lastProgress,
    pendingSuggestions,
  };
}

