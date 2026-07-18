# ADR 0002: Model-Specific Adapter Architecture

- Status: Accepted
- Date: 2026-07-18

## Decision

All router-specific authentication, endpoint paths, parsing, and capabilities live behind a versioned adapter contract.

## Consequences

The UI and orchestration remain reusable, adapters are independently testable, and unsupported behavior fails closed. Some duplication between router families is acceptable in exchange for clear compatibility boundaries.
