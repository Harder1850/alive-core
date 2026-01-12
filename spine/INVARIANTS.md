# ALIVE Spine Invariants
Non-Negotiable Cognitive Contracts

This document defines the invariants of the ALIVE Spine.
Any change that violates these rules is a cognitive bug, even if tests pass.

Invariant 1: There Is Exactly One Spine
There must be one and only one authoritative cognitive loop.
No other module may define its own “main loop,” scheduler, or awareness state.

Invariant 2: The Spine Never Blocks
The spine must never:
- perform disk I/O
- perform network I/O
- wait on promises or futures
- call external models
- sleep or delay

Invariant 3: Consciousness Is Capacity-Limited
The conscious workspace has a fixed maximum capacity.
Retention is determined by priority, not time.

Invariant 4: All Information Is Filtered on Entry
No raw input enters consciousness.
Most input must be discarded.

Invariant 5: Memory Is Queried, Not Accessed
Memory is never treated as RAM.
There is no transparent paging.

Invariant 6: Background Cognition Is Advisory Only
Unconscious processes may suggest.
They may not mutate spine state or trigger actions.

Invariant 7: No Action Without Reintegration
All actions must pass through the conscious stream.

Invariant 8: Forgetting Is the Default
Information decays unless actively justified.

Invariant 9: Latency Is Contained
Slow thinking is allowed.
Blocking awareness is not.

Invariant 10: Identity Is Preserved by Continuity
The spine maintains narrative continuity.
Background systems may restart.
