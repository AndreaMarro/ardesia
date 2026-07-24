#!/usr/bin/env python3
"""Controlli negativi del Quality Lab (Action 9).

    python3 bin/convergence/test_quality_lab.py
"""
from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import quality_lab as ql  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ql.load_tasks(ROOT)


def _task(**overrides) -> dict:
    task = {
        "id": "QL-XX",
        "title": "t",
        "class": "boundary",
        "derived_from": "un fallimento realmente osservato",
        "grader": "python3 x.py",
        "negative_control": "iniettando X esce 1",
        "observed_red": True,
        "allowed_paths": ["apps/studio/src/"],
    }
    task.update(overrides)
    return task


def _registry(tasks: list[dict]) -> dict:
    return {
        "schema_version": 1,
        "forbidden_classes": REGISTRY["forbidden_classes"],
        "protected_paths": REGISTRY["protected_paths"],
        "tasks": tasks,
    }


class RegistryNegativeControls(unittest.TestCase):
    def test_live_registry_is_valid(self) -> None:
        self.assertEqual(ql.validate_registry(REGISTRY), [])

    def test_every_live_task_has_an_observed_red_control(self) -> None:
        for task in REGISTRY["tasks"]:
            self.assertTrue(task["observed_red"], task["id"])
            self.assertTrue(task["negative_control"].strip(), task["id"])

    def test_task_without_observed_red_rejected(self) -> None:
        problems = ql.validate_registry(_registry([_task(observed_red=False)]))
        self.assertTrue(any("mai visto respingere" in p for p in problems), problems)

    def test_task_touching_its_own_evaluator_rejected(self) -> None:
        problems = ql.validate_registry(
            _registry([_task(allowed_paths=["bin/convergence/boundary_check.py"])]))
        self.assertTrue(any("proprio evaluator" in p for p in problems), problems)

    def test_task_touching_workflows_rejected(self) -> None:
        problems = ql.validate_registry(
            _registry([_task(allowed_paths=[".github/workflows/ci.yml"])]))
        self.assertTrue(any("protetto" in p for p in problems), problems)

    def test_forbidden_class_rejected(self) -> None:
        problems = ql.validate_registry(_registry([_task(**{"class": "merge"})]))
        self.assertTrue(any("vietata" in p for p in problems), problems)

    def test_empty_derivation_rejected(self) -> None:
        problems = ql.validate_registry(_registry([_task(derived_from="  ")]))
        self.assertTrue(any("fallimento reale" in p for p in problems), problems)

    def test_duplicate_id_rejected(self) -> None:
        problems = ql.validate_registry(_registry([_task(), _task()]))
        self.assertTrue(any("duplicato" in p for p in problems), problems)

    def test_registry_without_protected_paths_rejected(self) -> None:
        reg = _registry([_task()])
        reg["protected_paths"] = []
        problems = ql.validate_registry(reg)
        self.assertTrue(any("proprio giudice" in p for p in problems), problems)


class ResultNegativeControls(unittest.TestCase):
    def setUp(self) -> None:
        self.registry = _registry([_task()])

    def _result(self, **overrides) -> dict:
        r = {
            "task_id": "QL-XX",
            "outcome": "PASS",
            "base_sha": "a" * 40,
            "changed_paths": ["apps/studio/src/thing.ts"],
            "guardrails": {"typecheck": True, "tests": True},
        }
        r.update(overrides)
        return r

    def test_clean_result_validates(self) -> None:
        self.assertEqual(ql.validate_results([self._result()], self.registry), [])

    def test_out_of_scope_diff_invalidates_the_trial(self) -> None:
        problems = ql.validate_results(
            [self._result(changed_paths=["packs/elab-tutor/x.ts"])], self.registry)
        self.assertTrue(any("fuori dagli allowed_paths" in p for p in problems),
                        problems)

    def test_touching_the_evaluator_is_invalid_not_successful(self) -> None:
        problems = ql.validate_results(
            [self._result(changed_paths=["bin/convergence/ratchet.py"])],
            self.registry)
        self.assertTrue(any("invalido, non riuscito" in p for p in problems),
                        problems)

    def test_pass_with_regressed_guardrail_rejected(self) -> None:
        problems = ql.validate_results(
            [self._result(guardrails={"typecheck": True, "bundle_size": False})],
            self.registry)
        self.assertTrue(any("guardrail regrediti" in p for p in problems), problems)

    def test_non_success_outcomes_are_first_class(self) -> None:
        for outcome in ("NOT_RUN", "BLOCKED", "NOOP", "REVERTED", "UNAVAILABLE"):
            self.assertEqual(
                ql.validate_results([self._result(outcome=outcome)], self.registry),
                [], outcome)

    def test_unknown_outcome_rejected(self) -> None:
        problems = ql.validate_results(
            [self._result(outcome="MOSTLY_FINE")], self.registry)
        self.assertTrue(any("fuori da" in p for p in problems), problems)

    def test_unknown_task_rejected(self) -> None:
        problems = ql.validate_results(
            [self._result(task_id="QL-NOPE")], self.registry)
        self.assertTrue(any("sconosciuto" in p for p in problems), problems)


class CliSurface(unittest.TestCase):
    def test_cli_validates_live_registry(self) -> None:
        self.assertEqual(ql.main([]), 0)

    def test_cli_rejects_bad_results(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "results.json"
            path.write_text(json.dumps([{
                "task_id": REGISTRY["tasks"][0]["id"],
                "outcome": "PASS",
                "base_sha": "a" * 40,
                "changed_paths": ["bin/convergence/gate.sh"],
                "guardrails": {},
            }]), encoding="utf-8")
            self.assertEqual(ql.main(["--results", str(path)]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
