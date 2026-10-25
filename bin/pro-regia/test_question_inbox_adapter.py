"""Preserve source identity, precise answers, unknown metadata and ownership."""
from copy import deepcopy
import contextlib
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
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

    def committed_fixture(self):
        temp = tempfile.TemporaryDirectory(prefix="ardesia-intake-qa-")
        self.addCleanup(temp.cleanup)
        root = Path(temp.name).resolve()
        base = root / "packages/engine/lessonos/study/content/physics-semestre-2026-bank"
        base.mkdir(parents=True)
        question = deepcopy(self.record)
        question["difficulty"] = {"level": "base"}
        raw = json.dumps([question], ensure_ascii=False).encode()
        (base / "questions.json").write_bytes(raw)
        manifest = {"id": question["bankId"], "version": 1,
                    "schemaVersion": "1.0.0", "questionCount": 1,
                    "shards": [{"path": "questions.json", "count": 1,
                                "sha256": hashlib.sha256(raw).hexdigest()}]}
        (base / "manifest.json").write_text(json.dumps(manifest))

        def git(*args):
            return subprocess.check_output(["git", "-C", str(root), *args],
                                           stderr=subprocess.PIPE).decode().strip()

        git("init", "-q")
        git("add", ".")
        git("-c", "user.name=Synthetic Probe", "-c", "user.email=probe@example.invalid",
            "commit", "-q", "-m", "Synthetic QA bank")
        commit = git("rev-parse", "HEAD")
        return root, base, manifest, commit, git

    def test_explicit_ref_reads_committed_blobs_even_when_worktree_is_dirty(self):
        root, base, manifest, commit, git = self.committed_fixture()
        expected_manifest = hashlib.sha256((base / "manifest.json").read_bytes()).hexdigest()
        (base / "questions.json").write_text("uncommitted replacement, not JSON")
        (base / "manifest.json").write_text("uncommitted manifest replacement")
        output = root / "receipt.json"
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(inspect_delivery(root, output, ref=commit,
                                             expected_manifest_sha256=expected_manifest), 0)
        receipt = json.loads(output.read_text())
        self.assertEqual(receipt["sourceCommit"], commit)
        self.assertEqual(receipt["manifestSHA256"], expected_manifest)
        self.assertEqual(receipt["sourceReadMode"], "GIT_COMMITTED_BLOBS")
        self.assertEqual(receipt["receivedRecords"], 1)
        self.assertEqual(receipt["losslessRoundTrips"], 1)
        self.assertEqual(receipt["publications"], 0)
        self.assertEqual(receipt["runtimeCompatibility"]["status"], "NOT_CHECKED")
        self.assertNotIn("examV1Compatibility", receipt)

    def test_stale_manifest_pin_is_rejected_without_writing_a_receipt(self):
        root, base, manifest, commit, git = self.committed_fixture()
        output = root / "receipt.json"
        for pin in ("0" * 64, "invalid-digest"):
            with self.subTest(pin=pin), self.assertRaises(ValueError):
                inspect_delivery(root, output, ref=commit, expected_manifest_sha256=pin)
            self.assertFalse(output.exists())

    def test_invalid_or_noncommit_ref_does_not_fall_back_to_head(self):
        root, base, manifest, commit, git = self.committed_fixture()
        blob = git("rev-parse", commit + ":" + (base / "manifest.json").relative_to(root).as_posix())
        output = root / "receipt.json"
        for ref in ("missing-synthetic-ref", blob, "--all", ""):
            with self.subTest(ref=ref), self.assertRaises(ValueError):
                inspect_delivery(root, output, ref=ref)
            self.assertFalse(output.exists())

    def test_committed_shard_tampering_is_rejected(self):
        root, base, manifest, commit, git = self.committed_fixture()
        (base / "questions.json").write_text("[]")
        git("add", ".")
        git("-c", "user.name=Synthetic Probe", "-c", "user.email=probe@example.invalid",
            "commit", "-q", "-m", "Synthetic stale shard pin")
        output = root / "receipt.json"
        with self.assertRaisesRegex(ValueError, "Shard checksum mismatch"):
            inspect_delivery(root, output, ref=git("rev-parse", "HEAD"))
        self.assertFalse(output.exists())

    def test_committed_shard_cannot_escape_the_bank(self):
        root, base, manifest, commit, git = self.committed_fixture()
        manifest["shards"][0]["path"] = "../outside.json"
        (base / "manifest.json").write_text(json.dumps(manifest))
        git("add", ".")
        git("-c", "user.name=Synthetic Probe", "-c", "user.email=probe@example.invalid",
            "commit", "-q", "-m", "Synthetic invalid path")
        output = root / "receipt.json"
        with self.assertRaisesRegex(ValueError, "Shard escapes the bank"):
            inspect_delivery(root, output, ref=git("rev-parse", "HEAD"))
        self.assertFalse(output.exists())

    def test_cli_requires_an_explicit_ref(self):
        root, base, manifest, commit, git = self.committed_fixture()
        output = root / "receipt.json"
        result = subprocess.run([sys.executable, str(Path(__file__).with_name("question_inbox_adapter.py")),
                                 "--repo", str(root), "--output", str(output)],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn("--ref", result.stderr)
        self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
