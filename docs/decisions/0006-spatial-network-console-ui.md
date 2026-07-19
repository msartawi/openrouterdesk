# ADR 0006: Spatial Network Console UI

- Status: Accepted (design direction); **not implemented**
- Date: 2026-07-19

## Context

OpenRouterDesk must feel like a trustworthy network operating console, not a restyled CPE admin page. Topology, ports, and change-review are differentiators; heavy 3D on every control would hurt performance and clarity.

## Decision

1. Adopt the **Spatial Network Console** direction in [ORD_SPATIAL_UI.md](../ORD_SPATIAL_UI.md): dark flagship theme, ORD Spatial UI components, four-zone shell, command palette.
2. Use selective 3D (topology, device/port heroes) via Three.js/R3F; keep forms/tables/logs flat.
3. Configuration edits use side sheets and mandatory **change review** before apply (ADR 0003).
4. Inspector is a first-class lab surface with risk badges; default replay is read-only.
5. Prefer native modern CSS + Radix; avoid shipping a large general-purpose UI kit unless justified later.
6. No UI implementation in this ADR — documentation only until a UI phase is scheduled.

## Consequences

- Clear visual identity and safer config UX.
- Extra design/engineering cost for topology and port viz; acceptable as signature screens.
- Must still honor accessibility, reduced motion, and Electron isolation.
