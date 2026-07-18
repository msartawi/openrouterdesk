# Project Plan

## Vision

OpenRouterDesk becomes a trustworthy, community-maintained desktop interface for routers whose stock management interfaces are incomplete or operator-limited. The app should improve visibility and safe administration without encouraging unsupported firmware changes or authentication bypasses.

## Workstreams

### 1. Platform and adapter SDK

- Stable router-adapter contract.
- HTTP/HTTPS transport with timeouts, session isolation, and certificate trust records.
- Parser fixtures and adapter capability discovery.
- Model and firmware fingerprinting.

### 2. Desktop experience

- Router profiles.
- Dashboard and health summary.
- Device inventory and topology.
- Firewall posture and VLAN planner.
- Backup, audit, diagnostics, and firmware research screens.

### 3. Safety and security

- Windows-protected credential storage.
- Read-only default and write approval state machine.
- Signed releases, provenance attestations, dependency review, and SBOM.
- Threat modeling, privacy, redaction, and responsible disclosure.

### 4. F6600P enablement

- Document current endpoints and authentication flow.
- Normalize connected-device data.
- Map menu tags and object IDs after authorized login.
- Identify safe backup/export operations.
- Build firewall and VLAN capability maps.
- Research firmware identification and recovery; no auto-flash in MVP.

## Phases

| Phase | Outcome | Exit criteria |
|---|---|---|
| 0 — Bootstrap | Buildable public repo | CI green; app launches; docs and security boundaries present |
| 1 — Read-only core | Safe live connection | Profile, probe, auth, logout, timeouts, credential vault |
| 2 — Inventory | Useful visibility | Connected-device inventory, topology, export, tests |
| 3 — Security posture | Actionable assessment | Firewall report, service exposure report, recommendations |
| 4 — Backup and diff | Recovery foundation | Encrypted/local snapshots, normalized diff, restore research |
| 5 — VLAN planning | Validated design | Capability detection, proposed config, dry-run and conflict checks |
| 6 — Controlled writes | Limited safe changes | Approval state machine, backups, verification, rollback |
| 7 — Firmware assistant | Evidence-driven updates | Exact matching, vendor verification, hash/signature checks, recovery plan |
| 8 — Multi-router ecosystem | Community adapters | Versioned adapter SDK, conformance suite, additional models |

## Governance

- Protected `main` branch.
- Required reviews and status checks.
- CODEOWNERS for security, release, adapters, and installer files.
- Maintainer approval for signing requests.
- Security-sensitive changes require two reviewers once the project has enough maintainers.
