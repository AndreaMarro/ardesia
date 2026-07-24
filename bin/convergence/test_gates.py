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
            "schema_version": ratchet.SCHEMA_VERSION,
            "monoliths": {rel: {"loc": ceiling, "fan_out": 99, "exports": 99}},
            "lint_errors_max": 237,
            "lint_scope": self.SCOPE,
        }))
        return root

    def test_schema_1_integer_ceiling_still_read_as_loc(self) -> None:
        # baseline vecchia (intero = LOC): deve restare leggibile, altrimenti
        # l'aggiornamento dello schema si traveste da regressione di debito
        d = tempfile.mkdtemp()
        root = Path(d)
        rel = ratchet.MONOLITHS[0]
        _write(root, rel, "\n".join("x" for _ in range(10)))
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": 1, "monoliths": {rel: 10}}))
        failures = ratchet.check(root, lint_errors=None)
        # loc entro il tetto; fan_out/exports non hanno tetto e vanno dichiarati
        self.assertFalse(any("loc" in f for f in failures), failures)
        self.assertTrue(any("fan_out" in f for f in failures), failures)

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


class CouplingMetrics(unittest.TestCase):
    """LOC premia lo spostamento di righe; fan_out ed exports no."""

    SRC = (
        'import a from "./a"\n'
        'import b from "pkg-b"\n'
        'import c from "./a"\n'          # stesso modulo: non conta due volte
        'const lazy = () => import("./d")\n'
        "export const x = 1\n"
        "export function y() {}\n"
        "export type Z = number\n"
        "const hidden = 2\n"
    )

    def test_fan_out_counts_distinct_modules(self) -> None:
        self.assertEqual(ratchet._fan_out(self.SRC), 3)  # ./a, pkg-b, ./d

    def test_exports_count_public_surface(self) -> None:
        self.assertEqual(ratchet._exports(self.SRC), 3)

    def test_moving_lines_out_without_reducing_coupling_is_visible(self) -> None:
        # il file dimagrisce (LOC scende) ma importa ed esporta esattamente
        # come prima: nessuna delle due metriche che contano si muove
        slim = self.SRC + "".join(f"// riga {i}\n" for i in range(50))
        fat_metrics = {"loc": len(slim.splitlines()),
                       "fan_out": ratchet._fan_out(slim),
                       "exports": ratchet._exports(slim)}
        thin_metrics = {"loc": len(self.SRC.splitlines()),
                        "fan_out": ratchet._fan_out(self.SRC),
                        "exports": ratchet._exports(self.SRC)}
        self.assertLess(thin_metrics["loc"], fat_metrics["loc"])
        self.assertEqual(thin_metrics["fan_out"], fat_metrics["fan_out"])
        self.assertEqual(thin_metrics["exports"], fat_metrics["exports"])

    def test_new_import_breaks_the_ceiling(self) -> None:
        d = tempfile.mkdtemp()
        root = Path(d)
        rel = ratchet.MONOLITHS[0]
        _write(root, rel, self.SRC + 'import extra from "pkg-extra"\n')
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": ratchet.SCHEMA_VERSION,
            "monoliths": {rel: {"loc": 999, "fan_out": 3, "exports": 3}}}))
        failures = ratchet.check(root, lint_errors=None)
        self.assertTrue(any("fan_out 4 > tetto 3" in f for f in failures), failures)

    def test_new_export_breaks_the_ceiling(self) -> None:
        d = tempfile.mkdtemp()
        root = Path(d)
        rel = ratchet.MONOLITHS[0]
        _write(root, rel, self.SRC + "export const extra = 3\n")
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": ratchet.SCHEMA_VERSION,
            "monoliths": {rel: {"loc": 999, "fan_out": 3, "exports": 3}}}))
        failures = ratchet.check(root, lint_errors=None)
        self.assertTrue(any("exports 4 > tetto 3" in f for f in failures), failures)


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
