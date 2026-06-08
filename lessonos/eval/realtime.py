"""P1 eval LLM reale: run end-to-end pipeline with real LLM and measure quality.

``run_realtime_eval()`` loads a fixture path, runs the full LessonOS pipeline
(ingest → segmentation → extraction → assembly) with a **real** LLM provider
(default: Kimi), then scores the output with the existing groundedness and
citation-excerpt-accuracy metrics.

``run_realtime_eval_n_runs()`` runs the pipeline N times and returns a
distribution report with min/mean/max for groundedness, excerpt-accuracy,
and n-concepts. Useful because real LLM outputs are non-deterministic
(FM3 — COORDINATION.md ordine #3 di 3).

All costs are tracked through the CostLedger and returned in the report.

Usage (live, with KIMI_API_KEY set)::

    from lessonos.eval.realtime import run_realtime_eval
    report = run_realtime_eval()
    print(report.summary())

In tests the function is called with a mock router (same as the existing CLI
mock fixtures), so unit tests stay fast, free, and deterministic.

Design constraints (AGENTS.md §5):
- Only fixture data (no PII, synthetic only)
- Cost logged through existing CostLedger
- Mock tests = free and fast
- Live run gated by KIMI_API_KEY (skip if absent)
"""

from __future__ import annotations

import os
import statistics
from dataclasses import dataclass, field
from pathlib import Path as FsPath

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.eval.metrics import (
    build_citation_excerpt_accuracy_metric,
    build_groundedness_metric,
)
from lessonos.eval.models import EvalMetric
from lessonos.llm.cost_ledger import CostLedger
from lessonos.llm.deepseek import DeepSeekProvider
from lessonos.llm.kimi import KimiProvider
from lessonos.llm.router import LLMResponse, Router
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_segments,
    load_sample_path,
)
from lessonos.store.sqlite import SQLiteStore


@dataclass(frozen=True)
class RealtimeEvalReport:
    """Result of a realtime eval run.

    Attributes:
        lesson_id: The lesson that was processed.
        groundedness_score: Fraction of citations with valid seg_ids (0.0-1.0).
        groundedness_passed: True if ALL citations are grounded.
        excerpt_accuracy_score: Fraction of excerpts matching source text (0.0-1.0).
        excerpt_accuracy_passed: True if ALL checked excerpts match.
        total_citations: Total citations found in the capsule.
        capsule: The assembled LessonCapsule (useful for further analysis).
        total_cost_usd: Estimated USD cost for all LLM calls in this run.
        total_tokens: Total tokens (prompt + completion) consumed.
        llm_calls: Number of LLM calls made.
        error: Error message if the run failed, None otherwise.
    """

    lesson_id: str
    groundedness_score: float
    groundedness_passed: bool
    excerpt_accuracy_score: float
    excerpt_accuracy_passed: bool
    total_citations: int
    capsule: LessonCapsule | None
    total_cost_usd: float
    total_tokens: int
    llm_calls: int
    error: str | None = None

    def summary(self) -> str:
        """One-line summary of the eval result."""
        if self.error:
            return f"[ERROR] {self.lesson_id}: {self.error}"
        parts = [
            f"groundedness={self.groundedness_score:.2f} "
            f"({'PASS' if self.groundedness_passed else 'FAIL'})",
            f"excerpt_accuracy={self.excerpt_accuracy_score:.2f} "
            f"({'PASS' if self.excerpt_accuracy_passed else 'FAIL'})",
            f"citations={self.total_citations}",
            f"cost=${self.total_cost_usd:.6f}",
            f"tokens={self.total_tokens}",
            f"llm_calls={self.llm_calls}",
        ]
        return f"[EVAL] {self.lesson_id}: {' | '.join(parts)}"


@dataclass(frozen=True)
class MultiRunEvalReport:
    """Distribution report from N eval runs on the same fixture.

    Provides min/mean/max for groundedness, excerpt-accuracy, and
    n-concepts — reflecting the non-determinism of real LLM outputs.

    Attributes:
        lesson_id: The lesson that was processed.
        n_runs: Number of runs.
        groundedness_scores: List of per-run groundedness scores.
        groundedness_min: Minimum groundedness score across runs.
        groundedness_mean: Mean groundedness score across runs.
        groundedness_max: Maximum groundedness score across runs.
        excerpt_accuracy_scores: List of per-run excerpt-accuracy scores.
        excerpt_accuracy_min: Minimum excerpt-accuracy score.
        excerpt_accuracy_mean: Mean excerpt-accuracy score.
        excerpt_accuracy_max: Maximum excerpt-accuracy score.
        n_concepts_list: List of per-run concept counts.
        n_concepts_min: Minimum concept count.
        n_concepts_mean: Mean concept count.
        n_concepts_max: Maximum concept count.
        total_cost_usd: Total cost across all runs.
        total_tokens: Total tokens across all runs.
        run_reports: Individual per-run reports.
        error: Error message if any run failed, None otherwise.
    """

    lesson_id: str
    n_runs: int
    groundedness_scores: tuple[float, ...]
    groundedness_min: float
    groundedness_mean: float
    groundedness_max: float
    excerpt_accuracy_scores: tuple[float, ...]
    excerpt_accuracy_min: float
    excerpt_accuracy_mean: float
    excerpt_accuracy_max: float
    n_concepts_list: tuple[int, ...]
    n_concepts_min: int
    n_concepts_mean: float
    n_concepts_max: int
    total_cost_usd: float
    total_tokens: int
    run_reports: tuple[RealtimeEvalReport, ...]
    error: str | None = None

    def summary(self) -> str:
        """Multi-line summary of distribution results."""
        if self.error:
            return f"[ERROR] {self.lesson_id}: {self.error}"
        lines = [
            f"[EVAL-MULTI] {self.lesson_id} ({self.n_runs} runs)",
            f"  groundedness: min={self.groundedness_min:.2f} "
            f"mean={self.groundedness_mean:.2f} "
            f"max={self.groundedness_max:.2f}",
            f"  excerpt_accuracy: min={self.excerpt_accuracy_min:.2f} "
            f"mean={self.excerpt_accuracy_mean:.2f} "
            f"max={self.excerpt_accuracy_max:.2f}",
            f"  n_concepts: min={self.n_concepts_min} "
            f"mean={self.n_concepts_mean:.1f} "
            f"max={self.n_concepts_max}",
            f"  total_cost=${self.total_cost_usd:.6f} "
            f"tokens={self.total_tokens}",
        ]
        for i, r in enumerate(self.run_reports):
            lines.append(f"    run {i+1}: {r.summary()}")
        return "\n".join(lines)


def run_realtime_eval(
    lesson_id: str = "l1_derivative_definition",
    fixture_root: FsPath | None = None,
    router: Router | None = None,
    *,
    model: str = "kimi-k2-0905-preview",
) -> RealtimeEvalReport:
    """Run the LessonOS pipeline with a real or mock LLM on one fixture lesson.

    Args:
        lesson_id: Which lesson to process (default: l1_derivative_definition).
        fixture_root: Fixture directory (default: project-root/fixtures/sample_path).
        router: An optional pre-built Router. If not provided, creates a Kimi
            router (or raises if KIMI_API_KEY is not set).
        model: Model name to pass to KimiProvider (default: kimi-k2-0905-preview).

    Returns:
        A RealtimeEvalReport with quality scores and cost breakdown.

    Raises:
        RuntimeError: If no router is provided and KIMI_API_KEY is not set.
    """
    root = fixture_root or DEFAULT_FIXTURE_ROOT

    # --- Phase 1: Load fixture and ingest ---
    store = SQLiteStore(":memory:")

    # Load the full path (needed for source references) but only process one lesson
    path = load_sample_path(store, root)

    if lesson_id not in path.lesson_ids:
        return RealtimeEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
            error=f"Lesson '{lesson_id}' not found in fixture path ({root})",
        )

    # Ingest segments for this lesson
    ingest_lesson_segments(store, lesson_id, root)

    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        return RealtimeEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
            error=f"No segments found for lesson '{lesson_id}'",
        )

    # --- Phase 2: Build or use the provided router ---
    ledger = CostLedger()

    if router is None:
        # Try DeepSeek first (primary brain per POLICY CERVELLO), then Kimi.
        api_key = os.environ.get("DEEPSEEK_API_KEY")
        deepseek_provider = None
        if api_key:
            deepseek_provider = DeepSeekProvider(
                api_key=api_key, model=model or "deepseek-chat"
            )
        else:
            # Fallback: try .env file in project root
            try:
                deepseek_provider = DeepSeekProvider(model=model or "deepseek-chat")
            except RuntimeError:
                pass

        if deepseek_provider is not None:
            router = Router()
            router.register(deepseek_provider)
        else:
            # Fall back to Kimi
            api_key = os.environ.get("KIMI_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "No router provided and neither DEEPSEEK_API_KEY nor "
                    "KIMI_API_KEY are set. "
                    "Provide a mock Router for tests, or export one of the keys."
                )
            kimi = KimiProvider(api_key=api_key, model=model or "kimi-k2-0905-preview")
            router = Router()
            router.register(kimi)

    # Wrap router to track costs through the ledger
    original_complete = router.complete

    def _tracked_complete(
        prompt: str, *, provider: str, model: str | None = None
    ) -> LLMResponse:
        response = original_complete(prompt, provider=provider, model=model)
        ledger.add_from_response(
            response,
            lesson_id=lesson_id,
            label=f"realtime_eval_{provider}",
        )
        return response

    router.complete = _tracked_complete  # type: ignore[method-assign]

    # --- Phase 3: Assemble capsule ---
    try:
        # provider_name is already set above when building the router;
        # if a mock router was provided, use "mock".
        if router.has_provider("deepseek"):
            provider_name = "deepseek"
        elif router.has_provider("kimi"):
            provider_name = "kimi"
        else:
            provider_name = "mock"
        capsule = assemble_lesson_capsule(
            store, lesson_id, router, provider=provider_name,
        )
    except Exception as exc:
        return RealtimeEvalReport(
            lesson_id=lesson_id,
            groundedness_score=0.0,
            groundedness_passed=False,
            excerpt_accuracy_score=0.0,
            excerpt_accuracy_passed=False,
            total_citations=0,
            capsule=None,
            total_cost_usd=ledger.total_cost(),
            total_tokens=0,
            llm_calls=len(ledger.entries),
            error=f"Assembly failed: {type(exc).__name__}: {exc}",
        )

    # --- Phase 4: Measure quality ---
    g_metric = build_groundedness_metric(store)
    e_metric = build_citation_excerpt_accuracy_metric(store)

    try:
        grounded_passed, grounded_detail = g_metric.check(capsule)
    except Exception as exc:
        grounded_passed, grounded_detail = False, f"metric raised: {exc}"

    try:
        excerpt_passed, excerpt_detail = e_metric.check(capsule)
    except Exception as exc:
        excerpt_passed, excerpt_detail = False, f"metric raised: {exc}"

    # Parse scores from detail strings
    grounded_score = _parse_score(grounded_detail)
    excerpt_score = _parse_score(excerpt_detail)

    # Count citations
    from lessonos.eval.metrics import _collect_citations

    all_citations = _collect_citations(capsule)

    # --- Phase 5: Compute cost ---
    total_cost = ledger.total_cost()
    total_tokens = sum(
        e.prompt_tokens + e.completion_tokens for e in ledger.entries
    )
    llm_calls = len(ledger.entries)

    return RealtimeEvalReport(
        lesson_id=lesson_id,
        groundedness_score=grounded_score,
        groundedness_passed=grounded_passed,
        excerpt_accuracy_score=excerpt_score,
        excerpt_accuracy_passed=excerpt_passed,
        total_citations=len(all_citations),
        capsule=capsule,
        total_cost_usd=total_cost,
        total_tokens=total_tokens,
        llm_calls=llm_calls,
    )


def run_realtime_eval_n_runs(
    lesson_id: str = "l1_derivative_definition",
    fixture_root: FsPath | None = None,
    router: Router | None = None,
    n: int = 3,
    *,
    model: str = "kimi-k2-0905-preview",
) -> MultiRunEvalReport:
    """Run the realtime eval N times and return a distribution report.

    Args:
        lesson_id: Which lesson to process.
        fixture_root: Fixture directory.
        router: Mock or real Router. Each run re-ingests into a fresh store.
            If None, a live router is built (requires API key).
        n: Number of runs (default 3, must be >= 1).
        model: Model name.

    Returns:
        A MultiRunEvalReport with min/mean/max statistics across runs.
    """
    if n < 1:
        raise ValueError(f"n must be >= 1, got {n}")

    root = fixture_root or DEFAULT_FIXTURE_ROOT
    reports: list[RealtimeEvalReport] = []
    total_cost = 0.0
    total_tokens = 0

    for _ in range(n):
        report = run_realtime_eval(
            lesson_id=lesson_id,
            fixture_root=root,
            router=router,
            model=model,
        )
        reports.append(report)
        total_cost += report.total_cost_usd
        total_tokens += report.total_tokens

    g_scores = tuple(r.groundedness_score for r in reports)
    e_scores = tuple(r.excerpt_accuracy_score for r in reports)

    # Guard: if all capsules failed, set error
    error: str | None = None
    if all(r.capsule is None for r in reports):
        error = "All runs failed to produce a capsule"

    c_counts = tuple(len(r.capsule.content.concepts) if r.capsule else 0
                     for r in reports)

    return MultiRunEvalReport(
        lesson_id=lesson_id,
        n_runs=len(reports),
        groundedness_scores=g_scores,
        groundedness_min=min(g_scores),
        groundedness_mean=statistics.mean(g_scores),
        groundedness_max=max(g_scores),
        excerpt_accuracy_scores=e_scores,
        excerpt_accuracy_min=min(e_scores),
        excerpt_accuracy_mean=statistics.mean(e_scores),
        excerpt_accuracy_max=max(e_scores),
        n_concepts_list=c_counts,
        n_concepts_min=min(c_counts),
        n_concepts_mean=statistics.mean(c_counts),
        n_concepts_max=max(c_counts),
        total_cost_usd=total_cost,
        total_tokens=total_tokens,
        run_reports=tuple(reports),
        error=error,
    )


def _parse_score(detail: str) -> float:
    """Extract the numeric score from a metric detail string.

    Detail format examples::

        "score=1.00 (3/3) — all citations grounded"
        "score=0.50 (1/2); unresolved seg_ids: ['s99']"
        "0 citations to check (score=1.0)"
    """
    import re

    m = re.search(r"score=([\d.]+)", detail)
    if m:
        return float(m.group(1))
    return 0.0
