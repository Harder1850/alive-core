# The Brain–Body Firewall Contract

## Status

CONSTITUTIONAL — NON-NEGOTIABLE

Any change to this contract constitutes a fundamental architectural violation and must be treated as a breaking change to the ALIVE system.

## Purpose

The Nervous System is the only legal communication channel between the Virtual Body and the ALIVE Brain (ALIVE-Core).

Its sole purpose is to:

- protect the Brain from the external world
- prevent authority leakage
- ensure learning without execution
- enforce long-term safety and auditability

This is a hard firewall, not a convention.

## Foundational Principle

The Brain must never touch reality.
The Body must never become a brain.

Everything in this directory exists to enforce that principle.

## Authority Model

### 🧠 Brain (ALIVE-Core)

- Sovereign
- Non-executing
- Advisory only

### 🧍 Body (Virtual Entity)

- Executing
- Non-sovereign
- Responsible for action

Power and authority are deliberately separated.

## Allowed Direction of Communication

```text
World → Body → Brain
              ↓
         Judgment Only
              ↓
           Body → World
```

There is no other permitted flow.

## What the Nervous System IS

The Nervous System:

- translates body experience into data
- submits questions to the Brain
- receives judgments and explanations
- enforces strict type and shape boundaries
- prevents capability transfer

It is a translation and validation layer, not logic.

## What the Nervous System IS NOT

The Nervous System is not:

- a planner
- a command bus
- a control channel
- a tool router
- a scheduler
- an execution engine
- a shortcut around governance

If it starts “helping,” it is broken.

## Body → Brain (Upstream Rules)

### What the Body MAY Send

Only data may cross the firewall.

Allowed categories:

- observations
- summaries of observations (non-normative)
- environmental context
- proposed intents (descriptive)
- questions for judgment

Example (conceptual):

```json
{
  "type": "external_observation",
  "domain": "web",
  "payload": { "...": "..." },
  "timestamp": "ISO-8601"
}
```

### What the Body MUST NEVER Send

Under no circumstances may the Body send:

- executable code
- function references
- callbacks
- closures
- tool handles
- file descriptors
- sockets
- credentials
- API keys
- environment variables
- live connections
- raw sensor streams without mediation

If it can do something, it must not cross the boundary.

## Brain → Body (Downstream Rules)

### What the Brain MAY Return

The Brain may return descriptive outputs only, including:

- judgments
- constraints
- explanations
- warnings
- eligibility descriptions
- reasoning traces

Example (conceptual):

```json
{
  "judgment": "allowed",
  "constraints": ["no personal data"],
  "explanation": "Consistent with prior experience"
}
```

### What the Brain MUST NEVER Return

The Brain must never return:

- commands
- imperatives (“do X”)
- action plans
- schedules
- control flow
- executable instructions
- functions
- policies expressed as procedures

The Brain may explain.
It may not instruct.

## Capability Containment Rule

Capabilities never cross the firewall.

- The Body owns all tools.
- The Brain owns none.
- The Brain may reason about capabilities but never with them.

This prevents:

- prompt coercion
- accidental execution
- authority escalation
- hidden backdoors

## Non-Coercibility Guarantee

The Nervous System must ensure that:

- the Brain cannot be forced to act
- the Brain cannot be tricked into execution
- the Brain cannot be influenced by raw sensory overload
- the Brain cannot be bypassed

All inputs must be:

- mediated
- logged
- bounded
- auditable

## Learning Without Power

The Nervous System exists to support learning without authority.

Experience flows upward.
Judgment flows downward.
Power never flows inward.

The Brain may become wiser.
It must never become stronger.

## Failure Mode Policy

If a violation is detected:

- the interaction must be rejected
- the event must be logged
- the system must fail safe
- the Brain must remain untouched

Fail closed, not open.

## Invariants (Must Always Hold)

- The Brain cannot execute.
- The Body cannot judge.
- The Nervous System cannot decide.
- Capabilities cannot cross the boundary.
- Experience cannot be hidden or altered.

If any invariant is violated, ALIVE is no longer ALIVE.

## Summary

The Nervous System is the most sensitive component of the Virtual Body.
It is not clever.
It is not flexible.
It is not optimized.
It is strict, boring, and defensive by design.

This file protects the future of the system.
Treat it accordingly.

If you want next, we can:

- write the remaining sub-README files (senses, actuators, knowledge, etc.)
- draft boundary enforcement tests (even before code exists)
- write a repo-level invariant: “Brain must never import Body”
- version and freeze the Body architecture like the Brain

Just say the next move.

