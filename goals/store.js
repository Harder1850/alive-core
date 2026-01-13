// goals/store.js

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const GOALS_FILE = path.join(DATA_DIR, "goals.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(GOALS_FILE)) fs.writeFileSync(GOALS_FILE, "[]", "utf-8");
}

/** @returns {import('./types.js').Goal[]} */
export function loadGoals() {
  ensureStore();
  const raw = fs.readFileSync(GOALS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {import('./types.js').Goal[]} goals */
export function saveGoals(goals) {
  ensureStore();
  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2), "utf-8");
}

/** @param {import('./types.js').Goal} goal */
export function addGoal(goal) {
  const goals = loadGoals();
  goals.push(goal);
  saveGoals(goals);
}

/**
 * @param {string} goalId
 * @param {Partial<import('./types.js').Goal>} partialUpdate
 */
export function updateGoal(goalId, partialUpdate) {
  const goals = loadGoals();
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx === -1) throw new Error(`Goal not found: ${goalId}`);

  goals[idx] = {
    ...goals[idx],
    ...partialUpdate,
    last_updated: Date.now(),
  };
  saveGoals(goals);
}

export { GOALS_FILE };

