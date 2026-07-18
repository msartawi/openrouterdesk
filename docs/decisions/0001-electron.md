# ADR 0001: Electron for the Initial Desktop Application

- Status: Accepted
- Date: 2026-07-18

## Context

The project needs a Windows desktop application, installer packaging, public contributors, rapid UI development, and local network/API access. Alternatives considered were .NET/WPF or WinUI, Avalonia, Tauri, and Electron.

## Decision

Use Electron + React + TypeScript for the initial implementation, with electron-builder for Windows packaging.

## Rationale

- Lowest entry barrier for web and open-source contributors.
- Mature Windows installer and Authenticode integration.
- Strong tooling for typed UI and rapid iteration.
- Main/preload/renderer architecture can provide a clear privilege boundary when configured correctly.

## Security conditions

- Keep Electron on a supported current release.
- Local packaged renderer only.
- `nodeIntegration: false`.
- `contextIsolation: true`.
- `sandbox: true`.
- Strict CSP and navigation restrictions.
- Router traffic and credentials only in main process.
- Minimal dependencies and routine security updates.

## Consequences

The application bundle is larger than native alternatives and inherits Chromium/Node dependency maintenance. A later rewrite is possible because the adapter and domain contracts are UI-framework independent.
