"""MailSink: unico confine autorizzato a vedere token + destinatario insieme
(stesso contratto di apps/studio/src/entitlements/mailSink.ts).

SANDBOX ONLY: nessun provider SMTP reale. La consegna è simulata su file
JSONL in var/outbox/. L'indirizzo email NON viene MAI persistito: nell'outbox
finisce solo il suo sha256 (toHash) accanto al token — come farebbe una mail
vera, che contiene il token ma il cui indirizzo resta al mail-provider.
"""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path


class MailSink(ABC):
    @abstractmethod
    def deliver_token(self, to: str, token: str) -> None: ...


class MemoryMailSink(MailSink):
    """Per i test: cattura le consegne in memoria. Non logga, non persiste."""

    def __init__(self) -> None:
        self.deliveries: list[dict[str, str]] = []

    def deliver_token(self, to: str, token: str) -> None:
        self.deliveries.append({"to": to, "token": token})


class JsonlMailSink(MailSink):
    """Consegna sandbox: una riga JSONL per messaggio in var/outbox/outbox.jsonl.
    Persiste toHash (sha256 dell'email) + token; MAI l'email in chiaro."""

    def __init__(self, outbox_dir: Path, clock_ms, hash_email) -> None:
        self._path = Path(outbox_dir) / "outbox.jsonl"
        self._clock_ms = clock_ms
        self._hash_email = hash_email

    @property
    def path(self) -> Path:
        return self._path

    def deliver_token(self, to: str, token: str) -> None:
        entry = {"ts": self._clock_ms(), "toHash": self._hash_email(to), "token": token}
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with self._path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry, separators=(",", ":")) + "\n")
