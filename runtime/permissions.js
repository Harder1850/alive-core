// runtime/permissions.js

const allowOnce = new Set();

export function checkPermission(intent) {
  if (intent.type === "RUN_COMMAND") {
    if (allowOnce.has(intent.value)) return true;
    allowOnce.add(intent.value);
    return "CONFIRM";
  }
  return true;
}

