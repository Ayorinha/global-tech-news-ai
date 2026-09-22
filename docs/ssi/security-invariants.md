# SSI Security Invariants

These invariants are intended to be machine-testable.

1. Model output cannot directly authorize a tool.
2. Unknown tools and policy errors fail closed for privileged actions.
3. Actors receive only explicitly registered capabilities.
4. Untrusted content cannot increase its own integrity.
5. Sensitive context cannot be sent to a lower-trust destination without policy approval.
6. Approval applies only to the exact action digest and declared scope.
7. Secrets are never placed in model context.
8. Public evaluation never targets production infrastructure.
9. Audit evidence detects tampering.
10. Production approvals must bind to nonce, session and time.
11. High-impact financial actions support separation of duties.
12. Authorized humans can stop pending high-impact operations.
13. Delegated agents cannot exceed the parent's capability envelope.
14. Security claims require benchmark evidence and limitations.
15. Security-control failure never silently enables privileged execution.
16. A privileged transaction must bind requester, operation, resource, purpose, provenance, policy version, nonce and expiry.
17. An intent contract can only constrain authority; it cannot manufacture authority.
18. A transaction with an intent-hash mismatch cannot execute.
19. An observed tool chain must remain inside the declared tool capability and approved sequence.
20. An observed execution trajectory must remain a prefix of the approved trajectory.
21. Confidential information cannot flow to a lower-confidentiality sink when IFC denies the release.
22. Reconciliation cannot convert disagreement into authorization.
23. A valid cryptographic capability for one transaction cannot authorize another transaction.
