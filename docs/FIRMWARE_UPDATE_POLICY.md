# Firmware Update Policy

## Current project policy

OpenRouterDesk does not automatically flash firmware during the MVP. It may collect device identity, compare user-supplied candidates, verify provenance, and produce an evidence report.

## Required identity evidence

- Exact commercial model.
- Hardware revision and board identifier.
- Bootloader version, when available.
- Current firmware version/build.
- Region and regulatory variant.
- ISP/operator customization.
- GPON/ONT provisioning constraints.
- Flash layout and recovery method, when lawfully documented.

## Candidate acceptance

A firmware image is not considered compatible merely because its filename contains the model number. A candidate requires:

- Official vendor or authorized ISP source.
- Matching hardware/region/operator evidence.
- Published checksum or verifiable signature when available.
- Release notes and upgrade path.
- Confirmation that configuration/provisioning can survive or be restored.
- Documented recovery route.

## Upgrade gate

```text
Identity confidence = high
AND source confidence = official/authorized
AND integrity verified
AND full backup complete
AND recovery method confirmed
AND power/network conditions acceptable
AND user approves exact candidate and risks
```

If any gate fails, the application must stop before upload.

## Legal and operational notes

ONT firmware may be controlled by the ISP and can affect optical provisioning or service authorization. The project must not encourage bypassing provider controls or loading leaked images.
