"""Preserve source identity, precise answers, unknown metadata and ownership."""
from copy import deepcopy
import contextlib
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

from question_inbox_adapter import from_question_bank, inspect_delivery, to_source_record


class QuestionInboxAdapterTests(unittest.TestCase):
    def setUp(self):
        self.record = {"bankId": "physics-semestre-2026", "id": "synthetic-u1",
                       "version": 3, "schemaVersion": "1.0.0", "status": "DRAFT",
                       "answer": {"exact": "1/3", "unit": "m/s", "accepted": ["1/3"]},
                       "solution": "Spiegazione completa " * 500,
                       "taxonomy": {"microarea": "Vettori"},
                       "futureField": {"nested": ["α", {"units": "m·s⁻²"}]}}
        self.source = {"bankId": "physics-semestre-2026", "bankVersion": 1,
                       "repositoryCommit": "synthetic-pin"}

    def test_roundtrip_keeps_long_explanation_exact_fraction_and_unknown_fields(self):
        original = deepcopy(self.record)
        envelope = from_question_bank(self.record, self.source)
        self.assertEqual(to_source_record(envelope), original)
        self.assertEqual(envelope["identity"]["questionRevision"], 3)
        self.assertEqual(envelope["state"], "QUESTION_INBOX")
        self.assertFalse(envelope["publicationEligible"])

    def test_source_and_consumer_cannot_mutate_the_snapshot(self):
        envelope = from_question_bank(self.record, self.source)
        self.record["answer"]["exact"] = "9"
        self.source["bankVersion"] = 9
        restored = to_source_record(envelope)
        restored["answer"]["exact"] = "99"
        self.assertEqual(to_source_record(envelope)["answer"]["exact"], "1/3")
        self.assertEqual(envelope["source"]["bankVersion"], 1)

    def test_altered_content_or_revision_is_rejected(self):
        for kind in ("content", "identity"):
            with self.subTest(kind=kind):
                envelope = from_question_bank(self.record, self.source)
                if kind == "content":
                    envelope["sourceRecord"]["answer"]["exact"] = "7"
                else:
                    envelope["identity"]["questionRevision"] = 2
                with self.assertRaises(ValueError):
                    to_source_record(envelope)

    def test_cross_bank_identity_is_rejected(self):
        with self.assertRaises(ValueError):
            from_question_bank(self.record, {"bankId": "other-bank"})

    def test_intake_rejects_coherent_uncommitted_manifest_and_shard(self):
        # This fixture reproduced a provenance failure during independent review:
        # valid shard hashes alone do not prove the claimed Git commit.
        with tempfile.TemporaryDirectory(prefix="ardesia-synthetic-pin-") as tmp:
            root = Path(tmp)
            base = root / "packages/engine/lessonos/study/content/physics-semestre-2026-bank"
            base.mkdir(parents=True)
            question = deepcopy(self.record)
            question["difficulty"] = {"level": "base"}

            def write_snapshot():
                raw = json.dumps([question]).encode()
                (base / "questions.json").write_bytes(raw)
                manifest = {"id": question["bankId"], "version": 1,
                            "schemaVersion": "1.0.0", "questionCount": 1,
                            "shards": [{"path": "questions.json", "count": 1,
                                        "sha256": hashlib.sha256(raw).hexdigest()}]}
                (base / "manifest.json").write_text(json.dumps(manifest))

            def git(*args):
                subprocess.run(["git", "-C", str(root), *args], check=True,
                               stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

            write_snapshot()
            git("init", "-q")
            git("add", ".")
            git("-c", "user.name=Synthetic Probe", "-c", "user.email=probe@example.invalid",
                "commit", "-q", "-m", "Synthetic fixture")
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(inspect_delivery(root, root / "clean-receipt.json"), 0)
            question["solution"] = "Coherent but uncommitted replacement"
            write_snapshot()
            with self.assertRaisesRegex(ValueError, "do not match source commit"):
                inspect_delivery(root, root / "dirty-receipt.json")
            self.assertFalse((root / "dirty-receipt.json").exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
