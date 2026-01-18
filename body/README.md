# ALIVE Virtual Body — Architecture & Rules

## Purpose

The ALIVE Virtual Body is an independent embodied entity responsible for interacting with the external world on behalf of ALIVE-Core.

It provides:

- perception (inputs)
- execution (outputs)
- real-time operation
- experimentation and testing
- environmental interaction

It does not provide cognition, judgment, or authority.

The Body exists to protect the Brain while enabling learning through experience.

## Foundational Principle

The Body may act, but it may not decide what is right.
The Brain may decide what is right, but it may not act.

This separation is non-negotiable.

## What the Body Is

The Virtual Body is:

- an interface layer
- an execution layer
- a sensory aggregation layer
- a testing and experimentation harness
- a firewall between the Brain and reality

Biologically, it corresponds roughly to:

- spinal cord
- medulla
- peripheral nervous system

It can function autonomously at a mechanical level, but not at a normative level.

## What the Body May Do (Allowed)

The Body is explicitly allowed to:

- access the internet
- call LLMs
- query databases
- scrape or ingest external data
- run simulations or games
- interface with devices, sensors, or UIs
- execute procedures
- retry operations
- manage timing and real-time constraints
- cache domain-specific data
- crash and recover
- generate large volumes of experience

These actions are procedural, not cognitive.

## What the Body Must Never Do (Forbidden)

The Body must never:

- decide what is “right,” “wrong,” or “allowed”
- override or reinterpret Brain judgments
- invent goals or values
- mutate or delete experience
- suppress inconvenient events
- summarize experience for the Brain
- store identity or long-term meaning
- impersonate the Brain
- escalate its own authority

If the Body begins making value judgments, the system has failed.

## Internal Structure (Canonical)

```text
body/
├─ index.js                 # body lifecycle loop
├─ config/                  # body-only configuration
├─ senses/                  # perception modules
├─ environment/             # contextual state (time, network, etc.)
├─ knowledge/               # domain data & caches (disposable)
├─ events/                  # append-only experience logging
├─ actuators/               # execution mechanisms
├─ nervous-system/          # ONLY interface to the Brain
└─ README.md                # this document
```

## Knowledge vs Experience

### Body Knowledge

- domain-specific
- factual
- temporary
- replaceable
- discardable

Examples:

- research corpora
- game states
- caches
- indexes
- scraped data

### Experience

- append-only
- immutable
- authoritative
- shared with the Brain

Only experience crosses the Brain firewall.

## Event Logging (Mandatory)

Every meaningful interaction with the world must be logged as experience.

Rules:

- append-only
- deterministic shape
- no deletion
- no mutation
- no summarization at this layer

If it happened, it gets logged.

## The Nervous System (Firewall)

The directory `body/nervous-system/` is the only legal communication channel between Body and Brain.

### Body → Brain

May send:

- observations
- summaries of observations (non-normative)
- proposed intents
- environmental context

Must never send:

- executable code
- tool handles
- credentials
- callbacks
- file descriptors
- raw uncontrolled streams

### Brain → Body

May return:

- judgments
- constraints
- explanations
- eligibility descriptions
- warnings

Must never return:

- commands
- imperatives
- execution plans
- schedules
- callables

All communication is descriptive only.

## Non-Goals

The Virtual Body is not:

- an agent
- a planner
- a decision-maker
- a substitute for the Brain
- a shortcut around governance

Those are anti-patterns.

## Summary Guarantee

This architecture guarantees:

- safety under experimentation
- auditability under failure
- long-term stability
- reversible learning
- clean scaling to new domains

The Body is powerful.
The Brain is sovereign.
Neither replaces the other.

