# Contributing to ALIVE Core

## Spine Freeze Policy

The `/spine` directory defines the authoritative cognitive core of ALIVE.

Changes to `/spine` are **exceptional**, not routine.

Any change to `/spine` MUST:
1. Explicitly reference affected invariants by number
2. Pass all invariant tests
3. Justify why the change does not introduce:
   - blocking behavior
   - additional authority
   - hidden loops
   - memory side-effects

If a change "makes things easier" but weakens an invariant,
the change is wrong.

## Guiding Rule

Violating invariants is a bug,
even if tests pass.

## Constitutional Constraints

Contributors must not:

- add execution logic
- add invocation paths
- add authorization semantics
- wire adapters to runtime

Any work proposing execution must:

- reference a future Phase 28+
- be rejected unless explicitly authorized

ALIVE Core is not an agent framework. It is a governed cognitive substrate.
