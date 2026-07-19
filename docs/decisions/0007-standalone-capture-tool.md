# ADR 0007: Standalone Capture Tool (External to the App)

- Status: Accepted
- Date: 2026-07-19

## Context

Discovering ZTE F6600P (and later sibling) web APIs needs a Playwright/Chromium crawler, form simulation with aborted POSTs, and guided write recording. Putting that engine inside the public OpenRouterDesk Electron app would mix product UI with reverse-engineering automation, increase the chance of shipping unsafe write tooling, and conflict with “local-only RE” practice.

## Decision

1. Build **`openrouter-capture`** as a **standalone local helper** (sibling project, e.g. `c:\Projects\openrouter-capture\`), not as `apps/inspector` and not as any package published inside the public `openrouterdesk` tree.
2. Document methodology and safety modes in this repository ([OPENROUTER_CAPTURE.md](../OPENROUTER_CAPTURE.md)); do **not** commit crawler source, cookies, HARs, or raw capture trees here.
3. Modes: `discover` (read-only) → `simulate` (abort POST) → guided `verify` (explicit only), with a hard denylist for destructive/WAN/credential/firmware-class actions.
4. OpenRouterDesk adapters consume **hand-curated sanitized fixtures** derived from captures. Optional future `apps/inspector` may import redacted captures for viewing only—it is not the crawler and is not MVP.
5. Agent/Cursor operating files remain gitignored; capture outputs use `captures/`, `research/private/`, and existing `*.har` ignores.

## Consequences

- Faster, safer API discovery without polluting the product repo.
- Operators maintain a second local project for Stage 1+ implementation.
- Public docs describe process only; secrets and live router dumps stay off GitHub.
