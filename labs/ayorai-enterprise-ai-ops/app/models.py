from pydantic import BaseModel, Field

class OperationRequest(BaseModel):
    query: str = Field(min_length=1)
    role: str = "operator"

class OperationResponse(BaseModel):
    decision: str
    route: list[str]
    requires_approval: bool
    message: str
