# Technical Design

## Runtime

- Electron main process: Node.js APIs, router network transport, OS integration.
- React renderer: local packaged UI only.
- TypeScript: strict mode throughout.
- electron-builder: NSIS and Store/MSIX packaging.

## Main-process modules

- `RouterProfileService`: CRUD for non-secret profile metadata.
- `CredentialVault`: DPAPI-backed secret encryption using Electron `safeStorage`.
- `AdapterRegistry`: selects adapters and reports confidence/capabilities.
- `RouterSessionManager`: session lifecycle, cookies/tokens, expiry, logout.
- `RouterTransport`: HTTP/HTTPS requests, timeouts, maximum response sizes, certificate policy.
- `InventoryService`: connected-device retrieval and normalization.
- `TopologyService`: graph construction and relationship confidence.
- `SnapshotService`: metadata, redaction, encryption, diff preparation.
- `SafetyOrchestrator`: future write state machine.
- `AuditLog`: append-only local event records with redaction.

## Data rules

- IPC data must be serializable and versioned.
- Adapter raw responses remain in the main process.
- Raw HTML/XML/JSON is parsed with bounded size and strict schemas.
- Unknown fields are preserved only in sanitized research exports.
- UI labels state source and confidence: `router-reported`, `locally-observed`, or `inferred`.

## Network controls

- Default target scope is RFC1918/ULA/local-link addresses.
- Public targets require an explicit advanced setting and warning.
- Redirects are disabled by default.
- DNS rebinding is mitigated by resolving and re-checking target addresses.
- Requests use per-operation timeout and cancellation.
- Self-signed HTTPS uses certificate fingerprint trust, not global TLS disablement.
- HTTP is supported only because many routers require it; the UI clearly warns that credentials may be exposed on the LAN.

## Error model

Errors returned to the renderer use stable codes:

- `PROFILE_INVALID`
- `TARGET_NOT_LOCAL`
- `ROUTER_UNREACHABLE`
- `TLS_UNTRUSTED`
- `ADAPTER_MISMATCH`
- `AUTH_FAILED`
- `SESSION_EXPIRED`
- `RESPONSE_INVALID`
- `CAPABILITY_UNSUPPORTED`
- `APPROVAL_REQUIRED`
- `WRITE_VERIFICATION_FAILED`

Raw exceptions remain in redacted diagnostic logs.
