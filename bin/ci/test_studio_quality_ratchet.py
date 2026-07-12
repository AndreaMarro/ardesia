#!/usr/bin/env python3
"""Focused tests for the Studio ESLint and monolith quality ratchet."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("studio_quality_ratchet.py")
BOOTSTRAP_BASE_SHA = "e2dcb2321e7637de989ab4cdd923667f067109bc"


def load_gate():
    if not SCRIPT.exists():
        raise AssertionError(f"quality ratchet implementation is missing: {SCRIPT.name}")
    spec = importlib.util.spec_from_file_location("studio_quality_ratchet", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def baseline(
    errors: int,
    warnings: int,
    files: dict[str, tuple[int, int]],
    *,
    current_lines: int = 4_057,
    max_lines: int = 4_057,
    bootstrap_from: tuple[int, int] | None = None,
) -> dict:
    eslint: dict[str, object] = {
        "totals": {"errors": errors, "warnings": warnings},
        "files": {
            path: {"errors": counts[0], "warnings": counts[1]}
            for path, counts in files.items()
        },
    }
    if bootstrap_from is not None:
        eslint["bootstrap_from"] = {
            "errors": bootstrap_from[0],
            "warnings": bootstrap_from[1],
        }
    return {
        "version": 1,
        "eslint": eslint,
        "tool_canvas": {
            "path": "src/toolhost/ToolCanvasEmbeddable.tsx",
            "current_lines": current_lines,
            "max_lines": max_lines,
        },
    }


def observed(
    errors: int,
    warnings: int,
    files: dict[str, tuple[int, int]],
    *,
    lines: int = 4_057,
) -> dict:
    return {
        "errors": errors,
        "warnings": warnings,
        "files": {
            path: {"errors": counts[0], "warnings": counts[1]}
            for path, counts in files.items()
        },
        "tool_canvas_lines": lines,
    }


class StudioQualityRatchetTest(unittest.TestCase):
    def setUp(self) -> None:
        self.gate = load_gate()
        self.files = {
            "src/App.tsx": (150, 5),
            "src/legacy.ts": (43, 3),
        }

    def assert_problem(self, problems: list[str], fragment: str) -> None:
        self.assertTrue(
            any(fragment in problem for problem in problems),
            f"expected {fragment!r} in {problems!r}",
        )

    def test_exact_current_baseline_passes(self) -> None:
        committed = baseline(193, 8, self.files)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=committed,
            changed_files=["docs/quality.md"],
        )
        self.assertEqual(problems, [])

    def test_committed_baseline_must_exactly_match_current_counts(self) -> None:
        committed = baseline(193, 8, self.files)
        actual_files = dict(self.files)
        actual_files["src/App.tsx"] = (149, 5)
        problems = self.gate.validate_quality(
            observed(192, 8, actual_files),
            committed,
            base_baseline=committed,
            changed_files=[],
        )
        self.assert_problem(problems, "committed ESLint totals")
        self.assert_problem(problems, "committed per-file ESLint counts")

    def test_global_increase_fails(self) -> None:
        base = baseline(193, 8, self.files)
        current_files = dict(self.files)
        current_files["src/App.tsx"] = (151, 5)
        committed = baseline(194, 8, current_files)
        problems = self.gate.validate_quality(
            observed(194, 8, current_files),
            committed,
            base_baseline=base,
            changed_files=["apps/studio/src/App.tsx"],
        )
        self.assert_problem(problems, "global ESLint errors grew")

    def test_per_file_increase_and_new_issue_file_fail_when_totals_are_offset(self) -> None:
        base_files = {"src/a.ts": (100, 4), "src/b.ts": (93, 4)}
        current_files = {"src/a.ts": (98, 4), "src/b.ts": (94, 4), "src/new.ts": (1, 0)}
        problems = self.gate.validate_quality(
            observed(193, 8, current_files),
            baseline(193, 8, current_files),
            base_baseline=baseline(193, 8, base_files),
            changed_files=["apps/studio/src/new.ts"],
        )
        self.assert_problem(problems, "src/b.ts errors grew")
        self.assert_problem(problems, "new issue-bearing file: src/new.ts")

    def test_studio_js_or_ts_change_requires_a_total_reduction(self) -> None:
        committed = baseline(193, 8, self.files)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=committed,
            changed_files=["apps/studio/src/newFeature.tsx"],
        )
        self.assert_problem(problems, "Studio JS/TS change requires")

    def test_docs_or_ci_only_change_does_not_require_a_lint_reduction(self) -> None:
        committed = baseline(193, 8, self.files)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=committed,
            changed_files=["docs/quality.md", ".github/workflows/ci.yml"],
        )
        self.assertEqual(problems, [])

    def test_tool_canvas_line_growth_fails(self) -> None:
        committed = baseline(193, 8, self.files, current_lines=4_058)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files, lines=4_058),
            committed,
            base_baseline=baseline(193, 8, self.files),
            changed_files=["apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx"],
        )
        self.assert_problem(problems, "ToolCanvasEmbeddable.tsx grew")

    def test_tool_canvas_committed_max_cannot_grow(self) -> None:
        committed = baseline(193, 8, self.files, max_lines=4_058)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=baseline(193, 8, self.files),
            changed_files=["docs/quality.md"],
        )
        self.assert_problem(problems, "committed ToolCanvas max grew")

    def test_tool_canvas_shrink_then_regrow_fails_against_base_current_lines(self) -> None:
        shrunk_base = baseline(
            193,
            8,
            self.files,
            current_lines=4_000,
            max_lines=4_057,
        )
        regrown = baseline(
            192,
            8,
            {"src/App.tsx": (149, 5), "src/legacy.ts": (43, 3)},
            current_lines=4_050,
            max_lines=4_050,
        )
        problems = self.gate.validate_quality(
            observed(
                192,
                8,
                {"src/App.tsx": (149, 5), "src/legacy.ts": (43, 3)},
                lines=4_050,
            ),
            regrown,
            base_baseline=shrunk_base,
            changed_files=["apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx"],
        )
        self.assert_problem(problems, "ToolCanvasEmbeddable.tsx regrew")

    def test_tool_canvas_max_must_equal_current_lines(self) -> None:
        committed = baseline(
            193,
            8,
            self.files,
            current_lines=4_000,
            max_lines=4_057,
        )
        problems = self.gate.validate_quality(
            observed(193, 8, self.files, lines=4_000),
            committed,
            base_baseline=committed,
            changed_files=["docs/quality.md"],
        )
        self.assert_problem(problems, "ToolCanvas max_lines must equal current_lines")

    def test_empty_base_is_current_tree_mode_without_bootstrap_comparison(self) -> None:
        committed = baseline(193, 8, self.files)
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=None,
            base_sha="",
            changed_files=[],
        )
        self.assertEqual(problems, [])

    def test_baseline_less_sha_other_than_exact_bootstrap_base_fails(self) -> None:
        committed = baseline(193, 8, self.files, bootstrap_from=(195, 8))
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=None,
            base_sha="a" * 40,
            changed_files=["apps/studio/src/App.tsx"],
        )
        self.assert_problem(problems, "baseline-less base is not authorized")

    def test_exact_bootstrap_base_rejects_a_different_bootstrap_budget(self) -> None:
        committed = baseline(193, 8, self.files, bootstrap_from=(194, 8))
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=None,
            base_sha=BOOTSTRAP_BASE_SHA,
            changed_files=["apps/studio/src/App.tsx"],
        )
        self.assert_problem(problems, "bootstrap_from must be exactly 195/8")

    def test_bootstrap_tool_canvas_rejects_growth_but_allows_shrink(self) -> None:
        grown = baseline(
            193,
            8,
            self.files,
            current_lines=4_058,
            max_lines=4_058,
            bootstrap_from=(195, 8),
        )
        problems = self.gate.validate_quality(
            observed(193, 8, self.files, lines=4_058),
            grown,
            base_baseline=None,
            base_sha=BOOTSTRAP_BASE_SHA,
            changed_files=["apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx"],
        )
        self.assert_problem(problems, "ToolCanvasEmbeddable.tsx grew above bootstrap base")

        shrunk = baseline(
            193,
            8,
            self.files,
            current_lines=4_000,
            max_lines=4_000,
            bootstrap_from=(195, 8),
        )
        self.assertEqual(
            self.gate.validate_quality(
                observed(193, 8, self.files, lines=4_000),
                shrunk,
                base_baseline=None,
                base_sha=BOOTSTRAP_BASE_SHA,
                changed_files=["apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx"],
            ),
            [],
        )

    def test_first_ratchet_bootstrap_195_8_to_193_8_passes(self) -> None:
        committed = baseline(193, 8, self.files, bootstrap_from=(195, 8))
        problems = self.gate.validate_quality(
            observed(193, 8, self.files),
            committed,
            base_baseline=None,
            base_sha=BOOTSTRAP_BASE_SHA,
            changed_files=["apps/studio/src/__tests__/BreadboardCopySystem.test.ts"],
        )
        self.assertEqual(problems, [])

    def test_bootstrap_without_any_total_reduction_fails(self) -> None:
        committed = baseline(195, 8, self.files, bootstrap_from=(195, 8))
        problems = self.gate.validate_quality(
            observed(195, 8, self.files),
            committed,
            base_baseline=None,
            base_sha=BOOTSTRAP_BASE_SHA,
            changed_files=["apps/studio/src/App.tsx"],
        )
        self.assert_problem(problems, "bootstrap requires")

    def test_missing_or_malformed_baseline_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            missing = Path(tmp) / "missing.json"
            with self.assertRaisesRegex(ValueError, "missing baseline"):
                self.gate.load_baseline(missing)

            malformed = Path(tmp) / "baseline.json"
            malformed.write_text(json.dumps({"version": 1}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "invalid baseline"):
                self.gate.load_baseline(malformed)

    def test_eslint_rejects_non_object_messages_and_unknown_severity(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            studio = Path(tmp)
            eslint = studio / "node_modules" / ".bin" / "eslint"
            eslint.parent.mkdir(parents=True)
            tool_canvas = studio / "src" / "toolhost" / "ToolCanvasEmbeddable.tsx"
            tool_canvas.parent.mkdir(parents=True)
            tool_canvas.write_text("export {}\n", encoding="utf-8")
            file_path = (studio / "src" / "bad.ts").as_posix()

            for messages in ([None], [{"severity": 3}]):
                with self.subTest(messages=messages):
                    payload = json.dumps([{"filePath": file_path, "messages": messages}])
                    eslint.write_text(
                        "#!/bin/sh\nprintf '%s' " + repr(payload) + "\nexit 1\n",
                        encoding="utf-8",
                    )
                    eslint.chmod(0o755)
                    with self.assertRaisesRegex(ValueError, "ESLint message"):
                        self.gate.run_eslint(studio)

    def test_ci_runs_quality_ratchet_tests_as_a_blocking_step_before_gate(self) -> None:
        workflow = (
            Path(__file__).resolve().parents[2] / ".github" / "workflows" / "ci.yml"
        ).read_text(encoding="utf-8")
        test_command = "python3 ../../bin/ci/test_studio_quality_ratchet.py"
        gate_command = "python3 ../../bin/ci/studio_quality_ratchet.py"

        self.assertIn(test_command, workflow)
        self.assertIn(gate_command, workflow)
        self.assertLess(workflow.index(test_command), workflow.index(gate_command))

        lines = workflow.splitlines()
        command_line = next(index for index, line in enumerate(lines) if test_command in line)
        step_start = max(
            index
            for index in range(command_line + 1)
            if lines[index].startswith("      - ")
        )
        step_end = next(
            (
                index
                for index in range(command_line + 1, len(lines))
                if lines[index].startswith("      - ")
            ),
            len(lines),
        )
        test_step = "\n".join(lines[step_start:step_end])
        self.assertNotIn("continue-on-error:", test_step)


if __name__ == "__main__":
    unittest.main()
