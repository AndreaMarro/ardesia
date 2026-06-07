"""Eval harness: EvalCase, metrics, runner (M5)."""

from lessonos.eval.metrics import (
    build_citation_excerpt_accuracy_metric,
    build_groundedness_metric,
)
from lessonos.eval.models import EvalCase, EvalMetric, EvalResult, EvalReport
from lessonos.eval.runner import run_eval

__all__ = [
    "EvalCase",
    "EvalMetric",
    "EvalResult",
    "EvalReport",
    "build_citation_excerpt_accuracy_metric",
    "build_groundedness_metric",
    "run_eval",
]
