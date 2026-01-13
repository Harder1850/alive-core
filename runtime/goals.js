// runtime/goals.js

let goals = [];

export function addGoal(goal) {
  goals.push({ goal, created: Date.now() });
}

export function listGoals() {
  return goals;
}

