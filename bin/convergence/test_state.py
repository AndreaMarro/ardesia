#!/usr/bin/env python3
"""Controlli negativi per il control plane (Action 1).

Ogni test e' un oracolo: costruisce un documento che DEVE fallire un gate e
verifica che il gate lo respinga. Un gate che non respinge il suo contronesempio
non e' un gate. Standard library soltanto (unittest).

    python3 bin/convergence/test_state.py
"""
from __future__ import annotations

import datetime
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import state_schema  # noqa: E402


def _base_doc() -> dict:
    return {
        "schema_version": state_schema.SCHEMA_VERSION,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "generator": "test",
        "accepted_base": {"ref": "origin/main", "sha": "a" * 40},
        "active_branch": {"name": "codex/convergence-t1", "sha": "b" * 40, "dirty_files": 0},
        "active_programs": ["codex/convergence-t1"],
        "worktrees": [
            {"path": "/w/a", "dirty": False, "untracked": False, "ahead": 0,
             "behind": 0, "disposition_proposal": "prunable", "auto_removable": True},
        ],
        "entropy": {"worktrees_total": 1, "worktrees_dirty": 0,
                    "worktrees_prunable": 1, "open_prs": None},
        "ceilings": state_schema.CEILINGS if hasattr(state_schema, "CEILINGS") else {},
        "open_work": [],
        "violations": [],
    }


class ControlPlaneNegativeControls(unittest.TestCase):
    def test_base_doc_is_valid(self) -> None:
        state_schema.validate(_base_doc())  # non deve sollevare

    def test_two_active_programs_fail(self) -> None:
        doc = _base_doc()
        doc["active_programs"] = ["prog-a", "prog-b"]
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_stale_state_fails_freshness(self) -> None:
        doc = _base_doc()
        old = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=48)
        doc["generated_at"] = old.isoformat()
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_unclassified_open_work_fails_completeness(self) -> None:
        doc = _base_doc()
        doc["open_work"] = [{"id": "PR#175", "disposition": "unknown"}]
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_untracked_worktree_not_auto_removable(self) -> None:
        doc = _base_doc()
        doc["worktrees"][0]["untracked"] = True  # dati non tracciati
        # auto_removable resta True -> deve essere respinto
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_dirty_worktree_not_auto_removable(self) -> None:
        doc = _base_doc()
        doc["worktrees"][0]["dirty"] = True
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_unknown_disposition_rejected(self) -> None:
        doc = _base_doc()
        doc["worktrees"][0]["disposition_proposal"] = "delete-now"
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)

    def test_missing_top_key_rejected(self) -> None:
        doc = _base_doc()
        del doc["violations"]
        with self.assertRaises(state_schema.StateValidationError):
            state_schema.validate(doc)


if __name__ == "__main__":
    unittest.main(verbosity=2)
