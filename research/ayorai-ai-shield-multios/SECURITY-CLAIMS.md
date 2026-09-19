# AYORAI AI Shield — Security Claims Policy

## Purpose

A cybersecurity company earns trust by making claims that can be tested.

Every public claim must answer:

**What? Where? When? How tested? Against what? Under which configuration? With what limitations?**

## Claim classes

### Class A — Observed internal behavior
Example: “The engine blocked X of Y controlled synthetic cases in benchmark Z.”

Must include benchmark version and test conditions.

### Class B — Reproducible engineering result
Example: “The agent maintained protection after the desktop UI was closed in test environment X.”

Must include environment and test procedure.

### Class C — Independent result
Example: “Product version X was evaluated by organization Y under methodology Z.”

Must link to the external report and preserve its wording.

### Class D — Certification
Only use certification language after certification is actually granted and within its validity scope.

## Prohibited absolute language

Unless an external authority explicitly defines and grants such a claim, do not use:
- invulnerable;
- impossible to hack;
- 100% secure;
- guaranteed protection against all attacks;
- zero vulnerabilities;
- protects every device.

## Platform scope

A claim about Windows does not automatically apply to macOS, Linux, Android or iOS.

A claim about one product version does not automatically apply to another.

A claim about one configuration does not automatically apply to all configurations.

## Versioned evidence

Evidence should be linked to:
- product version;
- agent version;
- rules/intelligence version;
- model version;
- OS version;
- configuration;
- test corpus;
- test date;
- result;
- evidence hash.

## Public transparency

When a published test identifies a gap:
1. preserve the evidence;
2. reproduce;
3. classify;
4. create regression coverage;
5. fix;
6. retest;
7. publish the updated state.

A lower score or bypass finding is engineering input, not something to hide.

## Reference boundary

NIST, MITRE, OWASP, AV-TEST, AV-Comparatives and other organizations may provide frameworks, test methodologies or independent evaluation. Their existence does not imply AYORAI certification.

External evaluation must always be distinguished from AYORAI's own benchmark results.
