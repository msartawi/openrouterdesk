# Start Here

This file is the recommended entry point for maintainers and contributors.

## Project objective

Build a trustworthy Windows desktop application that manages supported routers through explicit adapters, beginning with the ZTE F6600P. The app must prioritize safe inspection, backups, and explainable changes over feature speed.

## First implementation sequence

1. Make the existing scaffold build and run on Windows.
2. Keep the mock adapter as the default and add tests around IPC boundaries.
3. Implement a read-only HTTP transport in the Electron main process.
4. Implement F6600P probe and login-token parsing from captured, sanitized samples.
5. Add an authenticated read-only session with automatic logout.
6. Retrieve and normalize connected-device information.
7. Render the first topology view.
8. Add encrypted credential storage and redacted audit logs.
9. Implement configuration snapshot export.
10. Only then design write operations, firewall changes, VLAN changes, and firmware workflows.

## Definition of safe progress

A change is safe when:

- Tests cover the behavior.
- No credential or token crosses into the renderer.
- Router responses are treated as untrusted input.
- No destructive command is invoked by a read-only feature.
- Error messages are useful but redact secrets.
- An adapter failure cannot crash the whole application.
- Documentation and an ADR are updated when architecture changes.

## Immediate next work

Start with the tasks in `docs/backlog/PHASE_0_BOOTSTRAP.md`, one pull request at a time. Do not implement router writes or firmware upload until the write-safety gates exist.
