# Release Process

## Channels

- `nightly`: optional unsigned developer builds; never promoted as trusted releases.
- `beta`: signed prereleases for testers.
- `stable`: signed, reviewed releases.
- Microsoft Store: preferred stable Windows channel.

## Steps

1. Confirm CI, tests, dependency review, and security checks pass.
2. Update version and changelog.
3. Create a signed tag from protected `main`.
4. Build on Windows.
5. Produce SBOM, checksums, and provenance attestation.
6. Submit artifact to the configured signing provider.
7. Verify Authenticode/MSIX signature and timestamp.
8. Run clean-VM install, launch, uninstall, and upgrade tests.
9. Publish release notes, hashes, signer identity, and verification instructions.
10. Submit the same commit/version to the Microsoft Store when applicable.

## No-signing behavior

The included workflow can generate an unsigned release candidate for maintainers. It must not create a public GitHub Release labeled stable. A signed-release workflow is enabled only after signing governance is configured.
