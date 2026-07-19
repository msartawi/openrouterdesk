# UX Principles

- Show facts, source, and confidence.
- Make dangerous actions visually distinct and multi-step.
- Present normalized diffs before changes.
- Explain service impact in plain language.
- Never hide a failed verification behind a success toast.
- Keep read-only exploration easy.
- Make backup and recovery status visible.
- Provide keyboard navigation and accessible contrast.
- Avoid jargon where a household user needs to make a decision.
- Prefer **Review changes** / **Apply safely** over one-click Apply.

## Visual direction

Product UI direction is **Spatial Network Console** (premium network OS feel, selective 3D, ORD Spatial UI). See [ORD_SPATIAL_UI.md](ORD_SPATIAL_UI.md). Design review only until implementation is scheduled; Electron security boundaries in [HLA.md](HLA.md) are non-negotiable.

## Main navigation

Align with the spatial shell rail (labels may evolve):

- Overview / Dashboard
- Network map (topology)
- Internet · LAN · Wi-Fi
- Devices
- VLANs
- Firewall · Port forwarding
- Diagnostics · Inspector
- Backups
- Settings

Also reachable via command palette (`Ctrl+K`): routers, devices, actions (risky actions warn and never run immediately).
