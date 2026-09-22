"""Explicit MCP/tool capability boundary.

This reference layer is a registry/validator, not an MCP client.
No arbitrary commands or production systems are reachable from the public lab.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ToolSpec:
    name: str
    risk: str
    read_only: bool
    allowed_roles: frozenset[str]
    max_amount: float | None = None
    max_data_classification: str = "PUBLIC"


class MCPToolRegistry:
    def __init__(self) -> None:
        self._tools = {
            "read_public": ToolSpec(
                "read_public", "LOW", True,
                frozenset({"analyst", "finance_manager", "auditor"}),
                max_data_classification="PUBLIC",
            ),
            "read_internal": ToolSpec(
                "read_internal", "MEDIUM", True,
                frozenset({"analyst", "finance_manager", "auditor"}),
                max_data_classification="INTERNAL",
            ),
            "read_audit": ToolSpec(
                "read_audit", "MEDIUM", True,
                frozenset({"auditor"}),
                max_data_classification="CONFIDENTIAL",
            ),
            "create_payment_draft": ToolSpec(
                "create_payment_draft", "HIGH", False,
                frozenset({"finance_manager"}), 10000.0,
                max_data_classification="INTERNAL",
            ),
        }

    def spec(self, tool: str | None) -> ToolSpec | None:
        return self._tools.get(tool) if tool else None

    def authorize(
        self,
        role: str,
        tool: str | None,
        amount: float | None = None,
        data_classification: str = "PUBLIC",
    ) -> tuple[bool, str]:
        if tool is None:
            return True, "no_tool"
        spec = self._tools.get(tool)
        if spec is None:
            return False, "unknown_tool"
        if role not in spec.allowed_roles:
            return False, "role_not_allowed"
        if data_classification not in {"PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"}:
            return False, "invalid_data_classification"
        levels = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}
        if levels[data_classification] > levels[spec.max_data_classification]:
            return False, "data_classification_too_high"
        if spec.max_amount is not None and amount is not None and amount > spec.max_amount:
            return False, "amount_exceeds_tool_limit"
        return True, "allowed"
