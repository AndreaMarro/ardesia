"""Tests for the ``lessonos eval-real`` CLI subcommand.

Tests that the subcommand:
- Parses arguments correctly
- Runs mock eval and prints summary
- Handles missing fixture path
- Handles unknown lesson
- Handles --n-runs > 1 for multi-run
"""

from __future__ import annotations

import os
import sys

import pytest

from lessonos.cli import main as cli_main


def _live_key_available() -> bool:
    """Mirror realtime.py's key resolution exactly: env DEEPSEEK, env KIMI,
    then ``.env`` (DeepSeek only — KimiProvider never parses .env).

    Resolution must match runtime: DeepSeekProvider reads ``.env`` relative to
    CWD (``_parse_env_file(".env")``), so the gate cwd (repo root) is what
    counts. On the Mini a key is present (env or project-root .env); in CI /
    clean checkout no key exists, so the ``--live`` tests skip instead of
    raising RuntimeError.
    """
    if os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("KIMI_API_KEY"):
        return True
    from lessonos.llm.deepseek import _parse_env_file

    return bool(_parse_env_file(".env").get("DEEPSEEK_API_KEY"))


_HAS_LIVE_KEY = _live_key_available()


def test_eval_real_default_lesson() -> None:
    """Run eval-real on default lesson with default fixture (mock)."""
    exit_code = cli_main(["eval-real"])
    assert exit_code == 0


def test_eval_real_output_contains_groundedness() -> None:
    """eval-real output includes groundedness metrics."""
    from io import StringIO
    import re

    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real"])
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    assert exit_code == 0
    output = stdout.getvalue()
    # Verify actual groundedness score in output
    assert "groundedness=" in output and "[EVAL]" in output
    # Parse and verify the score value (mock returns 1.0)
    m = re.search(r"groundedness=([\d.]+)", output)
    assert m is not None, "Could not parse groundedness score"
    assert float(m.group(1)) >= 0.5, f"groundedness too low: {m.group(1)}"


def test_eval_real_explicit_lesson() -> None:
    """eval-real works with explicit --lesson."""
    exit_code = cli_main(
        ["eval-real", "--lesson", "l1_derivative_definition"]
    )
    assert exit_code == 0


def test_eval_real_n_runs_3() -> None:
    """eval-real with --n-runs 3 prints per-run details."""
    from io import StringIO

    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real", "--n-runs", "3"])
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    assert exit_code == 0
    output = stdout.getvalue()
    # Multi-run output shows '[EVAL-MULTI]' with run count
    assert "[EVAL-MULTI]" in output and "(3 runs)" in output
    # Verify per-run lines exist
    assert "run 1:" in output and "run 3:" in output


def test_eval_real_n_runs_1_default() -> None:
    """eval-real with single run (default) does NOT crash."""
    exit_code = cli_main(["eval-real", "--n-runs", "1"])
    assert exit_code == 0


def test_eval_real_unknown_lesson_returns_1() -> None:
    """eval-real with unknown --lesson prints error and returns 1."""
    from io import StringIO

    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real", "--lesson", "nonexistent"])
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    assert exit_code == 1
    assert "not found" in stderr.getvalue()


def test_eval_real_missing_fixture_returns_1(tmp_path) -> None:
    """eval-real with a missing fixture directory prints error and returns 1."""
    from io import StringIO

    stderr = StringIO()
    old_err = sys.stderr
    sys.stderr = stderr
    try:
        exit_code = cli_main(
            ["eval-real", "--fixture", str(tmp_path / "nope")]
        )
    finally:
        sys.stderr = old_err
    assert exit_code == 1
    assert "not found" in stderr.getvalue()


def test_eval_real_no_mock_lesson_returns_1() -> None:
    """eval-real with unknown lesson returns 1 (lesson not found)."""
    from io import StringIO

    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        # Use a lesson_id that exists nowhere (no fixture, no mock).
        from lessonos import cli as _cli_mod

        assert "fake_lesson_no_mock" not in _cli_mod._LESSON_MOCKS

        exit_code = cli_main(
            ["eval-real", "--lesson", "fake_lesson_no_mock"]
        )
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    assert exit_code == 1
    err = stderr.getvalue()
    assert "not found" in err or "no mock" in err, f"Unexpected error: {err}"


def test_eval_real_missing_path_json_returns_1(tmp_path) -> None:
    """eval-real with a fixture dir missing path.json returns 1."""
    (tmp_path / "lessons").mkdir(parents=True)
    from io import StringIO

    stderr = StringIO()
    old_err = sys.stderr
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real", "--fixture", str(tmp_path)])
    finally:
        sys.stderr = old_err
    assert exit_code == 1
    assert "no path.json" in stderr.getvalue()


@pytest.mark.skipif(
    not _HAS_LIVE_KEY,
    reason="no DEEPSEEK/KIMI key available (env or .env) — live eval would raise",
)
def test_eval_real_live_flag_parses() -> None:
    """eval-real --live is accepted as a parser argument (mock-tested)."""
    from io import StringIO

    # In test env without DEEPSEEK_API_KEY, --live should exit with error
    # (key not found) — not a parser error
    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real", "--live"])
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    # If DEEPSEEK_API_KEY is set, it exits 0; otherwise RuntimeError (no key)
    # Either is acceptable — the parser accepts --live in both cases
    # The important thing is that it does NOT raise SystemExit from argparse
    assert exit_code in (0, 1), f"Unexpected exit code: {exit_code}"
    if exit_code == 1:
        # Verify the error is about missing API key, not parser rejection
        assert any(
            msg in (stdout.getvalue() + stderr.getvalue()).lower()
            for msg in ["key", "api_key", "api key"]
        ), f"Unexpected error: {stderr.getvalue()}"


@pytest.mark.skipif(
    not _HAS_LIVE_KEY,
    reason="no DEEPSEEK/KIMI key available (env or .env) — live eval would raise",
)
def test_eval_real_live_flag_with_n_runs() -> None:
    """eval-real --live --n-runs 3 is accepted (tries live or raises)."""
    from io import StringIO

    stdout = StringIO()
    stderr = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    sys.stdout = stdout
    sys.stderr = stderr
    try:
        exit_code = cli_main(["eval-real", "--live", "--n-runs", "3"])
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    # Same as above: live might work with key, or fail gracefully without
    assert exit_code in (0, 1), f"Unexpected exit code: {exit_code}"


# ---------------------------------------------------------------------------
# M8-task2: Cross-domain eval-real (spaced_path, bio_path)
# ---------------------------------------------------------------------------


def test_eval_real_spaced_path() -> None:
    """eval-real works on spaced_path (mock, lesson 1)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/spaced_path",
        "--lesson", "l1_sm2_intro",
    ])
    assert exit_code == 0


def test_eval_real_spaced_path_l2() -> None:
    """eval-real works on spaced_path lesson 2 (FSRS)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/spaced_path",
        "--lesson", "l2_fsrs_advanced",
    ])
    assert exit_code == 0


def test_eval_real_bio_path() -> None:
    """eval-real works on bio_path (mock, lesson 1)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/bio_path",
        "--lesson", "l1_fotosintesi_intro",
    ])
    assert exit_code == 0


def test_eval_real_bio_path_l2() -> None:
    """eval-real works on bio_path lesson 2 (reazioni luce)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/bio_path",
        "--lesson", "l2_reazioni_luce",
    ])
    assert exit_code == 0


def test_eval_real_spaced_path_n_runs_3() -> None:
    """eval-real --n-runs 3 works on spaced_path (mock)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/spaced_path",
        "--lesson", "l1_sm2_intro",
        "--n-runs", "3",
    ])
    assert exit_code == 0


def test_eval_real_bio_path_n_runs_3() -> None:
    """eval-real --n-runs 3 works on bio_path (mock)."""
    exit_code = cli_main([
        "eval-real", "--fixture", "fixtures/bio_path",
        "--lesson", "l1_fotosintesi_intro",
        "--n-runs", "3",
    ])
    assert exit_code == 0
