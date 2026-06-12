"""Tests for ``lessonos/status.py`` — DB status report.

ZERO-LLM, deterministic, reads from a ``SQLiteStore(:memory:)`` populated
with the standard fixtures.
"""

from __future__ import annotations

from pathlib import Path as FsPath

import pytest

from lessonos.status import build_status_report
from lessonos.store.sqlite import SQLiteStore

_HERE = FsPath(__file__).resolve().parent


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def empty_store() -> SQLiteStore:
    return SQLiteStore(":memory:")


@pytest.fixture
def populated_store() -> SQLiteStore:
    """Store loaded with the ``sample_path`` fixture (3 calculus lessons)."""
    store = SQLiteStore(":memory:")
    fixture_root = _HERE.parent / "fixtures" / "sample_path"
    from lessonos.store.fixture_loader import (
        load_sample_path,
        ingest_lesson_moments,
    )

    path_obj = load_sample_path(store, fixture_root)
    for lid in path_obj.lesson_ids:
        ingest_lesson_moments(store, lid, fixture_root)
    return store


@pytest.fixture
def store_with_graph(populated_store: SQLiteStore) -> SQLiteStore:
    """Populated store with graph data written for ``l1_derivative_definition``."""
    store = populated_store
    from lessonos.models.entities import GraphNode, GraphEdge, GraphEvidence

    # Write a node
    n1 = GraphNode(node_id="n1", node_type="concept", ref_id="derivata",
                   label="derivata")
    store.save_graph_node("l1_derivative_definition", n1)
    # Write an edge
    e1 = GraphEdge(edge_id="e1", source="derivata",
                   target="rapporto_incrementale",
                   edge_type="depends_on",
                   metadata={})
    store.save_graph_edge("l1_derivative_definition", e1)
    # Write an evidence
    store.save_evidence(GraphEvidence(
        evidence_id="ev1", edge_id="e1", seg_id="l1s1",
        excerpt="derivata come velocita istantanea",
        confidence=0.9, lesson_id="l1_derivative_definition",
    ))
    return store


@pytest.fixture
def store_with_capsule(populated_store: SQLiteStore) -> SQLiteStore:
    """Populated store with a capsule stored for one lesson."""
    store = populated_store
    store.save_capsule("l1_derivative_definition", '{"mock": "capsule"}')
    return store


# ---------------------------------------------------------------------------
# Tests — empty store
# ---------------------------------------------------------------------------

def test_empty_store_report(empty_store: SQLiteStore) -> None:
    """Empty DB → report with zeros, no crash."""
    report = build_status_report(empty_store)
    assert "**Paths**: 0" in report
    assert "**Lessons**: 0" in report
    assert "**Total segments**: 0" in report
    assert "**Graph nodes**: 0" in report
    assert "**Graph edges**: 0" in report
    assert "**Evidence**: 0" in report
    assert "**Teachers**: 0" in report
    assert "**Cost ledger entries**: 0" in report
    assert "**0 lesson(s)**" in report


# ---------------------------------------------------------------------------
# Tests — populated store
# ---------------------------------------------------------------------------

def test_populated_counts(populated_store: SQLiteStore) -> None:
    """Sample path with 4 lessons produces correct counts."""
    report = build_status_report(populated_store)
    assert "**Paths**: 1" in report
    assert "**Lessons**: 4" in report
    # No segments loaded via ingest_lesson_moments for sample_path
    assert "**Total segments**: 0" in report


def test_teachers_from_paths(populated_store: SQLiteStore) -> None:
    """Teacher listing derived from path.teacher_id."""
    report = build_status_report(populated_store)
    # Default sample_path paths have teacher_id = None (no teacher set)
    assert "**Teachers**: 1" in report
    assert "(no teacher)" in report


def test_store_with_graph(store_with_graph: SQLiteStore) -> None:
    """Graph nodes, edges, evidence counted."""
    report = build_status_report(store_with_graph)
    assert "**Graph nodes**: 1" in report
    assert "**Graph edges**: 1" in report
    assert "**Evidence**: 1" in report


def test_capsule_present(store_with_capsule: SQLiteStore) -> None:
    """Capsule presence reflected in per-lesson and summary."""
    report = build_status_report(store_with_capsule)
    assert "capsule=yes" in report
    assert "**1 capsule(s)**" in report


def test_capsule_missing_warning(populated_store: SQLiteStore) -> None:
    """Lessons without capsule → warning in summary."""
    report = build_status_report(populated_store)
    assert "**0 capsule(s)**" in report
    assert "4 lesson(s) missing capsule" in report


def test_determinism(populated_store: SQLiteStore) -> None:
    """Same store, same output (byte-for-byte, anti-tautology)."""
    r1 = build_status_report(populated_store)
    r2 = build_status_report(populated_store)
    assert r1 == r2


def test_determinism_empty(empty_store: SQLiteStore) -> None:
    """Empty store determinism."""
    r1 = build_status_report(empty_store)
    r2 = build_status_report(empty_store)
    assert r1 == r2


# ---------------------------------------------------------------------------
# Tests — cost ledger
# ---------------------------------------------------------------------------

def test_ledger_entries(populated_store: SQLiteStore) -> None:
    """Cost ledger entries counted in report."""
    from lessonos.models.ledger import CostLedgerEntry

    # Empty ledger
    report = build_status_report(populated_store)
    assert "**Cost ledger entries**: 0" in report

    # Add an entry
    entry = CostLedgerEntry(
        entry_id="cl:0001",
        lesson_id="l1_derivative_definition",
        model="mock",
        provider="mock",
        prompt_tokens=100,
        completion_tokens=50,
        cost_usd=0.0001,
    )
    populated_store.save_ledger_entry(entry)

    report2 = build_status_report(populated_store)
    assert "**Cost ledger entries**: 1" in report2
    assert "Total cost: $0.000100" in report2
    assert "Total prompt tokens: 100" in report2
    assert "Total completion tokens: 50" in report2


# ---------------------------------------------------------------------------
# Tests — CLI wiring
# ---------------------------------------------------------------------------

def test_cli_wiring() -> None:
    """``lessonos status`` on :memory: returns a valid report."""
    from lessonos.cli import main

    exit_code = main(["status"])
    assert exit_code == 0


def test_cli_wiring_empty_db() -> None:
    """``lessonos status --db :memory:`` returns a report."""
    from lessonos.cli import main

    exit_code = main(["status", "--db", ":memory:"])
    assert exit_code == 0
