# Router Adapter Contract

## Purpose

Adapters isolate model-specific protocols from the rest of the application.

## Required adapter behavior

- Provide a stable ID and human-readable name.
- Probe without authentication where possible.
- Return compatibility confidence and evidence.
- Declare capabilities explicitly.
- Authenticate and logout without exposing secrets.
- Normalize read-only information into shared contracts.
- Reject unsupported writes.
- Bound response size and parsing time.
- Redact adapter diagnostics.

## Capability model

Capabilities are granular, for example:

- `device.inventory.read`
- `firewall.posture.read`
- `firewall.rules.write`
- `vlan.inventory.read`
- `vlan.plan.validate`
- `vlan.configuration.write`
- `config.snapshot.export`
- `config.restore.write`
- `firmware.identity.read`
- `firmware.upload.write`

An adapter must never infer a write capability from a visible menu alone.

## Conformance tests

Every adapter must pass:

- Probe does not alter router state.
- Authentication failures are typed and redacted.
- Parser rejects oversized and malformed inputs.
- Logout is attempted when a session is disposed.
- Unsupported writes fail closed.
- Fixtures contain no live secret or personal identifier.
