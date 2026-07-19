# Router Reverse-Engineering Toolkit (Phased Plan)

Status: **architecture review — not execution-ready until gaps below are designed into packages**.  
Primary target: **ZTE F6600P** read-only MVP.  
Non-goals until safety gates exist: live Apply/writes, firmware upload, exploit tooling.

## Maturity assessment

The core direction (~70–75%) is sound: session abstraction, generic XML parsing, discovery, capture, type generation, SDK, Electron UI, multi-vendor layout.

**Not yet execution-ready** without the expansions in this document: full auth reverse engineering, safe-write controls, firmware-specific profiles, rollback/verification, provisional schema confidence, robust testing modes, credential security, and scanner rate limits.

Observed F6600P evidence (`OBJ_LOOPBACK_VLAN_ID`, Apply `VidStr`, `SessionTimeout` vs warm session) remains the reference case. See [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md).

---

## Target repository layout

```text
openrouterdesk/
├── apps/
│   ├── desktop/                 # OpenRouterDesk (product)
│   └── inspector/               # First-class RE workspace (lab)
├── packages/
│   ├── router-core/             # Session orchestration façade
│   ├── router-auth/             # Login strategies, crypto, lockout
│   ├── router-http/             # HttpClient, CookieJar, Request
│   ├── router-parser/           # ajax_response_xml_root / OBJ_*
│   ├── router-capture/          # Normalized CapturedExchange + redaction
│   ├── router-discovery/        # Broad static/dynamic endpoint discovery
│   ├── router-schema/           # Provisional field inference
│   ├── router-generator/        # Promote confident schemas → TS
│   ├── router-safety/           # Risk class, dry-run, backup, transaction
│   ├── router-testing/          # Fixtures, mock router, live harness
│   ├── router-sdk/              # Capability API (reads first)
│   └── shared/                  # Contracts, redaction helpers
├── vendors/
│   ├── zte/
│   │   ├── common/
│   │   ├── f6600p/
│   │   │   ├── firmware-v1/     # Firmware-level profiles
│   │   │   └── firmware-v2/
│   │   └── h3601p/
│   └── generic/
├── fixtures/
│   ├── responses/               # Sanitized XML/HTML bodies
│   └── captures/                # Redacted CapturedExchange sets
├── docs/
├── examples/
└── tests/
```

Migration note: keep current `src/` until packages exist. Do not big-bang restructure.

---

## Gap 1 — Authentication strategy (`router-auth` + `router-http`)

Highest priority. Without this, scanner/SDK fail unpredictably.

Required capabilities:

| Capability | Notes |
|---|---|
| Login page discovery | Locate login entry / scripts from root GUI |
| Challenge / nonce retrieval | e.g. `login_token` family |
| Password encryption / hashing | Match router JS (observed: SHA-256 + token; confirm per firmware) |
| RSA / AES handling | Port algorithms from router JavaScript; never invent crypto |
| Cookie persistence | `CookieJar` across requests |
| Session refresh / warm-up | `menuView` / page-entry before data tags |
| `SessionTimeout` in HTTP 200 | Body classification ≠ status code |
| Automatic re-login | Bounded retries; never tight loops |
| Logout | Always on session dispose |
| Login lockout protection | Backoff; surface lockout errors; no credential spraying |

```ts
const session = await createSession({
  host: "192.168.1.1",
  profile: "zte/f6600p/firmware-v1",
  username: "admin",
  password: "*****", // vault in desktop; never log
});

await session.login();
```

---

## Gap 2 — Safe write protection (`router-safety`)

Classify every operation:

| Class | Examples | Default |
|---|---|---|
| Read-only GET | inventory, VLAN list | Allowed when authorized |
| Safe POST | logout, language switch (profile-declared) | Allowlist only |
| Config-changing POST | Apply / `IF_ACTION=Apply` | Gated |
| Reboot / reset / firmware | reboot, restore, upload | Deny by default |
| Destructive | factory reset, flash | Deny; never auto-scan |

```ts
await router.applyChange(change, {
  dryRun: true,
  requireConfirmation: true,
  createBackup: true,
});
```

**Scanner must never automatically execute unknown POST endpoints.**

Aligns with [ADR 0003](decisions/0003-safe-write-operations.md).

---

## Gap 3 — Router capability profiles (`vendors/*`)

Do not assume all ZTE devices share fields. Profiles are **firmware-specific**:

```ts
interface RouterProfile {
  vendor: string;
  model: string;
  firmware: string;
  authStrategy: string;
  endpoints: EndpointDefinition[];
  quirks: string[]; // e.g. "session-warmup-via-menuView"
}
```

Example paths:

```text
vendors/zte/f6600p/firmware-v1/
vendors/zte/f6600p/firmware-v2/
vendors/zte/h3601p/v9/
```

---

## Gap 4 — Broader endpoint discovery (`router-discovery`)

`_tag=*.lua` alone is insufficient. Also scan for:

```text
_tag  _type  IF_ACTION  _InstID  OBJ_  ParaName
ajaxGet  ajaxPost  $.ajax  $.get  $.post  fetch
form action
```

Inspect: inline/external JS, hidden inputs, menu JSON, onclick handlers, dynamically built URLs, POST form serialization, iframe pages.

Authorized devices only; no brute-force credential or tag guessing.

---

## Gap 5 — Normalized capture format (`router-capture`)

```ts
interface CapturedExchange {
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string>;
  requestHeaders: Record<string, string>;
  requestBody?: Record<string, string>;
  status: number;
  contentType?: string;
  responseBody: string;
  sessionState: "valid" | "timeout" | "unknown";
}
```

Auto-redact at least: `password`, `SID`, `token`, `nonce`, `authorization`, and known cookie names. Prefer fixtures under `fixtures/captures/` over raw HARs in git.

---

## Gap 6 — XML parser edge cases (`router-parser`)

Must handle:

- Repeated / empty `OBJ_*` nodes (F6600P loopback already shows empties before a populated node)
- Repeated `Instance` nodes
- Missing `ParaValue`, duplicate `ParaName`
- Numerics as strings; booleans as `0/1`, `true/false`, or empty
- Malformed XML; non-XML HTML errors
- `SessionTimeout` bodies with status 200

---

## Gap 7 — Provisional schema inference (`router-schema`)

Do **not** promote `vlanCount: number` from one sample.

```ts
type InferredField = {
  observedTypes: Array<"string" | "number" | "boolean" | "empty">;
  required: boolean;
  samples: string[]; // redacted / bounded
  confidence: number;
};
```

`router-generator` promotes to stable SDK types only after enough observations + human/profile review.

---

## Gap 8 — Backup, verify, rollback (`router-safety`)

Before any live write:

1. Fetch current state  
2. Save request/response evidence (redacted)  
3. Diff  
4. Apply (only after confirmation)  
5. Read back + verify  
6. Rollback when possible  

```ts
const tx = await router.transaction();
await tx.snapshot("loopback-vlan");
await tx.apply(change);
await tx.verify();
await tx.commit();
```

---

## Gap 9 — Testing layers (`router-testing`)

| Mode | Where |
|---|---|
| Unit tests | parsers, redaction, auth crypto helpers with fixtures |
| Recorded-response tests | replay `CapturedExchange` / XML fixtures |
| Mock-router integration | fake transport in CI |
| Live-router tests | **opt-in only** |

```bash
RUN_LIVE_ROUTER_TESTS=true pnpm test:live
```

Normal CI must never modify a real router. See [TEST_STRATEGY.md](TEST_STRATEGY.md).

---

## Gap 10 — Inspector as first-class app (`apps/inspector`)

Lab workspace features:

- Network capture import  
- Endpoint list + risk level  
- XML tree viewer  
- Request replay (read-only by default)  
- Response diff  
- Session state  
- Generated TypeScript preview  
- Firmware / model metadata  
- Export to router profile  

Must not ship unrestricted write tooling in production desktop builds.

---

## Gap 11 — Electron security (`apps/desktop`)

- HTTP only in main process  
- `contextIsolation: true`, `nodeIntegration: false`  
- Strict IPC schemas; allowlisted channels  
- Encrypted credential vault; no password/SID logs  
- Restrict navigation / external URLs  

```ts
// Renderer — typed bridge only
window.routerApi.getLoopbackVlans();
```

Never send router HTTP from the renderer. See [THREAT_MODEL.md](THREAT_MODEL.md), [SECURE_STORAGE.md](SECURE_STORAGE.md).

---

## Gap 12 — Discovery boundaries

```ts
{
  maxRequests: 500,
  concurrency: 1,
  delayMs: 250,
  readOnly: true,
  allowTags: [],
  denyTags: ["reboot", "reset", "firmware", "restore"],
}
```

Routers are fragile; high concurrency can crash the web UI.

---

## Original phases (still valid, expanded)

### Phase A — Session + auth (`router-http`, `router-auth`, `router-core`)

Login, cookies, timeout detection, re-login, logout, lockout protection, warm-up.

### Phase B — Parser (`router-parser`)

Generic `OBJ_*` parse with edge cases above; unit tests from fixtures.

### Phase C — Discovery + scanner (`router-discovery`)

Broad static/dynamic discovery; **read-only** scanner with rate limits; emit `report.json`.

### Phase D — Capture + schema (`router-capture`, `router-schema`, `router-generator`)

Normalized exchanges; provisional inference; promote types carefully.

### Phase E — Safety + SDK (`router-safety`, `router-sdk`, `vendors/*`)

Read APIs first; writes only through `applyChange` / transactions.

### Phase F — Apps

`apps/desktop` consumes SDK via IPC. `apps/inspector` is the RE workspace.

---

## Practical implementation order

1. Sanitized `OBJ_LOOPBACK_VLAN_ID` fixture + warm-up capture (`CapturedExchange`).  
2. Parser + edge-case unit tests.  
3. Auth strategy for F6600P firmware profile (lab only).  
4. Read-only discovery/scanner with rate limits.  
5. Provisional schemas → cautious SDK reads in desktop.  
6. Inspector MVP (import capture, XML tree, endpoint list).  
7. Writes only after safety transaction + ADR 0003 gates.

---

## Related docs

- [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md)
- [API_REVERSE_ENGINEERING.md](API_REVERSE_ENGINEERING.md)
- [ROUTER_ADAPTER_CONTRACT.md](ROUTER_ADAPTER_CONTRACT.md)
- [TEST_STRATEGY.md](TEST_STRATEGY.md)
- [HLA.md](HLA.md)
- [THREAT_MODEL.md](THREAT_MODEL.md)
- [SECURE_STORAGE.md](SECURE_STORAGE.md)
- [decisions/0002-adapter-architecture.md](decisions/0002-adapter-architecture.md)
- [decisions/0003-safe-write-operations.md](decisions/0003-safe-write-operations.md)
- [decisions/0005-router-re-toolkit.md](decisions/0005-router-re-toolkit.md)
