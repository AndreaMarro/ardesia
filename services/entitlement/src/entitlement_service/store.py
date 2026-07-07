"""Store astratto (SOLID: dependency inversion) + FileStore KV su filesystem.

Il core dipende SOLO dall'interfaccia Store — swap a Postgres/Redis =
una nuova implementazione di queste tre operazioni, zero modifiche al core.
Stessa semantica dell'EntitlementStore Blob-based di entitlementCore.ts:
read puntuale (niente list), write atomica per chiave, delete idempotente.
"""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path


class Store(ABC):
    @abstractmethod
    def read(self, path: str) -> bytes | None: ...

    @abstractmethod
    def write(self, path: str, data: bytes) -> None: ...

    @abstractmethod
    def delete(self, path: str) -> None: ...


class FileStore(Store):
    """KV file-based sotto una root (default var/data). Path relativi soltanto."""

    def __init__(self, root: Path) -> None:
        self._root = Path(root)

    def _resolve(self, path: str) -> Path:
        candidate = Path(path)
        if candidate.is_absolute() or ".." in candidate.parts:
            raise ValueError(f"store path non consentito: {path!r}")
        return self._root / candidate

    def read(self, path: str) -> bytes | None:
        target = self._resolve(path)
        try:
            return target.read_bytes()
        except FileNotFoundError:
            return None

    def write(self, path: str, data: bytes) -> None:
        target = self._resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    def delete(self, path: str) -> None:
        self._resolve(path).unlink(missing_ok=True)


def read_json(store: Store, path: str) -> dict | None:
    """Come readJson TS: contenuto assente o corrotto -> None, mai eccezione."""
    raw = store.read(path)
    if raw is None:
        return None
    try:
        value = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return value if isinstance(value, dict) else None


def write_json(store: Store, path: str, value: dict) -> None:
    store.write(path, json.dumps(value, separators=(",", ":")).encode())
