"""Cost Ledger domain entities for per-LLM-call cost tracking (PLAN §20, M5-task3).

Mock calls are free (cost_usd=0, tokens=0). Real Kimi calls log actual
usage returned by the API and estimate USD cost from documented pricing.

The CostLedgerEntry is an append-only record of every LLM call within a
path run, tagged with lesson_id (or None for path-level calls) and a
semantic label (e.g. "segmentation", "extraction", "assembly").
"""

from __future__ import annotations

from dataclasses import dataclass

from typing import Mapping

from lessonos.models.entities import require_non_empty


@dataclass(frozen=True)
class CostLedgerEntry:
    """A single LLM call with its token usage and estimated cost.

    Args:
        entry_id: Unique identifier (``<prefix>#<index>``, e.g. ``cl:0000``).
        lesson_id: Lesson this call belonged to, or None for path-level calls.
        model: Model name (e.g. ``kimi-k2-0905-preview``, ``mock-1``).
        provider: Provider name (e.g. ``kimi``, ``mock``).
        prompt_tokens: Input token count (0 for mock). Must be >= 0.
        completion_tokens: Output token count (0 for mock). Must be >= 0.
        cost_usd: Estimated USD cost (0.0 for mock). Must be >= 0.0.
        label: Semantic label (e.g. ``segmentation``, ``extraction``).
    """

    entry_id: str
    lesson_id: str | None
    model: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    cost_usd: float
    label: str = ""

    def __post_init__(self) -> None:
        require_non_empty(self.entry_id, "entry_id")
        if self.prompt_tokens < 0:
            raise ValueError(f"prompt_tokens must be >= 0, got {self.prompt_tokens}")
        if self.completion_tokens < 0:
            raise ValueError(
                f"completion_tokens must be >= 0, got {self.completion_tokens}"
            )
        if self.cost_usd < 0.0:
            raise ValueError(f"cost_usd must be >= 0, got {self.cost_usd}")


@dataclass(frozen=True)
class CostReport:
    """Immutable summary of a CostLedger snapshot.

    Every aggregate field is derived at report-generation time so the
    ledger remains append-only and the report is always up-to-date.
    """

    total_cost_usd: float
    total_calls: int
    total_prompt_tokens: int
    total_completion_tokens: int
    per_lesson: Mapping[str, float]
    per_model: Mapping[str, float]
    per_label: Mapping[str, float]
    entries: tuple[CostLedgerEntry, ...]
