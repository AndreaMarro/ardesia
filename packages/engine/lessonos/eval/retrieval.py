"""Retrieval regression harness: recall@k + MRR on a gold-set (PLAN §13/§22).

The hybrid retriever (M7, BM25 + dense fused by RRF) has no regression guard:
a change that silently re-orders or drops a relevant document would slip past
any unit test that only checks *presence* in the top-k. This module measures
the retriever's **quality** — recall@k *and* Mean Reciprocal Rank — over a
fixed gold-set, so a quality drop is observable and can be pinned as a hard
floor (``tests/test_eval_retrieval.py``).

The gold-set is purpose-built for *regression*, not for the component-blind-spot
comparison in ``tests/test_retrieval_hybrid.py`` (a deliberately separate, more
targeted fixture). Here every query is paired with **distractor** documents that
share a query token but are not the gold answer, so the fused list is a real
field the retriever must rank — not a single forced hit. That is what makes MRR
informative: on the gold-set the hybrid recalls every relevant doc (recall@3 =
1.0) yet ranks one of them *second*, behind a distractor, so MRR sits strictly
below 1.0. recall@k answers "did we find it at all within k"; MRR answers "how
high did we rank it" — together they catch both a *dropped* relevant doc
(recall falls) and a *demoted* one (MRR falls while recall holds).

The corpus is **synthetic** (no real corpus content) and the embedder is a pure
lexicon lookup: it is the data, not a model, that drives the numbers — ZERO-LLM.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

from lessonos.models.entities import Segment
from lessonos.retrieval.dense import DenseRetriever, LexiconEmbedder
from lessonos.retrieval.fts import FTSRetriever, SearchResult
from lessonos.retrieval.hybrid import (
    DEFAULT_RRF_K,
    HybridRetriever,
    recall_at_k,
    reciprocal_rank,
)
from lessonos.store.sqlite import SQLiteStore

# ── Canonical regression gold-set (synthetic, ZERO real corpus) ───────────────

# Each doc is one node's text: (source_id, lesson_id, text). The first four are
# the gold *answers*; the ``n_*`` rows are distractors that each share exactly
# one query token, so every query resolves to a multi-document field the
# retriever has to order — not a single forced hit.
GOLD_DOCS: tuple[tuple[str, str, str], ...] = (
    ("d_laplace", "l1", "La trasformata di Laplace converte equazioni "
     "differenziali in equazioni algebriche."),
    ("d_fourier", "l2", "La trasformata di Fourier scompone un segnale nelle "
     "sue frequenze."),
    ("d_residui", "l3", "Il teorema dei residui calcola integrali complessi "
     "tramite i poli."),
    ("d_anti", "l4", "L'antitrasformata di Laplace recupera la funzione nel "
     "dominio del tempo."),
    ("n_signal", "l5", "Il rumore di fondo disturba il segnale audio "
     "registrato dal microfono."),
    ("n_eq", "l6", "Le equazioni differenziali alle derivate parziali "
     "restano complesse da risolvere."),
    ("n_poli", "l7", "I poli magnetici della Terra si invertono nel corso "
     "delle ere geologiche."),
)

# Embedder vocabulary = a finite semantic space. OOV terms carry NO dense
# signal, modelling a real embedding's weakness on rare/exact tokens and so
# exposing BM25's complementary strength.
GOLD_LEXICON: dict[str, list[str]] = {
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
    "rumore": ["noise"],
    "audio": ["signal"],         # the n_signal distractor's dense reach
}

# query -> relevant doc ids (the gold judgements).
GOLD_QUERIES: tuple[tuple[str, frozenset[str]], ...] = (
    # Paraphrase: 'spettrale' is OOV to BM25 but a dense synonym of 'frequenze'
    # → dense reaches d_fourier and the n_signal distractor; the gold doc wins.
    ("analisi spettrale del segnale", frozenset({"d_fourier"})),
    # Exact terms, OOV for the embedder → BM25-only; AND-gated to the two docs
    # carrying both tokens (gold d_laplace vs the n_eq distractor), gold wins.
    ("equazioni differenziali", frozenset({"d_laplace"})),
    # 'poli' is a dense synonym of 'residui' and a literal token in BOTH the
    # gold doc and the n_poli distractor → the retriever ranks the distractor
    # first here, so recall@k holds but MRR drops: the case MRR exists to catch.
    ("poli e residui", frozenset({"d_residui"})),
)


class _Searcher(Protocol):
    def search(self, query: str, *, top_k: int = ...) -> list[SearchResult]: ...


@dataclass(frozen=True)
class RetrievalReport:
    """Measured retrieval quality over a gold-set at a fixed cutoff ``k``.

    - ``mean_recall``: mean recall@k across the queries.
    - ``mrr``: Mean Reciprocal Rank — mean of ``1/rank`` of the first relevant
      hit (0 when none in top-k).
    - ``per_query``: ``(query, recall, reciprocal_rank)`` for each gold query,
      in gold order, so a regression report can name the query that slipped.
    """

    k: int
    mean_recall: float
    mrr: float
    per_query: tuple[tuple[str, float, float], ...]


def build_gold_store() -> SQLiteStore:
    """An in-memory store seeded with the gold corpus (answers + distractors)."""
    store = SQLiteStore(":memory:")
    for source_id, lesson_id, text in GOLD_DOCS:
        store.save_segment(
            Segment(seg_id=source_id, lesson_id=lesson_id, start=0, end=1, text=text)
        )
    return store


def build_gold_retrievers(
    store: SQLiteStore | None = None,
) -> tuple[FTSRetriever, DenseRetriever, HybridRetriever]:
    """Build the BM25, dense and fused-hybrid retrievers over the gold corpus.

    Returned as ``(bm25, dense, hybrid)`` so a caller can measure each ranker
    on the same gold-set — the basis for the fusion-superiority value claim.
    The dense embedder uses ``fallback_to_token=False`` so OOV terms stay
    genuinely blind (no accidental lexical leak into the dense channel).
    """
    store = store or build_gold_store()
    bm25 = FTSRetriever(store)
    bm25.build_index()
    dense = DenseRetriever.from_store(
        store, LexiconEmbedder(GOLD_LEXICON, fallback_to_token=False)
    )
    hybrid = HybridRetriever(bm25, dense, k=DEFAULT_RRF_K)
    return bm25, dense, hybrid


def build_gold_hybrid_retriever() -> HybridRetriever:
    """The M7 hybrid retriever over the canonical gold-set (convenience)."""
    return build_gold_retrievers()[2]


def evaluate_retrieval(
    retriever: _Searcher,
    gold: Sequence[tuple[str, frozenset[str]]] = GOLD_QUERIES,
    *,
    k: int,
) -> RetrievalReport:
    """Measure recall@k and MRR of *retriever* over the *gold* judgements.

    Pure measurement: issues each gold query once, scores the returned id
    ordering against the relevant set, and aggregates. No model call, no
    randomness — the report is a deterministic function of the retriever and
    the gold-set.

    Raises:
        ValueError: if *gold* is empty or *k* is not positive.
    """
    if k <= 0:
        raise ValueError(f"k must be >= 1, got {k}")
    if not gold:
        raise ValueError("gold-set must be non-empty")

    per_query: list[tuple[str, float, float]] = []
    recall_sum = 0.0
    rr_sum = 0.0
    for query, relevant in gold:
        ids = [r.source_id for r in retriever.search(query, top_k=k)]
        rel = set(relevant)
        rec = recall_at_k(ids, rel, k)
        rr = reciprocal_rank(ids, rel)
        per_query.append((query, rec, rr))
        recall_sum += rec
        rr_sum += rr

    n = len(gold)
    return RetrievalReport(
        k=k,
        mean_recall=recall_sum / n,
        mrr=rr_sum / n,
        per_query=tuple(per_query),
    )
