# ZTE F6600P Research Notes

## Current environment observations

The target router has been observed at `192.168.1.1` on an authorized local network.

Observed TCP services included:

- FTP on 21, accepting a connection but responding that the service is locked.
- DNS on 53.
- HTTP on 80.
- HTTPS on 443 with a self-signed ZTE certificate.
- UPnP-related service on TCP 52869.
- Telnet on 23 appeared filtered.

Observed UDP checks included UPnP/SSDP behavior on 1900 as open or filtered, while tested SNMP, NAT-PMP, and UDP 5000 were closed.

## Web application findings

The login page and authenticated GUI use the same root URL. The web application uses query-driven endpoints rather than the older guessed `.gch` paths.

Observed endpoint families:

```text
_type=loginData
_type=hiddenData
_type=menuView
```

Observed tags:

```text
accessdev_data
login_entry
login_token
logout_entry
modeswitch_entry
sntp_data
switchlang_entry
```

Observed scripts include jQuery, CryptoJS, JSEncrypt, and a common library. Login-page JavaScript indicates a token-based SHA-256 password derivation. The exact request fields and response contract remain to be captured and sanitized.

A device-list object named `OBJ_ACCESSDEV_ID` and the `accessdev_data` endpoint are likely relevant to connected-device inventory. This is a hypothesis until authenticated responses are captured.

## Breakthrough: Loopback VLAN read/write contract (observed)

Authorized captures confirmed a working **read** path that returns XML object `OBJ_LOOPBACK_VLAN_ID`, for example:

```xml
<OBJ_LOOPBACK_VLAN_ID>
    <Instance>
        <ParaName>_InstID</ParaName>
        <ParaValue>DEV.LOOP.VLAN1</ParaValue>

        <ParaName>PortID</ParaName>
        <ParaValue>DEV.BRIDGING.BR1.BRPORT5</ParaValue>

        <ParaName>vlanCount</ParaName>
        <ParaValue>1</ParaValue>

        <ParaName>VidStr</ParaName>
        <ParaValue>1</ParaValue>
    </Instance>
</OBJ_LOOPBACK_VLAN_ID>
```

| Parameter | Meaning |
|---|---|
| `_InstID` | Object instance |
| `PortID` | Physical bridge port |
| `vlanCount` | Number of VLANs assigned |
| `VidStr` | VLAN list (comma-separated when multiple) |

Observed **Apply** write shape (document only; do not enable live writes in the MVP):

```text
IF_ACTION=Apply
_InstID=DEV.LOOP.VLAN1
PortID=DEV.BRIDGING.BR1.BRPORT5
VidStr=1
```

Normalized SDK-oriented read model:

```ts
interface LoopbackVlan {
  instId: string;
  portId: string;
  vlanCount: number;
  vids: number[];
}
```

### SessionTimeout before success

Many requests returned HTTP 200 with a session-timeout style body, then a later request returned `OBJ_LOOPBACK_VLAN_ID`. Current interpretation: the router often needs a refreshed authenticated GUI context (page/menu entry) before certain data tags succeed — not purely random expiry. Capture the preceding page-load / `menuView` sequence alongside the successful data request.

See [ZTE_API_DISCOVERY_FRAMEWORK.md](ZTE_API_DISCOVERY_FRAMEWORK.md) for the scalable discovery/SDK plan.

## Feature flags observed in page configuration

- QoS menu disabled in the current exposed configuration.
- Diagnostic ping/trace/speed-test/simulation values disabled in the current exposed configuration.
- Login validation code/captcha disabled.
- Jordan/operator branding information present.

Feature flags do not prove the backend capability exists or is safe to enable.

## Research next steps

1. Record exact firmware/build/hardware identifiers through the super-admin GUI.
2. Capture one authorized login flow with values redacted.
3. Capture sanitized fixtures for `OBJ_LOOPBACK_VLAN_ID` (read) and the exact `_type`/`_tag` URL that returned it.
4. Capture the page-entry / `menuView` sequence that precedes a successful VLAN read after `SessionTimeout` responses.
5. Capture `accessdev_data` / `OBJ_ACCESSDEV_ID` response and build a sanitized fixture.
6. Run Stage 1 of external **`openrouter-capture`** (`discover`) for menu/endpoint catalog — see [OPENROUTER_CAPTURE.md](OPENROUTER_CAPTURE.md); keep raw output local.
7. Identify backup/export and firmware-information requests (capture tool or DevTools).
8. Map firewall and remaining VLAN pages to read-only endpoints.
9. Do not invoke write or upload endpoints from the app until write-safety gates exist.
