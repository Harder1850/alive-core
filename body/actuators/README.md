# Execution Layer — Actuation Contract

## Status

CONSTITUTIONAL — NON-NEGOTIABLE

This document defines what execution means in the ALIVE Virtual Body and, more importantly, what it must never become.

Any deviation from this contract introduces agency, authority, or decision-making into the Body and is an architectural violation.

## Purpose

The Actuators layer exists solely to carry out concrete, mechanical effects in the world as chosen by the Body’s procedural loop within constraints provided by the Brain.

Actuators are the hands, motors, and output channels of the Body.

They are not a will.

## Foundational Principle

Actuators execute.
They do not choose.

If an Actuator begins deciding what should happen, when it should happen, or whether it should happen, the system has failed.

## What an Actuator IS

An Actuator is:

- an execution mechanism
- a capability endpoint
- a concrete effect generator
- a procedural output device

An Actuator may:

- perform a specific action
- follow explicit parameters
- enforce hard safety bounds
- report success or failure
- emit execution events

## What an Actuator IS NOT

An Actuator is not:

- a planner
- a scheduler
- a policy engine
- a goal selector
- a prioritizer
- a conflict resolver
- a retry strategist
- a learning component
- a judge of correctness

Those responsibilities belong elsewhere — primarily to the Brain or to explicit Body procedures.

## Execution Without Authority

Actuators must operate under this rule:

Execution ≠ Authorization

Actuators do not determine whether an action is allowed

Actuators do not escalate permissions

Actuators do not reinterpret constraints

Actuators do not infer intent

They receive explicit execution instructions and either:

- carry them out, or
- refuse due to hard bounds

## Allowed Inputs to Actuators

Actuators may accept:

- concrete action descriptors
- explicit parameters
- bounded configuration values
- hard constraints (limits, caps, safety thresholds)

Example (conceptual):

```json
{
  "action": "http.request",
  "method": "GET",
  "url": "https://example.com",
  "limits": {
    "timeoutMs": 2000
  }
}
```

This is execution data, not a plan.

## Forbidden Inputs to Actuators

Actuators must never accept:

- goals
- intents
- policies
- priorities
- “best effort” instructions
- ambiguous requests
- open-ended tasks
- natural language commands
- function references
- callbacks or closures

If an input requires interpretation, it is forbidden.

## No Internal State Accumulation

Actuators must not:

- build memory
- adapt behavior over time
- optimize strategies
- learn from past executions
- infer patterns

All state beyond immediate execution must be externalized and logged as experience.

## Error Handling

Actuators must:

- fail explicitly
- report errors verbatim
- never silently retry
- never invent recovery strategies

Retries, backoff, and escalation are Body-level procedural decisions, not actuator behavior.

## Isolation Rule

Actuators must not:

- call other actuators directly
- communicate with Senses
- communicate with the Brain
- bypass the lifecycle loop

All actuator use is mediated by the Body loop.

## Logging Requirement

Every actuation attempt must result in an execution event, including:

- action attempted
- parameters (redacted if needed)
- success or failure
- error details
- timestamp

Nothing that happens in the world is invisible.

## Why This Matters

Most AI systems collapse because execution quietly becomes decision-making.

This contract ensures:

- power remains mechanical
- authority remains external
- learning remains safe
- rollback remains possible
- audits remain meaningful

Actuators are tools.
Tools do not decide.

## Invariant Summary

The following must always hold:

- Actuators execute only.
- Actuators never choose.
- Actuators never plan.
- Actuators never learn.
- Actuators never escalate authority.

Violation of any invariant makes the Body an agent — which is forbidden.

## Final Statement

The Actuators layer exists to change the world without understanding it.

Understanding belongs to the Brain.
Power belongs to the Body.
Choice belongs to neither.

This file exists to keep those lines unblurred.

