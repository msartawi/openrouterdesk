# Security Policy

## Reporting a vulnerability

Do not open a public issue for vulnerabilities that could expose router credentials, bypass authentication, execute code, alter network configuration, or compromise the release pipeline.

Until a dedicated security mailbox is published, use GitHub private vulnerability reporting for the repository.

Include:

- Affected version or commit.
- Impact and realistic attack scenario.
- Reproduction steps using sanitized data.
- Suggested mitigation, if known.
- Whether credentials, firmware, or signing infrastructure may be exposed.

## Supported versions

During pre-1.0 development, only the latest tagged release and `main` receive security fixes.

## Security boundaries

The app is an administrative tool. A compromised workstation, compromised router firmware, malicious adapter plugin, or compromised signing identity can defeat its protections. The project therefore minimizes privileges, signs releases, validates adapters, and keeps secrets outside the renderer.

See `docs/THREAT_MODEL.md` and `docs/SECURE_STORAGE.md`.
