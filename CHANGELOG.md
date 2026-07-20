# Changelog

All notable changes will be documented here.

## [0.1.1-rc.1] — 2026-07-20

### Added

- Safe main-process router transport (local IPv4 only, timeouts, size limits, no redirects, HTTPS fingerprint TOFU) — P0-05.
- F6600P root-page probe with sanitized fixture + FixtureTransport for CI — P0-06.
- Sanitized F6600P `OBJ_LOOPBACK_VLAN_ID` fixture and generic `OBJ_*` XML parser (P0-07).
- Read-only loopback VLAN normalization (`vlan.inventory.read` on F6600P adapter; offline/fixture only).

### Tester notes

- Unsigned NSIS build for local install testing only.
- App still defaults to **mock** dashboard mode (no live router traffic from UI yet).
- Configuration writes and firmware upload remain disabled.

## [Unreleased]

### Notes

- Initial Electron, React, and TypeScript scaffold.
- Security-first main/preload/renderer separation.
- Router-adapter contract and mock adapter.
- ZTE F6600P research notes and adapter placeholder.
- Project, MVP, architecture, signing, firewall, VLAN, topology, and release documentation.
- GitHub CI and unsigned release-candidate workflow.
