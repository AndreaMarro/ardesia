import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
import unittest
from tools.corpus_engineering.git_provenance import declared_blob_inputs, fixture_commit_refs, ensure_commits


def fixture(root, name, ref):
    directory = root / name
    directory.mkdir()
    files = {}
    for name, data in [("package.json", b'{"schema":"astra/1"}'), ("bindings.json", b'[]')]:
        (directory / name).write_bytes(data)
        files[name] = hashlib.sha256(data).hexdigest()
    (directory / "manifest.json").write_text(json.dumps({"sourceCandidateCommit": ref, "files": files}))


class GitProvenance(unittest.TestCase):
    def test_fixture_discovery_deduplicates_and_ignores_informational_metadata(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root, "one", "a" * 40)
            fixture(root, "two", "a" * 40)
            (root / "manifest.json").write_text('{"candidateLabel":"007219e"}')
            self.assertEqual(fixture_commit_refs(root), ["a" * 40])

    def test_mutable_refs_and_changed_or_missing_fixture_bytes_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root, "one", "main")
            with self.assertRaises(ValueError):
                fixture_commit_refs(root)
            p = root / "one/manifest.json"
            manifest = json.loads(p.read_text())
            manifest["sourceCandidateCommit"] = "a" * 40
            p.write_text(json.dumps(manifest))
            (root / "one/package.json").write_bytes(b'{"tampered":true}')
            with self.assertRaises(ValueError):
                fixture_commit_refs(root)
            (root / "one/package.json").unlink()
            with self.assertRaises(FileNotFoundError):
                fixture_commit_refs(root)

    def test_runtime_observation_needs_a_commit_but_has_no_draft_package(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root, "draft", "a" * 40)
            receipt = root / "manifest.json"
            data = {"schemaVersion": "1.0.0", "runtimeSha256": "b" * 64,
                    "sourceCandidateCommit": "c" * 40, "files": {"process.log": "d" * 64}}
            receipt.write_text(json.dumps(data))
            self.assertEqual(fixture_commit_refs(root), ["a" * 40, "c" * 40])

            data["files"]["package.json"] = "e" * 64
            receipt.write_text(json.dumps(data))
            with self.assertRaises(FileNotFoundError):
                fixture_commit_refs(root)

    def test_runtime_blob_manifest_may_describe_its_scope(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            raw = b'known specimen\n'
            (root / 'source.txt').write_bytes(raw)
            pin = hashlib.sha256(raw).hexdigest()
            manifest = root / 'git-inputs.json'
            item = {'commit': 'a' * 40, 'path': 'officina-di-fisica/source.txt', 'snapshot': 'source.txt', 'sha256': pin}
            manifest.write_text(json.dumps({'schemaVersion': '1.0.0', 'scope': 'Runtime observation', 'inputs': [item]}))
            self.assertEqual(declared_blob_inputs(root), [{name: item[name] for name in ('commit', 'path', 'sha256')}])
            (root / 'source.txt').write_bytes(b'different bytes\n')
            with self.assertRaises(ValueError):
                declared_blob_inputs(root)

    def test_real_missing_object_fetch_and_second_execution_are_idempotent(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            origin, consumer = root / "origin", root / "consumer"
            for repo in [origin, consumer]:
                subprocess.run(["git", "init", "-q", str(repo)], check=True)
            subprocess.run(["git", "-c", "commit.gpgsign=false", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                            "commit", "-q", "--allow-empty", "-m", "immutable fixture"], cwd=origin, check=True)
            ref = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=origin, text=True).strip()
            subprocess.run(["git", "remote", "add", "origin", str(origin)], cwd=consumer, check=True)
            self.assertEqual(ensure_commits(consumer, [ref], 1)["fetchedCommits"], 1)
            self.assertEqual(ensure_commits(consumer, [ref], 1)["fetchedCommits"], 0)
            for bad in ["--upload-pack=bad", "main"]:
                with self.assertRaises(ValueError):
                    ensure_commits(consumer, [bad])
