#!/usr/bin/env python3
"""Controlli negativi per ratchet e evidence guard (Action 2).

    python3 bin/convergence/test_gates.py
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ratchet  # noqa: E402
import evidence_guard  # noqa: E402


def _write(root: Path, rel: str, content: str) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


class RatchetNegativeControls(unittest.TestCase):
    SCOPE = "apps/studio: npx eslint . --format json"

    def _root_with_monolith(self, loc: int, ceiling: int) -> Path:
        d = tempfile.mkdtemp()
        root = Path(d)
        rel = ratchet.MONOLITHS[0]
        _write(root, rel, "\n".join("x" for _ in range(loc)))
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": 1,
            "monoliths": {rel: ceiling},
            "lint_errors_max": 237,
            "lint_scope": self.SCOPE,
        }))
        return root

    def test_lint_scope_mismatch_fails_even_when_count_is_lower(self) -> None:
        # 12 < 237, ma misurato su un altro albero: NON e' un miglioramento,
        # e' un confronto illecito. Deve fallire.
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        failures = ratchet.check(root, lint_errors=12,
                                 lint_scope="apps/studio: npx eslint src")
        self.assertTrue(any("scope" in f for f in failures), failures)

    def test_lint_scope_absent_fails(self) -> None:
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        failures = ratchet.check(root, lint_errors=237, lint_scope=None)
        self.assertTrue(any("scope" in f for f in failures), failures)

    def test_loc_growth_fails(self) -> None:
        root = self._root_with_monolith(loc=3000, ceiling=2943)
        self.assertTrue(ratchet.check(root, lint_errors=None))

    def test_loc_at_ceiling_passes(self) -> None:
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        self.assertEqual(ratchet.check(root, lint_errors=None), [])

    def test_loc_shrink_passes(self) -> None:
        root = self._root_with_monolith(loc=2900, ceiling=2943)
        self.assertEqual(ratchet.check(root, lint_errors=None), [])

    def test_lint_growth_fails(self) -> None:
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        self.assertTrue(ratchet.check(root, lint_errors=238, lint_scope=self.SCOPE))

    def test_lint_at_ceiling_passes(self) -> None:
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        self.assertEqual(ratchet.check(root, lint_errors=237, lint_scope=self.SCOPE), [])


class LintReportParsing(unittest.TestCase):
    """Il conteggio lint della CI deve venire dal report, non da un numero
    scritto a mano: un report malformato deve FALLIRE, non valere zero."""

    def test_counts_errors_across_files(self) -> None:
        report = json.dumps([
            {"filePath": "a.ts", "errorCount": 3, "warningCount": 1},
            {"filePath": "b.ts", "errorCount": 0, "warningCount": 9},
            {"filePath": "c.ts", "errorCount": 234, "warningCount": 0},
        ])
        self.assertEqual(ratchet.lint_errors_from_report(report), 237)

    def test_empty_report_is_zero_not_error(self) -> None:
        self.assertEqual(ratchet.lint_errors_from_report("[]"), 0)

    def test_missing_error_count_rejected(self) -> None:
        # un formato diverso non deve degradare a 0 in silenzio
        with self.assertRaises(ValueError):
            ratchet.lint_errors_from_report(json.dumps([{"filePath": "a.ts"}]))

    def test_non_array_rejected(self) -> None:
        with self.assertRaises(ValueError):
            ratchet.lint_errors_from_report(json.dumps({"errorCount": 0}))

    def test_cli_rejects_missing_report(self) -> None:
        root = self._noop_root()
        self.assertEqual(
            ratchet.main(["--root", str(root), "--lint-json", str(root / "nope.json")]), 1)

    def test_cli_rejects_disagreeing_sources(self) -> None:
        root = self._noop_root()
        report = root / "eslint.json"
        report.write_text(json.dumps([{"filePath": "a.ts", "errorCount": 237}]))
        self.assertEqual(ratchet.main(
            ["--root", str(root), "--lint-json", str(report), "--lint-errors", "12"]), 1)

    def _noop_root(self) -> Path:
        d = tempfile.mkdtemp()
        root = Path(d)
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": 1, "monoliths": {}, "lint_errors_max": 237}))
        return root


class EvidenceGuardNegativeControls(unittest.TestCase):
    def test_sha_named_evidence_caught(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            sha = "a" * 40
            _write(root, f"docs/ops/evidence/records/{sha}.json", "{}")
            offenders = evidence_guard.find_self_referential(
                root, ("docs/ops/evidence",))
            self.assertEqual(len(offenders), 1, offenders)

    def test_content_addressed_evidence_passes(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            # nome derivato dal digest di CIO' CHE si attesta, non del commit
            _write(root, "docs/ops/evidence/records/policy-v1-abc.json", "{}")
            offenders = evidence_guard.find_self_referential(
                root, ("docs/ops/evidence",))
            self.assertEqual(offenders, [], offenders)

    def test_short_hash_not_flagged(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            _write(root, "docs/ops/evidence/records/abc1234.json", "{}")
            offenders = evidence_guard.find_self_referential(
                root, ("docs/ops/evidence",))
            self.assertEqual(offenders, [], offenders)


if __name__ == "__main__":
    unittest.main(verbosity=2)
