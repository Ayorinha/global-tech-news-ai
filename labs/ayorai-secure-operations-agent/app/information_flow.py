"""Deterministic integrity/confidentiality labels for agent information flow."""

from dataclasses import dataclass

INTEGRITY = {"UNKNOWN": 0, "EXTERNAL": 1, "USER": 2, "INTERNAL": 3, "SYSTEM": 4}
CONFIDENTIALITY = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}

@dataclass(frozen=True)
class Label:
    integrity: str = "UNKNOWN"
    confidentiality: str = "PUBLIC"

    def __post_init__(self) -> None:
        if self.integrity not in INTEGRITY:
            raise ValueError("invalid integrity label")
        if self.confidentiality not in CONFIDENTIALITY:
            raise ValueError("invalid confidentiality label")

    def join(self, other: "Label") -> "Label":
        return Label(
            integrity=min((self.integrity, other.integrity), key=INTEGRITY.get),
            confidentiality=max((self.confidentiality, other.confidentiality), key=CONFIDENTIALITY.get),
        )

    def can_drive(self, sink: "Label") -> bool:
        return (
            INTEGRITY[self.integrity] >= INTEGRITY[sink.integrity]
            and CONFIDENTIALITY[self.confidentiality] <= CONFIDENTIALITY[sink.confidentiality]
        )
