from dataclasses import dataclass

@dataclass
class ToolResult:
    tool: str
    status: str
    data: dict

class MCPToolRegistry:
    """Typed tool boundary. The production MCP server will expose these operations."""

    def list_tools(self) -> list[str]:
        return ["search_knowledge", "read_database", "generate_report", "run_rpa"]

    def execute(self, tool_name: str, **kwargs) -> ToolResult:
        if tool_name not in self.list_tools():
            raise ValueError("tool_not_allowlisted")
        return ToolResult(tool_name, "simulated", {"input": kwargs})
