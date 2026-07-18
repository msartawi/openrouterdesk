# Firewall Baseline

The app should first report posture, then offer a reviewed plan. Labels such as Low/Medium/High are insufficient unless mapped to concrete settings.

## Recommended home/lab baseline

- Stateful firewall enabled.
- Unsolicited inbound WAN traffic denied.
- Remote web, Telnet, SSH, FTP, SNMP, and TR-064 administration from WAN disabled unless explicitly required and strongly restricted.
- WAN ping disabled by default; allow temporarily for diagnostics if needed.
- UPnP disabled by default or restricted to a dedicated gaming/media VLAN.
- NAT-PMP/PCP disabled unless required.
- Anti-spoofing and invalid-state drop enabled.
- DoS protections enabled with conservative thresholds and false-positive monitoring.
- Admin interface limited to a management VLAN and trusted devices.
- Strong unique administrator password; separate non-admin account when supported.
- HTTPS preferred with pinned/self-signed certificate trust record.
- DNS configuration documented and protected from unauthorized changes.
- Periodic review of port forwards and exposed services.

## Report format

Each finding includes:

- Observed value.
- Desired baseline.
- Risk.
- Confidence/source.
- Proposed change.
- Potential service impact.
- Rollback instruction.

## Safe rollout

1. Snapshot current configuration.
2. Inventory required inbound and inter-VLAN services.
3. Apply one logical group of changes.
4. Verify internet, DNS, DHCP, Wi-Fi, management, and required services.
5. Record outcome and rollback point.
