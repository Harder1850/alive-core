// runtime/habits.js

const habits = {};

export function recordHabit(event) {
  habits[event] = (habits[event] || 0) + 1;
}

export function getHabits() {
  return habits;
}

