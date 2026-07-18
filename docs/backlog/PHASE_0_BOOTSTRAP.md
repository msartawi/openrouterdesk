# Phase 0 Backlog — Bootstrap

Each item should normally be a separate pull request.

## P0-01: Validate Windows development environment

- Confirm Node 24, npm, and Windows SDK prerequisites.
- Run `npm install`, `npm run check`, `npm run dev`, and `npm run dist:win` on Windows.
- Document any corrections.

## P0-02: Add unit-test baseline

- Test URL/local-target validation.
- Test IPC sender validation.
- Test mock adapter probe and inventory.

## P0-03: Add local profile persistence

- Store non-secret profile metadata under Electron user data.
- Validate schema and migrate by version.
- Do not store passwords yet.

## P0-04: Implement credential vault

- Use Electron `safeStorage`.
- Expose save/delete/exists operations, not secret retrieval, to the renderer.
- Add tests around abstraction boundaries.

## P0-05: Implement safe router transport

- HTTP/HTTPS in main process.
- Local-address checks, timeout, cancellation, response-size bounds.
- Certificate fingerprint trust record.
- No redirects by default.

## P0-06: F6600P probe

- Detect root page signatures without authentication.
- Return confidence/evidence.
- Use sanitized fixtures and a fake transport in CI.

## P0 exit criteria

- CI green.
- App launches on Windows.
- NSIS development installer builds.
- Security boundaries covered by tests.
- No live write capability.
