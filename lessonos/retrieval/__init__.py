"""Retrieval layer for LessonOS (PLAN §13 — typed chunks, hierarchical scope)."""

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
    HybridRetriever,
    reciprocal_rank_fusion,
    recall_at_k,
)

__all__ = [
    "FTSRetriever",
    "SearchResult",
    "DenseRetriever",
    "LexiconEmbedder",
    "Embedder",
    "CorpusDoc",
    "corpus_from_store",
    "cosine",
    "HybridRetriever",
    "reciprocal_rank_fusion",
    "recall_at_k",
]
