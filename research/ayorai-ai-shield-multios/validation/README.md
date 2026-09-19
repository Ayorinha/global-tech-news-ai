# Research Validation

This validation layer checks the integrity of the AYORAI AI Shield global-platform research package without touching the deployed site.

## Checks

- Required architecture documents exist.
- Mermaid diagrams are present in the diagram package.
- Security claims avoid absolute guarantees.
- The threat model, requirements, testing and operations documents are present.
- The research branch remains documentation-first and does not claim production endpoint protection.

Run:

```bash
node validation/validate-research.mjs
```

The validator is intentionally dependency-free and deterministic.
