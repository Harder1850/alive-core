// background/suggestions.js

/**
 * @typedef {{
 *   goalId: string,
 *   suggestionText: string,
 *   confidence: number
 * }} Suggestion
 */

const HOURS = 60 * 60 * 1000;

/**
 * @param {import('../goals/types.js').Goal[]} goals
 * @param {{ staleHours?: number }} opts
 * @returns {Suggestion[]}
 */
export function generateSuggestions(goals, opts = {}) {
  const staleHours = opts.staleHours ?? 6;
  const now = Date.now();
  const suggestions = [];

  for (const g of goals) {
    const age = now - (g.last_updated || g.created_at || now);

    if (age > staleHours * HOURS) {
      suggestions.push({
        goalId: g.id,
        suggestionText: `Review goal: ${g.description}`,
        confidence: 0.6,
      });
    }

    if (Array.isArray(g.dependencies) && g.dependencies.length > 0) {
      suggestions.push({
        goalId: g.id,
        suggestionText: `Resolve dependencies: ${g.dependencies.join(", ")}`,
        confidence: 0.7,
      });
    }

    if (g.status === "blocked") {
      suggestions.push({
        goalId: g.id,
        suggestionText: "Clarify what is blocking this goal.",
        confidence: 0.8,
      });
    }
  }

  return suggestions;
}

