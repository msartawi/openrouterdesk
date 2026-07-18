# Test Strategy

## Unit tests

- Router response parsers.
- Redaction.
- URL/local-target validation.
- Capability handling.
- Topology correlation.
- Change-plan validation.

## Integration tests

- Main-process use cases with fake transport.
- IPC sender and payload validation.
- Credential-vault behavior using test-safe abstractions.
- Session expiry and logout.
- Oversized/malformed response handling.

## End-to-end tests

On Windows CI or a controlled runner:

- App launch.
- Mock router profile flow.
- Renderer cannot access Node globals.
- Installer install/upgrade/uninstall.
- Signed artifact verification in release pipeline.

## Router compatibility tests

Real-router tests are opt-in and never run in public CI. They require explicit target authorization and must default to read-only operations.

## Security regression tests

- Navigation and new-window blocking.
- IPC channel allowlist.
- Secret redaction.
- TLS trust behavior.
- Public-address protection.
- Dependency and license review.
