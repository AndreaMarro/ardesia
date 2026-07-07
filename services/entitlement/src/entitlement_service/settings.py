"""Configurazione via env — nessun segreto hardcoded.

ENTITLEMENT_API_KEY        chiave del piano authority (register/revoke/gdpr).
                           Se assente il piano authority risponde 503
                           (deny-by-default): il servizio NON parte con una
                           chiave di fabbrica.
ENTITLEMENT_DATA_DIR       root del KV file-based (default var/data).
ENTITLEMENT_OUTBOX_DIR     outbox sandbox JSONL (default var/outbox).
ENTITLEMENT_RETENTION_DAYS retention audit/outbox in giorni (default 30).
"""

from __future__ import annotations

import os
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

DEFAULT_RETENTION_DAYS = 30


def _now_ms() -> int:
    return int(time.time() * 1000)


@dataclass
class Settings:
    data_dir: Path
    outbox_dir: Path
    api_key: str | None
    retention_days: int = DEFAULT_RETENTION_DAYS
    clock_ms: Callable[[], int] = field(default=_now_ms)

    @classmethod
    def from_env(cls, env: dict[str, str] | None = None) -> "Settings":
        env = dict(os.environ if env is None else env)
        return cls(
            data_dir=Path(env.get("ENTITLEMENT_DATA_DIR", "var/data")),
            outbox_dir=Path(env.get("ENTITLEMENT_OUTBOX_DIR", "var/outbox")),
            api_key=env.get("ENTITLEMENT_API_KEY") or None,
            retention_days=int(
                env.get("ENTITLEMENT_RETENTION_DAYS", str(DEFAULT_RETENTION_DAYS))
            ),
        )
