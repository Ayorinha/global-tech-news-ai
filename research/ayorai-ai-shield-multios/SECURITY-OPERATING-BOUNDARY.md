# Security Operating Boundary

## Purpose

This document defines the boundary between the current public research laboratory and the future global security platform.

## Current repository behavior

The browser-based AYORAI AI Shield laboratory evaluates controlled synthetic security cases. It is not an endpoint antivirus, EDR, XDR, kernel security product, mobile security product, or universal malware detector.

## Future platform boundary

Future endpoint, network, identity, data, email, web, application, sandbox, isolation and response capabilities require separate implementation, threat modeling, testing and platform-specific validation before being presented as production capabilities.

## AI safety boundary

AI components may:

- analyze security telemetry;
- correlate signals;
- classify risk;
- propose defensive actions;
- generate synthetic tests;
- identify regression candidates;
- assist threat-intelligence analysis.

AI components must not independently:

- grant themselves privileges;
- disable security controls;
- erase or alter evidence;
- bypass approval gates;
- deploy arbitrary executable code;
- change their own security boundaries;
- silently convert recommendations into high-impact enforcement.

## Fail-safe principle

If cloud services, AI services, telemetry, intelligence feeds or non-essential UI components fail, the security architecture must degrade safely rather than silently weakening mandatory controls.

## Evidence principle

Every high-impact security claim must identify its product version, platform, configuration, test method, date and evidence source.

## Production gate

No capability moves from research to production merely because an AI model proposes it. It requires:

**Implementation → tests → negative tests → threat review → evidence → documentation → staged deployment → monitoring → rollback validation.**
