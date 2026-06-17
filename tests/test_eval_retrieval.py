"""Retrieval regression gate: recall@k + MRR on the gold-set, pinned floors.

Four layers:

1. ``reciprocal_rank`` primitive (rank 1 -> 1.0, rank 2 -> 0.5, absent -> 0.0).
2. ``evaluate_retrieval`` contract (input guards, per-query order).
3. MEASURED quality of the M7 hybrid over the gold-set, asserted against PINNED
   FLOORS — a metric falling below its floor is RED. The gold-set has real
   distractor fields, so recall@3 = 1.0 while MRR = 5/6 < 1.0: the MRR floor is
   *earned*, not arithmetically forced.
4. Value proofs, on the REAL retriever (no fabricated wrappers): MRR catches a
   distractor out-ranking a relevant doc that recall@k tolerates, and fusion
   dominates both components on both metrics. ZERO-LLM throughout.
"""

from __future__ import annotations

import pytest

from lessonos.eval.retrieval import (
    GOLD_QUERIES,
    RetrievalReport,
    build_gold_hybrid_retriever,
    build_gold_retrievers,
    evaluate_retrieval,
)
from lessonos.retrieval.hybrid import reciprocal_rank

# ── PINNED FLOORS ─────────────────────────────────────────────────────────────
# MEASURED on the M7 hybrid over the gold-set: it recalls every relevant doc
# (recall@3 = 1.0) but ranks one of the three second, behind a same-token
# distractor (the 'poli e residui' query), so MRR = (1 + 1 + 1/2)/3 = 5/6.
# Pinned here as a regression sentinel: a *dropped* relevant doc lowers recall,
# a further *demoted* one lowers MRR — either falling below its floor is RED.
GOLD_K = 3
RECALL_AT_K_FLOOR = 1.0
MRR_FLOOR = 5 / 6


class TestReciprocalRankPrimitive:
    def test_first_hit_relevant(self) -> None:
        assert reciprocal_rank(["a", "b", "c"], {"a"}) == 1.0

    def test_second_hit_relevant(self) -> None:
        assert reciprocal_rank(["a", "b", "c"], {"b"}) == pytest.approx(0.5)

    def test_third_hit_relevant(self) -> None:
        assert reciprocal_rank(["a", "b", "c"], {"c"}) == pytest.approx(1 / 3)

    def test_first_relevant_wins_when_several_present(self) -> None:
        # rr is the rank of the *first* relevant hit, not the best-scoring set.
        assert reciprocal_rank(["a", "b", "c"], {"b", "c"}) == pytest.approx(0.5)

    def test_no_relevant_hit(self) -> None:
        assert reciprocal_rank(["a", "b", "c"], {"z"}) == 0.0

    def test_empty_relevant_set(self) -> None:
        assert reciprocal_rank(["a", "b", "c"], set()) == 0.0

    def test_empty_retrieved(self) -> None:
        assert reciprocal_rank([], {"a"}) == 0.0


class TestEvaluateRetrievalContract:
    def test_rejects_non_positive_k(self) -> None:
        r = build_gold_hybrid_retriever()
        with pytest.raises(ValueError, match="k must be"):
            evaluate_retrieval(r, k=0)

    def test_rejects_empty_gold(self) -> None:
        r = build_gold_hybrid_retriever()
        with pytest.raises(ValueError, match="non-empty"):
            evaluate_retrieval(r, [], k=GOLD_K)

    def test_per_query_in_gold_order(self) -> None:
        rep = evaluate_retrieval(build_gold_hybrid_retriever(), k=GOLD_K)
        assert tuple(q for q, _, _ in rep.per_query) == tuple(
            q for q, _ in GOLD_QUERIES
        )


class TestGoldRegressionGate:
    """The pinned-threshold gate over the real M7 hybrid retriever."""

    def _report(self) -> RetrievalReport:
        return evaluate_retrieval(build_gold_hybrid_retriever(), k=GOLD_K)

    def test_recall_at_k_meets_pinned_floor(self) -> None:
        rep = self._report()
        assert rep.mean_recall >= RECALL_AT_K_FLOOR, (
            f"recall@{GOLD_K} regressed: {rep.mean_recall} < {RECALL_AT_K_FLOOR}; "
            f"per-query={rep.per_query}"
        )

    def test_mrr_meets_pinned_floor(self) -> None:
        rep = self._report()
        assert rep.mrr >= MRR_FLOOR, (
            f"MRR regressed: {rep.mrr} < {MRR_FLOOR}; per-query={rep.per_query}"
        )

    def test_measured_values_are_pinned(self) -> None:
        # The floors equal the MEASURED values, so the gate catches any
        # downward move. recall is at the ceiling; MRR is strictly below it,
        # proving MRR has genuine room to fall that recall does not.
        rep = self._report()
        assert rep.mean_recall == pytest.approx(1.0)
        assert rep.mrr == pytest.approx(5 / 6)
        assert rep.mrr < rep.mean_recall


class TestMRRMeasuresWhatRecallCannot:
    """On the REAL retriever, MRR penalises a mis-ranking recall@k ignores."""

    def test_distractor_outranks_relevant_doc(self) -> None:
        # 'poli e residui': the relevant doc is retrieved but a same-token
        # distractor sits above it. recall@3 = 1.0 (it is in the top-k) yet the
        # reciprocal rank is 0.5 — exactly the signal recall throws away.
        hybrid = build_gold_hybrid_retriever()
        rep = evaluate_retrieval(hybrid, k=GOLD_K)
        per = {q: (rec, rr) for q, rec, rr in rep.per_query}
        rec, rr = per["poli e residui"]
        assert rec == pytest.approx(1.0)
        assert rr == pytest.approx(0.5)


class TestFusionDominatesComponents:
    """Fusion is not worse than either ranker on either metric — measured."""

    def test_hybrid_beats_each_component(self) -> None:
        bm25, dense, hybrid = build_gold_retrievers()
        r_bm25 = evaluate_retrieval(bm25, k=GOLD_K)
        r_dense = evaluate_retrieval(dense, k=GOLD_K)
        r_hybrid = evaluate_retrieval(hybrid, k=GOLD_K)

        # recall: each component has blind spots (bm25 misses the paraphrase,
        # dense misses the OOV terms); fusion recovers all → strictly higher.
        assert r_hybrid.mean_recall > r_bm25.mean_recall
        assert r_hybrid.mean_recall > r_dense.mean_recall

        # MRR: fusion never ranks the relevant doc lower than the better
        # component would, and here strictly improves over both.
        assert r_hybrid.mrr >= r_bm25.mrr
        assert r_hybrid.mrr >= r_dense.mrr
        assert r_hybrid.mrr > r_bm25.mrr
