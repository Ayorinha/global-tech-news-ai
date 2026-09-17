from .agent import BlueAgent
from .audit import AuditLog
from .evaluator import evaluate
from .financial_sandbox import SyntheticLedger
from .policy import evaluate_policy
from .scenarios import SCENARIOS


class AgentArena:
    def __init__(self, agent=None):
        self.agent = agent or BlueAgent()
        self.audit = AuditLog()
        self.ledger = SyntheticLedger.demo()

    def run(self):
        evaluations = []
        for scenario in SCENARIOS:
            response = self.agent.respond(scenario)
            decision = evaluate_policy(scenario)
            result = evaluate(scenario, decision)
            self.audit.append("SCENARIO_EVALUATED", {"scenario": scenario.id, "risk": scenario.risk, "decision": decision.model_dump(), "response": response.text[:1000]})
            if scenario.requested_tool == "create_payment_draft" and decision.tool_allowed and not decision.blocked:
                self.ledger.create_payment_draft("blue-agent", "ACC-1001", scenario.requested_amount or 0, "Synthetic Beneficiary")
            evaluations.append(result)
        return evaluations
