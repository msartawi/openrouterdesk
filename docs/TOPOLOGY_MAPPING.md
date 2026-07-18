# Topology Mapping

## Goal

Show a useful network graph while making the source and confidence of every relationship visible.

## Data sources

- Router connected-device table.
- DHCP lease table.
- ARP/neighbor table.
- Switch MAC/LLDP information when supported.
- Wi-Fi association data.
- Optional local passive observations from the workstation.
- User annotations.

## Confidence levels

- **Confirmed:** directly reported by the responsible infrastructure device.
- **Correlated:** multiple identifiers agree, such as MAC + DHCP lease.
- **Inferred:** likely relationship based on incomplete evidence.
- **User-defined:** manually assigned by the user.

## Device fields

- Stable local ID.
- MAC address, optionally masked in exports.
- IPv4/IPv6 addresses.
- Hostname and user label.
- Manufacturer/OUI when available.
- Connection type and interface.
- VLAN and subnet.
- Lease expiry and last seen.
- Link speed/RSSI when available.
- Source and confidence.

## Privacy

Topology data is household and business-sensitive. It stays local. Reports default to masked MAC addresses and sanitized hostnames.
