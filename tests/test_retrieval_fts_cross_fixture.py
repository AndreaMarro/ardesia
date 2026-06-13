"""Cross-fixture FTS retrieval tests — all 3 fixture domains.

Hypothesis: FTS indexing + search produces meaningful, domain-accurate
results across all 3 fixture types (calculus, spaced repetition, biology).

Each test loads a fixture, ingests segments, builds the FTS index, and
verifies that domain-specific search terms find the expected content.

This is P2 hardening: validates the FTS layer generalises beyond a
single fixture/domain, catching regressions in segment indexing,
_capsule_to_text, or search across diverse domain vocabulary.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from lessonos.retrieval.fts import FTSRetriever
from lessonos.store.fixture_loader import (
    ingest_lesson_moments,
    ingest_lesson_segments,
    load_sample_path,
)
from lessonos.store.sqlite import SQLiteStore

HERE = Path(__file__).resolve().parent
FIXTURES = HERE.parent / "fixtures"

ALL_FIXTURES = ["sample_path", "spaced_path", "bio_path"]

_SKIP_CALCULUS = pytest.mark.skipif(
    not (FIXTURES / "sample_path" / "path.json").exists(),
    reason="calculus fixture (sample_path) not found",
)
_SKIP_SPACED = pytest.mark.skipif(
    not (FIXTURES / "spaced_path" / "path.json").exists(),
    reason="spaced-repetition fixture (spaced_path) not found",
)
_SKIP_BIO = pytest.mark.skipif(
    not (FIXTURES / "bio_path" / "path.json").exists(),
    reason="biology fixture (bio_path) not found",
)


# ── Helpers ─────────────────────────────────────────────────────────────────


def _load_with_segments(
    fixture_name: str,
) -> FTSRetriever:
    """Load fixture, ingest segments for all lessons + build FTS index."""
    store = SQLiteStore(":memory:")
    root = FIXTURES / fixture_name
    load_sample_path(store, root)

    path_data = json.loads((root / "path.json").read_text())
    lessons = path_data["lessons"] if "lessons" in path_data else path_data.get("lesson_ids", [])

    for lid in lessons:
        ingest_lesson_segments(store, lid, root)

    # Also ingest moments so the store is fully populated
    for lid in lessons:
        ingest_lesson_moments(store, lid, root)

    r = FTSRetriever(store)
    r.build_index()
    return r


# ── Tests: Calculus fixture (sample_path) ──────────────────────────────────


@_SKIP_CALCULUS
class TestCalculusFixture:
    """FTS search on the calculus fixture (4 lessons, derivative/integral)."""

    @pytest.fixture(scope="class")
    def retriever(self) -> FTSRetriever:
        return _load_with_segments("sample_path")

    def test_search_derivata_finds_segment_results(
        self, retriever: FTSRetriever
    ) -> None:
        """'derivata' — core calculus term — finds segment results."""
        results = retriever.search("derivata", top_k=10)
        assert len(results) == 5
        assert any(r.source == "segment" for r in results)

    def test_search_derivata_finds_results(
        self, retriever: FTSRetriever
    ) -> None:
        """'derivata' returns results from the calculus fixture."""
        results = retriever.search("derivata", top_k=10)
        assert len(results) == 5

    def test_search_integrale_includes_lesson_l3(
        self, retriever: FTSRetriever
    ) -> None:
        """'integrale' — topic of l3 — includes the integral lesson in results."""
        results = retriever.search("integrale", top_k=10)
        assert len(results) == 4
        lesson_ids = {r.lesson_id for r in results}
        assert any("l3" in lid for lid in lesson_ids), (
            f"Expected l3 (integral lesson) in results, got {lesson_ids}"
        )

    def test_search_regola_della_potenza_finds_specific_segment(
        self, retriever: FTSRetriever
    ) -> None:
        """'regola della potenza' — power rule — finds the rule segment (l2s2)."""
        results = retriever.search("regola della potenza", top_k=10)
        assert len(results) == 1
        source_ids = {r.source_id for r in results}
        assert "l2s2" in source_ids, (
            f"Expected l2s2 (power rule segment) in results, got {source_ids}"
        )

    def test_search_non_domain_term_returns_empty(
        self, retriever: FTSRetriever
    ) -> None:
        """A term from a completely different domain (biology) returns nothing."""
        results = retriever.search("fotosintesi", top_k=5)
        assert len(results) == 0


# ── Tests: Spaced-repetition fixture (spaced_path) ─────────────────────────


@_SKIP_SPACED
class TestSpacedRepetitionFixture:
    """FTS search on the spaced-repetition fixture (SM-2 / FSRS, 2 lessons)."""

    @pytest.fixture(scope="class")
    def retriever(self) -> FTSRetriever:
        return _load_with_segments("spaced_path")

    def test_search_ripetizione_spaziata_finds_segments(
        self, retriever: FTSRetriever
    ) -> None:
        """'ripetizione spaziata' — core term — finds segment results."""
        results = retriever.search("ripetizione spaziata", top_k=10)
        assert len(results) == 1
        assert any(r.source == "segment" for r in results)

    def test_search_sm_returns_lesson_1_results(
        self, retriever: FTSRetriever
    ) -> None:
        """'SM' (from SM-2) — specific algorithm prefix — returns results
        from l1_sm2_intro.

        Note: FTS5 tokenises 'SM-2' into 'SM' and '2'. We search for 'SM'
        which matches the SM-2 mentions in l1_sm2_intro segments.
        """
        results = retriever.search("SM", top_k=10)
        assert len(results) == 3
        lesson_ids = {r.lesson_id for r in results}
        assert "l1_sm2_intro" in lesson_ids

    def test_search_fsrs_returns_lesson_2_results(
        self, retriever: FTSRetriever
    ) -> None:
        """'FSRS' — topic of l2 — returns results from the advanced lesson."""
        results = retriever.search("FSRS", top_k=10)
        assert len(results) == 3
        lesson_ids = {r.lesson_id for r in results}
        assert any("l2" in lid for lid in lesson_ids)

    def test_search_fattore_di_facilita_finds_segment(
        self, retriever: FTSRetriever
    ) -> None:
        """'fattore di facilita' — EF from SM-2 formula — finds segment."""
        results = retriever.search("fattore di facilita", top_k=10)
        assert len(results) == 1
        assert any(r.source == "segment" for r in results)


# ── Tests: Biology fixture (bio_path) ──────────────────────────────────────


@_SKIP_BIO
class TestBiologyFixture:
    """FTS search on the biology fixture (photosynthesis, 2 lessons)."""

    @pytest.fixture(scope="class")
    def retriever(self) -> FTSRetriever:
        return _load_with_segments("bio_path")

    def test_search_fotosintesi_finds_segments(
        self, retriever: FTSRetriever
    ) -> None:
        """'fotosintesi' — core biology term — finds segment results."""
        results = retriever.search("fotosintesi", top_k=10)
        assert len(results) == 1
        assert any(r.source == "segment" for r in results)

    def test_search_clorofilla_finds_segment(
        self, retriever: FTSRetriever
    ) -> None:
        """'clorofilla' — key pigment — finds the segment mentioning it.

        Note: FTS5 doesn't do stemming; the fixture uses 'cloroplasti'
        (plural), 'clorofilla' (singular). We search for 'clorofilla'
        which appears verbatim in the text.
        """
        results = retriever.search("clorofilla", top_k=10)
        assert len(results) == 2
        lesson_ids = {r.lesson_id for r in results}
        assert "l1_fotosintesi_intro" in lesson_ids

    def test_search_co2_finds_segment(
        self, retriever: FTSRetriever
    ) -> None:
        """'CO2' — chemical formula — finds the reaction segment."""
        results = retriever.search("CO2", top_k=10)
        assert len(results) == 2
        assert any(r.source == "segment" for r in results)

    def test_search_calvin_finds_lesson_2(
        self, retriever: FTSRetriever
    ) -> None:
        """'Calvin' — l2 topic (ciclo di Calvin) — returns results from l2."""
        results = retriever.search("Calvin", top_k=10)
        assert len(results) == 1
        lesson_ids = {r.lesson_id for r in results}
        assert "l2_reazioni_luce" in lesson_ids

    def test_search_english_photosynthesis_returns_empty(
        self, retriever: FTSRetriever
    ) -> None:
        """English 'photosynthesis' not in the Italian fixture — no results."""
        results = retriever.search("photosynthesis", top_k=5)
        assert len(results) == 0


# ── Tests: Cross-domain uniqueness ─────────────────────────────────────────


class TestCrossDomainUniqueness:
    """Terms unique to one domain should not bleed into another's index."""

    @pytest.mark.parametrize(
        ("fixture_name", "domain_term", "foreign_term", "expected_hits"),
        [
            ("sample_path", "derivata", "fotosintesi", 5),
            ("spaced_path", "SM", "derivata", 3),
            ("bio_path", "fotosintesi", "SM", 1),
        ],
    )
    def test_domain_term_finds_results_foreign_does_not(
        self,
        fixture_name: str,
        domain_term: str,
        foreign_term: str,
        expected_hits: int,
    ) -> None:
        """Domain term finds results; foreign term from another domain doesn't."""
        r = _load_with_segments(fixture_name)

        domain_results = r.search(domain_term, top_k=10)
        assert len(domain_results) == expected_hits, (
            f"Expected {expected_hits} results for domain term '{domain_term}' "
            f"on {fixture_name}, got {len(domain_results)}"
        )

        foreign_results = r.search(foreign_term, top_k=10)
        assert len(foreign_results) == 0, (
            f"Expected NO results for foreign term '{foreign_term}' "
            f"on {fixture_name}"
        )


# ── Tests: Rebuild consistency ─────────────────────────────────────────────


class TestRebuildAcrossFixtures:
    """rebuild_index preserves search results on all 3 fixture types."""

    @pytest.mark.parametrize(
        ("fixture_name", "domain_term", "expected_hits"),
        [
            ("sample_path", "derivata", 5),
            ("spaced_path", "ripetizione spaziata", 1),
            ("bio_path", "fotosintesi", 1),
        ],
    )
    def test_rebuild_preserves_domain_results(
        self, fixture_name: str, domain_term: str, expected_hits: int
    ) -> None:
        """rebuild_index does not break search for domain terms."""
        r = _load_with_segments(fixture_name)

        before = r.search(domain_term, top_k=10)
        assert len(before) == expected_hits
        r.rebuild_index()

        after = r.search(domain_term, top_k=10)
        assert len(after) == expected_hits

        # The set of source_ids should be the same before and after rebuild
        before_ids = {res.source_id for res in before}
        after_ids = {res.source_id for res in after}
        assert after_ids == before_ids, (
            f"source_ids changed after rebuild on {fixture_name}: "
            f"before={before_ids}, after={after_ids}"
        )

    def test_english_term_not_in_any_fixture(
        self,
    ) -> None:
        """A truly foreign term returns nothing on any fixture."""
        for fixture_name in ALL_FIXTURES:
            root = FIXTURES / fixture_name
            if not (root / "path.json").exists():
                continue
            r = _load_with_segments(fixture_name)
            results = r.search("quantum electrodynamics", top_k=5)
            assert len(results) == 0, (
                f"Expected no results for 'quantum electrodynamics' "
                f"on {fixture_name}"
            )
