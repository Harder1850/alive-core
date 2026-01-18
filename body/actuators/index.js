/**
 * Actuators entrypoint.
 * MUST execute only; never choose, plan, learn, or interpret.
 */
export async function performActuation(action) {
  // Placeholder: noop only
  if (!action || action.type === "noop") return;
  throw new Error("Actuation not implemented (placeholder only).");
}

