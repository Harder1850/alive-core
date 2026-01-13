// memory/trust.js

const trust = {};

export function trustCommand(cmd) {
  trust[cmd] = true;
}

export function isTrusted(cmd) {
  return !!trust[cmd];
}

