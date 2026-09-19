# Runtime Core

This directory contains the first executable implementation of the cross-platform AYORAI AI Shield research architecture.

## Components

- **Security Event Core** — versioned event contract, validation and integrity hash.
- **Risk Engine** — deterministic, versioned risk scoring.
- **Policy Engine** — explicit policy thresholds; read-only mode never performs high-impact actions.
- **Evidence Store** — append-only JSONL evidence prototype.
- **Read-only Endpoint Agent** — local OS/architecture snapshot with no blocking, privilege escalation or persistence.
- **Local Control Plane** — localhost-only HTTP prototype for event ingestion and health inspection.

This is a research prototype, not a production EDR/XDR or endpoint security product.
