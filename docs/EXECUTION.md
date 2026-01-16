# EXECUTION (Phase 23)

## Purpose

Phase 23 introduces **execution adapters** as **lawful plumbing only**.

An execution adapter is a passive sink that receives **AUTHORIZED** intents from the runtime, returns a deterministic receipt, and **does not execute anything**.

This phase exists to establish a stable interface boundary for future phases without expanding authority.

## Hard Safety Rules (Phase 23)

- **Zero autonomy**: no planning, ranking, inference, retries, scheduling, or background loops.
- **No execution**: adapters must not invoke procedures, call capabilities, or trigger any action.
- **No IO**: no network, filesystem, or hardware access.
- **Deterministic**: reject malformed intents in a deterministic way and preserve intent order.
- **Never throw**: the adapter interface must always return a receipt.

## Adapter Interface

`runtime/execution/adapter.js` exports:

```js
export function receiveAuthorizedIntents({ intents, tickId, timestamp }) {
  return {
    acceptedCount: number,
    rejected: { intentId, reason }[],
    note: "Execution adapters are inert in Phase 23"
  }
}
```

### Semantics

- **acceptedCount**: number of intents accepted as *received* (not executed).
- **rejected**: list of rejected intents (in input order) with deterministic reasons.
- **note**: always the fixed Phase 23 note string.

## Runtime Event

Every runtime tick records an experience event:

- **type**: `execution_adapter_received`
- **payload**:
  - `inputCount`
  - `acceptedCount`
  - `rejected`
  - `note`

This event is recorded even when `inputCount = 0`.

---

# Phase 25 — Execution Adapter Registration (Declarative Only)

## Purpose

Phase 25 introduces a **declarative** registration mechanism for execution adapters.

It answers one question only:

> What adapters exist, and what do they claim to accept?

Registration does **not** enable execution, selection, routing, or intent handling.
Adapters remain inert.

---

## Phase Freeze — Execution Boundary

- Phase 23 — Adapter existence (inert)
- Phase 24 — Receipt validation
- Phase 25 — Adapter identity (immutable)
- Phase 26 — Eligibility resolution
- Phase 27 — Selection description (non-binding)

Phase 27 is the final authorized phase.

No execution, invocation, or authorization exists in ALIVE Core.
No phase beyond Phase 27 is implemented or permitted.

Any introduction of execution semantics requires:

- A new phase authorization
- A formal execution authorization envelope
- Explicit runtime gating

This section is normative, not descriptive.

---

# Phase 27 — Adapter Selection Envelope (Descriptive Only)

## Purpose

Phase 27 introduces a **selection envelope** that describes a deterministic selection outcome **without** enabling execution.

Selection is **descriptive metadata**, not control flow.

## Policy (Locked)

Default (and only) policy in Phase 27:

- `lexicographic-first`

If no eligible adapters exist:

- `selectedAdapterId === null`

## Envelope Contract

The selection envelope is inert by construction:
- no functions
- no callables
- no references to runtime objects

It contains only primitive data:

- `intentType`
- `eligibleAdapterIds`
- `selectedAdapterId`
- `policy`
- `note`

## Explicit Non-Authorization

Eligibility ≠ selection.  
Selection ≠ execution.

Adapters remain inert.

## Canonical Registration Event

- **type**: `execution_adapter_registered`

### Payload Contract

The payload is valid only if it contains:

- `adapterId` (string, non-empty)
  - must be globally unique
  - once registered, may never appear again
- `acceptedIntentTypes` (array of non-empty strings)
  - the array may be empty
- `declaredAt` (ISO 8601 timestamp string)
  - must parse to a valid date
- `note` (string)
  - must equal exactly: `Execution adapters are inert and declarative only`

## Invariant: Adapter Identity Is Immutable

Once an `adapterId` has been registered, any subsequent registration using the same `adapterId` is invalid.

## Reminder (Binding)

**Registration ≠ execution.**

Execution adapters remain inert in Phase 25.

---

# Phase 26 — Intent → Adapter Eligibility Resolution (Read-Only)

## Purpose

Phase 26 introduces a **pure eligibility resolver** that answers:

> Which registered execution adapters declare support for this intent type?

This phase provides deterministic, auditable visibility into adapter–intent compatibility.

It does **not**:
- select an adapter
- execute an intent
- authorize behavior
- modify runtime control flow

## Resolver Contract

`experience/query.js` exports:

```js
export function resolveEligibleExecutionAdapters(intentType, events) {
  return {
    eligibleAdapterIds: string[],
    reason: "declared-compatibility"
  }
}
```

### Semantics

- Eligibility is based only on `execution_adapter_registered` declarations.
- An adapter is eligible only if `acceptedIntentTypes` explicitly includes `intentType`.
- `acceptedIntentTypes: []` means **no declared support** (NOT a wildcard).
- Returned `eligibleAdapterIds` are:
  - unique
  - lexicographically sorted

## Explicit Non-Authorization

Eligibility ≠ selection.  
Selection ≠ execution.

Adapters remain inert.
