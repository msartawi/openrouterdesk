# Minimum Viable Product

## User outcome

A Windows user can connect to an authorized F6600P, see what the application knows, inspect connected devices and network posture, export a local report, and plan firewall/VLAN improvements without changing router configuration.

## Required features

1. Router profile with IP/hostname, protocol, certificate trust mode, username, and adapter selection.
2. Credentials protected by Windows DPAPI through Electron `safeStorage`.
3. Reachability probe and adapter/model confidence result.
4. Explicit login and logout with session timeout.
5. Read-only connected-device inventory.
6. Topology graph built from router data plus optional local ARP/neighbour observations.
7. Firewall posture report based on observed settings and exposed services.
8. VLAN design workspace with no live write.
9. Snapshot metadata and redacted report export.
10. Local audit log showing actions and outcomes without secrets.

## Acceptance criteria

- App installs on a clean supported Windows system.
- Unsigned development builds are visibly marked.
- Renderer has no Node integration and cannot read credentials.
- A malformed router response does not crash the app.
- Every network request has timeout and cancellation.
- No write or firmware endpoint is invoked.
- All model-specific parsing has fixture tests.
- User can remove a router profile and its stored secret.
- Export warns before including private network identifiers.

## Deferred

- Live firewall changes.
- Live VLAN changes.
- Firmware upload.
- Automatic update of the desktop app until signing and release channels are stable.
- Router plugins downloaded at runtime.
- Remote access or cloud sync.
