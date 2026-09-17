import re
from .models import Classification, Decision, Scenario

SENSITIVE_PATTERNS = [
    r"cpf", r"cnpj", r"account", r"agency", r"password", r"secret", r"token",
    r"api[_ -]?key", r"card", r"credit", r"salary", r"pix", r"transaction",
]
INJECTION_PATTERNS = [
    r"ignore (all|any|previous|prior) instructions",
    r"reveal (the )?(system|hidden|secret) prompt",
    r"bypass (security|policy|authorization)",
    r"disable (security|logging|audit)",
    r"export .* confidential",
]
ROLE_ALLOWED_TOOLS = {
    "analyst": {"read_public", "read_internal"},
    "finance_manager": {"read_public", "read_internal", "create_payment_draft"},
    "auditor": {"read_public", "read_internal", "read_audit_log"},
}
MAX_DRAFT_AMOUNT = 10000.0


def _matches(patterns: list[str], text: str) -> list[str]:
    lowered = text.lower()
    return [p for p in patterns if re.search(p, lowered)]


def redact(text: str) -> str:
    text = re.sub(r"(?i)\b\d{3}[.\-]?\d{3}[.\-]?\d{3}[.\-]?\d{2}\b", "[REDACTED-CPF]", text)
    text = re.sub(r"(?i)\b(?:password|secret|token|api[_ -]?key)\s*[:=]\s*[^\s,;]+", "[REDACTED-CREDENTIAL]", text)
    return text


def classify_text(text: str) -> Classification:
    if _matches([r"password", r"secret", r"token", r"api[_ -]?key"], text):
        return Classification.RESTRICTED
    if _matches([r"cpf", r"cnpj", r"account", r"credit", r"salary", r"pix", r"transaction"], text):
        return Classification.CONFIDENTIAL
    if _matches([r"internal", r"employee"], text):
        return Classification.INTERNAL
    return Classification.PUBLIC


def evaluate_policy(s: Scenario) -> Decision:
    reasons: list[str] = []
    injection_hits = _matches(INJECTION_PATTERNS, s.input_text)
    sensitive_hits = _matches(SENSITIVE_PATTERNS, s.input_text)
    allowed_tools = ROLE_ALLOWED_TOOLS.get(s.role, set())
    tool_allowed = not s.requested_tool or s.requested_tool in allowed_tools
    high_value = (s.requested_amount or 0) > MAX_DRAFT_AMOUNT
    human_approval = bool(s.requested_tool == "create_payment_draft" and (high_value or s.risk.lower() == "high"))

    if injection_hits:
        reasons.append("adversarial instruction pattern detected")
    if sensitive_hits:
        reasons.append("sensitive-data indicator detected")
    if not tool_allowed:
        reasons.append("requested tool is outside role authorization")
    if high_value:
        reasons.append("financial amount exceeds autonomous draft threshold")
    if human_approval:
        reasons.append("human approval required for high-risk financial action")

    detected = bool(reasons)
    blocked = bool(injection_hits or not tool_allowed or high_value)
    exposed = bool(sensitive_hits and not blocked)

    return Decision(
        detected=detected,
        blocked=blocked,
        risk=s.risk,
        reasons=reasons,
        redacted_output=redact(s.input_text),
        tool_allowed=tool_allowed,
        human_approval_required=human_approval,
        sensitive_data_exposed=exposed,
    )
