# High-Level Architecture

## Context

```text
User
  │
  ▼
OpenRouterDesk Renderer (unprivileged React UI)
  │ typed, allowlisted IPC
  ▼
Electron Preload Bridge
  │
  ▼
Electron Main Process
  ├── Application services
  ├── Credential vault
  ├── Audit/redaction
  ├── Snapshot and diff engine
  ├── Router adapter registry
  └── Network transport
          │
          ▼
      Authorized local router
```

## Components

### Renderer

Displays normalized domain data and gathers user intent. It never contacts a router directly and never receives stored passwords, session cookies, private keys, or unredacted backup content.

### Preload

Exposes a minimal `window.openRouterDesk` API. Each method maps to one approved IPC use case. No generic `send`, `invoke`, filesystem, shell, or network method is exposed.

### Main process

Owns privileged operations, session state, credentials, transport, audit logging, and adapter execution. It validates IPC sender origin and payloads.

### Adapter SDK

Each adapter identifies compatible devices, handles model-specific authentication and parsing, reports capabilities, and returns normalized data. Adapters cannot directly update the UI.

Longer-term, adapters should consume a vendor-agnostic reverse-engineering toolkit (`router-core` / `router-parser` / `router-sdk`, with profiles under `vendors/…`). See [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md) and [ADR 0005](decisions/0005-router-re-toolkit.md). The current `src/adapters` tree remains until that migration starts.

### Safety orchestrator

Future write operations pass through validation, snapshot, diff, approval, execution, verification, and rollback records. Adapters provide model-specific implementation; orchestration remains model-neutral.

## Deployment

- Windows x64 first.
- NSIS installer for GitHub development releases.
- MSIX for Microsoft Store distribution.
- All public binaries signed through an approved signing path.
- GitHub Actions produces test evidence, checksums, SBOM, and provenance attestations.
