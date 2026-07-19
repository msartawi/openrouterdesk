# API Reverse Engineering Guide

This guide applies only to routers the researcher owns or is authorized to administer.

## Principles

- Prefer browser developer tools and normal GUI actions.
- Capture only the requests necessary to understand a documented user action.
- Redact credentials, session identifiers, serial numbers, public IPs, MAC addresses, and household device names.
- Do not brute-force endpoints or credentials.
- Do not publish proprietary web bundles or firmware without permission.
- Separate observed facts from inferred behavior.

## Evidence record

For each endpoint record:

- Router model and exact firmware/build identifier.
- User role used.
- HTTP method and path.
- Content type.
- Required headers and token types, with values removed.
- Request field names and types.
- Response schema and sanitized fixture.
- Read or write classification.
- Failure behavior and session-expiry behavior.
- Confidence and source.

Prefer the normalized `CapturedExchange` shape (method, path, query, redacted headers/body, status, `sessionState`) described in [ROUTER_RE_TOOLKIT.md](ROUTER_RE_TOOLKIT.md). Auto-redact `password`, `SID`, `token`, `nonce`, and `authorization` before any commit.

For bulk menu/endpoint discovery, use the external local helper **`openrouter-capture`** (Playwright, discover/simulate/verify modes)—not the Electron app. Methodology: [OPENROUTER_CAPTURE.md](OPENROUTER_CAPTURE.md). Manual DevTools capture remains valid for single actions.

## F6600P currently observed

```text
GET  /?_type=loginData&_tag=login_token
GET  /?_type=loginData&_tag=login_entry
POST /?_type=loginData&_tag=login_entry
POST /?_type=loginData&_tag=logout_entry
POST /?_type=loginData&_tag=modeswitch_entry
GET  /?_type=hiddenData&_tag=accessdev_data&...
GET  /?_type=hiddenData&_tag=sntp_data
POST /?_type=hiddenData&_tag=switchlang_entry
GET  /?_type=menuView&_tag=<dynamic-tag>
```

The login JavaScript appears to derive a password value using a login token and SHA-256. The exact request contract must be captured from an authorized browser session and represented with sanitized fixtures before implementation.

### Confirmed object envelope: Loopback VLAN

Read responses can return XML objects such as `OBJ_LOOPBACK_VLAN_ID` with `_InstID`, `PortID`, `vlanCount`, and `VidStr` parameters.

Observed write Apply body fields:

```text
IF_ACTION=Apply
_InstID=...
PortID=...
VidStr=...
```

Treat Apply as a documented write API only. Implementation remains blocked until dry-run, approval, snapshot, and rollback gates exist.

### SessionTimeout vs successful object responses

HTTP 200 alone does not mean the payload is usable. Bodies may be session-timeout markers until a GUI page refresh / `menuView` re-establishes authenticated context, after which the same family of requests returns `OBJ_*` XML. Always record the preceding navigation when a data tag first succeeds.

For the full discovery/SDK plan (auto-enumerate tags, parse XML, generate models, map across ZTE siblings), see [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md) and [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md).

## Capture workflow

1. Start with a clean browser profile.
2. Open developer tools before login.
3. Preserve the network log.
4. Perform one GUI action only.
5. Export HAR locally.
6. Run the redaction checklist.
7. Derive a minimal sanitized fixture rather than committing the HAR.
8. Add parser tests before live integration.
