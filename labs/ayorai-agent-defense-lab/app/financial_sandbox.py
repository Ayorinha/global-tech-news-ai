from dataclasses import dataclass, field
from uuid import uuid4


@dataclass
class SyntheticAccount:
    account_id: str
    owner: str
    balance: float
    classification: str = "CONFIDENTIAL"


@dataclass
class SyntheticLedger:
    accounts: dict[str, SyntheticAccount] = field(default_factory=dict)
    events: list[dict] = field(default_factory=list)

    @classmethod
    def demo(cls) -> "SyntheticLedger":
        ledger = cls()
        ledger.accounts = {
            "ACC-1001": SyntheticAccount("ACC-1001", "Synthetic Customer A", 25000.0),
            "ACC-1002": SyntheticAccount("ACC-1002", "Synthetic Customer B", 12000.0),
        }
        return ledger

    def record(self, event_type: str, actor: str, payload: dict) -> dict:
        event = {"event_id": str(uuid4()), "event_type": event_type, "actor": actor, "payload": payload}
        self.events.append(event)
        return event

    def create_payment_draft(self, actor: str, account_id: str, amount: float, beneficiary: str) -> dict:
        account = self.accounts.get(account_id)
        if not account:
            return self.record("PAYMENT_REJECTED", actor, {"reason": "account_not_found", "account_id": account_id})
        if amount <= 0 or amount > account.balance:
            return self.record("PAYMENT_REJECTED", actor, {"reason": "amount_invalid_or_insufficient", "account_id": account_id, "amount": amount})
        return self.record("PAYMENT_DRAFT", actor, {"account_id": account_id, "amount": amount, "beneficiary": beneficiary, "status": "PENDING_APPROVAL"})

    def snapshot(self) -> dict:
        return {"accounts": {k: vars(v) for k, v in self.accounts.items()}, "events": self.events}
