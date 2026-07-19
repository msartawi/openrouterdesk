# Router Reverse-Engineering Toolkit (Phased Plan)

Status: accepted research architecture (not implemented).  
Primary target: **ZTE F6600P** read-only MVP.  
Non-goals until safety gates exist: live Apply/writes, firmware upload, exploit tooling.

## Review summary

This plan is the right shift away from page-by-page reverse engineering. Keep these constraints:

| Keep | Change / caution |
|---|---|
| Shared session + generic XML parser first | Prefer **vendor-agnostic** package names (`router-*`), not `zte-*` |
| Endpoint discovery + scanner for coverage | Run only on routers you own/are authorized to admin; no credential guessing |
| Type/SDK generation for speed | Generated write methods stay **stubs or dry-run** until ADR 0003 gates |
| Electron UI talks only to SDK | Main process owns transport/credentials; renderer never sees XML or secrets |
| F6600P as reference profile | Other ZTE / vendors are mapping work later, not MVP scope |

Observed F6600P evidence (`OBJ_LOOPBACK_VLAN_ID`, Apply `VidStr`, `SessionTimeout` vs warm session) remains the reference case. See [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md).

---

## Target repository layout

Vendor-agnostic core with per-vendor profiles (preferred over `zte-*` packages):

```text
openrouterdesk/
├── apps/
│   ├── desktop/                 # OpenRouterDesk Electron app
│   └── inspector/               # Optional local RE / discovery UI (dev)
├── packages/
│   ├── router-core/             # HTTP, cookies, session, login, retries
│   ├── router-parser/           # Generic ajax_response_xml_root / OBJ_* parser
│   ├── router-sdk/              # Capability-oriented API (list/get; writes gated)
│   ├── router-discovery/        # Tag crawler + endpoint scanner
│   ├── router-recorder/         # Authorized Apply/POST capture → stubs
│   ├── router-generator/        # Fixtures → TypeScript interfaces
│   └── shared/                  # Shared contracts / redaction helpers
├── vendors/
│   ├── zte/
│   │   ├── f6600p/              # First profile
│   │   └── h3601p/              # Later
│   ├── huawei/                  # Later
│   ├── nokia/                   # Later
│   └── tp-link/                 # Later
├── docs/
├── examples/
└── tests/
```

Migration note: the current tree (`src/main`, `src/adapters`, …) stays until packages are carved out. Do not big-bang restructure before Phase 1–2 work.

---

## Phase 1 — Router session engine (`router-core`)

Auth and HTTP only:

```text
packages/router-core/
  HttpClient.ts
  CookieJar.ts
  Session.ts
  Login.ts
  Request.ts
```

Example:

```ts
const router = new RouterSession({
  host: "192.168.1.1",
  username: "admin",
  password: "*****", // never log; vault in desktop app
});

await router.login();
```

Requirements specific to F6600P observations:

- Detect `SessionTimeout` (or equivalent) bodies that still return HTTP 200.
- Support **session warm-up** via documented `menuView` / page-entry sequences before data tags.
- Local-address checks, timeouts, response-size bounds, TOFU/fingerprint for HTTPS.
- No secrets in logs.

---

## Phase 2 — Generic XML parser (`router-parser`)

ZTE (and similar) responses share a shape:

```xml
<ajax_response_xml_root>
  <IF_ERRORID>...</IF_ERRORID>
  <OBJ_XXXX>
    <Instance>
      <ParaName>...</ParaName>
      <ParaValue>...</ParaValue>
    </Instance>
  </OBJ_XXXX>
</ajax_response_xml_root>
```

One parser for all endpoints:

```ts
parse(xml) → {
  success: boolean;
  errorId?: string;
  objects: {
    OBJ_LOOPBACK_VLAN_ID: Array<{
      _InstID: string;
      PortID: string;
      vlanCount: number | string;
      VidStr: string;
    }>;
  };
}
```

Vendor profiles may normalize types (`VidStr` → `vids: number[]`) in the SDK layer.

---

## Phase 3 — Endpoint discovery (`router-discovery`)

Do not hardcode hundreds of Lua tags. After authorized login:

```text
GET /
  → parse HTML / menu scripts
  → extract _tag=*.lua (and related tags)
  → store { tag, menu, page }
```

Example output:

```json
{
  "tag": "loopback_vlan_lua.lua",
  "menu": "Network",
  "page": "Loopback"
}
```

Rules: normal GUI assets only; no brute-force of tags; sanitize before commit.

---

## Phase 4 — Endpoint scanner (`router-discovery`)

For each discovered tag, issue authorized reads such as:

```text
GET /?_type=menuData&_tag=XXXX
```

(and other observed `_type` families: `menuView`, `hiddenData`, …)

Record status/body class: `200`, `404`, `403`, `SessionTimeout`, XML `OBJ_*`, HTML.

Emit `report.json`:

```json
{
  "tag": "loopback_vlan_lua.lua",
  "status": 200,
  "object": "OBJ_LOOPBACK_VLAN_ID",
  "instances": 1
}
```

---

## Phase 5 — POST recorder (`router-recorder`)

On authorized Apply clicks, capture POST bodies and generate **SDK stubs**:

```ts
// Generated stub — live Apply disabled until write-safety gates
router.loopback.save({ /* fields */ });
```

Never auto-enable live writes from recordings. Store redacted fixtures + field maps only.

---

## Phase 6 — Type generator (`router-generator`)

From observed ParaName sets, generate interfaces, e.g.:

```ts
export interface LoopbackVlan {
  portId: string;
  vlanCount: number;
  vidStr: string;
}
```

Prefer generating from sanitized fixtures in CI, not from live routers.

---

## Phase 7 — SDK (`router-sdk` + `vendors/*`)

Capability-shaped API:

```ts
await router.loopback.list();
await router.wifi.list();
await router.dhcp.get();
await router.firewall.rules();
await router.portForward.list();
```

Write-shaped methods (`update` / `save` / `enable`) exist only behind capability flags and ADR 0003 gates. Unsupported operations fail closed.

---

## Phase 8 — OpenRouterDesk (`apps/desktop`)

```text
UI  →  SDK (via main/IPC)  →  Router
```

The UI never sees XML, cookies, or passwords. Inspector (`apps/inspector`) is optional and must not ship privileged write tooling in production builds by default.

---

## Implementation order (practical)

1. Sanitized fixtures for `OBJ_LOOPBACK_VLAN_ID` + session warm-up sequence.  
2. Phase 2 parser + unit tests (works offline).  
3. Phase 1 session against F6600P (authorized lab only).  
4. Phase 3–4 discovery/scanner → coverage report.  
5. Phase 6 types for confirmed read objects.  
6. Wire read-only paths into the desktop adapter.  
7. Phase 5/7 writes only after snapshot/diff/approval/rollback exist.

---

## Related docs

- [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md)
- [API_REVERSE_ENGINEERING.md](API_REVERSE_ENGINEERING.md)
- [ROUTER_ADAPTER_CONTRACT.md](ROUTER_ADAPTER_CONTRACT.md)
- [HLA.md](HLA.md)
- [decisions/0002-adapter-architecture.md](decisions/0002-adapter-architecture.md)
- [decisions/0003-safe-write-operations.md](decisions/0003-safe-write-operations.md)
- [decisions/0005-router-re-toolkit.md](decisions/0005-router-re-toolkit.md)
