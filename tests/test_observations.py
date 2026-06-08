"""Tests for lessonos/observations.py — cross-iteration observation store."""

import json
import os
import tempfile
from unittest.mock import patch, MagicMock

import pytest

from lessonos.observations import (
    Observation,
    save_observation,
    load_recent_observations,
    search_observations,
)


class TestObservation:
    def test_default_fields(self):
        """Observation creates with at least ts + sensible defaults."""
        obs = Observation()
        assert obs.ts  # non-empty timestamp
        assert obs.status == "pass"
        assert obs.gate_passed == 0
        assert obs.cost_usd == 0.0

    def test_frozen(self):
        """Observation is immutable."""
        obs = Observation(task="test")
        with pytest.raises(AttributeError):
            obs.task = "changed"  # type: ignore[misc]

    def test_to_jsonl(self):
        """Serializes to valid JSON with expected fields."""
        obs = Observation(
            commit="abc123", task="test-task", hypothesis="test-hyp",
            file_line="src/foo.py:42", gate_passed=10, cost_usd=0.05,
            status="pass",
        )
        line = obs.to_jsonl()
        data = json.loads(line)
        assert data["commit"] == "abc123"
        assert data["task"] == "test-task"
        assert data["hypothesis"] == "test-hyp"
        assert data["file_line"] == "src/foo.py:42"
        assert data["gate_passed"] == 10
        assert data["cost_usd"] == 0.05
        assert data["status"] == "pass"
        assert "ts" in data


class TestSaveAndLoad:
    def test_save_observation_creates_file(self):
        """save_observation creates the JSONL file and appends a line."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name

        try:
            obs = save_observation(
                store_path=tmppath,
                task="test-save",
                hypothesis="saves correctly",
                file_line="tests/test_observations.py:42",
                gate_passed=10,
                cost_usd=0.01,
                status="pass",
            )
            assert os.path.exists(tmppath)
            with open(tmppath) as f2:
                lines = f2.readlines()
            assert len(lines) == 1
            data = json.loads(lines[0].strip())
            assert data["task"] == "test-save"
            assert data["gate_passed"] == 10
            assert data["cost_usd"] == 0.01
        finally:
            os.unlink(tmppath)

    def test_save_appends_not_overwrites(self):
        """Multiple saves append distinct lines."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name

        try:
            save_observation(store_path=tmppath, task="first", gate_passed=5)
            save_observation(store_path=tmppath, task="second", gate_passed=7)
            with open(tmppath) as f2:
                lines = f2.readlines()
            assert len(lines) == 2
            assert json.loads(lines[0])["task"] == "first"
            assert json.loads(lines[1])["task"] == "second"
        finally:
            os.unlink(tmppath)

    def test_load_recent_observations_newest_first(self):
        """load_recent_observations returns newest first, limited to n."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name

        try:
            for i in range(5):
                save_observation(store_path=tmppath, task=f"task-{i}", gate_passed=i)

            recent = load_recent_observations(n=3, store_path=tmppath)
            assert len(recent) == 3
            assert recent[0].task == "task-4"  # newest first
            assert recent[1].task == "task-3"
            assert recent[2].task == "task-2"
        finally:
            os.unlink(tmppath)

    def test_load_empty(self):
        """Empty / missing file returns empty list."""
        assert load_recent_observations(n=5, store_path="/nonexistent/path.jsonl") == []

    def test_search_observations(self):
        """search_observations finds matching lines by substring."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name

        try:
            save_observation(store_path=tmppath, task="add-llm-router", gate_passed=10)
            save_observation(store_path=tmppath, task="add-didactic-delta", gate_passed=15)
            save_observation(store_path=tmppath, task="fix-groundedness-bug", gate_passed=12)

            found = search_observations("delta", store_path=tmppath)
            assert len(found) == 1
            assert found[0].task == "add-didactic-delta"

            # Multi-match: "add-" matcha 2 task names ma non il commit SHA (e.g. "add9acf")
            found2 = search_observations("add-", store_path=tmppath)
            assert len(found2) == 2
            assert {obs.task for obs in found2} == {"add-llm-router", "add-didactic-delta"}

            found3 = search_observations("nonexistent", store_path=tmppath)
            assert len(found3) == 0
        finally:
            os.unlink(tmppath)

    def test_search_empty(self):
        """search on missing file returns empty."""
        assert search_observations("anything", store_path="/nonexistent/path.jsonl") == []

    @patch('subprocess.run')
    def test_auto_detect_commit(self, mock_run):
        """save_observation auto-detects git commit if not provided."""
        mock_run.return_value = MagicMock(stdout="abc1234\n", stderr="")
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name
        try:
            obs = save_observation(store_path=tmppath, task="auto-commit")
            assert obs.commit == "abc1234"
        finally:
            os.unlink(tmppath)

    def test_round_trip_all_fields_preserved(self):
        """All fields survive serialization round-trip."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
            tmppath = f.name
        try:
            original = save_observation(
                store_path=tmppath,
                task="full-round-trip",
                hypothesis="all fields preserved",
                file_line="lessonos/observations.py:100",
                gate_passed=42,
                cost_usd=1.23,
                status="blocked",
                note="blocked on external API",
            )
            loaded = load_recent_observations(n=1, store_path=tmppath)
            assert len(loaded) == 1
            l = loaded[0]
            assert l.task == original.task
            assert l.hypothesis == original.hypothesis
            assert l.file_line == original.file_line
            assert l.gate_passed == original.gate_passed
            assert l.cost_usd == original.cost_usd
            assert l.status == original.status
            assert l.note == original.note
        finally:
            os.unlink(tmppath)
