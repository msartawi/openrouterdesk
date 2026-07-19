# OpenRouterDesk — Spatial Network Console

Status: **UI/UX direction (design review — not implemented)**.  
Product feel: a premium **network operating system**, not a cloned router admin webpage.

```text
Modern desktop control center
+ 3D network visualization (selective)
+ Premium industrial design
+ Clean professional data presentation
```

Not childish 3D, not gaming RGB, not heavy glassmorphism everywhere.

## Review summary

| Keep | Caution |
|---|---|
| Four-zone shell + command palette | Ship signature screens before full 3D polish |
| Change review (“Review changes” → “Apply safely”) | Aligns with ADR 0003; never one-click Apply |
| Inspector as DevTools + API lab | Lab-first; risk badges; no blind POST replay |
| Native CSS + Radix + selective R3F | Three.js only for topology/device/ports — not buttons/forms |
| Dark as flagship theme | Light mode is a first-class alternate, not inverted dark |
| Electron security unchanged | Renderer never does router HTTP; strict IPC |

**Five signature screens for v1 visual identity:** spatial dashboard, interactive topology, 3D port manager, safe change review, API inspector.

---

## Visual identity

- Deep graphite background; soft black / titanium surfaces  
- Accent: electric cyan (primary) or violet (accent pack)  
- Green = healthy; amber = warning; red = failure / destructive only  
- Fine glow on active elements; subtle depth; soft grid/noise  
- Rounded corners, not pill-heavy  

### Flagship palette

```css
:root {
  --bg-0: #07090d;
  --bg-1: #0b0e14;
  --bg-2: #111620;

  --surface-1: rgba(20, 26, 38, 0.82);
  --surface-2: rgba(28, 36, 50, 0.72);
  --surface-3: rgba(40, 49, 66, 0.56);

  --border-soft: rgba(255, 255, 255, 0.08);
  --border-active: rgba(110, 210, 255, 0.42);

  --text-primary: #f4f7fb;
  --text-secondary: #a7b0c0;
  --text-muted: #687386;

  --accent: #63d5ff;
  --accent-strong: #17b8ff;

  --success: #42e6a4;
  --warning: #ffbf5a;
  --danger: #ff5f6d;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --shadow-panel:
    0 20px 70px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  --motion-fast: 120ms;
  --motion-normal: 220ms;
  --motion-slow: 420ms;
  --ease-standard: cubic-bezier(.2, .8, .2, 1);
  --ease-spring: cubic-bezier(.18, .89, .32, 1.28);
}
```

### Accent packs

`Ion Cyan` (default) · `Infra Violet` · `Signal Green` · `Ozzmo Red` · `Titanium`

### Light theme

Not pure white: warm off-white background, frosted pale-gray surfaces, dark graphite text, cool blue accent, fine shadows instead of heavy glow.

---

## Application shell (four zones)

```text
┌─────────────────────────────────────────────────────────────┐
│ Title bar / global search / router state / account          │
├────────────┬───────────────────────────────────┬────────────┤
│ Navigation │ Main workspace                    │ Context    │
│ rail       │                                   │ inspector  │
├────────────┴───────────────────────────────────┴────────────┤
│ Activity / jobs / notifications / connection state          │
└─────────────────────────────────────────────────────────────┘
```

### Left navigation rail

Icons (collapse = icons only; expand = labels + status dots):

Overview · Network map · Internet · LAN · Wi-Fi · Devices · VLANs · Firewall · Port forwarding · Diagnostics · Inspector · Backups · Settings

Active item: slightly elevated (`translateX`), soft accent gradient, restrained glow.

---

## Dashboard

Must answer immediately: internet online? router healthy? client count? Wi-Fi healthy? anything unusual? what changed recently?

### Hero

Center: branded abstract 3D router chassis (soft reflections, signal rings, glowing ports). Subtle pointer parallax — **no constant spin**.

Around it: WAN status, latency, uptime, CPU, memory, firmware, active clients, VLAN count, alerts.

---

## Network map (signature)

Spatial topology canvas with floating nodes (depth, not neon tunnels).

Per-device card: icon, hostname, IP, MAC, interface, signal, traffic, VLAN, trust level. Click → bring forward + open context inspector.

Modes:

| Mode | Shows |
|---|---|
| Logical | VLANs, subnets, firewall boundaries, DHCP |
| Physical | Ports, switches, wireless, mesh |
| Traffic | Restrained flow pulses on activity |

---

## Router port visualization (F6600P)

Stylized 3D rear panel: PON · LAN1–4 · TEL · USB. Hover shows link/speed/IP/VLAN/traffic. Selected port eases outward a few pixels in perspective.

---

## Configuration UX

Prefer modular cards over long admin forms. Edit opens a **side sheet**, not a full navigation away.

Primary CTA label: **Review changes** (not Apply).

### Change review (premium infrastructure feel)

Before apply: current vs proposed diff, impact copy, automatic snapshot notice → **Apply safely**.

After apply: progressive verification checklist (snapshot → accepted → responded → read back → verified). Never hide failed verification behind a success toast ([UX.md](UX.md)).

---

## Inspector UI

DevTools × API laboratory. Three columns: **Endpoints | Request/Response | Parsed Schema**.

- Endpoint list with method, tag, status, risk badge: `Read-only` · `Write` · `Potentially destructive` · `Unknown`  
- Request tabs: Headers · Query · Body · Raw · Replay (read-only default)  
- Response tabs: XML tree · Normalized JSON · Raw · Diff · Generated types  

Aligns with [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md). Live crawling is external [OPENROUTER_CAPTURE.md](OPENROUTER_CAPTURE.md); the in-app Inspector (if built) imports redacted captures only.

---

## 3D vs flat rules

**Use depth/3D for:** router/device viz, topology nodes, ports, selected cards, modals/sheets, major status objects.

**Keep flat for:** tables, forms, text, settings, logs, dense technical data.

---

## Motion

Communicate state: lift on hover, node advances on select, port glow when up, soft traffic pulse, sheet enter with depth, progressive apply steps, disconnected nodes fade back.

Respect `prefers-reduced-motion` (near-zero animation durations).

---

## CSS approach

Prefer native modern CSS over heavy UI kits:

- Custom properties, nesting, container queries, subgrid  
- `color-mix()`, `backdrop-filter`, `@property`  
- View Transitions, anchor positioning, scroll-driven animation as **progressive enhancement only**

Container queries: cards adapt to panel width in Electron. Subgrid: align metrics across nested cards.

Example (illustrative):

```css
.router-card {
  container-type: inline-size;
  position: relative;
  overflow: clip;
  padding: 1.25rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015)),
    var(--surface-1);
  backdrop-filter: blur(18px) saturate(130%);
  box-shadow: var(--shadow-panel);
  transition:
    transform var(--motion-normal) var(--ease-standard),
    border-color var(--motion-normal) var(--ease-standard),
    box-shadow var(--motion-normal) var(--ease-standard);

  &:hover {
    transform: perspective(900px) translateY(-4px) rotateX(1deg);
    border-color: var(--border-active);
  }
}

@container (width < 360px) {
  .router-card__metrics {
    grid-template-columns: 1fr;
  }
}
```

---

## Design system: ORD Spatial UI

Core components:

`SpatialPanel` · `StatusOrb` · `MetricTile` · `DeviceNode` · `TopologyLink` · `PortIndicator` · `CommandPalette` · `ContextSheet` · `ChangeReview` · `RiskBadge` · `XMLViewer` · `ActivityTimeline` · `HealthRing` · `SignalMeter` · `TrafficSparkline`

### Command palette (`Ctrl+K`)

Search routers, pages, devices, actions. Risky commands warn and never execute immediately.

### Onboarding

Discover router · Enter address · Import profile · Open Inspector. After probe: model/firmware/capabilities checklist → **Connect securely**.

---

## Technology (renderer)

```text
React + TypeScript
CSS Modules or vanilla-extract
Radix primitives (a11y)
Motion library for complex transitions
Three.js / React Three Fiber — topology & device models only
SVG for most icons and charts
```

Electron: `contextIsolation`, no Node in renderer, typed preload bridge only. See [Electron security tutorial](https://electronjs.org/docs/latest/tutorial/security).

CSS references: [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries), [subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid), [view transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition), [scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations).

---

## Desired feeling

```text
You are controlling a living network,
not editing an old router webpage.
```

## Related docs

- [UX.md](UX.md) — product UX principles (facts, confidence, safe writes)
- [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md) — inspector / capture / safety
- [HLA.md](HLA.md) — renderer/main boundaries
- [decisions/0003-safe-write-operations.md](decisions/0003-safe-write-operations.md)
