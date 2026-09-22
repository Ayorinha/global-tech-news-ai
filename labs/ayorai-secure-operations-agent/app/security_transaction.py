"""SSI Security Transaction: Pix-inspired transaction controls for AI systems.

This is a local research reference implementation. It uses standard cryptography,
fail-closed reconciliation, capability attenuation, transaction binding and a
sovereign data cell. It is not a production HSM/TEE or regulatory certification.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import base64
import hmac
import json
import secrets
from typing import Any, Mapping

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _canonical(value: Mapping[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def _hash(value: Mapping[str, Any]) -> str:
    return sha256(_canonical(value)).hexdigest()


def _now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True)
class SecurityTransaction:
    transaction_id: str
    requester: str
    operation: str
    resource: str
    purpose: str
    data_classification: str
    provenance: str
    nonce: str
    expires_at: str
    policy_version: str
    context_hash: str = ""

    def canonical(self) -> dict[str, Any]:
        return {
            "transaction_id": self.transaction_id,
            "requester": self.requester,
            "operation": self.operation,
            "resource": self.resource,
            "purpose": self.purpose,
            "data_classification": self.data_classification,
            "provenance": self.provenance,
            "nonce": self.nonce,
            "expires_at": self.expires_at,
            "policy_version": self.policy_version,
            "context_hash": self.context_hash,
        }

    @property
    def transaction_hash(self) -> str:
        return _hash(self.canonical())

    @staticmethod
    def create(
        requester: str,
        operation: str,
        resource: str,
        purpose: str,
        data_classification: str = "RESTRICTED",
        provenance: str = "trusted_internal",
        policy_version: str = "ssi-1",
        ttl_seconds: int = 30,
        context_hash: str = "",
    ) -> "SecurityTransaction":
        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be positive")
        now = _now()
        return SecurityTransaction(
            transaction_id="TX-" + secrets.token_hex(12),
            requester=requester,
            operation=operation,
            resource=resource,
            purpose=purpose,
            data_classification=data_classification,
            provenance=provenance,
            nonce=secrets.token_hex(16),
            expires_at=(now + timedelta(seconds=ttl_seconds)).isoformat(),
            policy_version=policy_version,
            context_hash=context_hash,
        )

    def is_expired(self, now: datetime | None = None) -> bool:
        current = now or _now()
        return current >= datetime.fromisoformat(self.expires_at)


@dataclass(frozen=True)
class DefenseDecision:
    defender: str
    status: str
    transaction_hash: str
    reasons: tuple[str, ...] = ()


class SemanticDefense:
    """Policy/context view. It never issues cryptographic authority."""

    ALLOWED_OPERATIONS = {"READ_BALANCE", "READ_CUSTOMER_STATUS", "READ_PUBLIC"}

    def evaluate(self, tx: SecurityTransaction) -> DefenseDecision:
        reasons: list[str] = []
        if not tx.requester.strip():
            reasons.append("missing requester")
        if tx.operation not in self.ALLOWED_OPERATIONS:
            reasons.append("operation outside semantic allowlist")
        if tx.provenance not in {"user", "trusted_internal"}:
            reasons.append("untrusted provenance")
        if tx.is_expired():
            reasons.append("transaction expired")
        if not tx.purpose.strip():
            reasons.append("missing purpose")
        status = "ALLOW" if not reasons else "DENY"
        return DefenseDecision("semantic", status, tx.transaction_hash, tuple(reasons))


class CapabilityDefense:
    """Cryptographic view. It validates exact transaction-bound authority."""

    def __init__(self, secret: bytes | None = None) -> None:
        self._secret = secret or secrets.token_bytes(32)

    def issue(self, tx: SecurityTransaction) -> str:
        payload = {"tx_hash": tx.transaction_hash, "scope": tx.operation, "exp": tx.expires_at}
        encoded = base64.urlsafe_b64encode(_canonical(payload)).decode().rstrip("=")
        mac = hmac.new(self._secret, encoded.encode(), sha256).hexdigest()
        return encoded + "." + mac

    def evaluate(self, tx: SecurityTransaction, capability: str | None) -> DefenseDecision:
        reasons: list[str] = []
        if not capability or "." not in capability:
            reasons.append("missing capability")
        else:
            encoded, mac = capability.rsplit(".", 1)
            expected = hmac.new(self._secret, encoded.encode(), sha256).hexdigest()
            if not hmac.compare_digest(mac, expected):
                reasons.append("invalid capability MAC")
            else:
                try:
                    padding = "=" * (-len(encoded) % 4)
                    payload = json.loads(base64.urlsafe_b64decode((encoded + padding).encode()))
                    if payload.get("tx_hash") != tx.transaction_hash:
                        reasons.append("capability not bound to transaction")
                    if payload.get("scope") != tx.operation:
                        reasons.append("capability scope mismatch")
                    if tx.is_expired():
                        reasons.append("transaction expired")
                except (ValueError, json.JSONDecodeError):
                    reasons.append("malformed capability")
        status = "ALLOW" if not reasons else "DENY"
        return DefenseDecision("capability", status, tx.transaction_hash, tuple(reasons))


class Reconciler:
    """Verifier only: it cannot turn a disagreement into authorization."""

    def reconcile(self, a: DefenseDecision, b: DefenseDecision) -> str:
        if (
            a.status == "ALLOW"
            and b.status == "ALLOW"
            and a.transaction_hash == b.transaction_hash
        ):
            return "EXECUTE"
        return "QUARANTINE"


@dataclass(frozen=True)
class ResponseCapsule:
    capsule_id: str
    transaction_id: str
    transaction_hash: str
    resource_hash: str
    ciphertext: str
    nonce: str
    expires_at: str


@dataclass(frozen=True)
class RevealCapability:
    token: str
    capsule_id: str
    requester: str
    expires_at: str


class SovereignDataCell:
    """Minimal data boundary: data stays local; only a sealed result leaves."""

    def __init__(self) -> None:
        self._key = AESGCM.generate_key(bit_length=256)
        self._aead = AESGCM(self._key)
        self._records: dict[str, dict[str, Any]] = {}
        self._used_reveal_tokens: set[str] = set()

    def put(self, resource: str, value: Mapping[str, Any]) -> None:
        self._records[resource] = dict(value)

    def execute(
        self,
        tx: SecurityTransaction,
        outcome: Mapping[str, Any],
        reveal_ttl_seconds: int = 30,
    ) -> tuple[ResponseCapsule, RevealCapability]:
        if tx.resource not in self._records:
            raise KeyError("resource not found")
        if tx.is_expired():
            raise PermissionError("transaction expired")
        plaintext = _canonical(dict(outcome))
        nonce = secrets.token_bytes(12)
        aad = tx.transaction_hash.encode()
        ciphertext = self._aead.encrypt(nonce, plaintext, aad)
        capsule_id = "CAPS-" + secrets.token_hex(12)
        expires_at = (_now() + timedelta(seconds=reveal_ttl_seconds)).isoformat()
        token = secrets.token_urlsafe(32)
        capsule = ResponseCapsule(
            capsule_id=capsule_id,
            transaction_id=tx.transaction_id,
            transaction_hash=tx.transaction_hash,
            resource_hash=sha256(tx.resource.encode()).hexdigest(),
            ciphertext=base64.urlsafe_b64encode(ciphertext).decode(),
            nonce=base64.urlsafe_b64encode(nonce).decode(),
            expires_at=expires_at,
        )
        return capsule, RevealCapability(token, capsule_id, tx.requester, expires_at)

    def reveal(
        self,
        capsule: ResponseCapsule,
        capability: RevealCapability,
        requester: str,
        now: datetime | None = None,
    ) -> dict[str, Any]:
        current = now or _now()
        if capability.token in self._used_reveal_tokens:
            raise PermissionError("reveal capability replay detected")
        if capability.capsule_id != capsule.capsule_id:
            raise PermissionError("capability not bound to capsule")
        if capability.requester != requester:
            raise PermissionError("requester mismatch")
        if current >= datetime.fromisoformat(capability.expires_at):
            raise PermissionError("reveal capability expired")
        if current >= datetime.fromisoformat(capsule.expires_at):
            raise PermissionError("response capsule expired")
        nonce = base64.urlsafe_b64decode(capsule.nonce.encode())
        ciphertext = base64.urlsafe_b64decode(capsule.ciphertext.encode())
        plaintext = self._aead.decrypt(nonce, ciphertext, capsule.transaction_hash.encode())
        self._used_reveal_tokens.add(capability.token)
        return json.loads(plaintext)


@dataclass
class SSITransactionEngine:
    semantic: SemanticDefense = field(default_factory=SemanticDefense)
    capability: CapabilityDefense = field(default_factory=CapabilityDefense)
    reconciler: Reconciler = field(default_factory=Reconciler)
    cell: SovereignDataCell = field(default_factory=SovereignDataCell)

    def authorize(
        self,
        tx: SecurityTransaction,
        capability: str | None,
    ) -> tuple[DefenseDecision, DefenseDecision, str]:
        a = self.semantic.evaluate(tx)
        b = self.capability.evaluate(tx, capability)
        return a, b, self.reconciler.reconcile(a, b)
