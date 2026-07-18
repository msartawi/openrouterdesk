# Project Manifest

## Working title

**OpenRouterDesk** — public, local-first Windows router-management application with the ZTE F6600P as the first adapter.

## Included

- Electron + React + TypeScript desktop scaffold.
- Windows NSIS packaging configuration.
- Microsoft Store/AppX configuration template.
- Strict main/preload/renderer privilege separation.
- Mock adapter and F6600P read-only adapter placeholder.
- DPAPI-backed credential-vault foundation.
- CI and unsigned release-candidate workflows.
- GitHub artifact-attestation step.
- Agent operating contract and Phase 0 backlog.
- Architecture, MVP, project, orchestration, API research, firmware, firewall, VLAN, topology, privacy, threat-model, testing, signing, and release documentation.
- MIT license and public-repository community files.

## Validation performed before packaging

```text
npm install --ignore-scripts   PASS (0 reported npm vulnerabilities)
npm run typecheck              PASS
npm run test                   PASS (2 tests)
npm run build                  PASS
```

The Windows NSIS installer itself must be validated on a Windows build environment because this starter was packaged in a Linux build container.

## First commands after import

```bash
npm install
npm run check
npm run dev
```

On Windows:

```powershell
npm run dist:win
```

## First coding task

Follow `docs/backlog/PHASE_0_BOOTSTRAP.md`, beginning with `P0-01`. Do not implement firmware upload or live configuration writes during Phase 0.
