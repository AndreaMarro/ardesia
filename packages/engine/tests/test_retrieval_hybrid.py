"""Tests for hybrid retrieval — BM25 + dense fused via RRF (M7).

Three layers:

1. Pure units: ``reciprocal_rank_fusion``, ``recall_at_k``, ``cosine``,
   ``LexiconEmbedder``, ``DenseRetriever`` ordering.
2. ``HybridRetriever`` wiring over a real store.
3. GOLD FIXTURE: a synthetic Italian STEM method-graph where BM25 and dense
   each have a deliberate blind spot, and recall@k is MEASURED for bm25-only,
   dense-only and hybrid — proving fusion recovers both.
"""

from __future__ import annotations

import math

import pytest

from lessonos.models.entities import Segment
from lessonos.retrieval.dense import (
    CorpusDoc,
    DenseRetriever,
    Embedder,
    LexiconEmbedder,
    corpus_from_store,
    cosine,
)
from lessonos.retrieval.fts import FTSRetriever, SearchResult
from lessonos.retrieval.hybrid import (
    DEFAULT_RRF_K,
    HybridRetriever,
    recall_at_k,
    reciprocal_rank_fusion,
)
from lessonos.store.sqlite import SQLiteStore


# ── Pure unit: reciprocal_rank_fusion ─────────────────────────────────────


class TestReciprocalRankFusion:
    def test_empty_input(self) -> None:
        assert reciprocal_rank_fusion([]) == []
        assert reciprocal_rank_fusion([[], []]) == []

    def test_single_list_preserves_order(self) -> None:
        fused = reciprocal_rank_fusion([["a", "b", "c"]], k=60)
        assert [item for item, _ in fused] == ["a", "b", "c"]

    def test_known_two_list_fusion(self) -> None:
        """Hand-computed RRF over two overlapping lists (k=60)."""
        list1 = ["a", "b", "c"]
        list2 = ["b", "c", "d"]
        fused = dict(reciprocal_rank_fusion([list1, list2], k=60))

        exp_a = 1 / 61
        exp_b = 1 / 62 + 1 / 61
        exp_c = 1 / 63 + 1 / 62
        exp_d = 1 / 63
        assert fused["a"] == pytest.approx(exp_a)
        assert fused["b"] == pytest.approx(exp_b)
        assert fused["c"] == pytest.approx(exp_c)
        assert fused["d"] == pytest.approx(exp_d)

    def test_agreement_beats_single_top_hit(self) -> None:
        """A doc ranked 2nd in BOTH lists outranks a doc that is #1 in one.

        This is the whole point of RRF: cross-ranker agreement wins.
        """
        list1 = ["x", "shared", "p"]  # x is #1 here
        list2 = ["y", "shared", "q"]  # y is #1 here
        order = [item for item, _ in reciprocal_rank_fusion([list1, list2], k=60)]
        assert order[0] == "shared"

    def test_order_sorted_descending_by_score(self) -> None:
        fused = reciprocal_rank_fusion([["a", "b"], ["a", "c"]], k=60)
        scores = [s for _, s in fused]
        assert scores == sorted(scores, reverse=True)
        assert fused[0][0] == "a"  # only doc in both lists

    def test_deterministic_tie_break(self) -> None:
        """Equal scores break by repr(item), reproducibly."""
        f1 = reciprocal_rank_fusion([["b"], ["a"]], k=60)
        f2 = reciprocal_rank_fusion([["a"], ["b"]], k=60)
        # a and b each appear once at rank 1 → identical scores → repr order.
        assert [i for i, _ in f1] == ["a", "b"]
        assert [i for i, _ in f2] == ["a", "b"]

    def test_k_changes_weighting(self) -> None:
        small_k = dict(reciprocal_rank_fusion([["a", "b"]], k=1))
        assert small_k["a"] == pytest.approx(1 / 2)
        assert small_k["b"] == pytest.approx(1 / 3)

    def test_negative_k_raises(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            reciprocal_rank_fusion([["a"]], k=-1)


# ── Pure unit: recall_at_k ────────────────────────────────────────────────


class TestRecallAtK:
    def test_full_recall(self) -> None:
        assert recall_at_k(["a", "b", "c"], {"a", "b"}, k=3) == 1.0

    def test_partial_recall(self) -> None:
        assert recall_at_k(["a", "x", "y"], {"a", "b"}, k=3) == 0.5

    def test_zero_recall(self) -> None:
        assert recall_at_k(["x", "y"], {"a", "b"}, k=2) == 0.0

    def test_k_cutoff_excludes_late_hit(self) -> None:
        # 'b' is at position 3 but k=2 cuts it off.
        assert recall_at_k(["x", "a", "b"], {"a", "b"}, k=2) == 0.5

    def test_empty_relevant_is_zero(self) -> None:
        assert recall_at_k(["a"], set(), k=1) == 0.0

    def test_non_positive_k_raises(self) -> None:
        with pytest.raises(ValueError, match="k >= 1"):
            recall_at_k(["a"], {"a"}, k=0)


# ── Pure unit: cosine + LexiconEmbedder ───────────────────────────────────


class TestCosine:
    def test_identical_vectors(self) -> None:
        v = {"a": 1.0, "b": 2.0}
        assert cosine(v, v) == pytest.approx(1.0)

    def test_orthogonal_vectors(self) -> None:
        assert cosine({"a": 1.0}, {"b": 1.0}) == 0.0

    def test_empty_vector(self) -> None:
        assert cosine({}, {"a": 1.0}) == 0.0

    def test_known_value(self) -> None:
        a = {"x": 1.0, "y": 1.0}
        b = {"x": 1.0}
        assert cosine(a, b) == pytest.approx(1 / math.sqrt(2))


class TestLexiconEmbedder:
    def test_fallback_to_token_default(self) -> None:
        emb = LexiconEmbedder()
        # 'di' is an Italian stopword and is dropped by content_tokens.
        assert emb.embed("derivata di funzione") == {"derivata": 1.0, "funzione": 1.0}

    def test_lexicon_maps_synonyms_to_shared_dim(self) -> None:
        emb = LexiconEmbedder({"frequenze": ["spectrum"], "spettrale": ["spectrum"]})
        assert emb.embed("frequenze")["spectrum"] == 1.0
        assert emb.embed("spettrale")["spectrum"] == 1.0
        # synonyms have cosine 1.0 despite zero lexical overlap
        assert cosine(emb.embed("frequenze"), emb.embed("spettrale")) == pytest.approx(
            1.0
        )

    def test_no_fallback_drops_oov(self) -> None:
        emb = LexiconEmbedder({"laplace": ["laplace_c"]}, fallback_to_token=False)
        assert emb.embed("laplace differenziali") == {"laplace_c": 1.0}

    def test_satisfies_embedder_protocol(self) -> None:
        assert isinstance(LexiconEmbedder(), Embedder)

    def test_distinct_tokens_to_same_dim_accumulate(self) -> None:
        emb = LexiconEmbedder({"frequenze": ["spectrum"], "spettrale": ["spectrum"]})
        assert emb.embed("frequenze spettrale") == {"spectrum": 2.0}

    def test_repeated_identical_token_counts_once(self) -> None:
        # content_tokens is a SET — an identical token repeated counts once.
        emb = LexiconEmbedder()
        assert emb.embed("derivata derivata") == {"derivata": 1.0}

    def test_punctuation_is_stripped(self) -> None:
        emb = LexiconEmbedder()
        assert emb.embed("frequenze. l'antitrasformata") == {
            "frequenze": 1.0,
            "antitrasformata": 1.0,
        }


# ── Dense retriever ───────────────────────────────────────────────────────


def _corpus() -> list[CorpusDoc]:
    return [
        CorpusDoc("segment", "d1", "l1", "trasformata di Laplace e equazioni"),
        CorpusDoc("segment", "d2", "l2", "segnale e frequenze in banda"),
    ]


class TestDenseRetriever:
    def test_empty_query_returns_empty(self) -> None:
        r = DenseRetriever(_corpus(), LexiconEmbedder())
        assert r.search("") == []
        assert r.search("   ") == []

    def test_oov_query_returns_empty(self) -> None:
        """Query with no embeddable token → empty (a real dense miss)."""
        emb = LexiconEmbedder({"laplace": ["lap"]}, fallback_to_token=False)
        r = DenseRetriever(_corpus(), emb)
        assert r.search("differenziali") == []

    def test_semantic_match_without_lexical_overlap(self) -> None:
        emb = LexiconEmbedder(
            {"frequenze": ["spectrum"], "spettrale": ["spectrum"]},
            fallback_to_token=False,
        )
        r = DenseRetriever(_corpus(), emb)
        results = r.search("analisi spettrale", top_k=5)
        assert [res.source_id for res in results] == ["d2"]
        assert results[0].match_type == "dense"
        assert results[0].metadata["similarity"] > 0.0

    def test_results_sorted_best_first(self) -> None:
        emb = LexiconEmbedder()
        r = DenseRetriever(_corpus(), emb)
        results = r.search("trasformata laplace", top_k=5)
        ranks = [res.rank for res in results]
        assert ranks == sorted(ranks)  # rank = -similarity, ascending
        assert results[0].source_id == "d1"

    def test_top_k_limits(self) -> None:
        emb = LexiconEmbedder({"e": ["x"]})  # both docs share token via fallback
        # use a query that hits both
        r = DenseRetriever(_corpus(), LexiconEmbedder())
        results = r.search("trasformata frequenze", top_k=1)
        assert len(results) == 1


# ── corpus_from_store + from_store ────────────────────────────────────────


class TestCorpusFromStore:
    def test_extracts_segments(self) -> None:
        store = SQLiteStore(":memory:")
        store.save_segment(
            Segment(seg_id="s1", lesson_id="l1", start=0, end=1, text="hello world")
        )
        docs = corpus_from_store(store)
        assert any(d.source == "segment" and d.source_id == "s1" for d in docs)

    def test_non_sqlite_raises(self) -> None:
        from unittest.mock import MagicMock

        fake = MagicMock()
        fake.__class__.__name__ = "MockStore"
        with pytest.raises(TypeError, match="SQLiteStore"):
            corpus_from_store(fake)

    def test_dense_from_store_matches(self) -> None:
        store = SQLiteStore(":memory:")
        store.save_segment(
            Segment(seg_id="s1", lesson_id="l1", start=0, end=1, text="derivata")
        )
        r = DenseRetriever.from_store(store, LexiconEmbedder())
        assert [res.source_id for res in r.search("derivata")] == ["s1"]


# ── HybridRetriever wiring ────────────────────────────────────────────────


class TestHybridRetriever:
    def _store(self) -> SQLiteStore:
        store = SQLiteStore(":memory:")
        store.save_segment(
            Segment(
                seg_id="s1",
                lesson_id="l1",
                start=0,
                end=1,
                text="la trasformata di Laplace risolve equazioni differenziali",
            )
        )
        store.save_segment(
            Segment(
                seg_id="s2",
                lesson_id="l2",
                start=0,
                end=1,
                text="lo spettro di un segnale mostra le sue frequenze",
            )
        )
        return store

    def _hybrid(self, store: SQLiteStore) -> HybridRetriever:
        bm25 = FTSRetriever(store)
        bm25.build_index()
        dense = DenseRetriever.from_store(
            store,
            LexiconEmbedder(
                {"frequenze": ["spectrum"], "spettrale": ["spectrum"]},
                fallback_to_token=False,
            ),
        )
        return HybridRetriever(bm25, dense, k=DEFAULT_RRF_K)

    def test_hybrid_returns_hybrid_results(self) -> None:
        store = self._store()
        results = self._hybrid(store).search("differenziali", top_k=5)
        assert results
        assert all(r.match_type == "hybrid" for r in results)
        assert all("rrf_score" in r.metadata for r in results)

    def test_lexical_only_query_found(self) -> None:
        """'differenziali' is OOV for dense → only BM25 hits, hybrid still finds it."""
        store = self._store()
        results = self._hybrid(store).search("differenziali", top_k=5)
        ids = [r.source_id for r in results]
        assert "s1" in ids
        s1 = next(r for r in results if r.source_id == "s1")
        assert s1.metadata["rankers"] == ("bm25",)

    def test_semantic_only_query_found(self) -> None:
        """'spettrale' has no lexical match → only dense hits, hybrid still finds it."""
        store = self._store()
        results = self._hybrid(store).search("analisi spettrale", top_k=5)
        ids = [r.source_id for r in results]
        assert "s2" in ids
        s2 = next(r for r in results if r.source_id == "s2")
        assert s2.metadata["rankers"] == ("dense",)

    def test_top_k_limits(self) -> None:
        store = self._store()
        results = self._hybrid(store).search("trasformata OR spettro", top_k=1)
        assert len(results) <= 1


# ── GOLD FIXTURE: measured recall@k ───────────────────────────────────────


# Synthetic Italian STEM method-graph. Each doc is one node's text.
_GOLD_DOCS: tuple[tuple[str, str, str], ...] = (
    ("d_laplace", "l1", "La trasformata di Laplace converte equazioni "
     "differenziali in equazioni algebriche."),
    ("d_fourier", "l2", "La trasformata di Fourier scompone un segnale nelle "
     "sue frequenze."),
    ("d_residui", "l3", "Il teorema dei residui calcola integrali complessi "
     "tramite i poli."),
    ("d_anti", "l4", "L'antitrasformata di Laplace recupera la funzione nel "
     "dominio del tempo."),
)

# Embedder vocabulary = a finite semantic space. OOV terms (e.g. "differenziali",
# "antitrasformata") carry NO dense signal — this models a real embedding's
# weakness on rare/exact tokens, exposing BM25's complementary strength.
_GOLD_LEXICON: dict[str, list[str]] = {
    "trasformata": ["transform"],
    "laplace": ["laplace"],
    "fourier": ["fourier"],
    "frequenze": ["spectrum"],
    "spettrale": ["spectrum"],   # synonym of frequenze — dense-only reach
    "segnale": ["signal"],
    "residui": ["residue"],
    "poli": ["residue"],         # synonym of residui
    "integrali": ["integral"],
    "complessi": ["complex"],
}

# query -> relevant doc ids (the gold judgements).
_GOLD_QUERIES: tuple[tuple[str, set[str]], ...] = (
    # Synonym query: 'spettrale' never appears literally → BM25 miss, dense hit.
    ("analisi spettrale", {"d_fourier"}),
    # Exact rare term, OOV for the embedder → dense miss, BM25 hit.
    ("differenziali", {"d_laplace"}),
    # 'poli' is a synonym of 'residui' in the lexicon → dense reaches d_residui;
    # the literal token 'poli' is also in the text → BM25 reaches it too.
    ("poli", {"d_residui"}),
)


def _build_gold_store() -> SQLiteStore:
    store = SQLiteStore(":memory:")
    for seg_id, lesson_id, text in _GOLD_DOCS:
        store.save_segment(
            Segment(seg_id=seg_id, lesson_id=lesson_id, start=0, end=1, text=text)
        )
    return store


def _ids(results: list[SearchResult]) -> list[str]:
    return [r.source_id for r in results]


def _mean_recall(retriever, k: int) -> float:
    recalls = [
        recall_at_k(_ids(retriever.search(q, top_k=k)), rel, k)
        for q, rel in _GOLD_QUERIES
    ]
    return sum(recalls) / len(recalls)


class TestGoldRecall:
    """recall@k MEASURED on the gold fixture: hybrid recovers both blind spots."""

    K = 3

    def _retrievers(self):
        store = _build_gold_store()
        bm25 = FTSRetriever(store)
        bm25.build_index()
        dense = DenseRetriever.from_store(
            store, LexiconEmbedder(_GOLD_LEXICON, fallback_to_token=False)
        )
        hybrid = HybridRetriever(bm25, dense, k=DEFAULT_RRF_K)
        return bm25, dense, hybrid

    def test_bm25_misses_synonym_query(self) -> None:
        bm25, _, _ = self._retrievers()
        # 'analisi spettrale' is not literally in any doc.
        assert _ids(bm25.search("analisi spettrale", top_k=self.K)) == []

    def test_dense_misses_oov_query(self) -> None:
        _, dense, _ = self._retrievers()
        # 'differenziali' is OOV for the embedder.
        assert _ids(dense.search("differenziali", top_k=self.K)) == []

    def test_hybrid_recovers_both_blind_spots(self) -> None:
        _, _, hybrid = self._retrievers()
        assert "d_fourier" in _ids(hybrid.search("analisi spettrale", top_k=self.K))
        assert "d_laplace" in _ids(hybrid.search("differenziali", top_k=self.K))

    def test_measured_recall_hybrid_beats_each_component(self) -> None:
        bm25, dense, hybrid = self._retrievers()
        r_bm25 = _mean_recall(bm25, self.K)
        r_dense = _mean_recall(dense, self.K)
        r_hybrid = _mean_recall(hybrid, self.K)

        # MEASURED on this fixture (each component has one blind spot of three
        # queries → 2/3; hybrid recovers both → 3/3).
        assert r_bm25 == pytest.approx(2 / 3)
        assert r_dense == pytest.approx(2 / 3)
        assert r_hybrid == pytest.approx(1.0)

        # The milestone claim: fusion never regresses below either component and
        # strictly beats both here.
        assert r_hybrid >= r_bm25
        assert r_hybrid >= r_dense
        assert r_hybrid > r_bm25
        assert r_hybrid > r_dense
