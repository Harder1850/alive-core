// runtime/confirmations.js

const confirmed = new Set();

export function isConfirmed(key) {
  return confirmed.has(key);
}

export function requestConfirmation(key) {
  confirmed.add(key);
}

export function clearConfirmation(key) {
  confirmed.delete(key);
}

