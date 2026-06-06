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


# ---------------------------------------------------------------------------
# ADR-002 — Lesson Capsule Pipeline M2
# ---------------------------------------------------------------------------


def test_adr_002_present():
    text = _arch_text()
    assert "ADR-002" in text
    assert "Pipeline Lesson Capsule" in text
    assert "accepted" in text


def test_adr_002_documents_four_phases():
    text = _arch_text().lower()
    assert "ingest" in text
    assert "segment" in text
    assert "estration" in text or "extract" in text
    assert "assembl" in text


def test_adr_002_cited_modules_exist():
    text = _arch_text()
    root = ROOT / "lessonos"
    files = [
        root / "store" / "fixture_loader.py",
        root / "capsule" / "segmentation.py",
        root / "capsule" / "extraction.py",
        root / "capsule" / "assembly.py",
        root / "store" / "base.py",
        root / "store" / "sqlite.py",
        root / "llm" / "router.py",
    ]
    for f in files:
        assert f.exists(), f"ADR-002 cita {f.name} ma il modulo manca"


def test_adr_002_cited_lines_are_in_range():
    """Ogni citazione file:line in ADR-002 deve puntare a righe che esistono."""
    import re

    text = _arch_text()
    # estrai citazioni tipo lessonos/.../file.py:12-34 o :56
    pattern = re.compile(r"`?(lessonos/[\w/]+\.py):(\d+)(?:-(\d+))?`?")
    matches = pattern.findall(text)
    assert matches, "nessuna citazione file:line trovata in ADR-002"

    for rel_path, start_str, end_str in matches:
        start = int(start_str)
        end = int(end_str) if end_str else start
        fpath = ROOT / rel_path
        assert fpath.exists(), f"ADR-002 cita {rel_path} che non esiste"
        lines = fpath.read_text(encoding="utf-8").splitlines()
        assert end <= len(lines), (
            f"ADR-002 cita {rel_path}:{start}-{end} "
            f"ma il file ha solo {len(lines)} righe"
        )


def test_adr_002_grounding_invariant():
    text = _arch_text().lower()
    assert "grounded" in text
    assert "valueerror" in text
    assert "seg_id" in text
    assert "citazione penzolante" in text or "dangling" in text or "unknown segment" in text


def test_adr_002_no_new_deps():
    text = _arch_text().lower()
    assert "zero dipendenze" in text or "nessuna dipendenza" in text or "stdlib" in text

