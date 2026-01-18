# Environment Layer — Context Without Meaning Contract

## Status

CONSTITUTIONAL — NON-NEGOTIABLE

This document defines what environment means in the ALIVE Virtual Body and enforces a strict separation between situational context and interpretation.

Any deviation from this contract introduces implicit world modeling or judgment into the Body and is an architectural violation.

## Purpose

The Environment layer exists to describe the situation the Body is currently operating within, without deciding what that situation means.

Environment provides context, not understanding.

## Foundational Principle

Context describes conditions.
Meaning is assigned elsewhere.

If the Environment layer begins explaining why conditions matter, the system has failed.

## What Environment IS

The Environment layer is:

- a snapshot of current conditions
- a description of constraints
- a report of system state
- a carrier of situational metadata

Examples of environmental context:

- current time and date
- timezone
- locale
- network availability
- connectivity state
- hardware availability
- execution limits
- resource constraints (CPU, memory, disk)
- operating mode (offline, sandboxed, restricted)
- user presence / session state
- simulation vs real-world mode

Environment answers “what is the situation right now?”

## What Environment IS NOT

The Environment layer is not:

- a world model
- a belief system
- a situation assessment
- a risk evaluator
- a priority engine
- a planner
- a forecaster
- a trend detector
- a decision input optimizer

Those belong to the Brain.

## No Interpretation Rule

The Environment layer must not:

- assess importance
- classify situations as good or bad
- infer intent
- detect danger
- predict outcomes
- recommend actions
- rank constraints
- summarize implications

It reports conditions as-is.

## Allowed Environmental Data

The Environment layer may expose:

- boolean flags (online/offline)
- numeric limits (timeouts, quotas)
- enumerated modes (sandboxed, live)
- timestamps
- identifiers
- capability availability (present / absent)

All data must be:

- explicit
- inspectable
- non-normative

## Event Representation

Environmental changes are events, not silent updates.

Examples:

- network became unavailable
- execution limit changed
- mode switched to sandbox
- resource threshold exceeded

These must be logged as experience events.

## Temporal Neutrality

The Environment layer must not:

- infer trends over time
- aggregate conditions meaningfully
- smooth changes
- predict future states

Time is reported, not analyzed.

## Isolation Rule

The Environment layer must not:

- communicate directly with Actuators
- communicate directly with Senses
- communicate directly with the Brain
- bypass the lifecycle loop

All environment context flows through:

- Experience logging
- Nervous System mediation
- Brain consultation (advisory only)

## Why This Matters

Most systems accidentally build world models long before they intend to.

This contract ensures:

- the Brain reasons from truth, not pre-digested context
- constraints remain explicit
- execution remains bounded
- explanations remain auditable
- environment changes cannot silently steer behavior

## Invariant Summary

The following must always hold:

- Environment describes conditions only.
- Environment assigns no meaning.
- Environment makes no recommendations.
- Environment performs no prediction.
- Environment changes are observable.

Violation of any invariant introduces implicit agency.

## Final Statement

The Environment layer exists to state the facts of the moment without opinion.

Facts are not advice.
Advice belongs to the Brain.

This file exists to ensure context never becomes control.

