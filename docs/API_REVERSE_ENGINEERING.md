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

## Capture workflow

1. Start with a clean browser profile.
2. Open developer tools before login.
3. Preserve the network log.
4. Perform one GUI action only.
5. Export HAR locally.
6. Run the redaction checklist.
7. Derive a minimal sanitized fixture rather than committing the HAR.
8. Add parser tests before live integration.
