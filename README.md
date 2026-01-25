# ALIVE Core

## Purpose
`alive-core` defines the **identity, continuity, and constitutional constraints** of the ALIVE system.

This repository is intentionally **execution-free**.

Core answers the question:
> “What is ALIVE, and what is it never allowed to do?”

## Responsibilities
- Identity & continuity
- Constitutional invariants
- Phase definitions (high-level)
- Audit ledger (canonical)

## Explicit Non-Responsibilities
Core does **not**:
- Execute code
- Access the filesystem
- Run background loops
- Process live input
- Make decisions
- Perform planning

## Execution Boundary
All execution authority lives in **alive-body**.
All cognition lives in **alive-system**.

Core may be referenced by other repos, but **never calls outward**.

## Canonical Audit Ledger
Cross-repo constitutional audits are recorded here:

- `CONSTITUTIONAL_AUDITS.md`

This file is append-only.

## Status
- Frozen by design
- Changes require constitutional justification
- Stable foundation for all other repos
