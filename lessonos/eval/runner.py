"""Eval runner: run_eval dispatches cases × metrics (M5, PLAN §22)."""

from __future__ import annotations

import time
from collections.abc import Sequence

from lessonos.eval.models import EvalCase, EvalMetric, EvalReport, EvalResult


def run_eval(
    cases: Sequence[EvalCase],
    metrics: Sequence[EvalMetric] | None = None,
) -> EvalReport:
    """Run each case against each metric and return an aggregated report.

    If no metrics provided, uses a default check that calls the case's own
    ``expected()`` callable on the result (binary pass/fail).

    If ``run()`` raises an exception, every metric is recorded as failed —
    metrics never receive an exception object in place of a result, because
    a metric's ``check`` expects a successful result, not a crash.

    Runs are independent — a failure in one case does not stop others.
    """
    results: list[EvalResult] = []

    for case in cases:
        t0 = time.perf_counter()
        try:
            result = case.run()
        except Exception as exc:
            elapsed = (time.perf_counter() - t0) * 1000
            # run() raised: every metric sees a failure, NOT the exception
            if metrics is None:
                results.append(
                    EvalResult(
                        case_name=case.name,
                        metric_name="expected",
                        passed=False,
                        detail=f"run() raised: {type(exc).__name__}: {exc}",
                        duration_ms=round(elapsed, 2),
                    )
                )
            else:
                for metric in metrics:
                    results.append(
                        EvalResult(
                            case_name=case.name,
                            metric_name=metric.name,
                            passed=False,
                            detail=f"run() raised: {type(exc).__name__}: {exc}",
                            duration_ms=round(elapsed, 2),
                        )
                    )
            continue

        elapsed = (time.perf_counter() - t0) * 1000

        if metrics is None:
            # Default: delegate to case.expected()
            try:
                ok = case.expected(result)
            except Exception as exc:
                ok, detail = False, f"expected() raised: {exc}"
            else:
                detail = "" if ok else "expected() returned False"
            results.append(
                EvalResult(
                    case_name=case.name,
                    metric_name="expected",
                    passed=ok,
                    detail=detail,
                    duration_ms=round(elapsed, 2),
                )
            )
        else:
            for metric in metrics:
                t1 = time.perf_counter()
                try:
                    ok, detail = metric.check(result)
                except Exception as exc:
                    ok, detail = False, f"metric.check() raised: {exc}"
                metric_dur = (time.perf_counter() - t1) * 1000
                results.append(
                    EvalResult(
                        case_name=case.name,
                        metric_name=metric.name,
                        passed=ok,
                        detail=detail,
                        duration_ms=round(elapsed + metric_dur, 2),
                    )
                )

    return EvalReport.from_results(results)
