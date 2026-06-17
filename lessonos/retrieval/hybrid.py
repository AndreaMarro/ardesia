"""Hybrid retrieval: BM25 + dense fused with Reciprocal Rank Fusion (PLAN §13).

BM25 (lexical, :mod:`lessonos.retrieval.fts`) and dense (semantic,
:mod:`lessonos.retrieval.dense`) have complementary blind spots: BM25 misses
paraphrase, dense misses rare/exact terms. **Reciprocal Rank Fusion** (Cormack,
Clarke & Buettcher, SIGIR 2009) combines their two ranked lists into one that
recovers both — using only the *rank position* of each document, so it needs no
score calibration between the two very different scales (FTS5 bm25 vs cosine).

This module is the engineered core of the milestone:

- :func:`reciprocal_rank_fusion` — pure RRF over arbitrary ranked id lists.
- :func:`recall_at_k` — the measurement metric for the gold fixture.
- :class:`HybridRetriever` — wires an FTS retriever + a dense retriever and
  returns RRF-fused :class:`SearchResult` objects.
"""

from __future__ import annotations

from collections.abc import Hashable, Sequence
from typing import Protocol

from lessonos.retrieval.fts import SearchResult

DEFAULT_RRF_K = 60


class _Retriever(Protocol):
    def search(self, query: str, *, top_k: int = ...) -> list[SearchResult]: ...


def reciprocal_rank_fusion(
    ranked_lists: Sequence[Sequence[Hashable]],
    *,
    k: int = DEFAULT_RRF_K,
) -> list[tuple[Hashable, float]]:
    """Fuse several ranked id lists into one via Reciprocal Rank Fusion.

    Each input list is one ranker's ordering, **best first**. A document's RRF
    score is ``sum over rankers of 1 / (k + rank)`` where ``rank`` is its
    1-based position in that ranker's list (a document absent from a list
    contributes 0 from it). The damping constant ``k`` (default 60, the SIGIR
    value) keeps any single ranker's top hit from dominating, so a document
    that ranks decently in *both* lists can outrank one that is #1 in only one.

    Returns ``(item, score)`` pairs sorted by descending score. Ties break
    deterministically by ``repr(item)`` so the order is reproducible.

    Raises:
        ValueError: if ``k`` is negative (``k + rank`` must stay positive).
    """
    if k < 0:
        raise ValueError(f"RRF k must be non-negative, got {k}")

    scores: dict[Hashable, float] = {}
    for ranked in ranked_lists:
        for position, item in enumerate(ranked):
            rank = position + 1  # 1-based
            scores[item] = scores.get(item, 0.0) + 1.0 / (k + rank)

    return sorted(scores.items(), key=lambda kv: (-kv[1], repr(kv[0])))


def recall_at_k(
    retrieved: Sequence[Hashable],
    relevant: set[Hashable],
    k: int,
) -> float:
    """Fraction of the *relevant* set found within the top-``k`` retrieved ids.

    ``retrieved`` is best-first. Denominator is ``len(relevant)`` (recall, not
    precision), so it is unaffected by how many irrelevant items rank high. An
    empty relevant set is undefined → returns 0.0 (nothing to recall).

    Raises:
        ValueError: if ``k`` is not positive.
    """
    if k <= 0:
        raise ValueError(f"recall@k requires k >= 1, got {k}")
    if not relevant:
        return 0.0
    top = set(retrieved[:k])
    return len(top & relevant) / len(relevant)


class HybridRetriever:
    """BM25 + dense retrieval fused with RRF.

    ``bm25`` and ``dense`` are any objects exposing
    ``search(query, *, top_k) -> list[SearchResult]`` over the *same* document
    key space (``(source, source_id)``) — e.g. an
    :class:`~lessonos.retrieval.fts.FTSRetriever` and a
    :class:`~lessonos.retrieval.dense.DenseRetriever` built from the same store.

    ``search`` pulls ``candidate_k`` from each, fuses their orderings by RRF,
    and returns the top ``top_k`` as ``SearchResult`` (``match_type="hybrid"``,
    ``metadata={"rrf_score", "rankers"}``). ``rank`` is ``-rrf_score`` so the
    list stays sorted ascending-is-better like every other retriever.
    """

    def __init__(
        self,
        bm25: _Retriever,
        dense: _Retriever,
        *,
        k: int = DEFAULT_RRF_K,
    ) -> None:
        self._bm25 = bm25
        self._dense = dense
        self._k = k

    def search(
        self,
        query: str,
        *,
        top_k: int = 5,
        candidate_k: int = 20,
    ) -> list[SearchResult]:
        bm25_hits = self._bm25.search(query, top_k=candidate_k)
        dense_hits = self._dense.search(query, top_k=candidate_k)

        # Map fusion key -> representative result + which rankers hit it.
        # Prefer the BM25 result for the excerpt (it carries an FTS snippet);
        # fall back to the dense one.
        reps: dict[tuple[str, str], SearchResult] = {}
        rankers: dict[tuple[str, str], list[str]] = {}
        for hit in dense_hits:
            key = (hit.source, hit.source_id)
            reps[key] = hit
            rankers.setdefault(key, []).append("dense")
        for hit in bm25_hits:
            key = (hit.source, hit.source_id)
            reps[key] = hit  # BM25 representative wins (FTS snippet excerpt)
            rankers.setdefault(key, []).insert(0, "bm25")

        bm25_keys = [(h.source, h.source_id) for h in bm25_hits]
        dense_keys = [(h.source, h.source_id) for h in dense_hits]
        fused = reciprocal_rank_fusion([bm25_keys, dense_keys], k=self._k)

        results: list[SearchResult] = []
        for key, score in fused[:top_k]:
            rep = reps[key]  # type: ignore[index]
            results.append(
                SearchResult(
                    source=rep.source,
                    source_id=rep.source_id,
                    lesson_id=rep.lesson_id,
                    rank=-score,
                    excerpt=rep.excerpt,
                    match_type="hybrid",
                    metadata={
                        "rrf_score": score,
                        "rankers": tuple(rankers[key]),  # type: ignore[index]
                    },
                )
            )
        return results
