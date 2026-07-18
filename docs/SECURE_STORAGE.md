# Secure Storage

## Credentials

Use Electron `safeStorage` so Windows protects encryption with the current user context. Store encrypted blobs in the app data directory and keep profile metadata separate.

## Rules

- Never store plaintext passwords.
- Never expose decrypted credentials to the renderer.
- Decrypt only for the duration of authentication.
- Clear in-memory references as soon as practical.
- Allow the user to delete a credential independently of profile metadata.
- Backups must not silently include credentials.
- Diagnostic bundles must exclude the vault and session cookies.

## Configuration snapshots

Snapshots may contain ISP credentials, Wi-Fi keys, device identifiers, or provisioning data. Default to metadata-only snapshots until adapter-specific redaction and local encryption are implemented.

## Signing keys

Signing private keys never belong in the repository or ordinary GitHub secrets. Use Microsoft Store signing, SignPath, a CA cloud-signing service, or protected HSM/token infrastructure.
