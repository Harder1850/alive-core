# ALIVE Core — Tick-Level Experience

## Definition

A single tick of the ALIVE spine represents one unit of lived experience.

An experience is defined as:
> The contents of the conscious workspace that survive arbitration
> and persist across a tick boundary.

## Properties of an Experience

An experience is:
- capacity-limited
- relevance-selected
- transient by default
- continuous across ticks

An experience is NOT:
- the full system state
- all inputs received
- memory contents
- background cognition output

## Experience Lifecycle

1. Inputs arrive (interfaces)
2. Ingress filters and compresses
3. Candidates compete in arbitration
4. Conscious workspace is updated
5. Egress demotes or discards contents
6. Tick advances

Only step 4 constitutes experience.

## Continuity

Continuity is preserved by:
- overlap of conscious contents across ticks
- not by persistence of memory
- not by replay of history

If nothing persists across ticks,
no experience occurred.

## Energy Implications

Because experience is:
- small
- selective
- transient

The system avoids:
- global recomputation
- full-context processing
- unnecessary memory access

Energy usage scales with relevance,
not input volume.

## Streaming

A live “experience stream” is:
- a projection of the conscious workspace per tick
- not a dump of system internals
- not a replay of memory

Streaming experience does not alter cognition.

---

## Canonical Authorization Denial Reasons (Phase 22)

The runtime records authorization outcomes using `intent_authorization_completed`.

Denial reasons are stable string codes that explain why an intent was not authorized.

Canonical reason codes (documented; not enforced here):

### Arbitration-stage elimination (Phase 20)
- `invalid_intent_shape`
- `constraint_violation`
- `exclusive_key_conflict`

### Authorization-stage denial (Phase 21)
- `not_explicitly_authorized`
- `missing_required_capability`
- `missing_capability_declaration`
- `capability_unavailable:<capabilityId>`
- `capability_explicitly_denied`
- `authorization_metadata_missing`
- `authority_boundary_violation`
- `authorization_scope_violation`
