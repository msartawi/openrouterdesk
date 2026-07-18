# Data Model

## RouterProfile

Non-secret metadata:

- `id`
- `displayName`
- `target`
- `protocol`
- `adapterId`
- `username`
- `certificateTrust`
- `createdAt`
- `updatedAt`

Password material is referenced by profile ID and stored separately in the credential vault.

## RouterIdentity

- model and hardware revision
- firmware/build
- operator/region
- serial and MAC values, sensitive by default
- adapter confidence and evidence

## DeviceNode

- normalized IDs and addresses
- display metadata
- VLAN/network
- link and presence state
- source and confidence

## TopologyEdge

- source node
- destination node
- relationship type
- source evidence
- confidence

## AuditEvent

- timestamp
- profile ID
- actor (`user`, `system`, `agent`)
- operation
- result
- redacted metadata
- correlation ID

## ChangePlan

- operation type
- prerequisites
- current state hash
- proposed normalized diff
- validation findings
- backup reference
- approval record
- execution and verification results
- rollback reference
