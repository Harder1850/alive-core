// services/knowledge/scratchpad.js

const scratch = [];

export function writeThought(text) {
  scratch.push(text);
}

export function readThoughts() {
  return scratch.slice(-10);
}

export function clear() {
  scratch.length = 0;
}

