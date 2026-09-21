"""MCP/tool boundary model.

This is a registry/validation layer, not an MCP client. The public lab never
executes arbitrary tools or connects to production systems.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ToolSpec:
    name: str
    risk: str
    read_only: bool
    allowed_roles: frozenset[str]
    max_amount: float | None = None


class MCPToolRegistry:
    def __init__(self) -> None:
        self._tools = {
            "read_public": ToolSpec("read_public", "LOW", True, frozenset({"analyst", "finance_manager", "auditor"})),
            "read_internal": ToolSpec("read_internal", "MEDIUM", True, frozenset({"analyst", "finance_manager", "auditor"})),
            "read_audit": ToolSpec("read_audit", "MEDIUM", True, frozenset({"auditor"})),
            "create_payment_draft": ToolSpec("create_payment_draft", "HIGH", False, frozenset({"finance_manager"}), 10000.0),
        }

    def authorize(self, role: str, tool: str, amount: float | None = None) -> tuple[bool, str]:
        spec = self._tools.get(tool)
        if spec is None:
            return False, "unknown_tool"
        if role not in spec.allowed_roles:
            return False, "role_not_allowed"
        if spec.max_amount is not None and amount is not None and amount > spec.max_amount:
            return False, "amount_exceeds_tool_limit"
        return True, "allowed"
