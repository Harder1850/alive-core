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

function hasExplicitArrayProp(obj, prop) {
  return isRecord(obj) && Object.prototype.hasOwnProperty.call(obj, prop) && Array.isArray(obj[prop]);
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

function isScopeAuthorized(authorizationScope, constraintsSnapshot) {
  // Deterministic, explicit-only scope gate.
  // Supported explicit shapes:
  // - constraintsSnapshot.allowedAuthorizationScopes: string[]
  // - constraintsSnapshot.maxAuthorizationScope: string
  // If neither is present, only "runtime" scope is permitted (conservative default).

  if (!isNonEmptyString(authorizationScope)) return true;

  const scopeOrder = ["runtime", "session", "user", "system"];
  const idx = scopeOrder.indexOf(authorizationScope);
  if (idx === -1) return false;

  if (isRecord(constraintsSnapshot)) {
    if (Array.isArray(constraintsSnapshot.allowedAuthorizationScopes)) {
      return constraintsSnapshot.allowedAuthorizationScopes.includes(authorizationScope);
    }

    if (isNonEmptyString(constraintsSnapshot.maxAuthorizationScope)) {
      const maxIdx = scopeOrder.indexOf(constraintsSnapshot.maxAuthorizationScope);
      if (maxIdx === -1) return false;
      return idx <= maxIdx;
    }
  }

  return authorizationScope === "runtime";
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
  candidateIntents,
  workspaceSnapshot,
  constraintsSnapshot,
  capabilitiesSnapshot,
} = {}) {
  void workspaceSnapshot;

  const failures = [];
  const denied = [];
  const authorizedIntents = [];

  const intents = Array.isArray(candidateIntents) ? candidateIntents : [];

  for (let i = 0; i < intents.length; i++) {
    const intent = intents[i];

    // Keep authorization deterministic and non-throwing even if input is malformed.
    if (!isRecord(intent) || !isNonEmptyString(intent.id)) {
      denied.push({ intentId: "(unknown)", reason: "missing_capability_declaration" });
      continue;
    }

    // A1 — Capability Declaration Required
    // If requiresCapabilities is absent (not explicitly declared), deny.
    if (!hasExplicitArrayProp(intent, "requiresCapabilities")) {
      denied.push({ intentId: intent.id, reason: "missing_capability_declaration" });
      continue;
    }

    // A2 — Capability Availability (existence only)
    const requiredCapabilities = toStringArray(intent.requiresCapabilities);
    let missingCap = null;
    for (const capId of requiredCapabilities) {
      if (!hasCapability(capabilitiesSnapshot, capId)) {
        missingCap = capId;
        break;
      }
    }
    if (missingCap) {
      denied.push({ intentId: intent.id, reason: `capability_unavailable:${missingCap}` });
      continue;
    }

    // A3 — Explicit Capability Denial
    if (hasExplicitArrayProp(intent, "deniesCapabilities")) {
      const denies = toStringArray(intent.deniesCapabilities);
      for (const capId of denies) {
        if (hasCapability(capabilitiesSnapshot, capId)) {
          denied.push({ intentId: intent.id, reason: "capability_explicitly_denied" });
          break;
        }
      }
      if (denied.length > 0 && denied[denied.length - 1].intentId === intent.id) continue;
    }

    // A4 — Authorization Scope (If Present)
    if (Object.prototype.hasOwnProperty.call(intent, "authorizationScope")
      && isNonEmptyString(intent.authorizationScope)
      && !isScopeAuthorized(intent.authorizationScope, constraintsSnapshot)) {
      denied.push({ intentId: intent.id, reason: "authorization_scope_violation" });
      continue;
    }

    authorizedIntents.push(intent);
  }

  return { authorizedIntents, denied, failures };
}
