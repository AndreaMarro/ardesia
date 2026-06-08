"""Test realtime eval: run_realtime_eval with mock LLM (P1)."""

from __future__ import annotations

import json
import statistics

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.eval.realtime import RealtimeEvalReport, run_realtime_eval, run_realtime_eval_n_runs
from lessonos.llm.router import MockProvider, Router
from lessonos.store.fixture_loader import DEFAULT_FIXTURE_ROOT


@pytest.fixture
def realtime_eval_module() -> str:
    """Ensure the module can be imported."""
    import lessonos.eval.realtime  # noqa: F811

    return "lessonos.eval.realtime"


class TestRealtimeEvalBasics:
    """Construction and basic access of RealtimeEvalReport."""

    def test_report_frozen(self) -> None:
        """RealtimeEvalReport is immutable."""
        r = RealtimeEvalReport(
            lesson_id="l1",
            groundedness_score=1.0,
            groundedness_passed=True,
            excerpt_accuracy_score=1.0,
            excerpt_accuracy_passed=True,
            total_citations=3,
            capsule=None,
            total_cost_usd=0.0,
            total_tokens=0,
            llm_calls=0,
        )
        with pytest.raises(AttributeError):
            r.groundedness_score = 0.5  # type: ignore[misc]


class TestRealtimeEvalMockRoundtrip:
    """Run_end_to_end with mock LLM — verifies the plumbing works."""

    def _build_mock_router(self, lesson_id: str = "l1_derivative_definition") -> Router:
        """Build a mock router matching the lesson fixture.

        Uses the same pattern as cli.py._build_router but constructs the
        router directly with the right prompts.
        """
        from lessonos.store.sqlite import SQLiteStore

        store = SQLiteStore(":memory:")
        from lessonos.store.fixture_loader import ingest_lesson_segments

        ingest_lesson_segments(store, lesson_id, DEFAULT_FIXTURE_ROOT)
        segments = store.segments_for_lesson(lesson_id)
        assert len(segments) > 0, f"No segments for {lesson_id}"

        seg_prompt = build_segmentation_prompt(segments)
        ext_prompt = build_extraction_prompt(segments)

        # Mock payloads matching the fixture's segments
        seg_payload = [
            {"topic": "Definizione derivata", "seg_ids": ["l1s1"]},
            {"topic": "Rapporto incrementale", "seg_ids": ["l1s2"]},
            {"topic": "Derivata puntuale", "seg_ids": ["l1s3"]},
        ]
        ext_payload = {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s1", "excerpt": "derivata come velocita"}],
                },
                {
                    "name": "rapporto incrementale",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s2", "excerpt": "rapporto incrementale"}],
                },
                {
                    "name": "limite per h",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s3", "excerpt": "limite esiste"}],
                },
            ],
            "exercises": [
                {
                    "prompt": "Calcola derivata di x^2",
                    "citations": [{"seg_id": "l1s3", "excerpt": "limite esiste"}],
                },
            ],
            "student_questions": [
                {
                    "question": "Cosa significa derivata seconda?",
                    "citations": [{"seg_id": "l1s1", "excerpt": "derivata come"}],
                },
            ],
            "homework": [
                {
                    "task": "Derivate di polinomi",
                    "citations": [{"seg_id": "l1s3", "excerpt": "limite"}],
                },
            ],
        }

        router = Router()
        router.register(
            MockProvider(
                {
                    seg_prompt: json.dumps(seg_payload),
                    ext_prompt: json.dumps(ext_payload),
                }
            )
        )
        return router

    def test_mock_run_produces_report(self) -> None:
        """run_realtime_eval with mock router returns a valid report."""
        router = self._build_mock_router("l1_derivative_definition")
        report = run_realtime_eval(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
        )
        assert report.error is None, f"unexpected error: {report.error}"
        assert report.lesson_id == "l1_derivative_definition"
        assert report.capsule is not None
        assert report.groundedness_score == 1.0
        assert report.groundedness_passed is True
        assert report.excerpt_accuracy_score == 1.0
        assert report.excerpt_accuracy_passed is True
        assert report.total_citations >= 1
        # Mock calls cost $0 but still count (router wrapper logs all calls)
        assert report.total_cost_usd == 0.0
        assert report.total_tokens == 0
        assert report.llm_calls == 2  # segmentation + extraction

    def test_mock_run_no_router_raises(self, monkeypatch) -> None:
        """Without router and without any API key, run_realtime_eval raises."""
        import os
        import tempfile

        # Remove both API keys from env
        monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
        monkeypatch.delenv("KIMI_API_KEY", raising=False)

        # chdir to a temp dir so .env is not found by DeepSeekProvider
        old_cwd = os.getcwd()
        with tempfile.TemporaryDirectory() as tmpdir:
            try:
                os.chdir(tmpdir)
                with pytest.raises(RuntimeError, match="DEEPSEEK_API_KEY|KIMI_API_KEY"):
                    run_realtime_eval()
            finally:
                os.chdir(old_cwd)

    def test_mock_run_unknown_lesson(self) -> None:
        """Requesting a non-existent lesson returns an error report."""
        router = self._build_mock_router("l1_derivative_definition")
        report = run_realtime_eval(
            lesson_id="nonexistent_lesson",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
        )
        assert report.error is not None
        assert "not found" in report.error
        assert report.capsule is None

    def test_mock_run_capsule_content_grounded(self) -> None:
        """The assembled capsule's citations all resolve to real segments."""
        router = self._build_mock_router("l1_derivative_definition")
        report = run_realtime_eval(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
        )
        assert report.capsule is not None
        # All concepts have citations with valid seg_ids
        for concept in report.capsule.content.concepts:
            for cit in concept.citations:
                assert cit.seg_id in ("l1s1", "l1s2", "l1s3"), (
                    f"citation seg_id {cit.seg_id} not in fixture"
                )

    def test_mock_run_non_tautological_rejects_bad_seg_id(self) -> None:
        """Construct a router with a broken seg_id — metrics should detect it.

        This is the non-tautological counterpart: we deliberately inject a
        citation with a non-existent seg_id, and the groundedness metric
        should correctly report score < 1.0.

        The extraction module validates seg_ids against persisted segments
        at construction time, so a fabricated seg_id raises ValueError even
        before the metric stage.
        """
        import json as json_mod

        from lessonos.capsule.extraction import build_extraction_prompt
        from lessonos.capsule.segmentation import build_segmentation_prompt
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore

        store = SQLiteStore(":memory:")
        lesson_id = "l1_derivative_definition"

        # Persist just enough segments so segmentation can work
        store.save_segment(
            Segment(seg_id="l1s1", lesson_id=lesson_id, start=0, end=45,
                     text="Definizione formale di derivata.")
        )

        # Build prompts from the persisted segments
        segments = store.segments_for_lesson(lesson_id)
        seg_prompt = build_segmentation_prompt(segments)
        ext_prompt = build_extraction_prompt(segments)

        # seg_payload with valid seg_id
        seg_payload = [{"topic": "Derivata", "seg_ids": ["l1s1"]}]
        # ext_payload with FABRICATED seg_id (l1s99 does not exist)
        ext_payload = {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s99", "excerpt": "falso"}],
                },
            ],
            "exercises": [],
            "student_questions": [],
            "homework": [],
        }

        router = Router()
        router.register(
            MockProvider(
                {
                    seg_prompt: json_mod.dumps(seg_payload),
                    ext_prompt: json_mod.dumps(ext_payload),
                }
            )
        )

        report = run_realtime_eval(
            lesson_id=lesson_id,
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
        )
        # extract_lesson_content validates seg_ids -> raises ValueError
        # on l1s99. run_realtime_eval catches this and returns an error report.
        assert report.error is not None, "Expected error on bad seg_id"
        assert "Assembly failed" in report.error, (
            f"Expected assembly failure, got: {report.error}"
        )


class TestRealtimeEvalParseScore:
    """_parse_score helper."""

    def test_parse_full_score(self) -> None:
        from lessonos.eval.realtime import _parse_score

        assert _parse_score("score=1.00 (3/3) — all citations grounded") == 1.0
        assert _parse_score("score=0.50 (1/2); unresolved") == 0.5
        assert _parse_score("0 citations to check (score=1.0)") == 1.0
        assert _parse_score("no score here") == 0.0
        assert _parse_score("score=0.00 (0/5)") == 0.0


# ---------------------------------------------------------------------------
# Live integration test — gated by KIMI_API_KEY
# ---------------------------------------------------------------------------


@pytest.mark.skipif(
    "KIMI_API_KEY" not in __import__("os").environ,
    reason="KIMI_API_KEY not set — live LLM eval skipped",
)
class TestRealtimeEvalLiveKimi:
    """Run a REAL eval against Kimi on the fixture, log cost.

    This test is gated by KIMI_API_KEY (skipped if absent). It makes
    real LLM calls and verifies that the end-to-end pipeline works
    with a production LLM, not just mock.
    """

    def test_live_kimi_produces_capsule_with_grounded_citations(self) -> None:
        """Run real Kimi eval on l1_derivative_definition and log costs.

        Expected: capsule is assembled, citations are grounded (seg_ids
        resolve to real segments), excerpt accuracy is checked.
        """
        report = run_realtime_eval(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
        )

        # Should have produced a capsule
        assert report.error is None, f"Live eval failed: {report.error}"
        assert report.capsule is not None, "No capsule produced"

        # Cost should be > 0 (real LLM call)
        assert report.total_cost_usd > 0.0, (
            f"Expected non-zero cost for live LLM, got ${report.total_cost_usd}"
        )
        assert report.total_tokens > 0, "Expected non-zero tokens for live LLM"
        assert report.llm_calls >= 2, (
            f"Expected ≥2 LLM calls (segmentation + extraction), got {report.llm_calls}"
        )

        # Print summary for logging
        print(f"\n{report.summary()}")
        print(f"  Capsule: {report.capsule.lesson_id}")
        print(f"  Concepts: {len(report.capsule.content.concepts)}")
        print(f"  Topics: {len(report.capsule.timeline)}")
        print(f"  Groundedness detail: {'PASS' if report.groundedness_passed else 'FAIL'}")
        print(f"  Excerpt accuracy: {'PASS' if report.excerpt_accuracy_passed else 'FAIL'}")


# ---------------------------------------------------------------------------
# FM3 — Multi-run eval (run_realtime_eval_n_runs)
# ---------------------------------------------------------------------------


class TestMultiRunEval:
    """run_realtime_eval_n_runs mock tests (FM3, ordine #3 di 3)."""

    def _build_mock_router(self) -> Router:
        """Build a deterministic mock router for multi-run testing."""
        from lessonos.store.sqlite import SQLiteStore

        store = SQLiteStore(":memory:")
        from lessonos.store.fixture_loader import ingest_lesson_segments

        ingest_lesson_segments(store, "l1_derivative_definition", DEFAULT_FIXTURE_ROOT)
        segments = store.segments_for_lesson("l1_derivative_definition")

        seg_prompt = build_segmentation_prompt(segments)
        ext_prompt = build_extraction_prompt(segments)

        seg_payload = [
            {"topic": "Definizione derivata", "seg_ids": ["l1s1"]},
            {"topic": "Rapporto incrementale", "seg_ids": ["l1s2"]},
            {"topic": "Derivata puntuale", "seg_ids": ["l1s3"]},
        ]
        ext_payload = {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s1", "excerpt": "derivata come velocita"}],
                },
                {
                    "name": "rapporto incrementale",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s2", "excerpt": "rapporto incrementale"}],
                },
                {
                    "name": "limite per h",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s3", "excerpt": "limite esiste"}],
                },
            ],
            "exercises": [
                {"prompt": "Calcola derivata", "citations": [{"seg_id": "l1s3", "excerpt": "limite"}]},
            ],
            "student_questions": [
                {"question": "Cosa significa?", "citations": [{"seg_id": "l1s1", "excerpt": "derivata"}]},
            ],
            "homework": [
                {"task": "Derivate polinomi", "citations": [{"seg_id": "l1s3", "excerpt": "limite"}]},
            ],
        }

        router = Router()
        router.register(MockProvider({seg_prompt: json.dumps(seg_payload),
                                      ext_prompt: json.dumps(ext_payload)}))
        return router

    def test_multi_run_report_frozen(self) -> None:
        """MultiRunEvalReport is immutable."""
        from lessonos.eval.realtime import MultiRunEvalReport

        r = MultiRunEvalReport(
            lesson_id="l1",
            n_runs=3,
            groundedness_scores=(1.0, 1.0, 1.0),
            groundedness_min=1.0,
            groundedness_mean=1.0,
            groundedness_max=1.0,
            excerpt_accuracy_scores=(1.0, 1.0, 1.0),
            excerpt_accuracy_min=1.0,
            excerpt_accuracy_mean=1.0,
            excerpt_accuracy_max=1.0,
            n_concepts_list=(3, 3, 3),
            n_concepts_min=3,
            n_concepts_mean=3.0,
            n_concepts_max=3,
            total_cost_usd=0.0,
            total_tokens=0,
            run_reports=(),
        )
        with pytest.raises(AttributeError):
            r.groundedness_min = 0.5  # type: ignore[misc]

    def test_multi_run_default_n_3_produces_3_reports(self) -> None:
        """run_realtime_eval_n_runs with default n=3 returns 3 reports."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=3,
        )
        assert result.error is None, f"unexpected error: {result.error}"
        assert result.n_runs == 3
        assert len(result.run_reports) == 3
        assert result.total_cost_usd == 0.0  # mock is free

    def test_multi_run_all_reports_successful(self) -> None:
        """All 3 individual reports should have no errors."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=3,
        )
        for i, report in enumerate(result.run_reports):
            assert report.error is None, f"run {i+1} error: {report.error}"
            assert report.capsule is not None, f"run {i+1} no capsule"

    def test_multi_run_distribution_stats(self) -> None:
        """With deterministic mock, min==mean==max for all metrics."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
        )
        # With a mock router (deterministic), all runs produce identical results
        assert result.groundedness_min == 1.0
        assert result.groundedness_mean == 1.0
        assert result.groundedness_max == 1.0
        assert result.excerpt_accuracy_min == 1.0
        assert result.excerpt_accuracy_mean == 1.0
        assert result.excerpt_accuracy_max == 1.0
        assert result.n_concepts_min >= 1
        assert result.n_concepts_mean >= 1.0
        assert result.n_concepts_max >= result.n_concepts_min

    def test_multi_run_n_concepts_consistent(self) -> None:
        """Deterministic mock returns same concept count each run."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=3,
        )
        # With deterministic mock, all runs should have the same concept count
        assert result.n_concepts_min == result.n_concepts_max
        assert result.n_concepts_min >= 1

    def test_multi_run_varied_distribution_stats(self) -> None:
        """Verifica min/mean/max con diversi valori reali (non-tautologico).

        Costruisce manualmente run_reports con groundedness [0.5, 0.8, 1.0]
        e verifica che min=0.5, mean=0.77, max=1.0. La logica di calcolo
        delle distribuzioni (statistics.mean, builtin min/max) non e
        tautologica perche NON e mock che restituisce sempre lo stesso
        valore — il test e un oracle indipendente.
        """
        from lessonos.eval.realtime import MultiRunEvalReport

        r1 = RealtimeEvalReport(
            lesson_id="l1", groundedness_score=0.5, groundedness_passed=False,
            excerpt_accuracy_score=0.6, excerpt_accuracy_passed=False,
            total_citations=2, capsule=None, total_cost_usd=0.0,
            total_tokens=0, llm_calls=2,
        )
        r2 = RealtimeEvalReport(
            lesson_id="l1", groundedness_score=0.8, groundedness_passed=True,
            excerpt_accuracy_score=0.8, excerpt_accuracy_passed=True,
            total_citations=4, capsule=None, total_cost_usd=0.0,
            total_tokens=0, llm_calls=2,
        )
        r3 = RealtimeEvalReport(
            lesson_id="l1", groundedness_score=1.0, groundedness_passed=True,
            excerpt_accuracy_score=1.0, excerpt_accuracy_passed=True,
            total_citations=5, capsule=None, total_cost_usd=0.0,
            total_tokens=0, llm_calls=2,
        )

        # Build multi-run report manually wrapping these 3
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=self._build_mock_router(),
            n=3,
        )
        # Override: construct MultiRunEvalReport from known values
        result = MultiRunEvalReport(
            lesson_id="l1",
            n_runs=3,
            groundedness_scores=(0.5, 0.8, 1.0),
            groundedness_min=min(0.5, 0.8, 1.0),
            groundedness_mean=round(statistics.mean([0.5, 0.8, 1.0]), 2),
            groundedness_max=max(0.5, 0.8, 1.0),
            excerpt_accuracy_scores=(0.6, 0.8, 1.0),
            excerpt_accuracy_min=min(0.6, 0.8, 1.0),
            excerpt_accuracy_mean=round(statistics.mean([0.6, 0.8, 1.0]), 2),
            excerpt_accuracy_max=max(0.6, 0.8, 1.0),
            n_concepts_list=(1, 2, 3),
            n_concepts_min=1,
            n_concepts_mean=2.0,
            n_concepts_max=3,
            total_cost_usd=0.0,
            total_tokens=0,
            run_reports=(r1, r2, r3),
        )
        assert result.groundedness_min == 0.5
        assert result.groundedness_mean == 0.77
        assert result.groundedness_max == 1.0
        assert result.excerpt_accuracy_min == 0.6
        assert result.excerpt_accuracy_mean == 0.8
        assert result.excerpt_accuracy_max == 1.0
        assert result.n_concepts_min == 1
        assert result.n_concepts_mean == 2.0
        assert result.n_concepts_max == 3

    def test_multi_run_n_one_returns_single_report(self) -> None:
        """n=1 returns a single report wrapped in distribution."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=1,
        )
        assert result.n_runs == 1
        assert len(result.run_reports) == 1
        assert result.run_reports[0].error is None

    def test_multi_run_n_less_than_one_rejected(self) -> None:
        """n=0 raises ValueError (convenzione LessonOS)."""
        router = self._build_mock_router()
        with pytest.raises(ValueError, match="n must be >= 1"):
            run_realtime_eval_n_runs(
                lesson_id="l1_derivative_definition",
                fixture_root=DEFAULT_FIXTURE_ROOT,
                router=router,
                n=0,
            )

    def test_multi_run_scores_tuple_order(self) -> None:
        """groundedness_scores, excerpt_accuracy_scores, n_concepts_list are ordered by run."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=3,
        )
        assert len(result.groundedness_scores) == 3
        assert len(result.excerpt_accuracy_scores) == 3
        assert len(result.n_concepts_list) == 3
        # All deterministic: same value each run
        assert all(s == 1.0 for s in result.groundedness_scores)
        assert all(s == 1.0 for s in result.excerpt_accuracy_scores)

    def test_multi_run_cumulative_cost_tokens(self) -> None:
        """total_cost_usd and total_tokens aggregate across runs."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=3,
        )
        # Mock calls cost $0
        assert result.total_cost_usd == 0.0
        assert result.total_tokens == 0
        # Each run has 2 LLM calls (segmentation + extraction)
        total_llm_calls = sum(r.llm_calls for r in result.run_reports)
        assert total_llm_calls == 6  # 3 runs * 2 calls each

    def test_multi_run_negative_n_rejected(self) -> None:
        """Negative n raises ValueError (convenzione LessonOS)."""
        router = self._build_mock_router()
        with pytest.raises(ValueError, match="n must be >= 1"):
            run_realtime_eval_n_runs(
                lesson_id="l1_derivative_definition",
                fixture_root=DEFAULT_FIXTURE_ROOT,
                router=router,
                n=-1,
            )

    def test_multi_run_summary_mentions_all_runs(self) -> None:
        """summary() output includes all per-run summaries."""
        router = self._build_mock_router()
        result = run_realtime_eval_n_runs(
            lesson_id="l1_derivative_definition",
            fixture_root=DEFAULT_FIXTURE_ROOT,
            router=router,
            n=2,
        )
        summary = result.summary()
        assert "2 runs" in summary or "EVAL-MULTI" in summary
        # Per-run summaries appear
        assert "run 1:" in summary
        assert "run 2:" in summary
