# Contributing

Thank you for helping make router management safer and more transparent.

## Before opening a pull request

- Read `AGENT.md` and `docs/THREAT_MODEL.md`.
- Open or reference an issue for non-trivial work.
- Keep adapters read-only unless the write-safety requirements are fully met.
- Use sanitized fixtures rather than live credentials or complete private configurations.
- Run `npm run check`.

## Pull requests

A PR must state:

- What changed and why.
- Security impact.
- Test evidence.
- Router models and firmware versions involved.
- Whether behavior is observed, inferred, or unverified.
- Rollback or compatibility considerations.

## Reverse-engineering contributions

Only submit information collected from devices you own or are authorized to administer. Do not submit credentials, authentication bypasses, proprietary firmware images, or personal network inventories.
