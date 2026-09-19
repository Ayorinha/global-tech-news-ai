# ADR-0001 — Separate Research Track From Deployed Site

## Status
Accepted

## Context

The existing AYORAI AI Shield laboratory is already published through the repository's deployed site. The global cybersecurity platform requires substantially larger architecture and platform-specific work.

## Decision

Maintain the global-platform work in a dedicated research branch and PR until implementation is sufficiently tested and reviewed.

## Consequences

### Positive
- Existing site remains stable.
- Experimental architecture cannot silently replace production content.
- GitHub history clearly shows research evolution.
- Reviewers can inspect the future platform independently.

### Negative
- Some capabilities are temporarily duplicated as documentation.
- Merge will happen later.

## Boundary

The research branch must never claim that future roadmap capabilities already exist.
