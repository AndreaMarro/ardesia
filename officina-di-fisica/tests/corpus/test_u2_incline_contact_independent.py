"""Independent reviewer checks; never import either candidate's authoring module."""
import ast
import importlib
import json
from pathlib import Path
import unittest

from tools.corpus_engineering.pipeline import digest, sha

APP=Path(__file__).resolve().parents[2]


class IndependentInclineContact(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.families=[]
        for name in ("incline_acceleration","incline_normal","kinetic_friction"):
            module=importlib.import_module("tools.corpus_engineering."+name+"_verifier")
            package=json.loads((APP/"editorial/batches"/(module.BATCH+".json")).read_text())
            bindings=json.loads((APP/"editorial/batches"/(module.BATCH+"-bindings.json")).read_text())
            cls.families.append((module,package,bindings))

    def test_complete_individually_reviewed_editions_and_reproducible_metadata(self):
        for module,package,bindings in self.families:
            with self.subTest(batch=module.BATCH):
                report=module.report(package,bindings)
                self.assertEqual(len(report["records"]),16)
                self.assertEqual({r["id"] for r in report["records"]},module.EXPECTED_IDS)
                self.assertTrue(all(r["ok"] for r in report["records"]))
                self.assertEqual(report["packageSha256"],module.REVIEWED_PACKAGE_SHA256)
                self.assertEqual(report["bindingsSha256"],module.REVIEWED_BINDINGS_SHA256)
                self.assertEqual(report["contractSha256"],sha(Path(module.__file__).with_name("review_contract.py").read_bytes()))
                self.assertEqual(report["verifierSha256"],sha(Path(module.__file__).read_bytes()))
                self.assertEqual(len(report["reviewedCandidateCommit"]),40)
                self.assertEqual(report["publication"],"DRAFT")
                self.assertEqual(report["humanApproval"],"NOT_RUN")
                for row in report["records"]:
                    self.assertTrue(row["manualArithmetic"] and row["distractors"] and row["physicalAssumptions"])
                    self.assertEqual(row["humanApproval"],"NOT_RUN")

    def test_rebound_keys_units_provenance_and_svg_scale_cannot_replace_review(self):
        for module,package,bindings in self.families:
            with self.subTest(batch=module.BATCH):
                before=(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256)
                audit=module.mutation_audit(package,bindings,APP/"editorial/assets")
                self.assertEqual(audit["caseCount"],25)
                self.assertTrue(audit["allRejected"])
                self.assertEqual(sum(c["case"]=="wrong_key_rebound_and_all_edition_tokens_replaced" for c in audit["cases"]),16)
                self.assertIn("wrong_SVG_force_length_all_hashes_bindings_and_tokens_replaced",{c["case"] for c in audit["cases"]})
                self.assertIn("false_source_shard_provenance_rehashed_and_retokenized",{c["case"] for c in audit["cases"]})
                self.assertEqual(before,(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256))
                self.assertTrue(all(r["ok"] for r in module.verify(package,bindings)))

    def test_oracles_keep_distinct_means_calibrations_and_physical_branches(self):
        a,n,f=(family[0].oracle() for family in self.families)
        # Pre-key manual results: output averaging is distinct from averaging
        # inputs in these bilinear models, and display offsets are removed.
        self.assertEqual(str(a[11]),"17/2")
        self.assertEqual(str(n[11]),"21")
        self.assertEqual(str(f[11]),"3/2")
        self.assertEqual([str(x[14]) for x in (a,n,f)],["20","4","1"])
        self.assertEqual([str(x[15]) for x in (a,n,f)],["1/2","1/2","4"])
        self.assertEqual(str(n[6]),"8/5")
        self.assertEqual(str(f[12]),"1/4")
        self.assertEqual(str(f[13]),"1")  # coefficient1 is physically allowed

    def test_independent_modules_have_no_authoring_import(self):
        for module,_,_ in self.families:
            tree=ast.parse(Path(module.__file__).read_text())
            for node in ast.walk(tree):
                if isinstance(node,ast.ImportFrom):
                    self.assertNotIn("authoring",node.module or "")
                elif isinstance(node,ast.Import):
                    self.assertTrue(all("authoring" not in alias.name for alias in node.names))


if __name__=="__main__":unittest.main()
