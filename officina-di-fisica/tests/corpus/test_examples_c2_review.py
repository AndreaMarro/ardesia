"""Independent finite-stroke counterexample and additive-edition review guards.

The revised example has no answer field: changed prose/formulas require renewed
independent reading, not a claim of a general natural-language physics solver.
"""
import copy
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import sympy as sp

from tools.corpus_engineering import examples_c2b_activity_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, digest, sha
from tools.corpus_engineering.review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]


class C2SeparateReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        original = subprocess.check_output(["git", "show", verifier.SOURCE_REF+":"+verifier.SOURCE_PATH], cwd=APP)
        if sha(original) != verifier.SOURCE_FILE_SHA256:
            raise AssertionError("Unexpected original source file")
        cls.sources = {row["id"]: row for row in json.loads(original)}
        cls.package = json.loads((APP/"editorial/batches/examples-c2-revisions-035.json").read_text())
        cls.bindings = json.loads((APP/"editorial/batches/examples-c2-revisions-035-bindings.json").read_text())

    def inputs(self):
        return copy.deepcopy(self.sources), copy.deepcopy(self.package), copy.deepcopy(self.bindings)

    def renewed_signature(self, package, bindings):
        return reviewed_rows(package, bindings, {}, verifier.REVISION_IDS, APP/"editorial/assets")[0][2]

    def test_originals_preserve_seven_valid_and_one_failed_edition(self):
        report = verifier.report(self.sources)
        self.assertEqual((report["acceptedCount"], report["failedCount"]), (7, 1))
        failed = [row for row in report["records"] if not row["ok"]]
        self.assertEqual([row["id"] for row in failed], ["C2-E005"])
        self.assertTrue(failed[0]["failedPublishedEdition"])
        self.assertTrue(any(not check["ok"] for check in failed[0]["checks"]))
        self.assertEqual(failed[0]["manualFeasibility"], "FAIL_ORIGINAL_EDITION")
        self.assertTrue(all(row["publicationAction"] == "NONE" and row["humanApproval"] == "NOT_RUN" for row in report["records"]))

    def test_counterexample_balances_fluid_energy_exactly(self):
        counter = verifier.finite_stroke_counterexample()
        self.assertEqual(sp.Rational(counter["finalOutputForceN"]), sp.Rational(2361, 5))
        self.assertEqual(sp.Rational(counter["outputWorkJ"]), sp.Rational(4761, 1000))
        self.assertEqual(sp.Rational(counter["fluidPotentialEnergyChangeJ"]), sp.Rational(39, 1000))
        self.assertEqual(sp.Rational(counter["inputWorkJ"])-sp.Rational(counter["outputWorkJ"]), sp.Rational(counter["fluidPotentialEnergyChangeJ"]))
        self.assertGreater(sp.Rational(counter["initialOutputForceN"]), sp.Rational(counter["finalOutputForceN"]))

    def test_new_model_is_a_separate_draft_with_failed_historical_judgment(self):
        original = verifier.report(self.sources)
        report = verifier.report(self.sources, self.package, self.bindings)
        self.assertEqual(canonical(report), canonical(verifier.report(self.sources, self.package, self.bindings)))
        self.assertEqual((report["acceptedCount"], report["failedCount"], report["draftReviewedCount"]), (8, 0, 1))
        old = next(row for row in original["records"] if row["id"] == "C2-E005")
        new = next(row for row in report["records"] if row["id"] == "C2-E005")
        self.assertEqual(new["publishedEditionReview"], old)
        self.assertFalse(new["publishedEditionReview"]["ok"])
        self.assertEqual((new["sourceVersion"], new["baseVersion"], new["candidateVersion"]), (1, 1, 2))
        self.assertEqual((new["publicationAction"], new["humanApproval"], new["verificationMode"]), ("DRAFT", "NOT_RUN", "EXACT_ORACLE"))
        self.assertTrue(new["failedPublishedEdition"] and new["originalEditionRetained"])
        self.assertTrue(all(check["ok"] for check in new["checks"]))
        self.assertNotIn("answer", self.package["records"][0])
        self.assertEqual({r["id"] for r in report["records"] if r["publicationAction"] == "NONE"}, set(verifier.READ_SOURCE_SHA256)-{"C2-E005"})

    def test_each_changed_source_is_detected_even_when_original_already_fails(self):
        for key in verifier.READ_SOURCE_SHA256:
            with self.subTest(id=key):
                sources = copy.deepcopy(self.sources)
                sources[key]["prompt"] += " changed after reading"
                record = next(row for row in verifier.verify_originals(sources) if row["id"] == key)
                self.assertFalse(record["ok"])
                self.assertIn("Source differs from independently read edition", record["errors"])

    def test_changed_revision_formula_and_rebinding_require_new_reading(self):
        sources, package, bindings = self.inputs()
        formula = next(b for b in package["records"][0]["blocks"] if b["type"] == "formula")
        formula["text"] = "F_2=999\\,\\mathrm N"
        bindings[0]["candidateSha256"] = digest(package["records"][0])
        record = next(row for row in verifier.verify(sources, package, bindings) if row["id"] == "C2-E005")
        self.assertFalse(record["ok"])
        self.assertIn("Independent reviewed signature mismatch", record["errors"])

    def test_wrong_version_or_source_fails_even_with_a_simulated_new_token(self):
        for field, value in [("baseVersion", 0), ("version", 3)]:
            with self.subTest(field=field):
                sources, package, bindings = self.inputs()
                package["records"][0][field] = value
                bindings[0]["candidateSha256"] = digest(package["records"][0])
                token = self.renewed_signature(package, bindings)
                with patch.dict(verifier.REVIEWED_REVISIONS, {"C2-E005": token}):
                    record = next(row for row in verifier.verify(sources, package, bindings) if row["id"] == "C2-E005")
                self.assertFalse(record["ok"])
                self.assertIn("Expected additive next example edition with correct base version", record["errors"])
        sources, package, bindings = self.inputs()
        bindings[0]["sourceSha256"] = "0"*64
        token = self.renewed_signature(package, bindings)
        with patch.dict(verifier.REVIEWED_REVISIONS, {"C2-E005": token}):
            record = next(row for row in verifier.verify(sources, package, bindings) if row["id"] == "C2-E005")
        self.assertFalse(record["ok"])
        self.assertIn("Revision not bound to the independently read original", record["errors"])

    def test_missing_new_or_retained_historical_figure_blocks_draft_acceptance(self):
        with tempfile.TemporaryDirectory(prefix="cric-c2-missing-assets-") as scratch:
            for kwargs, message in [({"asset_root": Path(scratch)}, "Reviewed asset changed or missing"),
                                    ({"original_asset_root": Path(scratch)}, "Retained historical scientific figure changed or missing")]:
                with self.subTest(scope=message):
                    record = next(row for row in verifier.verify(self.sources, self.package, self.bindings, **kwargs) if row["id"] == "C2-E005")
                    self.assertFalse(record["ok"])
                    self.assertIn(message, record["errors"])

    def test_revision_package_identity_is_exact_and_complete(self):
        for records, bindings in [([], []), (self.package["records"]*2, self.bindings*2)]:
            with self.subTest(count=len(records)), self.assertRaises(ValueError):
                verifier.verify(self.sources, dict(self.package, records=records), bindings)
        with self.assertRaises(ValueError):
            verifier.verify(self.sources, bindings=self.bindings)


if __name__ == "__main__":
    unittest.main()
