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
    def _root_with_monolith(self, loc: int, ceiling: int) -> Path:
        d = tempfile.mkdtemp()
        root = Path(d)
        rel = ratchet.MONOLITHS[0]
        _write(root, rel, "\n".join("x" for _ in range(loc)))
        _write(root, ratchet.BASELINE_PATH, json.dumps({
            "schema_version": 1,
            "monoliths": {rel: ceiling},
            "lint_errors_max": 237,
        }))
        return root

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
        self.assertTrue(ratchet.check(root, lint_errors=238))

    def test_lint_at_ceiling_passes(self) -> None:
        root = self._root_with_monolith(loc=2943, ceiling=2943)
        self.assertEqual(ratchet.check(root, lint_errors=237), [])


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
