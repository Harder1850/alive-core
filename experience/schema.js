// experience/schema.js

export const EVENT_VERSION = 1;

export function createBaseEvent({ source, type, payload, importance }) {
  const ts = Date.now();
  return {
    v: EVENT_VERSION,
    id: `evt_${ts}_${Math.random().toString(36).slice(2, 10)}`,
    timestamp: ts,
    source: source || "unknown", // 'spine' | 'user' | 'agent' | 'system' | 'plugin'
    type: type || "unknown", // 'input' | 'output' | 'thought' | 'action' | 'state'
    importance: typeof importance === "number" ? importance : 0.5,
    payload: payload ?? null,
  };
}

export function validateEvent(evt) {
  if (!evt || typeof evt !== "object") return false;
  if (!evt.id || !evt.timestamp || !evt.source || !evt.type) return false;
  return true;
}

