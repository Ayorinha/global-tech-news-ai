"""Integrity helpers for models, tools, policies and datasets."""

from hashlib import sha256

def sha256_bytes(content: bytes) -> str:
    return sha256(content).hexdigest()

def verify_sha256(content: bytes, expected: str) -> bool:
    return sha256_bytes(content) == expected.lower()

def require_pinned_version(version: str) -> None:
    if not version or version in {"latest", "*", "main", "master"}:
        raise ValueError("unpinned artifact version")
