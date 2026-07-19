# ZTE API Discovery Framework

Status: research direction (not yet implemented).  
Scope: authorized reverse engineering of ZTE home-gateway web UIs, starting with **ZTE F6600P**.  
Non-goal for MVP: live configuration writes or firmware upload.

## Why this exists

Manual page-by-page capture does not scale. Observed F6600P traffic uses a consistent query-driven pattern (`_type`, `_tag`, XML object envelopes). Once that pattern is reliable, a discovery framework can:

1. Enumerate authenticated menu/API tags through normal GUI navigation.
2. Classify responses as read XML vs write Apply forms.
3. Generate sanitized fixtures and TypeScript models.
4. Feed a ZTE family adapter used by OpenRouterDesk.

OpenRouterDesk stays model-agnostic at the UI layer. Adapters map discovered `_tag` / object names onto shared capabilities. Additional ZTE models (for example F660, F680, F670, H3601P, ZXHN variants) become mapping work once the discovery pipeline exists — they are **not** first-class MVP targets.

## Confirmed F6600P pattern (Loopback VLAN)

Observed object: `OBJ_LOOPBACK_VLAN_ID`.

### Read

Authenticated GET returns XML instances with parameters:

| Parameter | Meaning |
|---|---|
| `_InstID` | Object instance ID (example: `DEV.LOOP.VLAN1`) |
| `PortID` | Bridge port ID (example: `DEV.BRIDGING.BR1.BRPORT5`) |
| `vlanCount` | Number of VLANs assigned |
| `VidStr` | VLAN list (`1` or comma-separated when multiple) |

### Write (observed; do not implement live until write-safety gates)

```text
IF_ACTION=Apply
_InstID=DEV.LOOP.VLAN1
PortID=DEV.BRIDGING.BR1.BRPORT5
VidStr=1
```

SDK-shaped target (read-first):

```ts
interface LoopbackVlan {
  instId: string;
  portId: string;
  vlanCount: number;
  vids: number[];
}

// Read
router.loopback.getVlans(): Promise<LoopbackVlan[]>;

// Write — gated; dry-run / approval required before any live POST
router.loopback.setVlans(input: {
  portId: string;
  vids: number[];
}): Promise<void>;
```

Internally, a write would POST `VidStr` as a comma-separated list (example: `1,20,30`). OpenRouterDesk must still follow the write state machine in `AGENT.md` / ADR 0003 before enabling this path.

## Session behavior insight

Many authenticated requests returned HTTP 200 with a `SessionTimeout` (or equivalent session-expired) body until a later request suddenly returned `OBJ_LOOPBACK_VLAN_ID`.

Interpretation (hypothesis until more fixtures exist):

- The failure mode is often **stale or incomplete authenticated context**, not a random timeout.
- Some GUI pages appear to refresh or re-establish session/context before dependent API calls succeed.
- Login reverse-engineering remains necessary, but discovery should also capture **page-entry / menuView sequences** that warm the session before data tags are requested.

## Proposed SDK layout

Prefer **vendor-agnostic** packages (`router-core`, `router-parser`, `router-sdk`, …) with `vendors/zte/f6600p/` profiles — not a hard `zte-*` monorepo. Full phased plan: [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md) and [ADR 0005](decisions/0005-router-re-toolkit.md).

Illustrative capability modules (implemented behind the SDK, not in the Electron renderer):

```text
network/  lan, wan, vlan, dhcp
wifi/     radio, guest, wps
firewall/ acl, nat, portforward
diagnostics/ ping, traceroute
system/   reboot, backup, firmware
discovery/ enumerateTags, parseXmlObjects, generateModels
```

OpenRouterDesk consumes this through adapters; it does not embed raw router pages or privileged browser automation in the renderer.

## Discovery pipeline

```text
Authorized GUI session
  → capture menuView / hiddenData / loginData traffic (sanitized)
  → classify: login | read-xml | apply-write | unknown
  → parse OBJ_* envelopes into parameter maps
  → emit fixtures + TypeScript interfaces
  → map tags → adapter capabilities
  → enable read paths in OpenRouterDesk
  → only later: gated write paths
```

### Evidence rules

- Prefer normal GUI actions over guessed URLs.
- Redact credentials, session cookies, serials, public IPs, MACs, and household names.
- Separate observed facts from inferred behavior in every fixture.
- Never commit live HARs with secrets; commit redacted minimal XML/JSON fixtures only.
- Do not brute-force credentials or publish proprietary firmware dumps.

### Multi-model strategy

1. Keep F6600P as the reference implementation.
2. Treat `_tag` / `OBJ_*` names as the stable discovery surface across ZTE siblings.
3. Per-model adapters declare capability confidence from evidence, never from menu labels alone.
4. Reject unsupported writes closed.

## Immediate backlog (docs → fixtures → parsers)

1. Capture sanitized read fixture for `OBJ_LOOPBACK_VLAN_ID`.
2. Document the exact GET URL/`_type`/`_tag` that returned it.
3. Capture the preceding menuView / page-load sequence that restored a working session.
4. Build a shared XML `OBJ_*` parser with unit tests.
5. Enumerate additional authenticated tags via GUI navigation (LAN, WAN, Wi‑Fi, firewall, system).
6. Keep writes disabled in the app until ADR 0003 gates exist for VLAN Apply.

## Related docs

- [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md) — phased toolkit + preferred monorepo layout
- [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md)
- [API_REVERSE_ENGINEERING.md](API_REVERSE_ENGINEERING.md)
- [ROUTER_ADAPTER_CONTRACT.md](ROUTER_ADAPTER_CONTRACT.md)
- [VLAN_HOME_LAB_DESIGN.md](VLAN_HOME_LAB_DESIGN.md)
- [decisions/0002-adapter-architecture.md](decisions/0002-adapter-architecture.md)
- [decisions/0003-safe-write-operations.md](decisions/0003-safe-write-operations.md)
- [decisions/0005-router-re-toolkit.md](decisions/0005-router-re-toolkit.md)
