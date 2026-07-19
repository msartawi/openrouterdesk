# OpenRouterDesk

OpenRouterDesk is an open-source Windows desktop application for safely discovering, documenting, backing up, and managing supported home and small-lab routers through model-specific adapters.

The first target adapter is the **ZTE F6600P** family. The project is designed so additional router models can be added without changing the desktop UI.

> Status: architecture and MVP starter. Live configuration writes and firmware flashing are intentionally disabled until the relevant adapter, backup, validation, and recovery gates are implemented.

## Why this project exists

Consumer-router interfaces are often incomplete, operator-customized, difficult to audit, and inconsistent between firmware versions. OpenRouterDesk aims to provide:

- A clear inventory and network-topology view.
- Read-only router discovery and configuration export.
- Safe, reviewable configuration changes.
- Firewall and VLAN planning with explicit validation.
- Firmware research and update assistance without unsafe model guessing.
- A reusable adapter SDK for other router models.
- Reproducible, signed public releases.

## Technology choice

The starter uses **Electron + React + TypeScript** and packages Windows installers with **electron-builder**.

Electron was selected for the first release because it has the lowest contribution barrier for a public repository, strong Windows installer support, and a mature code-signing ecosystem. The security boundary is strict: the renderer has no Node.js access, router traffic is handled only in the Electron main process, IPC is allowlisted, and all write operations require a separate approval workflow.

See [ADR 0001](docs/decisions/0001-electron.md) for the decision and alternatives.

## Start here

1. Read [START_HERE.md](START_HERE.md).
2. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) before contributing.
3. Install Node.js 24 LTS or the version declared in `.nvmrc`.
4. Run:

```bash
npm install
npm run dev
```

5. Run validation before committing:

```bash
npm run check
```

6. Build an unsigned local Windows installer on Windows:

```powershell
npm run dist:win
```

Unsigned builds are for development only. Public releases must follow [docs/WINDOWS_INSTALLER_SIGNING.md](docs/WINDOWS_INSTALLER_SIGNING.md).

## Initial scope

### MVP

- Router profile creation and local-only credential storage.
- Safe reachability and model probing.
- F6600P login/session research implementation.
- Read-only device inventory.
- Connected-device list and topology graph.
- Configuration snapshot metadata and export framework.
- Firewall posture report.
- VLAN design assistant and dry-run plan.
- Audit log with redaction.

### Not in MVP

- Automatic firmware flashing.
- Hidden-account discovery or password bypass.
- Enabling locked Telnet/FTP services.
- Background exploitation, vulnerability scanning, or credential guessing.
- Automatic configuration writes without user review.
- Cloud collection of router credentials or network inventory.

## Repository map

```text
src/
  main/                 Electron privileged process
  preload/              Minimal typed IPC bridge
  renderer/             React UI; no Node.js access
  adapters/             Router model adapters
  services/             Credential vault, audit, backup, validation
  shared/               Shared contracts and validation types

docs/                   Architecture, plans, security, research
                        (start with START_HERE.md; F6600P API notes in
                        docs/RESEARCH_NOTES_F6600P.md and
                        docs/ZTE_API_DISCOVERY_FRAMEWORK.md)
.github/                 CI, release, issue and PR templates
scripts/                 Reproducible build and verification scripts
```

## Security principles

- Local-first and offline-capable.
- No telemetry by default.
- No credentials in logs, exports, screenshots, issues, or crash reports.
- Read-only by default.
- Every write has plan → diff → validation → explicit approval → execution → verification → rollback record.
- Firmware images must be identified by exact hardware, region, board, and operator compatibility.
- The renderer never receives stored passwords or session secrets.
- No remote web content is loaded into privileged windows.

## Code-signing policy

The preferred public distribution path is a Microsoft Store **MSIX** package because Store-distributed MSIX packages are signed by Microsoft and avoid SmartScreen download warnings. For GitHub releases, the project should apply to the SignPath Foundation open-source program or use an OV Authenticode certificate with protected signing infrastructure. GitHub artifact attestations are additional provenance and do not replace Authenticode.

See [docs/WINDOWS_INSTALLER_SIGNING.md](docs/WINDOWS_INSTALLER_SIGNING.md).

## License and trademarks

Code is licensed under the MIT License. “ZTE” and router model names are used only for compatibility identification. This project is not affiliated with or endorsed by ZTE or any ISP. See [TRADEMARKS.md](TRADEMARKS.md).
