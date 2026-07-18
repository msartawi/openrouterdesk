# Work Orchestration

## Agent roles

A single coding agent may perform multiple roles, but it must keep their outputs separate.

- **Planner:** converts a phase into small issues with acceptance criteria.
- **Researcher:** records observed router behavior and sanitized fixtures.
- **Implementer:** changes source code within approved scope.
- **Tester:** adds unit, integration, and security regression tests.
- **Reviewer:** checks architecture boundaries, secret handling, and risk.
- **Release steward:** verifies provenance, signing, hashes, and release notes.

## Issue-to-release flow

```text
Approved issue
→ implementation plan
→ branch
→ code + tests + docs
→ local checks
→ pull request
→ security/architecture review
→ CI
→ merge
→ release candidate
→ signing approval
→ signed release
→ verification and publication
```

## Work-package format

Every agent work package should contain:

- Goal.
- Non-goals.
- Files expected to change.
- Acceptance criteria.
- Security considerations.
- Test plan.
- Documentation impact.
- Rollback plan.

## Parallelism

Safe parallel tracks:

- UI components using mock data.
- Parser fixtures and tests.
- Documentation.
- CI and release hardening.

Avoid parallel changes to IPC contracts, adapter contracts, credential storage, and release signing without coordination.
