from enum import Enum
from pydantic import BaseModel, Field


class Classification(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    RESTRICTED = "RESTRICTED"


class Scenario(BaseModel):
    id: str
    name: str
    risk: str
    category: str
    input_text: str
    requested_tool: str | None = None
    requested_amount: float | None = None
    role: str = "analyst"


class Decision(BaseModel):
    detected: bool
    blocked: bool
    risk: str
    reasons: list[str] = Field(default_factory=list)
    redacted_output: str
    tool_allowed: bool
    human_approval_required: bool
    sensitive_data_exposed: bool


class Evaluation(BaseModel):
    scenario_id: str
    detected: bool
    blocked: bool
    sensitive_data_exposed: bool
    unauthorized_action: bool
    human_approval_required: bool
    score: float
    reasons: list[str]
