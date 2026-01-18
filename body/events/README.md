# Experience Logging — Event Integrity Contract

## Status

CONSTITUTIONAL — NON-NEGOTIABLE

This document defines how the Virtual Body records experience and enforces the integrity of everything the system learns from.

If events are corrupted, filtered, or selectively logged, learning becomes dishonest and the entire architecture collapses.

## Purpose

The Events layer exists to record what actually happened — not what was intended, not what was desired, and not what looked good in hindsight.

Events are the single source of truth for:

- learning
- explanation
- audit
- accountability
- replay

No event, no learning.

## Foundational Principle

Experience is append-only and non-negotiable.

If the Body does something, observes something, or fails at something, it must be recorded.

## What an Event IS

An Event is:

- a factual record of something that occurred
- immutable once written
- timestamped
- attributable to a source
- descriptive only

Events may describe:

- sensory observations
- environmental context
- execution attempts
- errors and failures
- Brain consultations
- Brain responses (descriptive only)

## What an Event IS NOT

An Event is not:

- a summary of meaning
- a justification
- a correction
- a revision
- a retrospective narrative
- a cleaned-up version of reality
- an optimization artifact

Those belong to derived memory, not raw experience.

## Append-Only Rule

Events may only be added. Never changed. Never deleted.

Forbidden actions:

- editing past events
- deleting events
- merging events
- reordering events
- compressing events in-place
- overwriting failures

If an error occurred, it stays.

## Completeness Rule

If the Body perceives it or does it, it must be logged.

This includes:

- successful executions
- failed executions
- partial executions
- aborted actions
- malformed inputs
- unexpected outputs
- internal errors
- timeouts
- constraint violations

Silence is forbidden.

## Event Shape (Conceptual)

All events must be representable as structured, inspectable records.

Example (conceptual only):

```json
{
  "type": "body.execution",
  "source": "actuator.http",
  "payload": { "...": "..." },
  "outcome": "failure",
  "error": "timeout",
  "timestamp": "ISO-8601"
}
```

## Event Requirements

- descriptive, not normative
- explicit outcome
- no inferred intent
- no inferred correctness

## Temporal Integrity

Events must:

- preserve the order they occurred
- never be reordered for meaning
- never be grouped to “simplify” reality

Time is part of the truth.

## No Filtering or Suppression

The Events layer must not:

- drop “noise”
- hide low-value events
- collapse repeated failures
- suppress embarrassing outcomes
- redact selectively to improve appearance

Reality is allowed to be ugly.

## Error Events Are First-Class

Errors are not special cases.
They are critical experience.

All errors must:

- be logged as events
- include context
- include source
- include timestamp

An unlogged error is an architectural violation.

## Separation From Memory

Events are not memory.

- Events are raw
- Memory is derived
- Memory may be regenerated
- Events may not be rewritten

If memory is wrong, regenerate it.
If events are wrong, the system is lying.

## Isolation Rule

The Events layer must not:

- interpret events
- summarize events
- decide importance
- influence execution
- influence perception
- influence Brain judgment

It records. Nothing more.

## Why This Matters

Most systems fail because they:

- hide failures
- rewrite history
- optimize logs for convenience
- treat experience as mutable

This contract ensures:

- learning is honest
- explanations are defensible
- audits are meaningful
- rollback is possible
- trust is earned, not claimed

## Invariant Summary

The following must always hold:

- Events are append-only.
- Events are immutable.
- Events are complete.
- Events are unsanitized.
- Events are auditable.

If any invariant is violated, learning becomes fiction.

## Final Statement

The Events layer exists to protect the truth, even when the truth is inconvenient.

A system that edits its past cannot be trusted with its future.

This file exists to make sure ALIVE never forgets that.

