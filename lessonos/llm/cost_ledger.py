"""Cost Ledger: per-LLM-call cost accumulator (PLAN §20, M5-task3).

Tracks estimated USD cost for every LLM call within a path run. Mock calls
(no usage dict) are free; real Kimi calls are estimated from documented
pricing via ``estimate_kimi_cost``.

Usage::

    ledger = CostLedger()
    resp = router.complete(prompt, provider="kimi")
    entry = ledger.add_from_response(resp, lesson_id="l1", label="segmentation")
    report = ledger.report()
    print(report.total_cost_usd)

The ledger is pure Python (no I/O, no DB) — use ``to_json()`` for
serialisation and the Store for persistence.
"""

from __future__ import annotations

import json

from lessonos.llm.kimi import estimate_kimi_cost
from lessonos.llm.router import LLMResponse
from lessonos.models.ledger import CostLedgerEntry, CostReport


class CostLedger:
    """Append-only accumulator of LLM call costs.

    Call ``add_entry`` or ``add_from_response`` for each LLM invocation,
    then call ``report()`` for an immutable snapshot.
    """

    def __init__(self, entries: list[CostLedgerEntry] | None = None) -> None:
        self._entries: list[CostLedgerEntry] = list(entries) if entries else []

    def add_entry(self, entry: CostLedgerEntry) -> None:
        """Append a pre-built entry."""
        self._entries.append(entry)

    def add_from_response(
        self,
        response: LLMResponse,
        *,
        lesson_id: str | None = None,
        label: str = "",
    ) -> CostLedgerEntry:
        """Build and append an entry from an ``LLMResponse``.

        Mock responses (no ``usage`` dict) produce zero tokens and zero
        cost. Kimi responses (with ``usage``) are estimated via
        ``estimate_kimi_cost``.
        """
        if response.usage:
            prompt_tokens = response.usage.get("prompt_tokens", 0)
            completion_tokens = response.usage.get("completion_tokens", 0)
            cost = estimate_kimi_cost(response.usage)
        else:
            prompt_tokens = 0
            completion_tokens = 0
            cost = 0.0

        entry = CostLedgerEntry(
            entry_id=f"cl:{len(self._entries):04d}",
            lesson_id=lesson_id,
            model=response.model,
            provider=response.provider,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cost_usd=cost,
            label=label,
        )
        self._entries.append(entry)
        return entry

    def report(self) -> CostReport:
        """Return an immutable snapshot of the current ledger state."""
        total_cost = sum(e.cost_usd for e in self._entries)
        total_calls = len(self._entries)
        total_prompt = sum(e.prompt_tokens for e in self._entries)
        total_completion = sum(e.completion_tokens for e in self._entries)

        per_lesson: dict[str, float] = {}
        per_model: dict[str, float] = {}
        per_label: dict[str, float] = {}
        for e in self._entries:
            lesson_key = e.lesson_id or "__path__"
            per_lesson[lesson_key] = per_lesson.get(lesson_key, 0.0) + e.cost_usd
            per_model[e.model] = per_model.get(e.model, 0.0) + e.cost_usd
            label_key = e.label or "__unlabelled__"
            per_label[label_key] = per_label.get(label_key, 0.0) + e.cost_usd

        # Replace sentinel keys with "" for path-level calls
        per_lesson_clean: dict[str, float] = {}
        for k, v in per_lesson.items():
            key = "" if k == "__path__" else k
            per_lesson_clean[key] = v

        return CostReport(
            total_cost_usd=round(total_cost, 6),
            total_calls=total_calls,
            total_prompt_tokens=total_prompt,
            total_completion_tokens=total_completion,
            per_lesson=per_lesson_clean,
            per_model=per_model,
            per_label=per_label,
            entries=tuple(self._entries),
        )

    def total_cost(self) -> float:
        """Shortcut: total estimated USD for all calls."""
        return sum(e.cost_usd for e in self._entries)

    def to_json(self) -> str:
        """Serialise all entries to a JSON array string."""
        return json.dumps(
            [
                {
                    "entry_id": e.entry_id,
                    "lesson_id": e.lesson_id,
                    "model": e.model,
                    "provider": e.provider,
                    "prompt_tokens": e.prompt_tokens,
                    "completion_tokens": e.completion_tokens,
                    "cost_usd": e.cost_usd,
                    "label": e.label,
                }
                for e in self._entries
            ],
            indent=2,
        )

    @classmethod
    def from_json(cls, data: str) -> CostLedger:
        """Deserialise a JSON array string into a ledger.

        The caller should NOT pass raw user data without validation;
        this method trusts the JSON structure.
        """
        raw = json.loads(data)
        entries = [
            CostLedgerEntry(
                entry_id=r["entry_id"],
                lesson_id=r.get("lesson_id"),
                model=r["model"],
                provider=r["provider"],
                prompt_tokens=r["prompt_tokens"],
                completion_tokens=r["completion_tokens"],
                cost_usd=r["cost_usd"],
                label=r.get("label", ""),
            )
            for r in raw
        ]
        return cls(entries)

    @property
    def entries(self) -> tuple[CostLedgerEntry, ...]:
        """Read-only view of all entries."""
        return tuple(self._entries)
