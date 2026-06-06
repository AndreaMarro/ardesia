"""ADR-001 deve esistere e documentare le scelte di base, allineate al codice reale.

Non tautologico: oltre a verificare le sezioni dell'ADR, controlla che i provider
LLM nominati (mock, kimi) corrispondano a moduli realmente presenti nel package —
così la doc non può divergere silenziosamente dall'architettura implementata.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCH = ROOT / "ARCH.md"


def _arch_text() -> str:
    assert ARCH.exists(), "ARCH.md mancante"
    return ARCH.read_text(encoding="utf-8")


def test_adr_001_present():
    text = _arch_text()
    assert "ADR-001" in text
    assert "Status:" in text and "accepted" in text


def test_adr_001_documents_required_choices():
    text = _arch_text().lower()
    # le 4 scelte richieste da MILESTONES M0
    assert "python 3.12" in text
    assert "sqlite" in text and "sqlite-vec" in text
    assert "router" in text and "mock" in text and "kimi" in text
    assert "json" in text and "citazion" in text  # schemi JSON + citazioni


def test_adr_named_providers_exist_in_package():
    # i provider citati nell'ADR devono esistere come moduli reali
    text = _arch_text().lower()
    llm_dir = ROOT / "lessonos" / "llm"
    if "kimi" in text:
        assert (llm_dir / "kimi.py").exists(), "ADR cita kimi ma manca kimi.py"
    if "router" in text:
        assert (llm_dir / "router.py").exists(), "ADR cita router ma manca router.py"


def test_adr_respects_no_local_models_constraint():
    # coerenza col vincolo PLAN §6 / AGENTS §5: niente modelli locali, niente PII
    text = _arch_text().lower()
    assert "modelli locali" in text  # devono comparire come scelta scartata
    assert "api-models" in text or "api models" in text
