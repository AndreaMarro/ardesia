"""ARDESIA Convergence — schema e validazione dello stato del control plane.

Action 1 del programma di convergenza (design 2026-07-24). Standard library
soltanto: nessuna dipendenza nuova. Il modulo definisce lo schema versionato
del documento di stato e i controlli negativi che il design impone:

- due programmi attivi devono far fallire la validazione;
- uno stato stale deve fallire il gate di freshness;
- una PR aperta non classificata deve fallire il report di completezza;
- una worktree con dati non tracciati o non raggiungibili non e' auto-rimovibile.

Il validatore NON tocca Git ne' il filesystem: opera solo sul documento gia'
generato. Cosi' i controlli negativi sono riproducibili con fixture sintetiche.
"""
from __future__ import annotations

import datetime
from typing import Any

SCHEMA_VERSION = 1

# Un solo programma di convergenza attivo alla volta (vincolo costituzionale 1).
MAX_ACTIVE_PROGRAMS = 1

# Oltre queste ore lo stato e' considerato stale e va rigenerato prima di deciderci.
FRESHNESS_MAX_HOURS = 24

REQUIRED_TOP_KEYS = (
    "schema_version",
    "generated_at",
    "generator",
    "accepted_base",
    "active_branch",
    "worktrees",
    "entropy",
    "ceilings",
    "open_work",
    "violations",
)

VALID_DISPOSITIONS = (
    "prunable",             # clean, nessun commit proprio: rimovibile dopo conferma umana
    "bundle-then-prune",    # commit propri ma clean: bundle prima della rimozione
    "preserve-uncommitted",  # dirty: mai rimuovere automaticamente
    "unknown",              # non classificata: blocca la completezza
)


class StateValidationError(Exception):
    """Sollevata quando il documento di stato viola lo schema o un gate."""


def _parse_iso(value: Any) -> datetime.datetime:
    if not isinstance(value, str):
        raise StateValidationError(f"timestamp non stringa: {value!r}")
    try:
        return datetime.datetime.fromisoformat(value)
    except ValueError as exc:
        raise StateValidationError(f"timestamp ISO non valido: {value!r}") from exc


def validate_shape(doc: Any) -> None:
    """Controllo strutturale: chiavi presenti, tipi coerenti, schema noto."""
    if not isinstance(doc, dict):
        raise StateValidationError("il documento di stato deve essere un oggetto")
    missing = [k for k in REQUIRED_TOP_KEYS if k not in doc]
    if missing:
        raise StateValidationError(f"chiavi mancanti: {missing}")
    if doc["schema_version"] != SCHEMA_VERSION:
        raise StateValidationError(
            f"schema_version {doc['schema_version']} != atteso {SCHEMA_VERSION}"
        )
    if not isinstance(doc["worktrees"], list):
        raise StateValidationError("worktrees deve essere una lista")
    for wt in doc["worktrees"]:
        if not isinstance(wt, dict):
            raise StateValidationError("ogni worktree deve essere un oggetto")
        for key in ("path", "disposition_proposal", "auto_removable", "dirty"):
            if key not in wt:
                raise StateValidationError(f"worktree senza campo {key}: {wt.get('path')}")
        if wt["disposition_proposal"] not in VALID_DISPOSITIONS:
            raise StateValidationError(
                f"disposizione ignota {wt['disposition_proposal']!r} per {wt.get('path')}"
            )


def check_single_program(doc: dict) -> None:
    """Controllo negativo: due programmi attivi non passano."""
    active = doc.get("active_programs")
    if active is None:
        return
    if not isinstance(active, list):
        raise StateValidationError("active_programs deve essere una lista")
    if len(active) > MAX_ACTIVE_PROGRAMS:
        raise StateValidationError(
            f"{len(active)} programmi attivi > massimo {MAX_ACTIVE_PROGRAMS}: {active}"
        )


def check_freshness(doc: dict, now: datetime.datetime | None = None) -> None:
    """Controllo negativo: uno stato piu' vecchio della soglia fallisce."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    generated = _parse_iso(doc["generated_at"])
    if generated.tzinfo is None:
        generated = generated.replace(tzinfo=datetime.timezone.utc)
    age_hours = (now - generated).total_seconds() / 3600.0
    if age_hours > FRESHNESS_MAX_HOURS:
        raise StateValidationError(
            f"stato stale: {age_hours:.1f}h > {FRESHNESS_MAX_HOURS}h"
        )


def check_completeness(doc: dict) -> None:
    """Controllo negativo: una PR/branch aperto non classificato blocca."""
    for item in doc.get("open_work", []):
        if not isinstance(item, dict):
            raise StateValidationError("open_work deve contenere oggetti")
        if item.get("disposition") in (None, "", "unknown"):
            raise StateValidationError(
                f"open work non classificato: {item.get('id', item)}"
            )


def check_auto_removal_safety(doc: dict) -> None:
    """Controllo negativo: dati non tracciati/non raggiungibili -> non auto-rimovibile."""
    for wt in doc["worktrees"]:
        risky = wt.get("dirty") or wt.get("untracked") or wt.get("unreachable_commits")
        if wt.get("auto_removable") and risky:
            raise StateValidationError(
                f"worktree {wt.get('path')} marcata auto_removable con dati a rischio"
            )


def validate(doc: Any, now: datetime.datetime | None = None) -> None:
    """Validazione completa: forma + tutti i gate. Solleva alla prima violazione."""
    validate_shape(doc)
    check_single_program(doc)
    check_freshness(doc, now=now)
    check_completeness(doc)
    check_auto_removal_safety(doc)
