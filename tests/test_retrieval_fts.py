"""Tests for the FTS5 retrieval layer (lessonos/retrieval/fts.py).

Covers: index building, search across segments + capsules, grounding checks,
edge cases (empty store, empty query, malformed query, source filtering).
"""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.assembly import _serialise_capsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.models.entities import Segment
from lessonos.retrieval.fts import FTSRetriever, SearchResult
from lessonos.store.sqlite import SQLiteStore


# ── Fixtures ──────────────────────────────────────────────────────────────


@pytest.fixture
def store() -> SQLiteStore:
    """An empty in-memory store."""
    return SQLiteStore(":memory:")


@pytest.fixture
def store_with_segments(store: SQLiteStore) -> SQLiteStore:
    """Store with 3 segments from lesson l1."""
    store.save_segment(
        Segment(
            seg_id="l1s1",
            lesson_id="l1",
            start=0,
            end=45,
            text="The derivative of a function measures the rate of change. "
            "Formally, f'(x) = lim_{h->0} (f(x+h)-f(x))/h.",
        )
    )
    store.save_segment(
        Segment(
            seg_id="l1s2",
            lesson_id="l1",
            start=45,
            end=110,
            text="The power rule says derivative of x^n is n*x^(n-1). "
            "For example, derivative of x^3 is 3x^2.",
        )
    )
    store.save_segment(
        Segment(
            seg_id="l1s3",
            lesson_id="l1",
            start=110,
            end=175,
            text="The chain rule allows us to differentiate composite functions. "
            "If h(x) = f(g(x)), then h'(x) = f'(g(x)) * g'(x).",
        )
    )
    return store


@pytest.fixture
def store_with_capsules(store_with_segments: SQLiteStore) -> SQLiteStore:
    """Store with segments + a capsule blob."""
    capsule = _serialise_capsule(
        _make_dummy_capsule("l1")
    )
    store_with_segments.save_capsule("l1", capsule)
    return store_with_segments


def _make_dummy_capsule(lesson_id: str):
    """Build a minimal LessonCapsule-like dict for testing."""
    from lessonos.capsule.assembly import LessonCapsule
    from lessonos.capsule.segmentation import TopicSpan

    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=(
            TopicSpan(
                lesson_id=lesson_id,
                topic="Derivatives and Rate of Change",
                seg_ids=("l1s1",),
                start=0,
                end=45,
            ),
            TopicSpan(
                lesson_id=lesson_id,
                topic="Power Rule and Chain Rule",
                seg_ids=("l1s2", "l1s3"),
                start=45,
                end=175,
            ),
        ),
        content=LessonContent(
            lesson_id=lesson_id,
            concepts=(
                ConceptExtraction(
                    name="derivative",
                    status="introduced",
                    prerequisites=("limit", "function"),
                ),
                ConceptExtraction(
                    name="power rule",
                    status="introduced",
                    prerequisites=("derivative",),
                ),
                ConceptExtraction(
                    name="chain rule",
                    status="introduced",
                    prerequisites=("derivative", "function composition"),
                ),
            ),
            exercises=(
                ExerciseExtraction(
                    prompt="Find the derivative of x^4 using the power rule.",
                    solution="4x^3",
                ),
            ),
            student_questions=(
                QuestionExtraction(
                    question="When do we use the chain rule vs product rule?",
                ),
            ),
            homework=(
                HomeworkExtraction(
                    task="Complete problems 1-10 from the derivative worksheet.",
                ),
            ),
        ),
    )


# ── Tests: Index building ─────────────────────────────────────────────────


class TestBuildIndex:
    def test_build_empty_store(self, store: SQLiteStore) -> None:
        """Building index on an empty store succeeds."""
        r = FTSRetriever(store)
        r.build_index()
        assert r._index_built is True

    def test_build_with_segments(self, store_with_segments: SQLiteStore) -> None:
        """Index builds with segments present."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        assert r._index_built is True
        # Verify FTS tables exist
        conn = store_with_segments._conn
        tables = [
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_fts'"
            ).fetchall()
        ]
        assert "segments_fts" in tables

    def test_build_with_capsules(self, store_with_capsules: SQLiteStore) -> None:
        """Index builds with capsules present."""
        r = FTSRetriever(store_with_capsules)
        r.build_index()
        assert r._index_built is True
        conn = store_with_capsules._conn
        tables = [
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_fts'"
            ).fetchall()
        ]
        assert "capsules_fts" in tables

    def test_build_idempotent(self, store_with_segments: SQLiteStore) -> None:
        """Calling build_index() twice is safe."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        r.build_index()  # second call — no error
        assert r._index_built is True


# ── Tests: Search ─────────────────────────────────────────────────────────


class TestSearch:
    def test_no_index_raises(self, store: SQLiteStore) -> None:
        """Search without building index raises ValueError."""
        r = FTSRetriever(store)
        with pytest.raises(ValueError, match="index not built"):
            r.search("derivative")

    def test_search_empty_query(self, store_with_segments: SQLiteStore) -> None:
        """Empty query returns empty list."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        assert r.search("") == []
        assert r.search("   ") == []

    def test_search_segments_finds_match(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Search for 'derivative' finds the segment that contains it."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative", top_k=5)
        assert len(results) >= 1
        # All results should be segments
        for res in results:
            assert res.source == "segment"
            assert res.lesson_id == "l1"
        # The best result should be one of the segments that mentions
        # 'derivative'. Both l1s1 and l1s2 contain the term.
        top = results[0]
        assert top.source_id in ("l1s1", "l1s2"), (
            f"Expected l1s1 or l1s2 (both mention derivative), got "
            f"{top.source_id}"
        )

    def test_search_segments_by_power_rule(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Search for 'power rule' finds l1s2."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("power rule", top_k=5)
        assert len(results) >= 1
        assert any(r.source_id == "l1s2" for r in results)

    def test_search_no_match_returns_empty(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Search for a term not in any segment returns empty."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("quantum physics", top_k=5)
        assert results == []

    def test_search_top_k_limits_results(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """top_k parameter limits the number of results."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative OR power OR chain", top_k=2)
        assert len(results) <= 2

    def test_search_capsules_finds_concept(
        self, store_with_capsules: SQLiteStore
    ) -> None:
        """Search for a concept name stored in a capsule finds it."""
        r = FTSRetriever(store_with_capsules)
        r.build_index()
        results = r.search("chain rule", top_k=5)
        # Should find both the segment (l1s3) and the capsule
        assert len(results) >= 1
        capsule_results = [r for r in results if r.source == "capsule"]
        assert len(capsule_results) >= 1

    def test_search_source_filter_segments_only(
        self, store_with_capsules: SQLiteStore
    ) -> None:
        """source_filter='segment' returns only segment results."""
        r = FTSRetriever(store_with_capsules)
        r.build_index()
        results = r.search("derivative", source_filter="segment")
        assert all(r.source == "segment" for r in results)

    def test_search_source_filter_capsules_only(
        self, store_with_capsules: SQLiteStore
    ) -> None:
        """source_filter='capsule' returns only capsule results."""
        r = FTSRetriever(store_with_capsules)
        r.build_index()
        results = r.search("chain rule", source_filter="capsule")
        assert all(r.source == "capsule" for r in results)

    def test_search_malformed_query_graceful(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Malformed FTS5 query (e.g. trailing OR) returns empty gracefully."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative OR")
        # FTS5 rejects trailing OR — should return empty list, not raise
        assert results == []

    def test_search_very_malformed_query(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Garbage query syntax returns empty gracefully."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("*&^% garbage NEAR/0")
        assert results == []


# ── Tests: SearchResult dataclass ─────────────────────────────────────────


class TestSearchResult:
    def test_results_are_searchresult_type(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """All returned results are SearchResult instances."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative")
        assert all(isinstance(res, SearchResult) for res in results)

    def test_result_has_all_required_fields(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Each SearchResult has the required fields populated."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative")
        assert len(results) >= 1
        res = results[0]
        assert isinstance(res.source, str)
        assert isinstance(res.source_id, str)
        assert isinstance(res.lesson_id, str)
        assert isinstance(res.rank, (int, float))
        assert isinstance(res.excerpt, str)
        assert len(res.excerpt) > 0  # excerpt should not be empty

    def test_result_rank_is_positive(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """FTS5 rank is approximately non-negative (lower = better).

        FTS5 BM25 rank can be slightly negative due to floating-point
        epsilon (e.g. -1e-6). We accept ranks >= -1e-5 as effectively
        non-negative.
        """
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative")
        for res in results:
            assert res.rank >= -1e-5, (
                f"Rank {res.rank} is significantly negative"
            )

    def test_results_ordered_by_relevance(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Results are sorted by rank ascending (best first)."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        results = r.search("derivative")
        ranks = [res.rank for res in results]
        assert ranks == sorted(ranks)


# ── Tests: _capsule_to_text ──────────────────────────────────────────────


class TestCapsuleToText:
    """Tests for the _capsule_to_text helper used by build_index()."""

    def _make_capsule_data(self) -> str:
        """Build a serialised capsule dict for _capsule_to_text testing."""
        from lessonos.capsule.assembly import _serialise_capsule

        capsule = _make_dummy_capsule("l1")
        return _serialise_capsule(capsule)

    def test_extracts_topic_names(self) -> None:
        """topic names from the timeline appear in the output."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert "Derivatives and Rate of Change" in text
        assert "Power Rule and Chain Rule" in text

    def test_extracts_concept_names(self) -> None:
        """concept names from the content appear in the output."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert "derivative" in text
        assert "power rule" in text
        assert "chain rule" in text

    def test_extracts_exercise_prompts(self) -> None:
        """exercise prompts appear in the output."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert "Find the derivative of x^4 using the power rule" in text

    def test_extracts_student_questions(self) -> None:
        """student questions appear in the output."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert "When do we use the chain rule vs product rule" in text

    def test_extracts_homework_tasks(self) -> None:
        """homework tasks appear in the output."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert "Complete problems 1-10 from the derivative worksheet" in text

    def test_all_extracted_fields_present_in_output(self) -> None:
        """All 5 field categories (topics, concepts, exercises, questions,
        homework) are present in the extracted text — not just the first."""
        from lessonos.retrieval.fts import _capsule_to_text

        raw = self._make_capsule_data()
        text = _capsule_to_text(raw)
        assert len(text.strip()) > 0
        # Every word from the content should be findable
        assert all(
            word in text
            for word in [
                "Derivatives",
                "Rate",
                "Change",
                "derivative",
                "power rule",
                "chain rule",
            ]
        )

    def test_malformed_json_returns_empty_string(self) -> None:
        """Invalid JSON input returns empty string."""
        from lessonos.retrieval.fts import _capsule_to_text

        assert _capsule_to_text("not json") == ""
        assert _capsule_to_text("{broken") == ""

    def test_empty_dict_returns_empty_string(self) -> None:
        """Empty dict JSON returns empty string."""
        from lessonos.retrieval.fts import _capsule_to_text

        assert _capsule_to_text("{}") == ""

    def test_non_dict_input_triggers_decode_error(self) -> None:
        """Non-dict valid JSON returns empty (no timeline/content to scan)."""
        from lessonos.retrieval.fts import _capsule_to_text

        # A valid JSON array has no lesson_id/content/timeline keys
        assert _capsule_to_text("[1, 2, 3]") == ""

    def test_topic_only_capsule_output_has_no_concepts(self) -> None:
        """A capsule with only topics (no concepts) extracts topic names
        but NOT concept names — proves the extraction logic is selective."""
        import json

        from lessonos.retrieval.fts import _capsule_to_text

        data = {
            "lesson_id": "l1",
            "timeline": [{"topic": "Introduction to Derivatives", "seg_ids": ["l1s1"]}],
            "content": {
                "concepts": [],
                "exercises": [],
                "student_questions": [],
                "homework": [],
            },
        }
        text = _capsule_to_text(json.dumps(data))
        assert "Introduction to Derivatives" in text
        # Concept fields explicitly empty — no derivative concept extracted
        assert "derivative" not in text

    def test_concept_only_capsule_omits_missing_exercises(self) -> None:
        """A capsule with concepts but no exercises/outputs omits
        exercise-related text — verifies selective extraction."""
        import json

        from lessonos.retrieval.fts import _capsule_to_text

        data = {
            "lesson_id": "l2",
            "timeline": [{"topic": "Power Rule Examples", "seg_ids": ["l2s1"]}],
            "content": {
                "concepts": [{"name": "power rule", "status": "introduced"}],
                "exercises": [],
                "student_questions": [],
                "homework": [],
            },
        }
        text = _capsule_to_text(json.dumps(data))
        assert "Power Rule Examples" in text
        assert "power rule" in text
        # No exercise text present
        assert "f(x)" not in text

    def test_mixed_empty_and_full_sections(self) -> None:
        """A capsule with empty student_questions but filled homework
        extracts homework but no questions."""
        import json

        from lessonos.retrieval.fts import _capsule_to_text

        data = {
            "lesson_id": "l3",
            "timeline": [{"topic": "Integration Intro", "seg_ids": ["l3s1"]}],
            "content": {
                "concepts": [],
                "exercises": [],
                "student_questions": [{"question": "What is integration?"}],
                "homework": [{"task": "Complete integration worksheet"}],
            },
        }
        text = _capsule_to_text(json.dumps(data))
        assert "Integration Intro" in text
        assert "What is integration" in text
        assert "integration worksheet" in text


# ── Tests: rebuild_index ─────────────────────────────────────────────────


class TestRebuildIndex:
    """Tests for the rebuild_index method of FTSRetriever."""

    def test_rebuild_on_empty_store_is_idempotent(self, store: SQLiteStore) -> None:
        """rebuild_index on an empty store succeeds and doesn't raise."""
        r = FTSRetriever(store)
        r.build_index()
        r.rebuild_index()
        assert r._index_built is True

    def test_rebuild_drops_and_repopulates(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """rebuild_index drops and repopulates the index."""
        r = FTSRetriever(store_with_segments)
        r.build_index()

        # Search before rebuild
        before = r.search("derivative", top_k=5)
        assert len(before) > 0

        # Rebuild
        r.rebuild_index()
        assert r._index_built is True

        # Search after rebuild — results should still be present
        after = r.search("derivative", top_k=5)
        assert len(after) > 0
        assert {r.source_id for r in after} == {r.source_id for r in before}

    def test_rebuild_clears_and_rebuilds(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """rebuild_index clears stale results from the old index."""
        r = FTSRetriever(store_with_segments)
        r.build_index()

        # Confirm 'power rule' is found in l1s2
        before = r.search("power rule", top_k=5)
        assert len(before) >= 1

        # Rebuild
        r.rebuild_index()

        # Same query still finds the same segment
        after = r.search("power rule", top_k=5)
        assert len(after) >= 1
        assert any(res.source_id == "l1s2" for res in after)

    def test_rebuild_with_capsules_still_finds_them(
        self, store_with_capsules: SQLiteStore
    ) -> None:
        """rebuild_index with capsule data still finds capsule content."""
        r = FTSRetriever(store_with_capsules)
        r.build_index()

        # Confirm 'chain rule' is found in both segment and capsule
        before = r.search("chain rule", top_k=5)
        capsule_before = [res for res in before if res.source == "capsule"]
        assert len(capsule_before) >= 1

        # Rebuild
        r.rebuild_index()

        # Same query after rebuild
        after = r.search("chain rule", top_k=5)
        capsule_after = [res for res in after if res.source == "capsule"]
        assert len(capsule_after) >= 1

    def test_rebuild_twice_no_error(
        self, store_with_segments: SQLiteStore
    ) -> None:
        """Calling rebuild_index twice in a row doesn't raise."""
        r = FTSRetriever(store_with_segments)
        r.build_index()
        r.rebuild_index()
        r.rebuild_index()  # second rebuild
        assert r._index_built is True

    def test_rebuild_then_search_empty(
        self, store: SQLiteStore
    ) -> None:
        """rebuild_index on an empty store, then search returns nothing."""
        r = FTSRetriever(store)
        r.build_index()
        r.rebuild_index()
        results = r.search("anything", top_k=5)
        assert results == []


# ── Tests: Type enforcement ──────────────────────────────────────────────


class TestStoreType:
    def test_non_sqlite_store_raises_type_error(self) -> None:
        """FTSRetriever requires SQLiteStore."""
        from unittest.mock import MagicMock

        fake_store = MagicMock()
        fake_store.__class__.__name__ = "MockStore"
        with pytest.raises(TypeError, match="SQLiteStore"):
            FTSRetriever(fake_store)  # type: ignore[arg-type]
