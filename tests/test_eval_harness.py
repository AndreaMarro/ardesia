"""Test eval harness: EvalCase, EvalMetric, EvalReport, run_eval (M5-task1)."""

from __future__ import annotations

import pytest

from lessonos.eval import EvalCase, EvalMetric, EvalReport, EvalResult, run_eval
from lessonos.eval.test_cases import ALL_CASES


class TestEvalModels:
    """EvalCase, EvalMetric, EvalResult, EvalReport construction."""

    def test_eval_case_minimal(self) -> None:
        case = EvalCase(
            name="test",
            description="minimal",
            run=lambda: 42,
            expected=lambda r: r == 42,
        )
        assert case.name == "test"
        assert case.run() == 42
        assert case.expected(42) is True
        assert case.expected(0) is False

    def test_eval_case_with_categories(self) -> None:
        case = EvalCase(
            name="categorized",
            description="with cats",
            run=lambda: "ok",
            expected=lambda r: r == "ok",
            categories=("groundedness", "segmentation"),
        )
        assert "groundedness" in case.categories
        assert "segmentation" in case.categories

    def test_eval_metric_construction(self) -> None:
        metric = EvalMetric(
            name="check_len",
            description="length check",
            check=lambda r: (len(r) > 0, f"len={len(r)}"),
        )
        assert metric.name == "check_len"
        ok, detail = metric.check("hello")
        assert ok is True
        assert "5" in detail

    def test_eval_result_frozen(self) -> None:
        result = EvalResult(
            case_name="c1", metric_name="m1",
            passed=True, detail="ok", duration_ms=1.5,
        )
        with pytest.raises(AttributeError):
            result.passed = False  # type: ignore[misc]

    def test_eval_report_from_results(self) -> None:
        results = [
            EvalResult("c1", "m1", True, "ok", 1.0),
            EvalResult("c1", "m2", False, "bad", 2.0),
            EvalResult("c2", "m1", True, "ok", 0.5),
        ]
        report = EvalReport.from_results(results)
        assert report.total_cases == 3
        assert report.total_passed == 2
        assert report.total_failed == 1
        assert report.total_duration_ms == pytest.approx(3.5)

    def test_eval_report_summary(self) -> None:
        report = EvalReport.from_results([
            EvalResult("c1", "m1", True, "ok", 1.0),
            EvalResult("c2", "m1", True, "ok", 2.0),
        ])
        text = report.summary()
        assert "2/2" in text
        assert "passed" in text
        assert "0 failed" in text

    def test_eval_report_from_empty(self) -> None:
        report = EvalReport.from_results([])
        assert report.total_cases == 0
        assert report.total_passed == 0
        assert report.total_failed == 0
        assert report.total_duration_ms == 0.0


class TestRunEval:
    """run_eval: dispatching cases × metrics."""

    def test_runs_all_cases_default_metric(self) -> None:
        """Default metric: runs each case's run() and checks via case.expected()."""
        report = run_eval(ALL_CASES)
        assert report.total_cases == len(ALL_CASES)
        # All cases on mock data should pass
        assert report.total_passed == len(ALL_CASES)
        assert report.total_failed == 0

    def test_default_metric_uses_expected_not_truthy(self) -> None:
        """Default metric calls case.expected() — even if result is falsy but expected=True."""
        falsy_ok = EvalCase(
            name="falsy_valid",
            description="returns 0 but expected says that's fine",
            run=lambda: 0,  # falsy value
            expected=lambda r: r == 0,  # expected returns True for 0
        )
        report = run_eval([falsy_ok])
        assert report.total_passed == 1, "falsy result with matching expected should pass"
        assert report.results[0].passed is True

    def test_default_metric_expected_raises_exception(self) -> None:
        """If case.expected() raises, it's recorded as failed (not a crash)."""
        broken = EvalCase(
            name="broken_expected",
            description="expected() raises",
            run=lambda: 42,
            expected=lambda r: (_ for _ in ()).throw(RuntimeError("oops")),
        )
        report = run_eval([broken])
        assert report.total_failed == 1
        assert "expected() raised" in report.results[0].detail

    def test_report_contains_all_case_names(self) -> None:
        report = run_eval(ALL_CASES)
        case_names = {r.case_name for r in report.results}
        assert len(case_names) == len(ALL_CASES)
        assert "segmentation_returns_topics" in case_names
        assert "extraction_rejects_bad_grounding" in case_names
        assert "assembly_produces_capsule" in case_names
        assert "path_memory_aggregates_concepts" in case_names
        assert "didactic_delta_detects_new" in case_names
        assert "learning_debt_identifies_open" in case_names

    def test_runs_with_custom_metric(self) -> None:
        filtering = EvalMetric(
            name="always_pass",
            description="always returns True",
            check=lambda r: (True, ""),
        )
        report = run_eval(ALL_CASES[:1], metrics=[filtering])
        assert report.total_cases == 1
        assert report.total_passed == 1
        assert report.results[0].metric_name == "always_pass"

    def test_custom_metric_sees_result(self) -> None:
        def _check(result) -> tuple[bool, str]:
            # PathMemory case returns a PathMemory — verify it has concepts
            from lessonos.graph.path_memory import PathMemory
            if isinstance(result, PathMemory):
                ok = result.total_concepts >= 1
                return (ok, f"concepts={result.total_concepts}")
            return (True, "type not inspected")

        pm_metric = EvalMetric(
            name="has_concepts",
            description="PathMemory result has concepts",
            check=_check,
        )
        # Run just the path_memory case
        case = [c for c in ALL_CASES if c.name == "path_memory_aggregates_concepts"][0]
        report = run_eval([case], metrics=[pm_metric])
        assert report.total_passed == 1
        assert "concepts=" in report.results[0].detail

    def test_case_run_exception_is_caught(self) -> None:
        """A case whose run() raises should fail, not crash the runner."""
        failing = EvalCase(
            name="explodes",
            description="run() raises",
            run=lambda: (_ for _ in ()).throw(RuntimeError("boom")),
            expected=lambda r: True,
        )
        report = run_eval([failing])
        assert report.total_failed == 1
        assert report.total_passed == 0
        assert "boom" in report.results[0].detail

    def test_run_exception_with_custom_metrics(self) -> None:
        """When run() raises, custom metrics all fail — exception not passed to check()."""
        m = EvalMetric(
            name="should_not_receive_exception",
            description="assertion",
            check=lambda r: (True, ""),  # Would pass if it received a normal result
        )
        failing = EvalCase(
            name="boom_custom",
            description="run() raises even with custom metrics",
            run=lambda: (_ for _ in ()).throw(ValueError("nope")),
            expected=lambda r: True,
        )
        report = run_eval([failing], metrics=[m])
        assert report.total_failed == 1
        assert report.total_passed == 0
        # The metric should NOT have been called — detail should say run() raised
        assert "run() raised" in report.results[0].detail

    def test_all_cases_have_unique_names(self) -> None:
        names = [c.name for c in ALL_CASES]
        assert len(names) == len(set(names)), f"duplicate names: {names}"

    def test_milestones_groundedness_check_fails_on_bad_citation(self) -> None:
        """MILESTONES M5: groundedness check FAILS on intentionally broken citation.

        The case_extraction_rejects_bad_grounding verifies that the system
        raises ValueError when the mock returns a non-existent seg_id.
        The 'expected' check returns True only if ValueError was raised.

        This test verifies the scenario described in MILESTONES.md M5-test:
        'groundedness check fallisce su una citazione volutamente rotta'.
        """
        cases = [c for c in ALL_CASES if "groundedness" in c.categories]
        assert len(cases) >= 1  # non-deterministic: tracks production ALL_CASES catalog (grows with new cases)

        for case in cases:
            # Run the case directly: it should return True (system detected fabrication)
            result = case.run()
            assert result is True, (
                f"Case '{case.name}': system failed to reject bad grounding. "
                "Expected ValueError on fabricated seg_id."
            )
            assert case.expected(result) is True, (
                f"Case '{case.name}': expected() check failed despite ValueError being raised."
            )

        # Now confirm via run_eval that all groundedness cases pass
        report = run_eval([c for c in ALL_CASES if "groundedness" in c.categories])
        assert report.total_passed >= 1
        assert report.total_failed == 0


class TestEvalMetrics:
    """build_groundedness_metric and build_citation_excerpt_accuracy_metric."""

    def test_groundedness_all_valid(self) -> None:
        """Groundedness metric passes when all citations resolve."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_groundedness_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Il concetto di derivata."))
        store.save_segment(Segment(seg_id="s2", lesson_id="l1", start=10, end=20, text="Regola della potenza."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "derivata", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="derivata", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt="derivata"),),
                    ),
                ),
            ),
        )

        metric = build_groundedness_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is True, f"expected all-grounded, got: {detail}"
        assert "1.00" in detail or "all citations grounded" in detail

    def test_groundedness_fails_on_broken_seg_id(self) -> None:
        """Groundedness metric fails when a citation references a non-existent segment."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_groundedness_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Testo."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "test", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="x", status="introduced",
                        citations=(Citation(seg_id="s99", excerpt="inventato"),),
                    ),
                ),
            ),
        )

        metric = build_groundedness_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is False, "should fail on non-existent seg_id"
        assert "s99" in detail
        assert "unresolved" in detail

    def test_groundedness_empty_citations_pass(self) -> None:
        """Groundedness metric passes gracefully when there are no citations to check."""
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import LessonContent
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_groundedness_metric

        store = SQLiteStore(":memory:")
        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "empty", (), 0, 0),),
            content=LessonContent(lesson_id="l1"),
        )

        metric = build_groundedness_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is True
        assert "0 citations" in detail

    def test_excerpt_accuracy_all_match(self) -> None:
        """Citation excerpt accuracy passes when all excerpts match source text."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Il concetto di derivata."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "d", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="derivata", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt="concetto di derivata"),),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is True, f"expected matching excerpt, got: {detail}"
        assert "all excerpts match" in detail

    def test_excerpt_accuracy_fails_on_mismatch(self) -> None:
        """Citation excerpt accuracy fails when excerpt is not in source text."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Il concetto di derivata."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "d", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="derivata", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt="derivata parziale"),),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is False, "should fail on non-matching excerpt"
        assert "derivata parziale" in detail
        assert "mismatch" in detail

    def test_excerpt_accuracy_skips_null_excerpts(self) -> None:
        """Excerpt accuracy skips citations with excerpt=None (optional field)."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Qualunque testo."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "t", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="x", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt=None),),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is True, f"null excerpts should pass: {detail}"
        assert "0 excerpts" in detail

    def test_excerpt_accuracy_skips_empty_excerpts(self) -> None:
        """Citation excerpt="" is SKIPPED, not counted as a match (false-verde).

        `"" in seg_text` is always True, so an empty excerpt would otherwise be
        scored as a perfect verbatim match (matching=1/1, "all excerpts match"),
        inflating citation_excerpt_accuracy. Per T6R an empty excerpt quotes
        nothing and is unverified: it must be skipped like excerpt=None.
        """
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="Qualunque testo."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "t", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="x", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt=""),),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        # Empty excerpt skipped: nothing checked, NOT counted as a 1/1 match.
        # Pre-fix this returned "score=1.00 (1/1) — all excerpts match".
        assert "0 excerpts" in detail, (
            f"empty excerpt must be skipped, not scored as a match: {detail}"
        )
        assert ok is True

    def test_excerpt_accuracy_blank_does_not_inflate_score(self) -> None:
        """Blank excerpts (empty AND whitespace-only) must not pad the matching
        count alongside a real mismatch: score reflects only genuine excerpts.

        The segment text contains a double-space run, so a whitespace-only
        excerpt IS a substring of it — exactly the case that would otherwise be
        mis-scored as a verbatim match.
        """
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=25, text="Il  concetto di derivata."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "t", ("s1",), 0, 25),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="x", status="introduced",
                        citations=(
                            Citation(seg_id="s1", excerpt=""),
                            Citation(seg_id="s1", excerpt="  "),
                            Citation(seg_id="s1", excerpt="non presente"),
                        ),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is False
        # Only the real mismatch is counted (0/1); both blank excerpts skipped.
        # Pre-fix (no strip) this was "score=0.50 (1/2)" — the "  " padded matching.
        assert "(0/1)" in detail, f"blank excerpt inflated the score: {detail}"

    def test_excerpt_accuracy_case_sensitive(self) -> None:
        """Excerpt matching is case-sensitive — 'Derivata' not in 'derivata'."""
        from lessonos.capsule.extraction import Citation
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, LessonContent,
        )
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_citation_excerpt_accuracy_metric

        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="s1", lesson_id="l1", start=0, end=10, text="concetto di derivata"))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "d", ("s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="derivata", status="introduced",
                        citations=(Citation(seg_id="s1", excerpt="Derivata"),),
                    ),
                ),
            ),
        )

        metric = build_citation_excerpt_accuracy_metric(store)
        ok, detail = metric.check(capsule)
        assert ok is False, "case-sensitive match should fail: 'Derivata' != 'derivata'"
        assert "mismatch" in detail

    def test_metrics_integrate_with_run_eval(self) -> None:
        """Custom metrics can be passed to run_eval and produce results."""
        from lessonos.capsule.extraction import Citation, ConceptExtraction, LessonContent
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.models.entities import Segment
        from lessonos.store.sqlite import SQLiteStore
        from lessonos.eval.metrics import build_groundedness_metric

        # Build a dedicated capsule with known seg_ids
        store = SQLiteStore(":memory:")
        store.save_segment(Segment(seg_id="custom_s1", lesson_id="l1", start=0, end=10, text="Testo segmento."))

        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "x", ("custom_s1",), 0, 10),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(
                        name="test", status="introduced",
                        citations=(Citation(seg_id="custom_s1", excerpt="Testo segmento"),),
                    ),
                ),
            ),
        )

        dedicated_case = EvalCase(
            name="dedicated_metrics_test",
            description="custom-built capsule for integration test",
            run=lambda: capsule,
            expected=lambda r: isinstance(r, LessonCapsule) and r.lesson_id == "l1",
            categories=("groundedness",),
        )

        metric = build_groundedness_metric(store, name="int_groundedness")
        report = run_eval([dedicated_case], metrics=[metric])
        assert report.total_cases == 1
        assert report.results[0].metric_name == "int_groundedness"
        assert report.results[0].passed is True, report.results[0].detail

    def test_metrics_exported_from_init(self) -> None:
        """build_groundedness_metric and build_citation_excerpt_accuracy_metric are exported."""
        from lessonos.eval import (
            build_citation_excerpt_accuracy_metric,
            build_groundedness_metric,
        )
        assert callable(build_groundedness_metric)
        assert callable(build_citation_excerpt_accuracy_metric)
