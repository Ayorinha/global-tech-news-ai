# AYORAI AI Shield — Platform Matrix

## Core principle

Portable security intelligence must be separated from native operating-system enforcement.

| Platform | Native agent | Local UI | Process | File | Network | Identity | Response |
|---|---|---|---|---|---|---|---|
| Windows | planned | planned | planned | planned | planned | planned | planned |
| macOS | planned | planned | planned | planned | planned | planned | planned |
| Linux | planned | optional | planned | planned | planned | planned | planned |
| Server Linux | planned | no UI required | planned | planned | planned | planned | planned |
| Server Windows | planned | optional | planned | planned | planned | planned | planned |
| Containers | runtime adapter | no | planned | planned | planned | planned | planned |
| Cloud workloads | workload adapter | no | planned | planned | planned | planned | planned |
| Specialized financial systems | controlled adapter | optional | policy-dependent | policy-dependent | planned | planned | controlled |

## OS-specific principle

The project should not force identical controls onto every OS.

Instead:

**Common Security Policy → Common Detection Schema → Platform Adapter → Native Enforcement**

This allows Windows, macOS and Linux to have different capabilities while sharing the same security model.

## Desktop installation concept

A future installer would:

1. identify the operating system and architecture;
2. verify package signature;
3. install the native agent;
4. request only required OS permissions;
5. establish a secure device identity;
6. start the protected service;
7. install the local status application;
8. verify health;
9. download signed security intelligence;
10. run a local self-test;
11. show protection status.

The user should always be able to inspect what permissions were requested and why.

## Native service model

The endpoint component should run as a hardened background service or daemon.

The desktop UI is not the security engine.

If the UI closes, protection continues.

If the cloud control plane is unavailable, the endpoint retains a safe local baseline policy.

## Offline operation

A security agent must remain useful without internet connectivity.

Offline capabilities should include local policy, cached reputation, local detection, process monitoring, file monitoring, response and evidence buffering.

When connectivity returns, evidence should synchronize securely.

## High-assurance environments

Some customers may require:
- no cloud telemetry;
- private management plane;
- air-gapped operation;
- delayed updates;
- customer-controlled approval;
- dedicated keys;
- immutable evidence export.

These should be architectural options, not afterthoughts.
