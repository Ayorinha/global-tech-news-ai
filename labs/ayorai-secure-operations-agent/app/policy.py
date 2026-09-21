from dataclasses import dataclass


@dataclass(frozen=True)
class SafetyDecision:
    status: str
    risk: str
    scope: str


BLOCKED_TERMS = {
    "password", "credential", "secret", "token", "shell",
    "ransomware", "malware", "exploit",
}

EXTERNAL_ACTION_TERMS = {
    "send email", "send an email", "delete", "publish",
    "upload", "execute", "change production", "modify system",
}


def evaluate_request(request: str, approved: bool = False) -> SafetyDecision:
    text = request.lower()

    if any(term in text for term in BLOCKED_TERMS):
        return SafetyDecision("BLOCK", "HIGH", "none")

    if any(term in text for term in EXTERNAL_ACTION_TERMS):
        if approved:
            return SafetyDecision("ALLOW", "MEDIUM", "explicit-approved")
        return SafetyDecision("APPROVAL_REQUIRED", "MEDIUM", "proposed-only")

    return SafetyDecision("ALLOW", "LOW", "read-only-local")
