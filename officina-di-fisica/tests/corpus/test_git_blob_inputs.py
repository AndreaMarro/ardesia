"""A clean checkout recovers the exact historical models, without retagging."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

from tools.corpus_engineering.git_provenance import declared_blob_inputs, fixture_commit_refs, ensure_commits, verify_declared_blobs


def declare(root, ref, source_path='model.py', raw=b'original model\n'):
    (root / 'model-frozen.py.txt').write_bytes(raw)
    value = {'schemaVersion': '1.0.0', 'inputs': [{'commit': ref, 'path': source_path,
             'snapshot': 'model-frozen.py.txt', 'sha256': hashlib.sha256(raw).hexdigest()}]}
    (root / 'git-inputs.json').write_text(json.dumps(value))
    return value


class GitBlobInputs(unittest.TestCase):
    def test_model_only_input_is_discovered_without_inventing_a_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            declare(root, 'a' * 40)
            self.assertEqual(fixture_commit_refs(root), ['a' * 40])
            self.assertEqual(len(declared_blob_inputs(root)), 1)

    def test_mutable_refs_paths_and_changed_snapshots_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for field, value in [('commit', 'main'), ('path', '../model.py'),
                                 ('path', '/model.py'), ('path', 'model.py:other'),
                                 ('snapshot', '../outside'), ('sha256', 'b' * 64)]:
                with self.subTest(field=field, value=value):
                    data = declare(root, 'a' * 40)
                    data['inputs'][0][field] = value
                    (root / 'git-inputs.json').write_text(json.dumps(data))
                    with self.assertRaises(ValueError):
                        declared_blob_inputs(root)

    def test_real_fetch_checks_blob_content_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            origin, consumer, frozen = root / 'origin', root / 'consumer', root / 'frozen'
            frozen.mkdir()
            for repo in [origin, consumer]:
                subprocess.run(['git', 'init', '-q', str(repo)], check=True)
            raw = b'original model\n'
            (origin / 'model.py').write_bytes(raw)
            subprocess.run(['git', 'add', 'model.py'], cwd=origin, check=True)
            subprocess.run(['git', '-c', 'commit.gpgsign=false', '-c', 'user.name=Fixture',
                            '-c', 'user.email=fixture@example.invalid', 'commit', '-q', '-m', 'model'], cwd=origin, check=True)
            ref = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=origin, text=True).strip()
            subprocess.run(['git', 'remote', 'add', 'origin', str(origin)], cwd=consumer, check=True)
            declare(frozen, ref)
            inputs = declared_blob_inputs(frozen)
            self.assertEqual(ensure_commits(consumer, fixture_commit_refs(frozen), 1)['fetchedCommits'], 1)
            self.assertEqual(verify_declared_blobs(consumer, inputs)['verifiedBlobInputs'], 1)
            self.assertEqual(ensure_commits(consumer, fixture_commit_refs(frozen), 1)['fetchedCommits'], 0)
            declare(frozen, ref, raw=b'rebound model\n')
            with self.assertRaises(ValueError):
                verify_declared_blobs(consumer, declared_blob_inputs(frozen))
