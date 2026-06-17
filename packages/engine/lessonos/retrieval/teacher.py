"""Single-teacher context-grounded hybrid retrieval (PLAN §13 + CRM M1).

A teacher's recap must be grounded **only** in that teacher's own corpus —
never leaking another teacher's lesson content. This is both a relevance
property (a recap for teacher A should surface A's prior context, not B's) and
the GDPR-anonymisation invariant of the CRM layer (teacher boundaries are hard).

This module scopes the hybrid (BM25 + dense) retriever to the lessons owned by a
single teacher, resolved through the persisted ``Teacher -> Path -> Lesson``
lineage (``paths_for_teacher`` → ``lessons_for_path``). Both rankers are scoped
**at the source** (dense over a teacher-filtered corpus, BM25 with a SQL-level
``lesson_id`` filter), so an out-of-scope lesson never enters the fusion — the
boundary holds even when another teacher has a lexically or semantically
relevant lesson.

ZERO-LLM: same deterministic, zero-dependency stack as the rest of M7 (RRF +
cosine in pure Python, :class:`LexiconEmbedder` by default; swap a neural
embedder behind the :class:`Embedder` protocol for production).
"""

from __future__ import annotations

from lessonos.retrieval.dense import (
    DenseRetriever,
    Embedder,
    LexiconEmbedder,
    corpus_from_store,
)
from lessonos.retrieval.fts import FTSRetriever, SearchResult
from lessonos.retrieval.hybrid import DEFAULT_RRF_K, HybridRetriever
from lessonos.store.base import Store


def teacher_lesson_ids(store: Store, teacher_id: str) -> frozenset[str]:
    """Lesson ids owned by *teacher_id* via the persisted lineage.

    Walks ``paths_for_teacher(teacher_id)`` then ``lessons_for_path(path_id)``
    so the set reflects the **persisted** lessons (the lessons table), not the
    denormalised ``Path.lesson_ids`` hint. A teacher with no paths/lessons
    yields the empty set.

    Raises:
        ValueError: if *teacher_id* is empty.
    """
    if not teacher_id:
        raise ValueError("teacher_id must be non-empty")
    ids: set[str] = set()
    for path in store.paths_for_teacher(teacher_id):
        for lesson in store.lessons_for_path(path.path_id):
            ids.add(lesson.lesson_id)
    return frozenset(ids)


class _TeacherScopedFTS:
    """Adapter binding an :class:`FTSRetriever` to a fixed lesson-id scope.

    Exposes the ``search(query, *, top_k)`` shape :class:`HybridRetriever`
    expects while injecting the teacher's ``lesson_ids`` SQL-level filter, so the
    BM25 ranker only ever sees in-scope documents.
    """

    def __init__(self, fts: FTSRetriever, lesson_ids: frozenset[str]) -> None:
        self._fts = fts
        self._lesson_ids = lesson_ids

    def search(self, query: str, *, top_k: int = 5) -> list[SearchResult]:
        return self._fts.search(query, top_k=top_k, lesson_ids=self._lesson_ids)


def build_teacher_retriever(
    store: Store,
    teacher_id: str,
    *,
    embedder: Embedder | None = None,
    rrf_k: int = DEFAULT_RRF_K,
) -> HybridRetriever:
    """Build a hybrid retriever scoped to a single teacher's corpus.

    Both rankers are scoped at the source (dense over a teacher-filtered corpus,
    BM25 with the teacher's ``lesson_id`` filter), so results can only come from
    *teacher_id*'s lessons. Builds the FTS index and embeds the corpus once;
    reuse the returned retriever across queries (e.g. one per recap concept)
    rather than calling :func:`retrieve_teacher_context` repeatedly.

    A teacher with no lessons yields a retriever that returns ``[]`` for every
    query (no leakage, no error).

    Args:
        embedder: dense backend (defaults to :class:`LexiconEmbedder`).
        rrf_k: Reciprocal Rank Fusion damping constant.
    """
    lesson_ids = teacher_lesson_ids(store, teacher_id)
    embedder = embedder or LexiconEmbedder()

    scoped_corpus = [d for d in corpus_from_store(store) if d.lesson_id in lesson_ids]
    dense = DenseRetriever(scoped_corpus, embedder)

    fts = FTSRetriever(store)
    fts.build_index()
    scoped_fts = _TeacherScopedFTS(fts, lesson_ids)

    return HybridRetriever(scoped_fts, dense, k=rrf_k)


def retrieve_teacher_context(
    store: Store,
    teacher_id: str,
    query: str,
    *,
    embedder: Embedder | None = None,
    top_k: int = 5,
    candidate_k: int = 20,
    rrf_k: int = DEFAULT_RRF_K,
) -> list[SearchResult]:
    """Retrieve hybrid, teacher-scoped context for a recap query.

    Convenience one-shot wrapper around :func:`build_teacher_retriever`. Every
    returned :class:`SearchResult` is grounded in a lesson owned by *teacher_id*
    (``match_type="hybrid"``). ZERO-LLM.

    Prefer :func:`build_teacher_retriever` when issuing several queries for the
    same teacher (this rebuilds the index + corpus every call).
    """
    retriever = build_teacher_retriever(
        store, teacher_id, embedder=embedder, rrf_k=rrf_k
    )
    return retriever.search(query, top_k=top_k, candidate_k=candidate_k)
