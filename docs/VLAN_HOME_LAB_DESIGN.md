# Home and Lab VLAN Design

This is a target design. Actual implementation depends on F6600P VLAN capabilities, switch support, and access-point SSID-to-VLAN support.

Observed F6600P web API evidence for loopback/port VLAN assignment (`OBJ_LOOPBACK_VLAN_ID`, `VidStr`) is recorded in [RESEARCH_NOTES_F6600P.md](RESEARCH_NOTES_F6600P.md) and [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md). That evidence confirms a read/Apply surface for VLAN IDs on bridge ports; it does **not** yet prove full 802.1Q isolation for this home/lab plan.

## Proposed segments

| VLAN | Name | Example subnet | Purpose |
|---:|---|---|---|
| 10 | Home | 192.168.10.0/24 | Family phones, tablets, TVs, ordinary devices |
| 20 | Work | 192.168.20.0/24 | Workstations and employer/business devices |
| 30 | Lab | 192.168.30.0/24 | Servers, development systems, containers, test services |
| 40 | IoT | 192.168.40.0/24 | Appliances, cameras, smart devices |
| 50 | Guest | 192.168.50.0/24 | Internet-only guest access |
| 99 | Management | 192.168.99.0/24 | Router, managed switch, AP management, admin workstation |

## Default inter-VLAN policy

Deny by default, then allow explicit flows:

- Management → all network infrastructure administration.
- Work → selected Lab services such as HTTPS, SSH, Git, and monitoring.
- Home → selected printer/media services only.
- IoT → DNS, NTP, internet; no initiation toward Home/Work/Lab.
- Guest → internet only; client isolation enabled.
- Lab → internet and explicitly approved infrastructure; no unrestricted access to Work.

## Dependencies

A router alone cannot create complete VLAN isolation when downstream hardware is unmanaged. Confirm:

- Router supports 802.1Q LAN VLANs, not only WAN service VLANs.
- Switch is managed and supports tagged/untagged ports and PVIDs.
- Access points support one SSID per VLAN or equivalent mapping.
- DHCP scopes can bind to VLAN interfaces.
- Firewall can filter inter-VLAN routing.

## Migration strategy

1. Document physical topology and recovery access.
2. Create management VLAN without removing current access.
3. Move one wired test device.
4. Validate DHCP, DNS, internet, management, and isolation.
5. Add Lab, Work, Home, IoT, and Guest incrementally.
6. Remove temporary flat-network rules only after validation.
