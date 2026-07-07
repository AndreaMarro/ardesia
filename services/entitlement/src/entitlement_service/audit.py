"""Audit trail append-only JSONL — SOLI hash e pseudonimi.

Regola dura: in questo file non entrano MAI email in chiaro, chiavi in
chiaro o token in chiaro. Il chiamante passa solo keyHash / entitlementId /
subjectHash (sha256). L'unica scrittura non-append è l'erasure GDPR e la
retention (documentate nel README), che riscrivono il file filtrato.
"""

from __future__ import annotations

from pathlib import Path

from .jsonl import append_entry, read_entries, rewrite_keeping


class AuditLog:
    def __init__(self, path: Path, clock_ms) -> None:
        self._path = Path(path)
        self._clock_ms = clock_ms

    @property
    def path(self) -> Path:
        return self._path

    def append(self, event: str, **fields: object) -> None:
        append_entry(self._path, {"ts": self._clock_ms(), "event": event, **fields})

    def entries(self) -> list[dict]:
        return read_entries(self._path)

    def for_subject(self, subject_hash: str) -> list[dict]:
        return [e for e in self.entries() if e.get("subjectHash") == subject_hash]

    def erase_subject(self, subject_hash: str) -> int:
        """Cancellazione GDPR: rimuove le entry del soggetto e appende un
        evento gdpr.delete come prova di erasure (il solo pseudonimo resta)."""
        removed = rewrite_keeping(self._path, lambda e: e.get("subjectHash") != subject_hash)
        self.append("gdpr.delete", subjectHash=subject_hash, removedAudit=removed)
        return removed

    def purge_older_than(self, cutoff_ms: int) -> int:
        """Retention: rimuove le entry più vecchie del cutoff."""
        return rewrite_keeping(self._path, lambda e: e.get("ts", 0) >= cutoff_ms)
