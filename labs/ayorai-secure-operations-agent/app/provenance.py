"""Minimal provenance checks for context entering the control plane."""

from dataclasses import dataclass
from hashlib import sha256


TRUST_LEVELS = {"trusted_internal": 3, "user": 2, "external": 1, "unknown": 0}


@dataclass(frozen=True)
class Provenance:
    source_id: str
    source_type: str
    trust: str
    content_hash: str


def make_provenance(source_id: str, source_type: str, content: str, trust: str = "external") -> Provenance:
    if trust not in TRUST_LEVELS:
        raise ValueError("invalid trust level")
    digest = sha256(content.encode("utf-8")).hexdigest()
    return Provenance(source_id, source_type, trust, digest)


def acceptable_for_action(provenance: Provenance, minimum_trust: str = "user") -> bool:
    return TRUST_LEVELS[provenance.trust] >= TRUST_LEVELS[minimum_trust]
