"""Deterministic DLP controls for public reference scenarios."""

import re

PATTERNS = {
    "credential": re.compile(r"(?i)\b(password|secret|api[_ -]?key|credential|bearer)\b\s*[:=]?\s*[^\s,;]+"),
    "cpf": re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b"),
    "cnpj": re.compile(r"\b\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}\b"),
}

def inspect(text: str) -> tuple[bool, tuple[str, ...]]:
    findings = tuple(name for name, pattern in PATTERNS.items() if pattern.search(text))
    return bool(findings), findings

def redact(text: str) -> str:
    value = text
    for name, pattern in PATTERNS.items():
        value = pattern.sub(f"[REDACTED-{name.upper()}]", value)
    return value
