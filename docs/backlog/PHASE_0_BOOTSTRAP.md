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

- [x] HTTP/HTTPS in main process (`FetchRouterTransport`).
- [x] Local-address checks (`resolveLocalRouterUrl` / private IPv4 only).
- [x] Timeout, cancellation, response-size bounds.
- [x] Certificate fingerprint trust record (TOFU memory/file stores).
- [x] No redirects by default (3xx returned without follow).
- [x] Fixture transport for CI.

## P0-06: F6600P probe

- [x] Detect root page signatures without authentication.
- [x] Return confidence/evidence.
- [x] Use sanitized fixtures and a fake transport in CI.

## P0-07: Loopback VLAN read fixture + OBJ_* parser spike

- [x] Add a sanitized fixture for `OBJ_LOOPBACK_VLAN_ID` (`fixtures/zte-f6600p/obj-loopback-vlan.xml`).
- [x] Implement a minimal XML `OBJ_*` instance parser with unit tests (`src/adapters/zte-f6600p/parseObjXml.ts`).
- [x] Normalize to `LoopbackVlan` domain rows; declare `vlan.inventory.read` (offline/fixture parse only).
- [ ] Record the exact `_type`/`_tag` + `menuView` warm-up sequence beside the fixture (metadata still open).
- [ ] Wire live read session once P0-05 transport exists — do not POST Apply.

## P0 exit criteria

- CI green.
- App launches on Windows.
- NSIS development installer builds.
- Security boundaries covered by tests.
- No live write capability.
