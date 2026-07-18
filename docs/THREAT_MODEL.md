# Threat Model

## Assets

- Router administrator credentials.
- Session cookies/tokens.
- Router configuration and provisioning data.
- Home/work device inventory and topology.
- Signing identity and release pipeline.
- User trust in proposed configuration changes.

## Threat actors

- Malicious content returned by a compromised router.
- Local malware or another user on the workstation.
- Network attacker on an untrusted LAN.
- Compromised dependency or GitHub workflow.
- Malicious or careless contributor.
- Incorrect adapter or firmware identification.

## Major threats and mitigations

### Router response compromises renderer

Mitigation: parse in main process; do not render raw HTML; no Node integration; strict CSP; schema validation; size bounds.

### IPC exposes privileged operations

Mitigation: minimal preload bridge, sender validation, typed payloads, no generic IPC forwarding.

### Credential theft

Mitigation: DPAPI-backed `safeStorage`, no renderer exposure, redaction, short-lived session state.

### Man-in-the-middle against HTTP router UI

Mitigation: warn clearly, restrict to local networks, prefer HTTPS with fingerprint trust, avoid remote networks, recommend wired management where possible.

### Wrong firmware bricks device

Mitigation: exact identity evidence, official-source verification, backup/recovery gates, no auto-flash in MVP.

### Unsafe firewall/VLAN change locks out user

Mitigation: dry-run, conflict analysis, management-path protection, snapshot, staged rollout, post-change verification, rollback.

### Supply-chain compromise

Mitigation: protected branches, dependency review, minimal dependencies, lockfile, reproducible CI, SBOM, Authenticode/MSIX signing, artifact attestations, signing approval separation.

## Residual risk

No desktop application can make unsupported firmware or incomplete vendor APIs safe. The app must surface uncertainty and stop risky workflows rather than implying certainty.
