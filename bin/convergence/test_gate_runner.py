#!/usr/bin/env python3
"""CLI contract tests for the convergence gate runner."""

from __future__ import annotations

import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GATE = ROOT / "bin" / "convergence" / "gate.sh"


class GateRunnerCliContract(unittest.TestCase):
    def test_help_is_side_effect_free(self) -> None:
        result = subprocess.run(
            ["bash", str(GATE), "--help"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )

        self.assertEqual(0, result.returncode)
        self.assertIn("Usage:", result.stdout)
        self.assertNotIn("control-plane", result.stdout)

    def test_unknown_argument_fails_closed(self) -> None:
        result = subprocess.run(
            ["bash", str(GATE), "--bogus"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )

        self.assertEqual(2, result.returncode)
        self.assertIn("unknown argument", result.stderr.lower())


if __name__ == "__main__":
    unittest.main(verbosity=2)
