# ADR 0005: Vendor-Agnostic Router RE Toolkit

- Status: Accepted
- Date: 2026-07-19

## Context

F6600P captures show a reusable `_type` / `_tag` / `OBJ_*` XML pattern and a session warm-up quirk (`SessionTimeout` until menu context is established). Building only a one-off F6600P client would force a redesign when adding other ZTE models or vendors.

## Decision

1. Adopt a phased reverse-engineering toolkit: session → generic XML parser → discovery → scanner → (gated) POST recorder → type generator → SDK → desktop app. Details: [ROUTER_RE_TOOLKIT.md](../ROUTER_RE_TOOLKIT.md).
2. Name shared packages **`router-*`**, not `zte-*`. Put model quirks under `vendors/<vendor>/<model>/`.
3. Keep OpenRouterDesk UI vendor-agnostic; main process consumes the SDK/adapters only.
4. Ship read paths first. Generated Apply/write APIs remain disabled until ADR 0003 safety gates exist.
5. Defer monorepo folder migration until Phase 1–2 packages exist; do not block MVP research on a full tree move.

## Consequences

- Faster coverage across ZTE siblings once discovery works.
- Clearer security boundary: recorder/generator are lab tools; production desktop stays read-first.
- Slightly more upfront structure than a single `src/adapters/zte-f6600p` folder, paid back when the second model appears.
