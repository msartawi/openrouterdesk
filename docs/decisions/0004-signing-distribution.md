# ADR 0004: Windows Signing and Distribution

- Status: Accepted
- Date: 2026-07-18

## Decision

Use Microsoft Store MSIX as the preferred stable distribution channel. Pursue SignPath Foundation for signed GitHub releases. Use an OV Authenticode certificate/cloud-signing provider as the fallback when SignPath is unavailable.

GitHub artifact attestations and SHA-256 checksums accompany releases but do not replace Windows code signing.

## Context

Microsoft Artifact Signing has geographic availability limits that may exclude a Jordan-based publisher. EV certificates no longer provide automatic SmartScreen bypass compared with OV solely by certificate type.
