#!/usr/bin/env python3
"""Counted Studio quality ratchet for legacy ESLint debt and ToolCanvas size."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
STUDIO_ROOT = REPO_ROOT / "apps" / "studio"
BASELINE_PATH = REPO_ROOT / "bin" / "ci" / "studio-quality-baseline.json"
BASELINE_REPO_PATH = "bin/ci/studio-quality-baseline.json"
TOOL_CANVAS_PATH = "src/toolhost/ToolCanvasEmbeddable.tsx"
CODE_SUFFIXES = {".js", ".jsx", ".ts", ".tsx"}
BOOTSTRAP_BASE_SHA = "e2dcb2321e7637de989ab4cdd923667f067109bc"
BOOTSTRAP_ESLINT = {"errors": 195, "warnings": 8}
BOOTSTRAP_TOOL_CANVAS_LINES = 4_057


def _counts(value: Any, label: str) -> dict[str, int]:
    if not isinstance(value, dict) or set(value) != {"errors", "warnings"}:
        raise ValueError(f"invalid baseline: {label} must contain errors and warnings")
    if any(not isinstance(value[key], int) or value[key] < 0 for key in value):
        raise ValueError(f"invalid baseline: {label} counts must be non-negative integers")
    return {"errors": value["errors"], "warnings": value["warnings"]}


def parse_baseline(raw: str, label: str) -> dict[str, Any]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid baseline {label}: malformed JSON") from exc
    try:
        if not isinstance(data, dict) or data.get("version") != 1:
            raise ValueError("version must be 1")
        eslint = data["eslint"]
        if not isinstance(eslint, dict):
            raise ValueError("eslint must be an object")
        totals = _counts(eslint["totals"], "eslint.totals")
        raw_files = eslint["files"]
        if not isinstance(raw_files, dict):
            raise ValueError("eslint.files must be an object")
        files: dict[str, dict[str, int]] = {}
        for path, counts in raw_files.items():
            if not isinstance(path, str) or not path or path.startswith("/"):
                raise ValueError("eslint.files keys must be relative paths")
            normalized = Path(path).as_posix()
            if normalized != path or normalized.startswith("../"):
                raise ValueError("eslint.files keys must be normalized Studio-relative paths")
            parsed = _counts(counts, f"eslint.files[{path}]")
            if parsed["errors"] + parsed["warnings"] == 0:
                raise ValueError("eslint.files must omit zero-issue files")
            files[path] = parsed
        if sum(item["errors"] for item in files.values()) != totals["errors"]:
            raise ValueError("eslint error total does not match per-file counts")
        if sum(item["warnings"] for item in files.values()) != totals["warnings"]:
            raise ValueError("eslint warning total does not match per-file counts")
        bootstrap = eslint.get("bootstrap_from")
        if bootstrap is not None:
            bootstrap = _counts(bootstrap, "eslint.bootstrap_from")
        tool_canvas = data["tool_canvas"]
        if not isinstance(tool_canvas, dict) or set(tool_canvas) != {
            "path",
            "current_lines",
            "max_lines",
        }:
            raise ValueError("tool_canvas must contain path, current_lines, and max_lines")
        if tool_canvas["path"] != TOOL_CANVAS_PATH:
            raise ValueError(f"tool_canvas.path must be {TOOL_CANVAS_PATH}")
        for key in ("current_lines", "max_lines"):
            if not isinstance(tool_canvas[key], int) or tool_canvas[key] < 1:
                raise ValueError(f"tool_canvas.{key} must be a positive integer")
    except (KeyError, TypeError, ValueError) as exc:
        if isinstance(exc, ValueError) and str(exc).startswith("invalid baseline"):
            raise
        raise ValueError(f"invalid baseline {label}: {exc}") from exc
    return {
        "version": 1,
        "eslint": {
            "totals": totals,
            "files": files,
            **({"bootstrap_from": bootstrap} if bootstrap is not None else {}),
        },
        "tool_canvas": tool_canvas,
    }


def load_baseline(path: Path = BASELINE_PATH) -> dict[str, Any]:
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise ValueError(f"missing baseline: {path}") from exc
    return parse_baseline(raw, str(path))


def load_base_baseline(base_sha: str) -> dict[str, Any] | None:
    commit = subprocess.run(
        ["git", "cat-file", "-e", f"{base_sha}^{{commit}}"],
        cwd=REPO_ROOT,
        capture_output=True,
    )
    if commit.returncode != 0:
        raise ValueError("invalid base commit")
    result = subprocess.run(
        ["git", "show", f"{base_sha}:{BASELINE_REPO_PATH}"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    return parse_baseline(result.stdout, f"{base_sha}:{BASELINE_REPO_PATH}")


def changed_files(base_sha: str) -> list[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMRD", base_sha, "HEAD", "--"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def _studio_code_changed(paths: list[str]) -> bool:
    prefix = "apps/studio/"
    return any(path.startswith(prefix) and Path(path).suffix in CODE_SUFFIXES for path in paths)


def validate_quality(
    observed: dict[str, Any],
    committed: dict[str, Any],
    *,
    base_baseline: dict[str, Any] | None,
    changed_files: list[str],
    base_sha: str = "",
) -> list[str]:
    problems: list[str] = []
    current_eslint = committed["eslint"]
    committed_totals = current_eslint["totals"]
    observed_totals = {
        "errors": observed["errors"],
        "warnings": observed["warnings"],
    }
    if committed_totals != observed_totals:
        problems.append(
            "committed ESLint totals do not equal the current tree "
            f"(baseline {committed_totals['errors']}/{committed_totals['warnings']}, "
            f"actual {observed['errors']}/{observed['warnings']})"
        )
    if current_eslint["files"] != observed["files"]:
        problems.append("committed per-file ESLint counts do not equal the current tree")

    tool = committed["tool_canvas"]
    if tool["current_lines"] != observed["tool_canvas_lines"]:
        problems.append(
            "committed ToolCanvas current_lines does not equal the current tree "
            f"({tool['current_lines']} vs {observed['tool_canvas_lines']})"
        )
    if observed["tool_canvas_lines"] > tool["max_lines"]:
        problems.append(
            "ToolCanvasEmbeddable.tsx grew beyond its committed max "
            f"({observed['tool_canvas_lines']} > {tool['max_lines']})"
        )
    if tool["max_lines"] != tool["current_lines"]:
        problems.append(
            "ToolCanvas max_lines must equal current_lines "
            f"({tool['max_lines']} != {tool['current_lines']})"
        )

    current_total = observed["errors"] + observed["warnings"]
    if base_baseline is None:
        if not base_sha:
            return problems
        if base_sha != BOOTSTRAP_BASE_SHA:
            problems.append("baseline-less base is not authorized for bootstrap")
            return problems
        if observed["tool_canvas_lines"] > BOOTSTRAP_TOOL_CANVAS_LINES:
            problems.append(
                "ToolCanvasEmbeddable.tsx grew above bootstrap base "
                f"({BOOTSTRAP_TOOL_CANVAS_LINES} -> {observed['tool_canvas_lines']})"
            )
        bootstrap = current_eslint.get("bootstrap_from")
        if bootstrap is None:
            problems.append("first ratchet requires an explicit eslint.bootstrap_from budget")
        elif bootstrap != BOOTSTRAP_ESLINT:
            problems.append(
                "eslint.bootstrap_from must be exactly 195/8 for the authorized base"
            )
        else:
            bootstrap_total = bootstrap["errors"] + bootstrap["warnings"]
            if observed["errors"] > bootstrap["errors"]:
                problems.append("global ESLint errors grew above the bootstrap budget")
            if observed["warnings"] > bootstrap["warnings"]:
                problems.append("global ESLint warnings grew above the bootstrap budget")
            if current_total >= bootstrap_total:
                problems.append("bootstrap requires at least one total ESLint issue reduction")
        return problems

    base_eslint = base_baseline["eslint"]
    base_totals = base_eslint["totals"]
    for severity in ("errors", "warnings"):
        if observed[severity] > base_totals[severity]:
            problems.append(
                f"global ESLint {severity} grew "
                f"({base_totals[severity]} -> {observed[severity]})"
            )

    base_files = base_eslint["files"]
    for path, counts in observed["files"].items():
        previous = base_files.get(path)
        if previous is None:
            problems.append(f"new issue-bearing file: {path}")
            continue
        for severity in ("errors", "warnings"):
            if counts[severity] > previous[severity]:
                problems.append(
                    f"{path} {severity} grew "
                    f"({previous[severity]} -> {counts[severity]})"
                )

    base_tool = base_baseline["tool_canvas"]
    if observed["tool_canvas_lines"] > base_tool["current_lines"]:
        problems.append(
            "ToolCanvasEmbeddable.tsx regrew from the base current_lines "
            f"({base_tool['current_lines']} -> {observed['tool_canvas_lines']})"
        )
    if tool["max_lines"] > base_tool["current_lines"]:
        problems.append(
            "committed ToolCanvas max grew from the base current_lines "
            f"({base_tool['current_lines']} -> {tool['max_lines']})"
        )

    base_total = base_totals["errors"] + base_totals["warnings"]
    if _studio_code_changed(changed_files) and current_total >= base_total:
        problems.append(
            "Studio JS/TS change requires at least one total ESLint issue reduction "
            f"({base_total} -> {current_total})"
        )
    return problems


def run_eslint(studio_root: Path = STUDIO_ROOT) -> dict[str, Any]:
    eslint = studio_root / "node_modules" / ".bin" / "eslint"
    if not eslint.is_file():
        raise ValueError("repository-pinned Studio ESLint is missing; run npm ci")
    result = subprocess.run(
        [str(eslint), ".", "--format", "json"],
        cwd=studio_root,
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        raise ValueError(f"ESLint could not run (exit {result.returncode})")
    try:
        reports = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ValueError("ESLint did not return valid JSON") from exc
    if not isinstance(reports, list):
        raise ValueError("ESLint JSON result must be a list")

    root = studio_root.resolve()
    files: dict[str, dict[str, int]] = {}
    for report in reports:
        if not isinstance(report, dict) or not isinstance(report.get("filePath"), str):
            raise ValueError("ESLint JSON result is malformed")
        file_path = Path(report["filePath"])
        if not file_path.is_absolute():
            file_path = studio_root / file_path
        try:
            relative = file_path.resolve().relative_to(root).as_posix()
        except ValueError as exc:
            raise ValueError("ESLint reported a file outside apps/studio") from exc
        messages = report.get("messages")
        if not isinstance(messages, list):
            raise ValueError("ESLint JSON result is malformed")
        for message in messages:
            if not isinstance(message, dict):
                raise ValueError("ESLint message must be an object")
            severity = message.get("severity")
            if type(severity) is not int or severity not in (1, 2):
                raise ValueError("ESLint message severity must be exactly 1 or 2")
        counts = {
            "errors": sum(message.get("severity") == 2 for message in messages),
            "warnings": sum(message.get("severity") == 1 for message in messages),
        }
        if counts["errors"] + counts["warnings"]:
            files[relative] = counts
    return {
        "errors": sum(counts["errors"] for counts in files.values()),
        "warnings": sum(counts["warnings"] for counts in files.values()),
        "files": dict(sorted(files.items())),
        "tool_canvas_lines": len(
            (studio_root / TOOL_CANVAS_PATH).read_text(encoding="utf-8").splitlines()
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base",
        default=os.environ.get("STUDIO_QUALITY_BASE_SHA", ""),
        help="optional base commit for PR ratchet comparison",
    )
    args = parser.parse_args(argv)
    base_sha = args.base.strip()
    try:
        committed = load_baseline()
        observed = run_eslint()
        base = load_base_baseline(base_sha) if base_sha else None
        changes = changed_files(base_sha) if base_sha else []
        problems = validate_quality(
            observed,
            committed,
            base_baseline=base,
            changed_files=changes,
            base_sha=base_sha,
        )
    except (OSError, subprocess.CalledProcessError, ValueError) as exc:
        print(f"studio_quality_ratchet: FAIL: {exc}", file=sys.stderr)
        return 1
    if problems:
        for problem in problems:
            print(f"studio_quality_ratchet: FAIL: {problem}", file=sys.stderr)
        return 1
    print(
        "studio_quality_ratchet: OK "
        f"(ESLint {observed['errors']} errors / {observed['warnings']} warnings; "
        f"ToolCanvas {observed['tool_canvas_lines']} lines)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
