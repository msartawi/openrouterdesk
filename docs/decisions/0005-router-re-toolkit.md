# ADR 0005: Vendor-Agnostic Router RE Toolkit

- Status: Accepted (architecture); **not execution-ready** until toolkit gaps are packaged
- Date: 2026-07-19
- Updated: 2026-07-19

## Context

F6600P captures show a reusable `_type` / `_tag` / `OBJ_*` XML pattern and a session warm-up quirk (`SessionTimeout` until menu context is established). An initial phased plan covered ~70–75% of the needed architecture but omitted authentication depth, write safety, firmware profiles, capture normalization, provisional schemas, testing modes, inspector scope, Electron credential rules, and scanner rate limits.

## Decision

1. Adopt the reverse-engineering toolkit described in [ROUTER_RE_TOOLKIT.md](../ROUTER_RE_TOOLKIT.md), including the twelve execution gaps.
2. Name shared packages **`router-*`** (split auth/http/capture/schema/safety/testing as needed). Put quirks under `vendors/<vendor>/<model>/<firmware>/`.
3. Production **`apps/desktop`** stays read-first with strict IPC. Optional later **`apps/inspector`** may import redacted captures for viewing only—it is **not** the discovery crawler and is not MVP.
4. Live Chromium crawl / simulate / guided verify runs in external **`openrouter-capture`** ([OPENROUTER_CAPTURE.md](../OPENROUTER_CAPTURE.md), [ADR 0007](0007-standalone-capture-tool.md)), never as published app code in this repository.
5. Authentication reverse engineering is a blocker for reliable discovery/SDK work.
6. Scanners are read-only by default, rate-limited, and must never auto-POST unknown endpoints.
7. Schema inference stays provisional until confidence + profile review; writes use backup/diff/verify/rollback (`router-safety`, ADR 0003).
8. Defer monorepo migration until early packages exist; do not block fixture/parser spikes on a full tree move.

## Consequences

- Stronger, safer foundation than an F6600P-only prototype.
- More packages and upfront design before “execution-ready.”
- Live router tests remain opt-in and out of default CI.
- Discovery automation stays out of the public product tree (ADR 0007).
