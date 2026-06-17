"""Eval data model: EvalCase, EvalMetric, EvalResult, EvalReport (M5, PLAN §22).

An EvalCase is one testable scenario exercising a pipeline stage. Each case
specifies a named runnable function and an expected truth-check that decides
pass/fail. Metrics extend cases with category-specific checks (groundedness,
citation-accuracy).

Cases are mock-based (deterministic, free, fast). Real LLM evaluation is
gated and logged separately (cost ledger, M5-task3).
"""

from __future__ import annotations

import dataclasses
import time
from collections.abc import Callable
from typing import Any


@dataclasses.dataclass(frozen=True)
class EvalCase:
    """One evaluable scenario.

    Attributes:
        name: Unique human-readable identifier.
        description: What this case tests.
        run: Zero-argument callable that executes the pipeline stage and
            returns a result (dict or scalar). The callable captures all
            needed fixtures internally.
        expected: A callable that takes the result of `run()` and returns
            True if the result is acceptable, False otherwise.
        categories: Optional set of metric categories for filtering/
            aggregation (e.g. {"groundedness", "segmentation", "path_memory"}).
    """

    name: str
    description: str
    run: Callable[[], Any]
    expected: Callable[[Any], bool]
    categories: tuple[str, ...] = ()


@dataclasses.dataclass(frozen=True)
class EvalMetric:
    """A named check applied to an EvalCase result.

    The `check` callable receives the case result and returns (passed, detail).
    Unlike `expected` (a binary gate), a metric can score a case more finely.
    """

    name: str
    description: str
    check: Callable[[Any], tuple[bool, str]]


@dataclasses.dataclass(frozen=True)
class EvalResult:
    """Outcome of evaluating one case with one metric."""

    case_name: str
    metric_name: str
    passed: bool
    detail: str
    duration_ms: float


@dataclasses.dataclass(frozen=True)
class EvalReport:
    """Aggregated report from running eval on a set of cases × metrics."""

    results: tuple[EvalResult, ...]
    total_cases: int
    total_passed: int
    total_failed: int
    total_duration_ms: float

    @classmethod
    def from_results(cls, results: list[EvalResult]) -> EvalReport:
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        failed = total - passed
        duration = sum(r.duration_ms for r in results) if results else 0.0
        return cls(
            results=tuple(results),
            total_cases=total,
            total_passed=passed,
            total_failed=failed,
            total_duration_ms=duration,
        )

    def summary(self) -> str:
        """One-line summary string."""
        return (
            f"Eval: {self.total_passed}/{self.total_cases} passed, "
            f"{self.total_failed} failed, "
            f"{self.total_duration_ms:.1f}ms total"
        )
