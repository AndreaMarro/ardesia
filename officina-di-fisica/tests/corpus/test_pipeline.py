"""Offline editorial contracts; no learner database or publication authority."""
import copy
import json
from pathlib import Path
import tempfile
import unittest

from tools.corpus_engineering.pipeline import build_entry, canonical, checkpoint, digest, exact, load_checkpoint


def source(key="u1-test-01"):
    return {"id": key, "prompt": "Un quadrato di lato 2 cm.", "familyId": "area",
            "answer": {"exact": "4", "kind": "rational"}, "options": [],
            "verification": {"automaticChecks": [{"kind": "substitution",
                "expression": "x**2", "values": {"x": "2", "y": "4"}}]}}


class Pipeline(unittest.TestCase):
    def entry(self, row=None, previous=None):
        return build_entry("ardesia", row or source(), {"commit": "a" * 40,
            "path": "bank/U1.json", "fileSha256": "b" * 64}, "v1", previous)

    def test_stable_identity_does_not_follow_array_position(self):
        self.assertEqual(self.entry()["id"], "AR-u1-test-01")
        self.assertEqual(self.entry(source("u1-other-02"))["sourceId"], "u1-other-02")

    def test_same_input_has_identical_bytes_and_no_time_dependent_fields(self):
        a = self.entry()
        self.assertEqual(canonical(a), canonical(self.entry(previous=a)))

    def test_changed_source_invalidates_old_verification(self):
        old = self.entry()
        old["review"]["pedagogy"] = "PASS_AI"
        changed = source(); changed["prompt"] += " Nel vuoto."
        fresh = self.entry(changed, old)
        self.assertNotEqual(old["sourceSha256"], fresh["sourceSha256"])
        self.assertEqual(fresh["review"]["pedagogy"], "NOT_RUN")

    def test_verifier_revision_invalidates_cache(self):
        old = self.entry(); old["review"]["pedagogy"] = "PASS_AI"
        fresh = build_entry("ardesia", source(), old["provenance"], "v2", old)
        self.assertEqual(fresh["review"]["pedagogy"], "NOT_RUN")

    def test_false_source_residual_is_not_trusted(self):
        q = source(); q["verification"]["automaticChecks"][0]["values"]["y"] = "5"
        q["verification"]["automaticChecks"][0]["residual"] = "0"
        self.assertEqual(self.entry(q)["automatic"]["sourceArithmetic"]["status"], "FAIL")

    def test_parser_rejects_code_and_unbounded_work(self):
        for expr in ["__import__('os').system('true')", "x.__class__", "[1][0]", "2**100000", "unknown+1", "1e1_01"]:
            with self.subTest(expr=expr), self.assertRaises(ValueError):
                exact(expr)
        self.assertEqual(str(exact("1/3 + 1/6")), "1/2")
        self.assertNotEqual(exact("1.00000000000000001"), exact("1"))

    def test_numeric_exponents_and_explicit_rationals_are_bounded_after_binding(self):
        self.assertEqual(exact("x*2**(-z)", {"x": exact("64"), "z": exact("1")}), 32)
        self.assertEqual(exact("10*log(1000/10,10)"), 20)
        self.assertEqual(exact("Rational(3,4)*1000"), 750)
        with self.assertRaises(ValueError): exact("2**z", {"z": exact("1000")})

    def test_bounded_symbolic_derivative_for_the_stated_position_law(self):
        self.assertEqual(exact("diff(2*t**2,t,2)"), 4)
        with self.assertRaises(ValueError): exact("diff(t**100,t,100000)")

    def test_direct_answer_is_checked_against_recomputed_result(self):
        q = source(); q["answer"]["exact"] = "7"
        self.assertEqual(self.entry(q)["automatic"]["sourceArithmetic"]["status"], "FAIL")

    def test_checkpoint_is_immutable_bounded_and_repeatable(self):
        with tempfile.TemporaryDirectory() as home:
            entries = [self.entry(source(f"u1-test-{i:03}")) for i in range(205)]
            one = checkpoint(Path(home), entries, [], {"schemaVersion": "1.0.0"})
            two = checkpoint(Path(home), entries, [], {"schemaVersion": "1.0.0"})
            self.assertEqual(one, two)
            index = json.loads((Path(home) / "checkpoint.json").read_text())
            shards = list((Path(home) / index["generation"]).glob("questions-*.json"))
            self.assertEqual(sorted(len(json.loads(p.read_text())) for p in shards), [5, 100, 100])
            self.assertEqual(index["questionCount"], 205)
            for p in shards:
                self.assertNotIn('"answer"', p.read_text())

    def test_cric_identity_and_exam_confidentiality(self):
        q = {"id": "C6-Q014", "kind": "question", "exam": 1, "answer": {"value": "segreto"}}
        row = build_entry("cric", q, {}, "v1")
        self.assertEqual(row["id"], q["id"])
        self.assertEqual(row["visibility"], "protected_exam")
        self.assertNotIn("segreto", canonical(row))

    def test_corrupt_cached_review_cannot_be_resealed(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            result = checkpoint(root, [self.entry()], [], {"schemaVersion": "1.0.0"})
            self.assertEqual(len(load_checkpoint(root)[0]), 1)
            shard = root/result["generation"]/"questions-001.json"
            rows = json.loads(shard.read_text())
            rows[0]["review"]["pedagogy"] = "PASS_AI"
            shard.write_text(canonical(rows))
            with self.assertRaises(ValueError): load_checkpoint(root)


if __name__ == "__main__":
    unittest.main()
