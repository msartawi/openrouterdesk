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

## P0-07: Loopback VLAN read fixture + OBJ_* parser spike

- Add a sanitized fixture for `OBJ_LOOPBACK_VLAN_ID` (see research notes / discovery framework).
- Record the exact `_type`/`_tag` and the preceding `menuView` sequence that avoids `SessionTimeout` bodies.
- Fixtures may be produced by external **`openrouter-capture`** (`discover` mode) then hand-curated into the app repo — see [OPENROUTER_CAPTURE.md](../OPENROUTER_CAPTURE.md). Do not commit raw capture trees or HARs.
- Implement a minimal XML `OBJ_*` instance parser with unit tests (seed of `router-parser` in [ROUTER_RE_TOOLKIT.md](../ROUTER_RE_TOOLKIT.md)).
- Expose read-only adapter capability only; do not POST Apply.

## P0 exit criteria

- CI green.
- App launches on Windows.
- NSIS development installer builds.
- Security boundaries covered by tests.
- No live write capability.
