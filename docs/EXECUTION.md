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
