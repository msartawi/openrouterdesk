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

## Feature flags observed in page configuration

- QoS menu disabled in the current exposed configuration.
- Diagnostic ping/trace/speed-test/simulation values disabled in the current exposed configuration.
- Login validation code/captcha disabled.
- Jordan/operator branding information present.

Feature flags do not prove the backend capability exists or is safe to enable.

## Research next steps

1. Record exact firmware/build/hardware identifiers through the super-admin GUI.
2. Capture one authorized login flow with values redacted.
3. Capture `accessdev_data` response and build a sanitized fixture.
4. Enumerate authenticated menu tags through normal GUI navigation.
5. Identify backup/export and firmware-information requests through browser devtools.
6. Map firewall and VLAN pages to read-only endpoints.
7. Do not invoke write or upload endpoints during this phase.
