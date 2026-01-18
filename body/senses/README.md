# Perception Layer — Sensory Input Contract

## Status

CONSTITUTIONAL — NON-NEGOTIABLE

This document defines what perception means in the ALIVE Virtual Body and, more importantly, what it does not mean.

Any deviation from this contract introduces cognitive authority into the Body and is an architectural violation.

## Purpose

The Senses layer exists solely to observe the external world and internal body state and convert those observations into raw, non-normative events.

Senses are the eyes, ears, and nerves of the Body.

They are not a mind.

## Foundational Principle

Senses observe.
They do not interpret.

If a Sense begins deciding what something means, what matters, or what should be done, the system has failed.

## What a Sense IS

A Sense is:

- an observation mechanism
- a data collection point
- a translation from reality → event
- a boundary between raw input and logged experience

A Sense may:

- read input
- attach metadata
- timestamp events
- identify source and modality
- lightly structure raw data (formatting only)

## What a Sense IS NOT

A Sense is not:

- a classifier
- a filter of importance
- a relevance detector
- a safety gate
- a planner
- a summarizer of meaning
- a ranking system
- a decision-maker
- a policy enforcer

Those responsibilities belong to the Brain.

## Allowed Sensory Inputs

Senses may observe inputs such as:

- user text input
- LLM responses
- web content
- API responses
- sensor feeds (camera, audio, telemetry)
- system events
- errors and failures
- environment state changes

All inputs are treated as potentially important.

No input may be silently discarded.

## Event Shape (Conceptual)

All Sense outputs must be represented as observation events.

Example (conceptual only):

```json
{
  "type": "sense.input",
  "source": "web",
  "modality": "text",
  "payload": "...raw or lightly structured data...",
  "metadata": {
    "encoding": "utf-8",
    "origin": "example.com"
  },
  "timestamp": "ISO-8601"
}
```

## Event Requirements

- descriptive only
- no conclusions
- no confidence scoring
- no relevance weighting
- no suppression

## Light Structuring vs Interpretation

### ✅ Allowed (Light Structuring)

- parsing JSON
- extracting headers
- normalizing encodings
- splitting streams into frames or chunks
- tagging source or modality

### ❌ Forbidden (Interpretation)

- labeling content as “important”
- classifying intent
- scoring relevance
- summarizing meaning
- detecting safety issues
- ranking inputs
- discarding “noise”

If it changes meaning, it is forbidden.

## Completeness Rule

If the Body perceives it, it must be logged.

Senses must not:

- hide events
- debounce meaningfully
- collapse multiple observations into one
- pre-filter for cleanliness or convenience

Messy input is expected.
Cleanliness happens later — in the Brain.

## Error Handling

Errors, failures, and malformed inputs are first-class sensory events.

Examples:

- network failures
- invalid responses
- timeouts
- corrupted data
- unexpected formats

Errors must be:

- observed
- recorded
- timestamped

Never swallowed.

## Temporal Neutrality

Senses must not:

- reorder events for meaning
- merge events across time
- infer trends
- detect patterns

Time ordering is recorded, not analyzed.

## No Backchannels

Senses must not:

- communicate directly with actuators
- communicate directly with the Brain
- trigger execution
- short-circuit the lifecycle loop

All Sense output flows through:

- Experience logging
- The Nervous System
- The Brain (advisory only)

## Why This Matters

Most AI systems fail because perception quietly becomes judgment.

This contract ensures:

- the Brain sees reality as it is, not as pre-chewed
- learning happens safely
- bias is not baked in early
- failures are visible
- auditability is preserved

## Invariant Summary

The following must always hold:

- Senses observe only.
- Senses never judge.
- Senses never decide.
- Senses never suppress.
- Senses never optimize for “usefulness.”

If any of these are violated, the Body is no longer safe.

## Final Statement

The Senses layer exists to deliver truth without opinion.

Reality is messy.
The Brain is responsible for making sense of it.

This file exists to keep that responsibility where it belongs.

