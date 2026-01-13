// runtime/scheduler.js

const tasks = [];

export function schedule(task, delayMs) {
  tasks.push(setTimeout(task, delayMs));
}

export function clearAll() {
  tasks.forEach(clearTimeout);
}

