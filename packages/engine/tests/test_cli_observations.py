"""Tests for the ``lessonos observations`` CLI subcommand.

Covers: formatted display of recent observations from observations.jsonl,
edge cases (empty file, missing file, limit parameter, corrupted lines).
"""

from __future__ import annotations

import json
import pytest

from lessonos.cli import _observations_summary, main


def _write_observations(path, entries):
    """Write test observation entries to a JSONL file."""
    with open(path, "w") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False, sort_keys=False) + "\n")


# ── Tests for _observations_summary ────────────────────────────────────────


def test_observations_summary_shows_most_recent_first(tmp_path):
    """Observations are displayed newest-first by file-order (last appended = first shown)."""
    obs_path = tmp_path / "observations.jsonl"
    _write_observations(obs_path, [
        {"ts": "2026-06-01T00:00:00Z", "task": "first_written", "gate_passed": 100, "status": "pass", "commit": "abc123", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
        {"ts": "2026-06-03T00:00:00Z", "task": "second_written", "gate_passed": 200, "status": "pass", "commit": "def456", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
        {"ts": "2026-06-02T00:00:00Z", "task": "third_written", "gate_passed": 150, "status": "pass", "commit": "ghi789", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
    ])
    result = _observations_summary(obs_path, limit=5)
    lines = [l for l in result.split("\n") if l.strip()]
    obs_lines = [l for l in lines if "[" in l and "]" in l]
    assert len(obs_lines) == 3, f"expected 3 observation lines, got {len(obs_lines)}"
    # load_recent_observations reverses file order: last written appears first
    assert "third_written" in obs_lines[0], "last appended should be first"
    assert "second_written" in obs_lines[1], "second appended should be second"
    assert "first_written" in obs_lines[2], "first appended should be last"


def test_observations_summary_respects_limit(tmp_path):
    """With limit=1, only the most recent observation is shown."""
    obs_path = tmp_path / "observations.jsonl"
    _write_observations(obs_path, [
        {"ts": "2026-06-01T00:00:00Z", "task": "first", "gate_passed": 100, "status": "pass", "commit": "a1", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
        {"ts": "2026-06-02T00:00:00Z", "task": "second", "gate_passed": 200, "status": "pass", "commit": "a2", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
    ])
    result = _observations_summary(obs_path, limit=1)
    assert "second" in result
    assert "first" not in result, "limit=1 should only show the single most recent observation"


def test_observations_summary_empty_file(tmp_path):
    """Empty file returns empty string, not a crash."""
    obs_path = tmp_path / "observations.jsonl"
    obs_path.write_text("")
    assert _observations_summary(obs_path) == ""


def test_observations_summary_missing_file(tmp_path):
    """Missing file returns empty string, not a crash."""
    obs_path = tmp_path / "nonexistent.jsonl"
    assert _observations_summary(obs_path) == ""


def test_observations_summary_skips_corrupted_lines(tmp_path):
    """Corrupted JSON lines are skipped with a warning, valid lines still shown."""
    obs_path = tmp_path / "observations.jsonl"
    with open(obs_path, "w") as f:
        f.write("not json\n")
        f.write('{"ts": "2026-06-03T00:00:00Z", "task": "valid", "gate_passed": 300, "status": "pass", "commit": "a3", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""}\n')
        f.write("{broken json\n")
    result = _observations_summary(obs_path)
    assert "valid" in result
    assert "not json" not in result  # corrupted line should not appear as valid entry


def test_observations_summary_shows_gate_passed_status(tmp_path):
    """The gate_passed count and status appear in the summary for each observation."""
    obs_path = tmp_path / "observations.jsonl"
    _write_observations(obs_path, [
        {"ts": "2026-06-04T00:00:00Z", "task": "test task", "gate_passed": 600, "status": "pass", "commit": "a4", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": "some note"},
    ])
    result = _observations_summary(obs_path)
    assert "600" in result, "gate_passed should appear in summary"
    assert "pass" in result, "status should appear in summary"
    assert "test task" in result, "task name should appear in summary"
    assert "some note" in result, "note should appear in summary"


def test_observations_summary_default_limit_10(tmp_path):
    """With no explicit limit, up to 10 observations are shown."""
    obs_path = tmp_path / "observations.jsonl"
    _write_observations(obs_path, [
        {"ts": f"2026-06-{d:02d}T00:00:00Z", "task": f"task {d}", "gate_passed": d * 10, "status": "pass", "commit": f"c{d}", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""}
        for d in range(1, 15)
    ])
    result = _observations_summary(obs_path)
    # With 14 entries and default limit 10, oldest 4 should be cut
    lines = [l for l in result.split("\n") if "task " in l]
    assert len(lines) == 10, f"expected 10 lines (default limit), got {len(lines)}"
    # Most recent 10 = tasks 5-14 (displayed newest first: 14,13,...,5)
    assert "task 14" in result, "most recent task should appear"
    assert "task 5" in result, "10th most recent (last within limit)"
    # Oldest tasks (1-4) should be beyond the limit — check for exact lines
    assert "  (gate=10," not in result, "oldest task (gate=10) should be beyond default limit"
    assert "  (gate=20," not in result, "second oldest task should be beyond default limit"


def test_observations_summary_rejects_negative_limit(tmp_path):
    """Negative or zero limit raises ValueError."""
    obs_path = tmp_path / "observations.jsonl"
    _write_observations(obs_path, [
        {"ts": "2026-06-01T00:00:00Z", "task": "t", "gate_passed": 1, "status": "pass", "commit": "c", "cost_usd": 0.0, "file_line": "", "hypothesis": "", "note": ""},
    ])
    with pytest.raises(ValueError, match="limit must be positive"):
        _observations_summary(obs_path, limit=0)
    with pytest.raises(ValueError, match="limit must be positive"):
        _observations_summary(obs_path, limit=-1)

