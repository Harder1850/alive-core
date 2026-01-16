You can paste this verbatim into docs/brain/SPINE.md.

# ALIVE Spine — Constitutional Definition

**Status:** Ratified  
**Scope:** Authoritative  
**Change Control:** Spine Amendment Proposal (SAP) only

---

## 1. Purpose

The ALIVE Spine is the **authoritative cognitive core** of the ALIVE system.

It exists to:
- maintain identity over time
- enforce continuity of experience
- arbitrate intent deterministically
- provide a stable substrate for all higher cognition

The Spine is **not intelligence itself**.  
It is the **lawful structure that intelligence must pass through**.

---

## 2. Definition

The Spine is a **single, continuous, deterministic loop** that advances in discrete ticks.

Each tick represents **one unit of lived experience**.

There is:
- exactly one Spine
- exactly one active tick at a time
- no parallel decision authority

---

## 3. Core Invariants (Non-Negotiable)

The following invariants **must hold at all times**.

Violation of any invariant is a system failure.

### I1 — Single Authority
There is exactly **one Spine**.
No other module may decide, override, or bypass it.

### I2 — Non-Blocking
The Spine **never blocks**.
It always completes a tick, either successfully or with an explicit failure.

### I3 — Deterministic Arbitration
Given identical inputs and state, the Spine produces identical outcomes.

No randomness is permitted inside the Spine.

### I4 — Explicit Failure
All failures are:
- surfaced
- recorded
- attributable

Silent failure is forbidden.

### I5 — Experience Continuity
Experience persists across restarts.
The system does not reset identity when powered down.

### I6 — No Side Effects
The Spine itself performs **no external actions**.
It authorizes actions but does not execute them.

### I7 — Temporal Authority
The Spine is the **only place where “now” exists**.
All other modules are temporally downstream.

---

## 4. What the Spine Is NOT

The Spine is not:

- a language model
- a planner
- a memory store
- a task executor
- a plugin host
- a background agent system
- a knowledge base
- a UI
- an API façade

Any attempt to turn the Spine into any of the above is a violation.

---

## 5. Inputs

The Spine accepts **structured intents only**.

All inputs must be:
- explicit
- validated
- attributable to a source

Unrecognized or malformed intents are rejected via constraint enforcement.

---

## 6. Constraints

Constraints are **first-class law** inside the Spine.

A constraint:
- may veto an intent
- may abort a tick
- may not mutate state

Constraint violations:
- halt further intent execution
- are returned immediately
- are recorded as experience

---

## 7. Tick Lifecycle

Each Spine tick proceeds in strict order:

1. **Ingress**
   - Receive intents
   - Normalize and validate

2. **Constraint Evaluation**
   - Enforce all active constraints
   - Abort on first violation

3. **Arbitration**
   - Select survivable intents
   - Resolve conflicts deterministically

4. **Conscious Workspace Update**
   - Admit selected content
   - Enforce capacity limits

5. **Egress**
   - Emit authorized decisions
   - Produce tick result

6. **Experience Recording**
   - Persist what survived the tick boundary

---

## 8. Experience

An experience is defined as:

> The contents of the conscious workspace that survive arbitration and persist across a tick boundary.

Experience is:
- append-only
- immutable
- capacity-limited
- relevance-selected

Experience is **not memory**.

---

## 9. Memory

Memory is **derived**, not stored.

The Spine does not:
- summarize
- consolidate
- recall

Memory systems operate **downstream** of experience.

---

## 10. Capabilities

The Spine does not assume power.

It queries available capabilities and authorizes their use.

Capabilities:
- may appear or disappear
- may fail
- may be local or remote

The Spine remains unchanged regardless.

---

## 11. Plugins and Adapters

Plugins, adapters, sensors, models, and tools:

- exist outside the Spine
- may never modify Spine state directly
- may never bypass arbitration
- may never execute without authorization

They are **replaceable**.

The Spine is not.

---

## 12. Evolution Policy

The Spine **may evolve**, but only under the following conditions:

- A written Spine Amendment Proposal (SAP) exists
- The amendment states purpose, risk, and scope
- The amendment is explicitly approved by the System Architect
- The amendment is versioned and recorded

No automatic self-modification is permitted.

---

## 13. Authority

Final authority over the Spine rests with:

**The System Architect**

No agent, model, plugin, or external system may alter the Spine independently.

---

## 14. Summary (Binding)

The Spine is:

- singular
- deterministic
- explicit
- continuous
- conservative
- lawful

All intelligence in ALIVE must pass through it.

Anything that bypasses it is not ALIVE.

---

**End of Constitutional Definition**

---

## Phase 21 — Authorization (Frozen Constitutional Boundary)

**Status:** Ratified & Frozen  
**Scope:** Brain Authority Ceiling

Phase 21 is ratified.

Authorization is the final authority ceiling.

The Brain may:
- authorize
- deny
- explain

The Brain may not:
- execute
- schedule
- retry
- route
- invoke capabilities
- mutate authority

Authorization is:
- deterministic
- synchronous
- single-tick
- side-effect-free

Explicit denial is a valid, stable outcome.

Any modification to Phase 21 semantics requires a Spine Amendment Proposal (SAP).

---

### SAP-021 — Freeze Authorization Boundary (Phase 21)

Status: Ratified  
Type: Constitutional Freeze  
Scope: Brain Authority

This amendment freezes Phase 21 Authorization as the maximum authority the Brain may exercise.
Authorization may allow or deny intents but may never execute them.

Any expansion of Brain authority beyond authorization requires a new Spine Amendment Proposal.

---

## Phase 24 — Execution Adapter Receipt Contract (Frozen)

**Status:** Ratified  
**Scope:** Constitutional  
**Authority:** Spine-adjacent (Experience Boundary)  
**Change Control:** Spine Amendment Proposal (SAP) required

### Purpose

Phase 24 defines the **constitutional execution boundary** for ALIVE.

It establishes that:
- Execution adapters are **inert**
- Execution is **not authority**
- Execution artifacts are **validated experience**, not actions

This phase exists to ensure that *no system claiming to be ALIVE may execute, imply execution, or accept execution artifacts without strict validation and auditability*.

---

### Constitutional Guarantees

Under Phase 24, the following guarantees are binding:

1. **No Execution Authority**
   - Execution adapters **do not execute**
   - They do not invoke procedures, capabilities, hardware, or services
   - They are passive recipients only

2. **Receipt-Only Semantics**
   - Execution adapters may only emit **receipt artifacts**
   - Receipts describe *what was presented*, not *what was done*

3. **Schema-Enforced Receipts**
   - All execution adapter receipts **must conform** to a ratified schema
   - Malformed receipts are constitutionally invalid and must be rejected

4. **Experience Is the Only Output**
   - Execution adapter receipts are recorded as immutable experience
   - No downstream behavior may be triggered by their presence

5. **Determinism and Auditability**
   - Receipt validation is deterministic
   - Validation failures are explicit and attributable
   - Silent acceptance is forbidden

---

### Canonical Receipt Event

Phase 24 ratifies the following event as the **only valid execution adapter artifact**:

- **Event Type:** `execution_adapter_received`

This event:
- records adapter receipt only
- carries no executable handles
- carries no implicit authority
- cannot cause action

Any deviation from the canonical schema constitutes a constitutional violation.

---

### Explicit Prohibitions

Under Phase 24, the following are explicitly forbidden:

- Executing authorized intents
- Routing intents to procedures
- Invoking capabilities
- Treating adapter receipts as success signals
- Introducing execution side effects
- Adding autonomy at the adapter layer

---

### Amendment Rule

**Any modification to Phase 24 semantics requires a Spine Amendment Proposal (SAP).**

No runtime, plugin, adapter, or agent may weaken or bypass this boundary without explicit ratification.

---

### Binding Statement

Phase 24 establishes that:

> **ALIVE may acknowledge execution without performing it.**

This boundary is permanent unless amended by constitutional process.

---

What to Do Next (Exact)

Save this as:
docs/brain/SPINE.md

Commit with a message like:

docs(spine): ratify ALIVE Spine constitutional definition


Do not change it casually.
