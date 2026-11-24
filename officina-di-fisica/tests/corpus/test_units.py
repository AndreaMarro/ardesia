from copy import deepcopy
import json
from pathlib import Path
import unittest

from hypothesis import given, settings, strategies as st

from tools.corpus_engineering.units_authoring import assemble
from tools.corpus_engineering.units_verifier import verify, count_units
from tools.corpus_engineering.pipeline import digest

APP = Path(__file__).resolve().parents[2]
SOURCE = "5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"


class Units(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package, cls.bindings = assemble(APP.parent, SOURCE)

    def test_all_32_tasks_have_individual_independent_evidence(self):
        report = verify(self.package, self.bindings)
        self.assertEqual(len(report), 32)
        self.assertTrue(all(r["ok"] for r in report))
        self.assertTrue(all(r["humanApproval"] == "NOT_RUN" for r in report))

    def test_changed_answer_and_distractor_are_detected(self):
        for index in (0, 7, 14, 16, 23, 31):
            package = deepcopy(self.package)
            package["records"][index]["answer"]["value"] = "errore"
            self.assertFalse(verify(package, self.bindings)[index]["ok"])
        package = deepcopy(self.package)
        r = package["records"][2]
        r["answer"]["options"][0] = r["answer"]["value"]
        self.assertFalse(verify(package, self.bindings)[2]["ok"])

    def test_modified_prompt_invalidates_the_reviewed_candidate(self):
        package = deepcopy(self.package)
        package["records"][0]["prompt"] = "La lunghezza raddoppia: quanto vale il volume?"
        self.assertFalse(verify(package, self.bindings)[0]["ok"])

    def test_rebinding_changed_content_does_not_replace_independent_review(self):
        package = deepcopy(self.package)
        bindings = deepcopy(self.bindings)
        package["records"][0]["prompt"] += " Il rapporto lineare diventa invece tre."
        bindings[0]["candidateSha256"] = digest(package["records"][0])
        self.assertFalse(verify(package, bindings)[0]["ok"])

    def test_empty_partial_or_duplicate_batch_is_rejected(self):
        for records in ([], self.package["records"][:1], self.package["records"]+[self.package["records"][0]]):
            with self.subTest(count=len(records)), self.assertRaises(ValueError):
                verify({"records": records}, self.bindings)

    def test_missing_scientific_asset_invalidates_review(self):
        import tempfile
        with tempfile.TemporaryDirectory() as home:
            report = verify(self.package, self.bindings, asset_root=Path(home))
        self.assertFalse(report[0]["ok"])

    def test_rebound_source_provenance_does_not_inherit_review(self):
        bindings = deepcopy(self.bindings)
        bindings[0]["sourceSha256"] = "0"*64
        bindings[0]["sourceRef"] = "f"*40
        bindings[0]["sourceId"] = "invented-source"
        self.assertFalse(verify(self.package, bindings)[0]["ok"])

    @settings(max_examples=80, derandomize=True)
    @given(st.integers(1, 9), st.integers(1, 7), st.sampled_from([2, 3]))
    def test_counting_cells_agrees_with_conversion_and_inverse(self, n, c, dimension):
        expected = n * c ** dimension
        self.assertEqual(count_units(n, c, dimension), expected)
        self.assertEqual(expected // c ** dimension, n)


if __name__ == "__main__": unittest.main()
