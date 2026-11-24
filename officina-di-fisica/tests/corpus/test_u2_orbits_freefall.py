"""Reproducible independent-oracle counterexamples for five reviewed U2 batches.

Retokening is simulated only inside a patch context: the adversary must still
fail the separate mathematical oracle after satisfying payload/key integrity.
No candidate, binding, review token or source file is changed on disk.
"""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from hypothesis import given, settings, strategies as st
import sympy as sp

from tools.corpus_engineering import (
    centripetal_acceleration_verifier,
    circular_force_verifier,
    freefall_speed_verifier,
    freefall_time_verifier,
    vertical_maximum_verifier,
)
from tools.corpus_engineering.pipeline import canonical, digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
ASSETS = APP/"editorial/assets"
BATCHES = [
    ("freefall-speed-021", freefall_speed_verifier),
    ("freefall-time-022", freefall_time_verifier),
    ("vertical-maximum-023", vertical_maximum_verifier),
    ("centripetal-acceleration-025", centripetal_acceleration_verifier),
    ("circular-force-026", circular_force_verifier),
]


def load_batch(name):
    home = APP/"editorial/batches"
    return json.loads((home/f"{name}.json").read_text()), json.loads((home/f"{name}-bindings.json").read_text())


class SeparateU2Evidence(unittest.TestCase):
    def test_all_eighty_read_drafts_have_deterministic_fresh_reports(self):
        for name, verifier in BATCHES:
            with self.subTest(batch=name):
                package, bindings = load_batch(name)
                report = verifier.report(package, bindings)
                self.assertEqual(canonical(report), canonical(verifier.report(package, bindings)))
                self.assertEqual({r["id"] for r in report["records"]}, verifier.EXPECTED_IDS)
                self.assertEqual(len(report["records"]), 16)
                self.assertEqual(report["humanApproval"], "NOT_RUN")
                for result in report["records"]:
                    self.assertTrue(result["ok"], result["errors"])
                    self.assertTrue(result["manualArithmetic"])
                    self.assertIn(result["verificationMode"], {"EXACT_ORACLE", "AI_CONCEPTUAL"})
                    self.assertEqual((result["humanApproval"], result["publication"]), ("NOT_RUN", "DRAFT"))

    def test_each_wrong_answer_fails_after_rebinding_and_simulated_retokening(self):
        for name, verifier in BATCHES:
            for index in range(16):
                with self.subTest(batch=name, id=index+1):
                    package, bindings = load_batch(name)
                    row = package["records"][index]
                    answer = row["answer"]
                    if answer["type"] == "numeric":
                        answer["value"] += 1
                    else:
                        # A distinct EXISTING option keeps a valid unique choice key.
                        answer["value"] = next(x for x in answer["options"] if x != answer["value"])
                    binding = next(x for x in bindings if x["id"] == row["id"])
                    binding["candidateSha256"] = digest(row)
                    signature = next(signature for candidate, _, signature, _, _ in reviewed_rows(
                        package, bindings, {}, verifier.EXPECTED_IDS, ASSETS) if candidate["id"] == row["id"])
                    with patch.dict(verifier.REVIEWED_CANDIDATES, {row["id"]: signature}):
                        result = next(x for x in verifier.verify(package, bindings) if x["id"] == row["id"])
                    self.assertFalse(result["ok"])
                    self.assertNotIn("Independent reviewed signature mismatch", result["errors"])
                    self.assertNotIn("Distractors or unique key invalid", result["errors"])
                    self.assertTrue(any("Independent" in error and "mismatch" in error for error in result["errors"]), result["errors"])

    def test_each_rebound_prompt_change_still_requires_the_separate_review(self):
        for name, verifier in BATCHES:
            for index in range(16):
                with self.subTest(batch=name, id=index+1):
                    package, bindings = load_batch(name)
                    row = package["records"][index]
                    row["prompt"] += " Ipotesi fisica modificata dopo la revisione."
                    next(x for x in bindings if x["id"] == row["id"])["candidateSha256"] = digest(row)
                    result = next(x for x in verifier.verify(package, bindings) if x["id"] == row["id"])
                    self.assertFalse(result["ok"])
                    self.assertIn("Independent reviewed signature mismatch", result["errors"])

    def test_empty_partial_and_duplicate_batches_are_rejected(self):
        for name, verifier in BATCHES:
            package, bindings = load_batch(name)
            variants = [(dict(package, records=[]), []),
                        (dict(package, records=package["records"][:-1]), bindings[:-1]),
                        (dict(package, records=package["records"][:-1]+[package["records"][0]]), bindings)]
            for number, (bad_package, bad_bindings) in enumerate(variants):
                with self.subTest(batch=name, shape=number), self.assertRaises(ValueError):
                    verifier.verify(bad_package, bad_bindings)

    def test_changed_source_identity_and_missing_figures_cannot_pass(self):
        for name, verifier in BATCHES:
            with self.subTest(batch=name):
                package, bindings = load_batch(name)
                changed = copy.deepcopy(bindings)
                changed[0]["sourceSha256"] = "0"*64
                result = next(x for x in verifier.verify(package, changed) if x["id"] == changed[0]["id"])
                self.assertFalse(result["ok"])
                expected_figured = {binding["id"] for binding in bindings if binding["assetChecksums"]}
                self.assertTrue(expected_figured)
                with tempfile.TemporaryDirectory(prefix="cric-review-missing-assets-") as scratch:
                    result = verifier.verify(package, bindings, Path(scratch))
                self.assertEqual({x["id"] for x in result if not x["ok"]}, expected_figured)

    @settings(max_examples=50, deadline=None)
    @given(st.integers(1, 50), st.integers(1, 50), st.integers(1, 20))
    def test_common_height_field_scaling_preserves_duration_and_scales_final_speed(self, height, field, scale):
        g, h, speed = freefall_speed_verifier.trajectory_model()
        original = speed.subs({g: field, h: height})
        selected = speed.subs({g: scale*field, h: scale*height})
        self.assertEqual(sp.simplify(selected-scale*original), 0)
        original_time = sp.sqrt(sp.Rational(2*height, field))
        selected_time = sp.sqrt(sp.Rational(2*scale*height, scale*field))
        self.assertEqual(selected_time, original_time)
        self.assertEqual(sp.simplify(original-field*original_time), 0)

    @settings(max_examples=50, deadline=None)
    @given(st.integers(1, 50), st.integers(1, 50), st.integers(1, 50))
    def test_circle_resultant_is_inward_and_perpendicular_to_velocity(self, radius, angular_speed, mass):
        tau = sp.Symbol("tau", real=True)
        position = sp.Matrix([radius*sp.cos(angular_speed*tau), radius*sp.sin(angular_speed*tau)])
        velocity = position.diff(tau).subs(tau, 0)
        resultant = mass*position.diff(tau, 2).subs(tau, 0)
        self.assertEqual(resultant.dot(velocity), 0)
        self.assertLess(resultant.dot(position.subs(tau, 0)), 0)
        self.assertEqual(resultant.norm(), sp.Rational(mass*(radius*angular_speed)**2, radius))


if __name__ == "__main__":
    unittest.main()
