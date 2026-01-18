# How the ALIVE Brain and Body Work Together

## Purpose of This Document

This document defines how the ALIVE Brain (ALIVE-Core) and the Virtual Body interact, and just as importantly, how they do not.

It exists to:

- prevent architectural drift
- guide contributors
- preserve safety guarantees
- make future scaling possible

## The Three-Layer Model

ALIVE is composed of three sovereign layers:

```text
[ Purpose ]
   ↓
[ Body ]
   ↓
[ Brain ]
```

Purpose defines why

Body defines how

Brain defines whether

Each layer protects the others.

## Role of the Brain (ALIVE-Core)

The Brain is the system’s cognitive authority.

It is responsible for:

- identity continuity
- reasoning and abstraction
- constraint enforcement
- explanation
- pattern recognition over experience

It does not:

- act
- execute
- access tools
- access sensors
- access the internet

The Brain is sovereign but non-executing.

## Role of the Body

The Body is the system’s embodied interface.

It is responsible for:

- perception
- execution
- real-time interaction
- experimentation
- domain adaptation

It does not:

- judge lawfulness
- define values
- reinterpret constraints
- mutate experience

The Body is executing but non-sovereign.

## The Firewall (Critical Invariant)

There is a hard firewall between Brain and Body.

No capability crosses the boundary.

Only data.

This prevents:

- coercion
- prompt injection
- runaway autonomy
- accidental execution authority

## Interaction Pattern (Canonical)

Body interacts with the world

Body logs experience

Body consults the Brain

Brain returns judgments and explanations

Body chooses how to act within constraints

Cycle repeats

The Brain is advisory.
The Body is responsible.

## Learning Without Authority

Learning in ALIVE means:

- improved judgment
- better abstraction
- stronger constraints
- clearer explanations

It does not mean:

- self-modifying code
- autonomous execution
- authority escalation

The Brain becomes wiser, not stronger.

## Why This Separation Works

Because it enforces three invariants:

- Authority ≠ Power
- Learning ≠ Acting
- Knowledge ≠ Identity

Most AI systems fail by violating one of these.

## Scaling Forward

With this architecture:

- new bodies can be added
- new purposes can be plugged in
- experiments can be run safely
- domains can be swapped
- execution can remain controlled

The Brain does not change.
The Body adapts.
The Purpose evolves.

## Final Principle

ALIVE is not an agent.
It is a governed cognitive substrate with embodied interfaces.

This document, together with the Brain constitution and Body rules, defines the system.

Any future change must preserve these boundaries.

