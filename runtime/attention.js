// runtime/attention.js

let focus = null;

export function setFocus(topic) {
  focus = topic;
}

export function getFocus() {
  return focus;
}

export function score(input) {
  if (!focus) return 0.5;
  return input.includes(focus) ? 0.9 : 0.4;
}

