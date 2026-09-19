# AYORAI AI Shield — Release Checklist

A release is ready only when applicable gates are satisfied.

## Engineering
- [ ] Scope and affected components documented
- [ ] Threat model updated
- [ ] Failure modes reviewed
- [ ] Dependencies reviewed
- [ ] Reproducible build/test path documented

## Security
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security tests pass
- [ ] Negative/failure tests pass
- [ ] AI-security regression suite passes when applicable
- [ ] No secrets or sensitive data
- [ ] Security claims remain scoped

## Update safety
- [ ] Artifact provenance verified
- [ ] Integrity/signature validation implemented where applicable
- [ ] Rollback tested
- [ ] Canary plan defined
- [ ] Monitoring defined

## Evidence
- [ ] Version recorded
- [ ] Platform/configuration recorded
- [ ] Test corpus/version recorded
- [ ] Evidence artifacts retained
- [ ] Known limitations documented

## Governance
- [ ] Human review completed
- [ ] Required approvals completed
- [ ] Release notes prepared
- [ ] Vulnerability implications assessed

A checkbox is not evidence by itself; the release record must point to the actual test or artifact.
