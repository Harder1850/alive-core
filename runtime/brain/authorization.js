// runtime/brain/authorization.js
// Phase 21 — Intent Authorization (Lawful Permission, Still Non-Executing)
//
// Deterministic only. No IO. No execution. No spine authority.

function isRecord(v) {
  return typeof v === "object" && v !== null;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}

function toStringArray(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const x of v) {
    if (isNonEmptyString(x)) out.push(x);
  }
  return out;
}

function hasCapability(capabilitiesSnapshot, capId) {
  if (!isNonEmptyString(capId)) return false;

  // Supported deterministic snapshot shapes:
  // - { capabilityIds: string[] }
  // - { ids: string[] }
  // - { capabilities: { id: string }[] }
  // - { byId: Record<string, unknown> }
  // - { set: Set<string> } (if caller precomputes)
  if (!isRecord(capabilitiesSnapshot)) return false;

  if (Array.isArray(capabilitiesSnapshot.capabilityIds)) {
    return capabilitiesSnapshot.capabilityIds.includes(capId);
  }

  if (Array.isArray(capabilitiesSnapshot.ids)) {
    return capabilitiesSnapshot.ids.includes(capId);
  }

  if (Array.isArray(capabilitiesSnapshot.capabilities)) {
    return capabilitiesSnapshot.capabilities.some(c => isRecord(c) && c.id === capId);
  }

  if (isRecord(capabilitiesSnapshot.byId)) {
    return Object.prototype.hasOwnProperty.call(capabilitiesSnapshot.byId, capId);
  }

  if (capabilitiesSnapshot.set instanceof Set) {
    return capabilitiesSnapshot.set.has(capId);
  }

  return false;
}

function isExplicitlyDeniedByPolicy(constraintsSnapshot, intent) {
  // Supported explicit shapes (no inference):
  // - { deniedIntentIds: string[] }
  // - { rejectedIntentIds: string[] } (Phase 20 compatibility)
  if (!isRecord(constraintsSnapshot) || !isRecord(intent) || !isNonEmptyString(intent.id)) return false;

  const id = intent.id;
  if (Array.isArray(constraintsSnapshot.deniedIntentIds) && constraintsSnapshot.deniedIntentIds.includes(id)) {
    return true;
  }
  if (Array.isArray(constraintsSnapshot.rejectedIntentIds) && constraintsSnapshot.rejectedIntentIds.includes(id)) {
    return true;
  }
  return false;
}

function isUnauthorizedScope(intent) {
  // Structural mapping only (deterministic):
  // - If intent.payload.scope is one of these forbidden labels
  // - OR if intent.payload.kind is one of these forbidden kinds
  // No heuristics, no ranking.
  if (!isRecord(intent) || !isRecord(intent.payload)) return false;

  const scope = intent.payload.scope;
  if (scope === "filesystem.write" || scope === "network.call" || scope === "system.mutate") return true;

  const kind = intent.payload.kind;
  if (kind === "filesystem_write" || kind === "network_call" || kind === "system_mutation") return true;

  return false;
}

/**
 * Phase 21 authorization.
 *
 * Rules (applied in order):
 * A1 Capability Declaration Check
 * A2 Explicit Policy / Constitution Check
 * A3 Authorization Scope Check
 *
 * Output preserves input order exactly.
 * Never throws.
 */
export function authorizeIntents({
  survivingIntents,
  workspaceSnapshot,
  constraintsSnapshot,
  capabilitiesSnapshot,
} = {}) {
  void workspaceSnapshot;

  const failures = [];
  const denied = [];
  const authorizedIntents = [];

  const intents = Array.isArray(survivingIntents) ? survivingIntents : [];

  for (let i = 0; i < intents.length; i++) {
    const intent = intents[i];

    // Keep authorization deterministic and non-throwing even if input is malformed.
    if (!isRecord(intent) || !isNonEmptyString(intent.id)) {
      denied.push({ intentId: "(unknown)", reason: "missing_capability" });
      continue;
    }

    // A1 — Capability Declaration Check (existence only)
    const requiredCapabilities = toStringArray(intent.requiredCapabilities);
    let missing = null;
    for (const capId of requiredCapabilities) {
      if (!hasCapability(capabilitiesSnapshot, capId)) {
        missing = capId;
        break;
      }
    }
    if (missing) {
      denied.push({ intentId: intent.id, reason: "missing_capability" });
      continue;
    }

    // A2 — Explicit Policy / Constitution Check (explicit only)
    if (isExplicitlyDeniedByPolicy(constraintsSnapshot, intent)) {
      denied.push({ intentId: intent.id, reason: "policy_violation" });
      continue;
    }

    // A3 — Authorization Scope Check (structural mapping only)
    if (isUnauthorizedScope(intent)) {
      denied.push({ intentId: intent.id, reason: "unauthorized_scope" });
      continue;
    }

    authorizedIntents.push(intent);
  }

  return { authorizedIntents, denied, failures };
}

