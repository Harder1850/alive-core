// runtime/permissions.js

const allowOnce = new Set();
let trustAdapter = null;

export function attachTrust(adapter) {
  trustAdapter = adapter;
}

export function checkPermission(intent) {
  if (intent.type === "RUN_COMMAND") {
    if (trustAdapter && trustAdapter.isTrusted(intent.value)) return true;
    if (allowOnce.has(intent.value)) return true;
    allowOnce.add(intent.value);
    return "CONFIRM";
  }
  return true;
}
