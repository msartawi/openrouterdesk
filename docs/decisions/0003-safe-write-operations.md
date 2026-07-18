# ADR 0003: Approval-Gated Write Operations

- Status: Accepted
- Date: 2026-07-18

## Decision

No adapter method may perform a configuration write directly from UI intent. All writes must pass through the model-neutral safety orchestrator and its snapshot, diff, approval, execution, verification, and rollback record.

## Consequences

Implementation is slower but changes are auditable and recoverable. The MVP remains read-only.
