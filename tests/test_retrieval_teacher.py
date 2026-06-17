"""Tests for single-teacher context-grounded hybrid retrieval (M7 API).

The headline invariant: a teacher's recap retrieval is grounded ONLY in that
teacher's own lessons. Two teachers share lexically and semantically identical
lessons; scoping must return each teacher's own document and NEVER the other's —
for the BM25 ranker (lexical scope) AND the dense ranker (semantic scope).
"""

from __future__ import annotations

import json

import pytest

from lessonos.models.entities import Lesson, Path, Segment
from lessonos.retrieval.dense import LexiconEmbedder
from lessonos.retrieval.fts import FTSRetriever
from lessonos.retrieval.teacher import (
    build_teacher_retriever,
    retrieve_teacher_context,
    teacher_lesson_ids,
)
from lessonos.store.sqlite import SQLiteStore

# Synonym lexicon: "frequenze" and "spettrale" share the 'spectrum' dimension,
# so a "spettrale" query is a pure DENSE hit (the literal token never appears in
# any segment) — this isolates the dense ranker for the leakage test.
_LEXICON: dict[str, list[str]] = {
    "frequenze": ["spectrum"],
    "spettrale": ["spectrum"],
    "laplace": ["laplace"],
    "trasformata": ["transform"],
}


def _two_teacher_store() -> SQLiteStore:
    """Two teachers, each with one lesson whose segment is near-identical.

    Both segments contain 'Laplace' (lexical) and 'frequenze' (→ 'spectrum'
    dense), so without scoping a query for either would return BOTH teachers'
    documents — exactly what scoping must prevent.
    """
    store = SQLiteStore(":memory:")

    store.save_path(
        Path(path_id="p_alpha", title="Corso A", subject="fisica", teacher_id="t_alpha")
    )
    store.save_path(
        Path(path_id="p_beta", title="Corso B", subject="fisica", teacher_id="t_beta")
    )
    store.save_lesson(Lesson(lesson_id="l_alpha", path_id="p_alpha", title="LA", order=1))
    store.save_lesson(Lesson(lesson_id="l_beta", path_id="p_beta", title="LB", order=1))

    store.save_segment(
        Segment(
            seg_id="s_alpha",
            lesson_id="l_alpha",
            start=0,
            end=1,
            text="la trasformata di Laplace scompone le frequenze del segnale",
        )
    )
    store.save_segment(
        Segment(
            seg_id="s_beta",
            lesson_id="l_beta",
            start=0,
            end=1,
            text="la trasformata di Laplace mostra le frequenze del segnale",
        )
    )
    return store


def _embedder() -> LexiconEmbedder:
    return LexiconEmbedder(_LEXICON, fallback_to_token=False)


# ── teacher_lesson_ids resolution ─────────────────────────────────────────


class TestTeacherLessonIds:
    def test_resolves_persisted_lineage(self) -> None:
        store = _two_teacher_store()
        assert teacher_lesson_ids(store, "t_alpha") == frozenset({"l_alpha"})
        assert teacher_lesson_ids(store, "t_beta") == frozenset({"l_beta"})

    def test_unknown_teacher_is_empty(self) -> None:
        store = _two_teacher_store()
        assert teacher_lesson_ids(store, "t_ghost") == frozenset()

    def test_multiple_paths_union(self) -> None:
        store = _two_teacher_store()
        # give t_alpha a second path with another lesson
        store.save_path(
            Path(path_id="p_alpha2", title="A2", subject="mat", teacher_id="t_alpha")
        )
        store.save_lesson(
            Lesson(lesson_id="l_alpha2", path_id="p_alpha2", title="LA2", order=1)
        )
        assert teacher_lesson_ids(store, "t_alpha") == frozenset(
            {"l_alpha", "l_alpha2"}
        )

    def test_empty_teacher_id_raises(self) -> None:
        store = _two_teacher_store()
        with pytest.raises(ValueError, match="teacher_id must be non-empty"):
            teacher_lesson_ids(store, "")


# ── anti-leakage invariant (the milestone value) ──────────────────────────


class TestNoTeacherLeakage:
    def test_lexical_query_stays_in_teacher_scope(self) -> None:
        """BM25 ranker is scoped: 'Laplace' is in BOTH lessons, only own wins."""
        store = _two_teacher_store()
        emb = _embedder()

        a_hits = retrieve_teacher_context(store, "t_alpha", "laplace", embedder=emb)
        b_hits = retrieve_teacher_context(store, "t_beta", "laplace", embedder=emb)

        assert [h.source_id for h in a_hits] == ["s_alpha"]
        assert [h.source_id for h in b_hits] == ["s_beta"]
        assert all(h.match_type == "hybrid" for h in a_hits + b_hits)

    def test_semantic_query_stays_in_teacher_scope(self) -> None:
        """Dense ranker is scoped: 'spettrale' (synonym, never literal) is a
        pure dense hit on BOTH lessons, yet only the queried teacher's appears."""
        store = _two_teacher_store()
        emb = _embedder()

        a_hits = retrieve_teacher_context(store, "t_alpha", "spettrale", embedder=emb)
        ids = [h.source_id for h in a_hits]
        assert ids == ["s_alpha"]
        assert "s_beta" not in ids

    def test_leakage_is_actually_possible_without_scope(self) -> None:
        """Sanity: the other teacher's doc is real & lexically matchable — so the
        scope test above is not vacuous (an unscoped FTS sees BOTH)."""
        store = _two_teacher_store()
        fts = FTSRetriever(store)
        fts.build_index()
        unscoped = {h.source_id for h in fts.search("laplace", top_k=10)}
        assert unscoped == {"s_alpha", "s_beta"}

    def test_unknown_teacher_retrieves_nothing(self) -> None:
        store = _two_teacher_store()
        assert retrieve_teacher_context(store, "t_ghost", "laplace") == []


class TestNoCapsuleLeakage:
    """Capsules live in a DISTINCT key space (source_id == lesson_id) from
    segments; their scope path must hold independently. Both the FTS
    capsules_fts SQL filter and the dense capsule-doc filter are exercised here.
    """

    @staticmethod
    def _capsule(concept_name: str) -> str:
        return json.dumps(
            {"content": {"concepts": [{"name": concept_name, "status": "ok"}]}}
        )

    def _store(self) -> SQLiteStore:
        store = _two_teacher_store()
        # both teachers' lessons get a capsule with the SAME concept text
        cap = self._capsule("trasformata di Laplace")
        store.save_capsule("l_alpha", cap)
        store.save_capsule("l_beta", cap)
        return store

    def test_capsule_lexical_query_stays_in_scope(self) -> None:
        store = self._store()
        hits = retrieve_teacher_context(
            store, "t_alpha", "laplace", embedder=_embedder(), top_k=10
        )
        # the alpha capsule is retrievable…
        keys = {(h.source, h.source_id) for h in hits}
        assert ("capsule", "l_alpha") in keys
        # …and NO beta-derived doc (capsule or segment) ever leaks
        assert all(h.lesson_id == "l_alpha" for h in hits)
        assert ("capsule", "l_beta") not in keys

    def test_capsule_present_for_other_teacher_only(self) -> None:
        store = self._store()
        b_hits = retrieve_teacher_context(
            store, "t_beta", "laplace", embedder=_embedder(), top_k=10
        )
        assert all(h.lesson_id == "l_beta" for h in b_hits)
        assert ("capsule", "l_beta") in {(h.source, h.source_id) for h in b_hits}


# ── build_teacher_retriever reuse ─────────────────────────────────────────


class TestBuildTeacherRetriever:
    def test_reusable_across_queries(self) -> None:
        store = _two_teacher_store()
        retriever = build_teacher_retriever(store, "t_alpha", embedder=_embedder())
        # two different queries, same retriever — both stay in scope
        assert [h.source_id for h in retriever.search("laplace")] == ["s_alpha"]
        assert [h.source_id for h in retriever.search("spettrale")] == ["s_alpha"]

    def test_teacher_with_no_lessons_returns_empty(self) -> None:
        store = _two_teacher_store()
        # a teacher whose path has no lessons
        store.save_path(
            Path(path_id="p_empty", title="E", subject="x", teacher_id="t_empty")
        )
        retriever = build_teacher_retriever(store, "t_empty")
        assert retriever.search("laplace") == []

    def test_default_embedder_used_when_none(self) -> None:
        store = _two_teacher_store()
        # no embedder → LexiconEmbedder fallback; 'laplace' is lexical anyway
        hits = retrieve_teacher_context(store, "t_alpha", "laplace")
        assert [h.source_id for h in hits] == ["s_alpha"]


# ── FTS lesson_ids filter (non-lossy scoping unit) ────────────────────────


class TestFTSLessonScope:
    def _store(self) -> SQLiteStore:
        store = SQLiteStore(":memory:")
        store.save_segment(
            Segment(seg_id="x1", lesson_id="lx", start=0, end=1, text="derivata catena")
        )
        store.save_segment(
            Segment(seg_id="y1", lesson_id="ly", start=0, end=1, text="derivata catena")
        )
        return store

    def test_filter_restricts_to_lesson(self) -> None:
        fts = FTSRetriever(self._store())
        fts.build_index()
        hits = fts.search("derivata", lesson_ids={"lx"})
        assert [h.source_id for h in hits] == ["x1"]

    def test_none_filter_searches_all(self) -> None:
        fts = FTSRetriever(self._store())
        fts.build_index()
        ids = {h.source_id for h in fts.search("derivata")}
        assert ids == {"x1", "y1"}

    def test_empty_filter_matches_nothing(self) -> None:
        fts = FTSRetriever(self._store())
        fts.build_index()
        assert fts.search("derivata", lesson_ids=set()) == []

    def test_filter_is_non_lossy_under_top_k(self) -> None:
        """The in-scope doc survives even when an out-of-scope doc would rank
        first — the SQL filter runs before the LIMIT/top_k cutoff."""
        fts = FTSRetriever(self._store())
        fts.build_index()
        hits = fts.search("derivata", top_k=1, lesson_ids={"ly"})
        assert [h.source_id for h in hits] == ["y1"]
