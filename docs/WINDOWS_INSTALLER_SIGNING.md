# Windows Installer and Code Signing

_Reviewed for the project starter on 2026-07-18._

## Important distinction

- **Authenticode/MSIX signing** establishes Windows publisher identity and executable integrity.
- **SmartScreen reputation** is a separate reputation system. A new signed web-download may still show an “unrecognized app” warning until reputation develops.
- **GitHub artifact attestations** prove build provenance and do not replace Authenticode.

## Recommended distribution order

### 1. Microsoft Store MSIX — preferred public channel

Microsoft recommends Store MSIX distribution for most new Windows apps. The Store re-signs accepted MSIX packages, and users do not receive SmartScreen download warnings for Store installation.

Use `electron-builder.store.yml` after reserving the real Store identity and publisher values.

### 2. SignPath Foundation — preferred GitHub-release path for qualifying OSS

Because OpenRouterDesk is intended to be a public open-source project, apply to the SignPath Foundation open-source code-signing program. The project must meet its governance, MFA, review, signing-policy, and origin-verification requirements.

### 3. OV Authenticode certificate — fallback for Jordan/non-supported regions

Microsoft Artifact Signing is geographically limited. At the time of this starter, organization availability is listed for the USA, Canada, EU, and UK, while individual availability is USA and Canada. A Jordan-based publisher should therefore plan for Microsoft Store MSIX, SignPath Foundation, or an OV certificate/cloud-signing service from a CA that supports the publisher's jurisdiction.

Do not buy EV solely to bypass SmartScreen: Microsoft documents that EV and OV now follow the same reputation-building behavior.

## Release requirements

- Build on a protected GitHub Actions workflow or controlled Windows runner.
- Pin actions by trusted major version initially; move to commit pinning before 1.0.
- Generate SHA-256 checksums.
- Generate an SBOM.
- Generate GitHub artifact attestations for public-repo builds.
- Sign the application binaries and final installer/package.
- Timestamp signatures with RFC 3161 and SHA-256.
- Verify signatures with SignTool before publication.
- Publish the signer identity and code-signing policy in README/release pages.
- Keep signing approval separate from ordinary code contribution.

## Verification commands

```powershell
signtool verify /pa /all /v .\OpenRouterDesk-Setup.exe
Get-AuthenticodeSignature .\OpenRouterDesk-Setup.exe | Format-List
Get-FileHash .\OpenRouterDesk-Setup.exe -Algorithm SHA256
```

```bash
gh attestation verify OpenRouterDesk-Setup.exe -R OWNER/REPOSITORY
```

## Official references

- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Electron code signing: https://www.electronjs.org/docs/latest/tutorial/code-signing
- electron-builder Windows signing: https://www.electron.build/docs/features/code-signing/code-signing-win/
- Microsoft code-signing options: https://learn.microsoft.com/windows/apps/package-and-deploy/code-signing-options
- Microsoft SmartScreen reputation: https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation
- GitHub artifact attestations: https://docs.github.com/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations
- SignPath Foundation: https://signpath.org/
