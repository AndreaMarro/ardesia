"""Test Cost Ledger (lessonos/llm/cost_ledger.py, lessonos/store/base.py, M5-task3).

Verifies:
- add_entry / add_from_response record correctly
- Mock calls (no usage dict) are free (tokens=0, cost=0)
- Kimi calls (with usage dict) estimate cost from documented pricing
- Report aggregates correctly (total, per_lesson, per_model, per_label)
- Empty ledger returns all-zero report
- JSON round-trip (to_json/from_json) is idempotent
- Store persistence (save_ledger_entry/get_ledger_entries/get_ledger_for_lesson)
- Frozen immutability of entry and report
"""

from __future__ import annotations

import json
import tempfile

import pytest

from lessonos.llm.cost_ledger import CostLedger
from lessonos.llm.router import LLMResponse
from lessonos.models.ledger import CostLedgerEntry, CostReport
from lessonos.store.sqlite import SQLiteStore


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_response(
    text: str = "ok",
    provider: str = "mock",
    model: str = "mock-1",
    usage: dict | None = None,
) -> LLMResponse:
    return LLMResponse(text=text, provider=provider, model=model, usage=usage)


def _kimi_usage(prompt: int = 100_000, completion: int = 10_000) -> dict:
    """Simulate a Kimi API usage dict (~$0.09 at K2.5 rates)."""
    return {"prompt_tokens": prompt, "completion_tokens": completion}


# ---------------------------------------------------------------------------
# add_entry / add_from_response
# ---------------------------------------------------------------------------


def test_add_entry() -> None:
    ledger = CostLedger()
    entry = CostLedgerEntry(
        entry_id="cl:0000",
        lesson_id="l1",
        model="mock-1",
        provider="mock",
        prompt_tokens=0,
        completion_tokens=0,
        cost_usd=0.0,
        label="test",
    )
    ledger.add_entry(entry)
    assert len(ledger.entries) == 1
    assert ledger.entries[0] == entry


def test_add_from_response_mock_is_free() -> None:
    """Mock responses have no usage dict → zero tokens, zero cost."""
    ledger = CostLedger()
    resp = _make_response()
    entry = ledger.add_from_response(resp, lesson_id="l1", label="segmentation")
    assert entry.prompt_tokens == 0
    assert entry.completion_tokens == 0
    assert entry.cost_usd == 0.0
    assert entry.provider == "mock"
    assert entry.model == "mock-1"
    assert entry.lesson_id == "l1"
    assert entry.label == "segmentation"
    assert entry.entry_id == "cl:0000"


def test_add_from_response_kimi_estimates_cost() -> None:
    """Kimi responses with usage dict → cost estimated from pricing."""
    ledger = CostLedger()
    usage = _kimi_usage(prompt=100_000, completion=10_000)
    resp = _make_response(provider="kimi", model="kimi-k2-0905-preview", usage=usage)
    entry = ledger.add_from_response(resp, lesson_id="l1", label="extraction")
    # K2.5 rates: 100K*0.60 + 10K*3.00 = 0.06 + 0.03 = 0.09 USD
    assert entry.prompt_tokens == 100_000
    assert entry.completion_tokens == 10_000
    assert entry.cost_usd == 0.09
    assert entry.provider == "kimi"
    assert entry.model == "kimi-k2-0905-preview"
    assert entry.lesson_id == "l1"
    assert entry.label == "extraction"
    assert entry.entry_id == "cl:0000"


def test_add_from_response_no_lesson_id() -> None:
    """Path-level calls (lesson_id=None) are allowed."""
    ledger = CostLedger()
    resp = _make_response()
    entry = ledger.add_from_response(resp, label="path-synthesis")
    assert entry.lesson_id is None
    assert entry.label == "path-synthesis"


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------


def test_report_empty_ledger() -> None:
    report = CostLedger().report()
    assert report.total_cost_usd == 0.0
    assert report.total_calls == 0
    assert report.total_prompt_tokens == 0
    assert report.total_completion_tokens == 0
    assert report.per_lesson == {}
    assert report.per_model == {}
    assert report.per_label == {}
    assert report.entries == ()


def test_report_total_cost_matches_sum() -> None:
    ledger = CostLedger()
    ledger.add_from_response(_make_response(usage=_kimi_usage(50_000, 5_000)), label="a")
    ledger.add_from_response(_make_response(usage=_kimi_usage(20_000, 2_000)), label="b")
    report = ledger.report()
    expected = (50_000 * 0.60 + 5_000 * 3.00 + 20_000 * 0.60 + 2_000 * 3.00) / 1_000_000
    assert report.total_cost_usd == pytest.approx(expected, rel=1e-6)
    assert report.total_calls == 2


def test_report_per_lesson() -> None:
    ledger = CostLedger()
    ledger.add_from_response(_make_response(usage=_kimi_usage(100_000, 10_000)), lesson_id="l1")
    ledger.add_from_response(_make_response(usage=_kimi_usage(50_000, 5_000)), lesson_id="l1")
    ledger.add_from_response(_make_response(usage=_kimi_usage(20_000, 2_000)), lesson_id="l2")
    # Path-level call (lesson_id=None)
    ledger.add_from_response(_make_response(usage=_kimi_usage(10_000, 1_000)))
    report = ledger.report()
    # l1: 100K*0.60+10K*3.00 + 50K*0.60+5K*3.00 = 0.06+0.03 + 0.03+0.015 = 0.135
    l1_cost = (100_000 * 0.60 + 10_000 * 3.00 + 50_000 * 0.60 + 5_000 * 3.00) / 1_000_000
    l2_cost = (20_000 * 0.60 + 2_000 * 3.00) / 1_000_000
    path_cost = (10_000 * 0.60 + 1_000 * 3.00) / 1_000_000
    assert report.per_lesson.get("l1", 0.0) == pytest.approx(l1_cost, rel=1e-6)
    assert report.per_lesson.get("l2", 0.0) == pytest.approx(l2_cost, rel=1e-6)
    # Path-level key should be empty string ''
    assert report.per_lesson.get("", 0.0) == pytest.approx(path_cost, rel=1e-6)


def test_report_per_model() -> None:
    ledger = CostLedger()
    ledger.add_from_response(_make_response(model="mock-1"))
    ledger.add_from_response(_make_response(model="mock-1"))
    ledger.add_from_response(
        _make_response(model="kimi-k2-0905-preview", usage=_kimi_usage(50_000, 5_000))
    )
    report = ledger.report()
    assert report.per_model["mock-1"] == 0.0
    kimi_cost = (50_000 * 0.60 + 5_000 * 3.00) / 1_000_000
    assert report.per_model["kimi-k2-0905-preview"] == pytest.approx(kimi_cost, rel=1e-6)
    assert len(report.per_model) == 2


def test_report_per_label() -> None:
    ledger = CostLedger()
    ledger.add_from_response(_make_response(usage=_kimi_usage(10_000, 1_000)), label="segmentation")
    ledger.add_from_response(_make_response(usage=_kimi_usage(20_000, 2_000)), label="extraction")
    ledger.add_from_response(_make_response(usage=_kimi_usage(5_000, 500)), label="segmentation")
    report = ledger.report()
    seg_cost = (10_000 * 0.60 + 1_000 * 3.00 + 5_000 * 0.60 + 500 * 3.00) / 1_000_000
    ex_cost = (20_000 * 0.60 + 2_000 * 3.00) / 1_000_000
    assert report.per_label["segmentation"] == pytest.approx(seg_cost, rel=1e-6)
    assert report.per_label["extraction"] == pytest.approx(ex_cost, rel=1e-6)


def test_report_entries_are_frozen_tuple() -> None:
    """report.entries must be a tuple (not mutable list)."""
    ledger = CostLedger()
    ledger.add_from_response(_make_response())
    report = ledger.report()
    # Verify it's a tuple (immutable)
    assert isinstance(report.entries, tuple)


def test_entry_validation_negative_tokens() -> None:
    with pytest.raises(ValueError, match="prompt_tokens"):
        CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="m", provider="p",
            prompt_tokens=-1, completion_tokens=0, cost_usd=0.0,
        )
    with pytest.raises(ValueError, match="completion_tokens"):
        CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="m", provider="p",
            prompt_tokens=0, completion_tokens=-1, cost_usd=0.0,
        )


def test_entry_validation_negative_cost() -> None:
    with pytest.raises(ValueError, match="cost_usd"):
        CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="m", provider="p",
            prompt_tokens=0, completion_tokens=0, cost_usd=-0.01,
        )


def test_entry_validation_empty_entry_id() -> None:
    with pytest.raises(ValueError, match="entry_id"):
        CostLedgerEntry(
            entry_id="", lesson_id="l1", model="m", provider="p",
            prompt_tokens=0, completion_tokens=0, cost_usd=0.0,
        )


# ---------------------------------------------------------------------------
# JSON round-trip
# ---------------------------------------------------------------------------


def test_to_json_round_trip() -> None:
    ledger = CostLedger()
    e1 = ledger.add_from_response(
        _make_response(usage=_kimi_usage(100_000, 10_000)),
        lesson_id="l1", label="segmentation",
    )
    e2 = ledger.add_from_response(_make_response(), lesson_id="l1", label="extraction")
    e3 = ledger.add_from_response(
        _make_response(usage=_kimi_usage(50_000, 5_000)),
        label="path-synthesis",
    )
    blob = ledger.to_json()
    restored = CostLedger.from_json(blob)
    assert len(restored.entries) == 3
    # Verify each field is preserved
    for original, loaded in zip(ledger.entries, restored.entries):
        assert original == loaded
    # Deep-check specific values
    r0 = restored.entries[0]
    assert r0.entry_id == e1.entry_id
    assert r0.lesson_id == "l1"
    assert r0.model == "mock-1"
    assert r0.provider == "mock"
    assert r0.prompt_tokens == 100_000
    assert r0.completion_tokens == 10_000
    assert r0.cost_usd == pytest.approx(0.09, rel=1e-6)
    assert r0.label == "segmentation"
    r2 = restored.entries[2]
    assert r2.lesson_id is None
    assert r2.label == "path-synthesis"
    # Report from restored matches original
    assert restored.report().total_calls == 3
    assert restored.report().total_cost_usd == ledger.report().total_cost_usd


# ---------------------------------------------------------------------------
# Immutability
# ---------------------------------------------------------------------------


def test_entry_is_frozen() -> None:
    entry = CostLedgerEntry(
        entry_id="cl:0000", lesson_id="l1", model="m", provider="p",
        prompt_tokens=0, completion_tokens=0, cost_usd=0.0,
    )
    with pytest.raises(Exception):
        entry.cost_usd = 1.0  # type: ignore[misc]


def test_report_is_frozen() -> None:
    report = CostReport(
        total_cost_usd=0.0, total_calls=0,
        total_prompt_tokens=0, total_completion_tokens=0,
        per_lesson={}, per_model={}, per_label={},
        entries=(),
    )
    with pytest.raises(Exception):
        report.total_calls = 1  # type: ignore[misc]


# ---------------------------------------------------------------------------
# Store persistence
# ---------------------------------------------------------------------------


def test_store_persistence_round_trip() -> None:
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        store = SQLiteStore(f.name)
        entry = CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="mock-1",
            provider="mock", prompt_tokens=0, completion_tokens=0,
            cost_usd=0.0, label="test",
        )
        store.save_ledger_entry(entry)
        all_entries = store.get_ledger_entries()
        assert len(all_entries) == 1
        assert all_entries[0] == entry
        store.close()


def test_store_ledger_across_reconnect() -> None:
    """Entries survive disk persistence (not just in-memory cache)."""
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        path = f.name
        store1 = SQLiteStore(path)
        entry = CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="kimi",
            provider="kimi", prompt_tokens=100, completion_tokens=10,
            cost_usd=0.00009, label="extraction",
        )
        store1.save_ledger_entry(entry)
        store1.close()

        store2 = SQLiteStore(path)
        entries = store2.get_ledger_entries()
        assert len(entries) == 1
        assert entries[0] == entry
        store2.close()


def test_store_ledger_for_lesson() -> None:
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        store = SQLiteStore(f.name)
        e1 = CostLedgerEntry(
            entry_id="cl:0000", lesson_id="l1", model="m", provider="p",
            prompt_tokens=0, completion_tokens=0, cost_usd=0.0, label="a",
        )
        e2 = CostLedgerEntry(
            entry_id="cl:0001", lesson_id="l1", model="m", provider="p",
            prompt_tokens=0, completion_tokens=0, cost_usd=0.0, label="b",
        )
        e3 = CostLedgerEntry(
            entry_id="cl:0002", lesson_id="l2", model="m", provider="p",
            prompt_tokens=0, completion_tokens=0, cost_usd=0.0, label="c",
        )
        for e in (e1, e2, e3):
            store.save_ledger_entry(e)

        l1_entries = store.get_ledger_for_lesson("l1")
        assert len(l1_entries) == 2
        assert l1_entries[0].entry_id == "cl:0000"
        assert l1_entries[1].entry_id == "cl:0001"

        l2_entries = store.get_ledger_for_lesson("l2")
        assert len(l2_entries) == 1
        assert l2_entries[0].entry_id == "cl:0002"

        l3_entries = store.get_ledger_for_lesson("l3")
        assert l3_entries == ()
        store.close()


def test_store_ledger_empty() -> None:
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        store = SQLiteStore(f.name)
        assert store.get_ledger_entries() == ()
        store.close()


def test_store_multiple_entries_order() -> None:
    """Entries must be returned in entry_id order."""
    with tempfile.NamedTemporaryFile(suffix=".db") as f:
        store = SQLiteStore(f.name)
        # Insert in non-sorted order
        for i in [2, 0, 1]:
            e = CostLedgerEntry(
                entry_id=f"cl:{i:04d}", lesson_id="l1", model="m", provider="p",
                prompt_tokens=0, completion_tokens=0, cost_usd=0.0,
            )
            store.save_ledger_entry(e)

        entries = store.get_ledger_entries()
        assert [e.entry_id for e in entries] == ["cl:0000", "cl:0001", "cl:0002"]
        store.close()


# ---------------------------------------------------------------------------
# Multi-provider cost routing
# ---------------------------------------------------------------------------


def _deepseek_usage(prompt: int = 100_000, completion: int = 10_000) -> dict:
    """Simulate a DeepSeek API usage dict."""
    return {"prompt_tokens": prompt, "completion_tokens": completion}


def test_add_from_response_deepseek_uses_deepseek_pricing() -> None:
    """DeepSeek responses with usage dict must use DeepSeek pricing (not Kimi)."""
    ledger = CostLedger()
    usage = _deepseek_usage(prompt=100_000, completion=10_000)
    resp = _make_response(
        provider="deepseek", model="deepseek-chat", usage=usage
    )
    entry = ledger.add_from_response(resp, lesson_id="l1", label="segmentation")
    # DeepSeek deepseek-chat rates: 100K*0.14 + 10K*0.28 = 0.014 + 0.0028 = 0.0168 USD
    assert entry.prompt_tokens == 100_000
    assert entry.completion_tokens == 10_000
    assert entry.cost_usd == 0.0168
    assert entry.provider == "deepseek"
    assert entry.model == "deepseek-chat"


def test_add_from_response_deepseek_with_reasoner_model() -> None:
    """DeepSeek reasoner model uses its own pricing tier."""
    ledger = CostLedger()
    usage = _deepseek_usage(prompt=50_000, completion=5_000)
    resp = _make_response(
        provider="deepseek", model="deepseek-reasoner", usage=usage
    )
    entry = ledger.add_from_response(resp, lesson_id="l2", label="reasoning")
    # Reasoner rates: 50K*0.55 + 5K*2.19 = 0.0275 + 0.01095 = 0.03845 USD
    assert entry.cost_usd == 0.03845
    assert entry.model == "deepseek-reasoner"


def test_add_from_response_kimi_and_deepseek_in_same_ledger() -> None:
    """Mixed provider calls produce correct per-provider costs in the ledger."""
    ledger = CostLedger()
    # One Kimi call
    kimi_usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
    ledger.add_from_response(
        _make_response(provider="kimi", model="kimi-k2-0905-preview", usage=kimi_usage),
        lesson_id="l1", label="segmentation",
    )
    # One DeepSeek call
    ds_usage = {"prompt_tokens": 100_000, "completion_tokens": 10_000}
    ledger.add_from_response(
        _make_response(provider="deepseek", model="deepseek-chat", usage=ds_usage),
        lesson_id="l1", label="extraction",
    )
    report = ledger.report()
    assert report.total_calls == 2
    # Kimi: 100K*0.60 + 10K*3.00 = 0.06 + 0.03 = 0.09
    # DeepSeek: 100K*0.14 + 10K*0.28 = 0.014 + 0.0028 = 0.0168
    assert report.total_cost_usd == pytest.approx(0.1068, rel=1e-6)
    assert report.per_model["kimi-k2-0905-preview"] == pytest.approx(0.09, rel=1e-6)
    assert report.per_model["deepseek-chat"] == pytest.approx(0.0168, rel=1e-6)
