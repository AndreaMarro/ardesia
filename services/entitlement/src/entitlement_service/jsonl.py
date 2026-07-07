"""Utility JSONL condivise da audit trail e outbox sandbox."""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path


def read_entries(path: Path) -> list[dict]:
    if not path.exists():
        return []
    entries = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            entries.append(value)
    return entries


def append_entry(path: Path, entry: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, separators=(",", ":")) + "\n")


def rewrite_keeping(path: Path, keep: Callable[[dict], bool]) -> int:
    """Riscrive il file tenendo solo le entry per cui keep() è True.
    Ritorna il numero di entry rimosse. Usato SOLO per erasure GDPR e
    retention: in esercizio normale i file sono append-only."""
    entries = read_entries(path)
    kept = [e for e in entries if keep(e)]
    removed = len(entries) - len(kept)
    if removed:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fh:
            for entry in kept:
                fh.write(json.dumps(entry, separators=(",", ":")) + "\n")
    return removed
