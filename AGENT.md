# AGENT.md — Coding-Agent Operating Contract

This document is binding for automated coding agents working in this repository.

## Mission

Develop OpenRouterDesk as a local-first, security-sensitive router-management desktop application. Favor correctness, recoverability, and explainability over speed.

## Non-negotiable rules

1. **Never guess firmware compatibility.** Exact model, hardware revision, board, region, operator customization, bootloader, and current firmware must be recorded before any update workflow can proceed.
2. **Read-only first.** New adapters start read-only. A write capability requires an ADR, tests, a risk review, a dry-run representation, explicit user confirmation, post-write verification, and a rollback path.
3. **No bypasses.** Do not add password guessing, hidden-account bypass, exploit code, Telnet unlocking, or authentication circumvention.
4. **No secrets in renderer.** Passwords, session cookies, CSRF/session tokens, certificate private keys, and raw configuration secrets remain in the main process or OS-protected storage.
5. **No secrets in logs.** Use the redaction utilities. Treat router responses as potentially sensitive.
6. **No remote code.** The Electron renderer loads packaged local resources only. Do not embed router pages or arbitrary websites in a privileged view.
7. **No unsafe TLS fallback.** Self-signed router certificates require explicit trust-on-first-use or a recorded fingerprint. Do not globally disable certificate validation.
8. **Validate IPC senders and inputs.** Every IPC handler must use an allowlisted channel, validate sender origin, validate payload shape, and return a typed result.
9. **Keep dependencies minimal.** A new runtime dependency requires justification in the PR. Prefer platform APIs and small audited packages.
10. **One concern per PR.** Keep changes reviewable and update tests and docs together.

## Required workflow

Before coding:

- Read `README.md`, `START_HERE.md`, this file, `docs/HLA.md`, `docs/THREAT_MODEL.md`, and relevant ADRs.
- Identify the active phase and acceptance criteria.
- Search for existing contracts before creating new ones.

During coding:

- Preserve main/preload/renderer separation.
- Parse all router data through adapter-owned schemas.
- Return domain errors, not raw stack traces, to the UI.
- Add unit tests for parsers and validation.
- Add integration tests using fixtures; never require a real router in CI.
- Keep network calls bounded by timeouts and cancellation.

Before finishing:

```bash
npm run check
```

Then confirm:

- No write capability was introduced accidentally.
- No sensitive value appears in fixtures, snapshots, logs, or docs.
- UI text accurately distinguishes observed facts from inferred data.
- Documentation and changelog entries are updated.

## Architecture boundaries

- `src/renderer`: presentation and user intent only. No direct network, filesystem, shell, credential, or Electron imports.
- `src/preload`: tiny typed bridge exposing allowlisted methods only.
- `src/main`: privileged orchestration, IPC, transport, storage, signing/update checks.
- `src/adapters`: model-specific protocol and normalization logic.
- `src/services`: model-neutral use cases and safety controls.
- `src/shared`: serializable types and validation contracts only.

## Write-operation state machine

Any future configuration write must follow:

```text
Draft → Validate → Snapshot → Present Diff → Explicit Approval
→ Execute → Verify → Record → Offer Rollback
```

A failed verification must produce a visible warning and preserve recovery information.

## Firmware state machine

```text
Identify → Collect Evidence → Match Candidate → Verify Vendor Source
→ Verify Hash/Signature → Confirm Recovery Path → Backup
→ User Approval → Upload → Monitor → Verify → Rollback/Recovery
```

The MVP stops before upload.

## Commit and PR conventions

Use Conventional Commits:

- `feat:` user-visible capability
- `fix:` defect correction
- `sec:` security hardening
- `docs:` documentation only
- `test:` tests only
- `refactor:` behavior-preserving change
- `build:` build/release changes
- `chore:` maintenance

PR descriptions must include: scope, security impact, test evidence, screenshots for UI changes, and rollback considerations.

## Prohibited shortcuts

- `nodeIntegration: true`
- `contextIsolation: false`
- `sandbox: false` without an approved ADR
- `webSecurity: false`
- `rejectUnauthorized: false` as a global or default behavior
- `shell.openExternal()` with unvalidated input
- `eval`, dynamic remote imports, or downloaded executable code
- storing passwords in JSON, SQLite plaintext, logs, or GitHub secrets used by forks
- executing router configuration writes from the renderer
- silently continuing after adapter/model mismatch

## Handling uncertainty

When information is missing, stop the risky path and create a clearly labeled evidence task. Do not convert uncertainty into a default that could alter or brick a device.
