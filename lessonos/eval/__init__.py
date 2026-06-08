"""Eval harness: EvalCase, metrics, runner (M5), and realtime eval (P1/P2)."""

from lessonos.eval.metrics import (
    build_citation_excerpt_accuracy_metric,
    build_groundedness_metric,
)
from lessonos.eval.models import EvalCase, EvalMetric, EvalResult, EvalReport
from lessonos.eval.realtime import RealtimeEvalReport, run_realtime_eval
from lessonos.eval.realtime_raw import RawTranscriptEvalReport, run_raw_transcript_eval
from lessonos.eval.runner import run_eval

__all__ = [
    "EvalCase",
    "EvalMetric",
    "EvalResult",
    "EvalReport",
    "RawTranscriptEvalReport",
    "RealtimeEvalReport",
    "build_citation_excerpt_accuracy_metric",
    "build_groundedness_metric",
    "run_eval",
    "run_raw_transcript_eval",
    "run_realtime_eval",
]
