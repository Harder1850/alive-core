// experience/schema.js

export const EVENT_VERSION = 1;

const EXECUTION_ADAPTER_REGISTRATION_NOTE = "Execution adapters are inert and declarative only";

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

  // Optional context for semantic validation without IO.
  // context.events is expected to be an in-memory list of prior events (if available).
  const context = arguments.length > 1 ? arguments[1] : undefined;

  if (evt.type === "execution_adapter_registered") {
    const res = validateExecutionAdapterRegistrationPayload(evt.payload);
    if (!res.ok) return false;

    const prior = context && Array.isArray(context.events) ? context.events : [];
    const adapterId = evt && evt.payload && typeof evt.payload.adapterId === "string" ? evt.payload.adapterId : null;
    if (!adapterId) return false;

    // Phase 25 invariant: adapter identity is immutable.
    // Reject duplicate adapterId registrations.
    for (let i = 0; i < prior.length; i++) {
      const e = prior[i];
      if (!e || typeof e !== "object") continue;
      if (e.type !== "execution_adapter_registered") continue;
      const p = e.payload;
      if (p && typeof p === "object" && p.adapterId === adapterId) return false;
    }

    return true;
  }

  return true;
}

export function validateExecutionAdapterRegistrationPayload(payload) {
  // Never throws, deterministic, no IO.
  try {
    /** @type {string[]} */
    const errors = [];

    // 1) payload object
    if (!payload || typeof payload !== "object") {
      errors.push("payload_invalid");
      return { ok: false, errors };
    }

    // 2) adapterId
    if (typeof payload.adapterId !== "string") errors.push("adapterId_missing");
    else if (!payload.adapterId.trim()) errors.push("adapterId_empty");

    // 3) acceptedIntentTypes
    if (!Array.isArray(payload.acceptedIntentTypes)) {
      errors.push("acceptedIntentTypes_invalid");
    } else {
      for (let i = 0; i < payload.acceptedIntentTypes.length; i++) {
        const v = payload.acceptedIntentTypes[i];
        if (typeof v !== "string") {
          errors.push("acceptedIntentTypes_entry_invalid");
          break;
        }
        if (!v.trim()) {
          errors.push("acceptedIntentTypes_entry_empty");
          break;
        }
      }
    }

    // 4) declaredAt
    if (typeof payload.declaredAt !== "string") {
      errors.push("declaredAt_missing");
    } else {
      const t = Date.parse(payload.declaredAt);
      if (Number.isNaN(t)) errors.push("declaredAt_invalid");
    }

    // 5) note
    if (payload.note !== EXECUTION_ADAPTER_REGISTRATION_NOTE) errors.push("note_mismatch");

    return { ok: errors.length === 0, errors };
  } catch {
    return { ok: false, errors: ["validator_internal_error"] };
  }
}

export function getExecutionAdapterRegistrationNote() {
  return EXECUTION_ADAPTER_REGISTRATION_NOTE;
}
