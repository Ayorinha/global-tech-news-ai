# Contributing to AYORAI AI Shield Research

## Development model

The research track is intentionally separated from the deployed site.

Preferred flow:

**Issue → branch → commit → pull request → automated validation → human review → merge**

## Safety requirements

Contributions must not introduce:

- malware or destructive payloads;
- credentials or secrets;
- unauthorized external targets;
- unsafe autonomous enforcement;
- claims of absolute security.

Use synthetic security cases and local controlled environments.

## Documentation standard

Security architecture documents should state:

- scope;
- assumptions;
- trust boundaries;
- failure modes;
- test methodology;
- evidence;
- known limitations.

## AI-assisted development

AI may assist with analysis, documentation, test generation and defensive recommendations. High-impact security changes still require deterministic tests and human review.
