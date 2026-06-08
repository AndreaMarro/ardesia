"""Test realtime eval: run_realtime_eval with mock LLM (P1)."""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.eval.realtime import RealtimeEvalReport, run_realtime_eval
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

    def test_mock_run_no_router_raises(self) -> None:
        """Without router and without KIMI_API_KEY, run_realtime_eval raises."""
        # Ensure no key
        import os

        if os.environ.get("KIMI_API_KEY"):
            pytest.skip("KIMI_API_KEY is set — test only valid without it")
        with pytest.raises(RuntimeError, match="KIMI_API_KEY"):
            run_realtime_eval()

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
