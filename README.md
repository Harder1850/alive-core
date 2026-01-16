# alive-core

**A deterministic cognitive core for AI systems that persist, remember, and remain internally coherent across runs.**

alive-core is not a chatbot framework, not an agent swarm, and not a UI. It is the **irreducible nucleus** of a living AI system: a single authoritative loop that records experience, enforces invariants, and derives memory *after the fact*.

Most AI systems reboot as amnesiacs. alive-core refuses to forget.

## Project Status — Frozen at Phase 27

ALIVE Core is intentionally frozen at Phase 27.

Phases 23–27 establish a complete, deterministic, and auditable decision substrate without execution or authority.

The system can:

- record experience
- declare adapter identity
- validate receipts
- resolve eligibility
- describe adapter selection

The system cannot:

- execute intents
- invoke adapters
- authorize behavior
- schedule actions

Any work beyond Phase 27 (including execution or authorization) requires an explicit constitutional amendment.

---

## What Problem This Solves (Plain English)

Modern AI systems are fundamentally **stateless**:

* Restart the process → memory gone
* Fork the agent → identity fractured
* Inject tools → behavior drifts

alive-core fixes this by enforcing:

* **One spine** (authoritative cognition)
* **One experience stream** (append-only, immutable)
* **Derived memory** (never written directly)
* **Hard invariants** (identity and safety cannot be violated)

This is infrastructure for AI that must:

* Survive restarts
* Maintain continuity
* Be audited
* Be trusted

---

## Core Design Principles (Non‑Negotiable)

1. **Experience is primary**
   Everything that happens is recorded. Nothing is overwritten.

2. **Memory is derived, not written**
   Memory is compressed, summarized, and extracted *from experience*.

3. **The spine is singular**
   No competing loops. No swarm authority. No hidden autonomy.

4. **Invariants are enforced, not implied**
   Tests define what is impossible.

5. **Core ≠ Capabilities**
   Tools, UIs, agents, and automation live *outside* the core.

---

## High‑Level Architecture

```
┌────────────┐
│   Spine    │  ← single cognitive loop
└─────┬──────┘
      │ emits
┌─────▼──────────────┐
│ Experience Stream  │  ← append‑only log
└─────┬──────────────┘
      │ derives
┌─────▼────────┐
│   Memory     │  ← summaries, patterns, relevance
└─────┬────────┘
      │ informs
┌─────▼────────────┐
│ Capabilities /   │  ← tools, adapters, UIs (external)
│ Adapters         │
└──────────────────┘
```

The spine **never mutates memory directly**.
The experience stream is the source of truth.

---

## Repository Structure

```
spine/          # Authoritative cognitive loop (locked)
experience/    # Append-only experience recorder
memory/        # STM / LTM derivation logic
procedures/    # Declarative actions (no autonomy)
runtime/       # Boot, lifecycle, shutdown
kernel/        # Invariants, contracts, registries
tests/         # Invariant enforcement (identity, safety)
```

If a folder is locked, it stays locked.

---

## Quick Start (Minimal)

```ts
import { AliveCore } from 'alive-core';

const core = new AliveCore({
  persistencePath: './alive-data'
});

await core.start();

core.recordExperience({
  type: 'system',
  message: 'Core awakened'
});

console.log(core.status());
```

**Expected behavior:**

* A new experience entry is appended
* No memory is directly written
* Restarting the process resumes from prior experience

---

## Experience vs Memory (Critical Distinction)

**Experience**

* Immutable
* Ordered
* Lossless
* Auditable

**Memory**

* Derived
* Compressed
* Fallible
* Replaceable

If memory is wrong, regenerate it.
If experience is wrong, your system is broken.

---

## Invariants (Why This Is Safe)

alive-core enforces invariants via tests, not promises:

* No experience deletion
* No direct memory mutation
* No parallel spines
* No autonomous execution
* No hidden IO

If an invariant fails, the system **must not boot**.

---

## What This Is NOT

* ❌ Not a chatbot
* ❌ Not an agent swarm
* ❌ Not auto‑GPT
* ❌ Not self‑executing
* ❌ Not magical

This is **infrastructure**, not a personality.

---

## Who This Is For

* Engineers building long‑running AI systems
* Researchers studying continuity and identity
* Safety‑critical automation designers
* Anyone tired of amnesiac AI

---

## Status

**Experimental, opinionated, and intentionally constrained.**

If you want fast hacks, look elsewhere.
If you want something that can last years, welcome.

---

## Next Docs (Planned)

* Spine contract (formal)
* Experience schema
* Memory derivation algorithms
* Adapter interface spec
* Recovery & replay semantics

---

Built to stay alive.
