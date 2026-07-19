# openrouter-capture — Standalone API Discovery Helper

Status: **design / docs only — not implemented in this repository**.  
Role: internal **local development** Playwright helper to discover router APIs for OpenRouterDesk adapters.  
Placement: sibling project `c:\Projects\openrouter-capture\` (or equivalent). **Never** ship crawler source or raw captures inside the public OpenRouterDesk app tree.

See [ADR 0007](decisions/0007-standalone-capture-tool.md).

## Why a separate tool

OpenRouterDesk is the product. Discovery needs a Chromium crawler, form simulation, and guided write recording. Embedding that in the Electron app would blur security boundaries and risk publishing RE tooling.

```text
Automated read-only crawl (≈70–85%)
+ Guided write recorder
+ Safe verify (explicit only)
→ sanitized fixtures / catalogs for OpenRouterDesk
```

No single scraper can safely discover **every** write operation automatically. Auto-submitting every form could disable LAN, alter WAN credentials, enable DMZ, reboot, or reset the router.

## Hybrid model

| Layer | Purpose |
|---|---|
| Automated crawler | Menus, pages, scripts, read endpoints, XML/`OBJ_*`, fields, preliminary schemas |
| Guided recorder | One approved write scenario at a time |
| Safe test runner | Optional verify with read-back / restore |

### What can be collected automatically

After one manual login in visible Chromium:

- Complete menu tree; visit every router page  
- Download HTML and referenced JavaScript  
- Call discovered read endpoints (`menuData` / `menuView` / related `_type`s)  
- Save XML; extract `OBJ_*`, `_InstID`, `ParaName`, `ParaValue`  
- Extract form fields, select options, validation rules, `_sessionTOKEN`  
- Detect privilege-restricted pages  
- Build an initial endpoint catalog  
- Generate **preliminary** TypeScript schemas (labeled inferred)

Pattern search in page/script source (examples):

```text
?_type=menuView
?_type=menuData
_tag=
IF_ACTION
_InstID
OBJ_
ParaName
ParaValue
_sessionTOKEN
dataTransfer(
$.ajax(
```

Then crawl discovered tags automatically (read-only / rate-limited).

### What cannot safely be inferred from scraping alone

A page may show `IF_ACTION=Apply` and field names without proving:

- Which fields are required on write  
- Whether omitted fields are reset  
- Whether `_InstID=-1` means create  
- How deletion works; whether the token rotates  
- Semantics of enums (TCP/UDP, allow/deny, direction)  
- Whether apply disconnects the session or WAN  
- Whether one form submits an entire collection  
- Whether a button fires several sequential requests  

Therefore the crawler must **not** automatically submit every form.

---

## CLI shape (target)

```bash
openrouter-capture crawl \
  --router http://192.168.1.1 \
  --output ./captures/zte-f6600p \
  --mode discover

openrouter-capture crawl --mode simulate

openrouter-capture scenario security.dmz.enable --mode verify
```

Typical flow: open Chromium visibly → operator logs in → tool continues with the authenticated session.

### Operating modes

| Mode | Behavior | Risk |
|---|---|---|
| **discover** | Read pages/data, download scripts, **no POST** | Very low |
| **simulate** | Interact with forms; capture proposed writes; **abort before transmission** | Low |
| **verify** | Explicitly approved writes only; read-back; restore when possible | Controlled / real |

`--read-only` is an alias constraint for discover (and forbids verify).

---

## Phase 1 — Automatic read-only crawl (`discover`)

1. Open the router.  
2. Manual login.  
3. Capture authenticated Chromium session.  
4. Parse menu tree.  
5. Visit every menu page.  
6. Record network traffic.  
7. Download HTML and JavaScript.  
8. Call only known **read** endpoints.  
9. Parse XML.  
10. Produce a report.

### Output layout

```text
captures/zte-f6600p/
├── router.json
├── menu-tree.json
├── endpoints.json
├── objects.json
├── fields.json
├── pages/
├── scripts/
├── requests/
├── responses/
└── report.html
```

Raw output stays **local / gitignored**. Only hand-curated sanitized fixtures may later enter OpenRouterDesk.

### Endpoint catalog example

```json
{
  "id": "security.dmz",
  "viewTag": "firewall_dmz_t.lp",
  "dataTag": "firewall_dmz_lua.lua",
  "fields": [
    "_InstID",
    "Enable",
    "WANCViewName",
    "InternalClient"
  ],
  "actionsDetected": ["Apply", "Cancel"],
  "writeTested": false,
  "risk": "critical"
}
```

### Expected Stage 1 coverage

| Area | Approx. |
|---|---|
| Menus and pages | 90–100% |
| Read endpoints | 75–95% |
| Field names | 80–95% |
| Validation rules | 60–85% |
| Write payload guesses | 30–60% |
| Verified writes | 0% |

---

## Phase 2 — Static analysis + simulate

Parse HTML/JS for inputs, selects, and client validation (e.g. jQuery Validate rules). Generate **inferred** interfaces:

```ts
interface DmzConfigurationCandidate {
  enabled: boolean;
  wanInterface: string;
  internalClient: string;
}
```

Label as inferred, not confirmed.

### Simulated submission (abort POST)

For low-risk pages, interact without applying:

- Open dropdowns; enumerate options  
- Inspect hidden fields; trigger client-side validation  
- Change values locally; observe generated payloads  
- Intercept submission and **abort** before the router receives it  

```ts
await page.route("**/*", async (route) => {
  const request = route.request();
  if (request.method() === "POST") {
    saveProposedRequest(request);
    await route.abort();
    return;
  }
  await route.continue();
});
```

Improves write-payload discovery (~60–85%) without confirming router acceptance.

Denylist still applies: never auto-simulate pages matching blocked terms without explicit override.

---

## Phase 3 — Guided write recorder + verify

After crawl/simulate, show missing scenarios:

```text
DMZ
✓ Read  ✓ Fields  ✓ Validation
○ Enable  ○ Disable  ○ Change host

Port forwarding
✓ Read  ✓ Fields
○ Create  ○ Edit  ○ Delete  ○ Disable
```

Operator picks one scenario (e.g. Port Forwarding → Create rule). Browser opens the page; tool records while the operator performs **only that action**.

```text
Start scenario
→ perform one action
→ stop
→ automatic request diff
→ automatic response analysis
→ automatic read-back
```

For a CRUD module, often only create / edit / disable / delete once each are needed.

`verify` allows an approved write, then read-back and restore when possible. Never batch-auto-verify denylisted actions.

---

## Denylist (never auto-submit)

Block automatic submission when page/tag/action matches terms such as:

```text
reboot  restart  reset  restore  factory
firmware  upgrade
wan  password  credential
pon  loid  registration
```

Initially also require explicit approval for:

```text
LAN IP changes
DHCP disable
VLAN management-port changes
Firewall disable
Remote service changes
DMZ enable
```

Scanner rate limits (aligned with toolkit): low concurrency, delay between requests, `readOnly: true` by default, `maxRequests` cap.

---

## One-run experience (correct)

```text
One login
→ automatic full read-only crawl
→ automatic JavaScript/form analysis
→ automatic simulated submissions (abort POST)
→ generated missing-scenario checklist
```

Then only a small number of guided verify actions remain.

**Not** equivalent to one-click submit across all pages.

---

## Redaction and evidence

Prefer normalized `CapturedExchange` (see [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md)). Auto-redact at least: `password`, `SID`, `token`, `nonce`, `authorization`, session cookies.

Authorized routers only. No credential guessing. Separate observed vs inferred in every report field.

---

## Relationship to OpenRouterDesk

| Component | Role |
|---|---|
| **openrouter-capture** (external) | Discovers APIs; produces local capture trees |
| **OpenRouterDesk** | Consumes sanitized fixtures / catalogs in adapters |
| **apps/inspector** (optional, later) | May **import** redacted captures for browsing—not the crawler engine; not MVP |

Do not implement Chromium crawling inside the Electron renderer or as a published app feature in this repo.

---

## Implementation stages (future — outside this repo)

1. Stage 1: `crawl --mode discover` in sibling `openrouter-capture`  
2. Stage 2: `simulate`  
3. Stage 3: guided `scenario` + `verify`  

This document does not scaffold that project.

## Related docs

- [decisions/0007-standalone-capture-tool.md](decisions/0007-standalone-capture-tool.md)
- [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md)
- [API_REVERSE_ENGINEERING.md](API_REVERSE_ENGINEERING.md)
- [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md)
- [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md)
- [decisions/0003-safe-write-operations.md](decisions/0003-safe-write-operations.md)
