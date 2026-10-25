import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


build = module('release_candidate_builder', 'bin/build_teaching_candidate.py')
release = module('release_candidate_check', 'bin/web/check_teaching_candidate.py')


class ReleaseCheckTests(unittest.TestCase):
    def fixture(self, root):
        for name in ('marketing', 'experience'):
            (root / name).mkdir()
            (root / name / 'index.html').write_text('<!doctype html><title>Fixture</title>')
        (root / 'marketing/robots.txt').write_text('User-agent: *\nDisallow: /\n')
        (root / 'marketing/source-manifest.json').write_text(json.dumps({'examples': [{'id': 'draft', 'editorialStatus': 'DRAFT', 'contentSHA256': 'c' * 64}]}))
        output = root / 'candidate'
        empty_sha = hashlib.sha256(b'').hexdigest()
        build.assemble(output, root / 'marketing', root / 'experience', source={
            'commit': 'b' * 40, 'sourceTreeSha256': empty_sha,
            'trackedDiffSha256': empty_sha, 'sourceFileCount': 0})
        (output / 'source-manifest.json').write_text(json.dumps({'sha256': empty_sha, 'files': {}}))
        return output

    def update_asset_digest(self, candidate, name):
        path = candidate / 'candidate-manifest.json'
        data = json.loads(path.read_text())
        data['assetsSha256'][name] = hashlib.sha256((candidate / name).read_bytes()).hexdigest()
        path.write_text(json.dumps(data))

    def test_technical_pass_cannot_be_misrepresented_as_human_approval(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = release.check(self.fixture(Path(tmp)))
            self.assertEqual(result['technicalStatus'], 'PASS')
            self.assertEqual(result['releaseStatus'], 'BLOCKED')
            self.assertEqual(result['humanReview']['status'], 'PENDING')
            self.assertIsNone(result['humanReview']['scientificReviewer'])
            self.assertEqual(result['humanReview']['draftExamples'][0]['id'], 'draft')
            self.assertEqual(result['privateBeta'], 'NOT_CERTIFIED_REMOTE')

    def test_modified_and_unlisted_files_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = self.fixture(Path(tmp))
            (candidate / 'public/index.html').write_text('altered after review')
            (candidate / 'public/extra.txt').write_text('unreviewed')
            result = release.check(candidate)
            self.assertIn('asset_inventory_mismatch', result['errors'])
            self.assertIn('asset_digest_mismatch:public/index.html', result['errors'])

    def test_recomputed_manifest_does_not_legitimize_private_data_or_routes(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = self.fixture(Path(tmp))
            (candidate / 'public/study').mkdir()
            for name, data in [('public/study/private.bin', b'SQLite format 3\x00'), ('public/demo-access.json', b'{}')]:
                (candidate / name).write_bytes(data)
                self.update_asset_digest(candidate, name)
            errors = release.check(candidate)['errors']
            self.assertIn('private_route_in_public:public/study/private.bin', errors)
            self.assertIn('database_bytes:public/study/private.bin', errors)
            self.assertIn('private_file:public/demo-access.json', errors)

    def test_credential_tripwire_reports_only_pattern_name(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = self.fixture(Path(tmp))
            token = 'gh' + 'p_' + 'z' * 40
            (candidate / 'public/config.json').write_text(json.dumps({'token': token}))
            self.update_asset_digest(candidate, 'public/config.json')
            result = release.check(candidate)
            self.assertIn('credential_pattern:public/config.json:github-token', result['errors'])
            self.assertNotIn(token, json.dumps(result))

    def test_external_and_missing_resources_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = self.fixture(Path(tmp))
            (candidate / 'public/index.html').write_text('<script src="https://example.org/code.js"></script><img src="/gone.png">')
            self.update_asset_digest(candidate, 'public/index.html')
            result = release.check(candidate)
            self.assertIn('external_resource:public/index.html', result['errors'])
            self.assertIn('missing_resource:public/index.html:/gone.png', result['errors'])

    def test_source_version_policy_and_indexing_changes_invalidate_packet(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = self.fixture(Path(tmp))
            data = json.loads((candidate / 'candidate-manifest.json').read_text())
            data['source']['trackedDiffSha256'] = 'c' * 64
            data['source']['sourceTreeSha256'] = 'c' * 64
            (candidate / 'candidate-manifest.json').write_text(json.dumps(data))
            (candidate / 'public/_headers').write_text('/*\n Content-Security-Policy: media-src *\n')
            (candidate / 'public/robots.txt').write_text('User-agent: *\nAllow: /\n')
            self.update_asset_digest(candidate, 'public/_headers')
            self.update_asset_digest(candidate, 'public/robots.txt')
            errors = release.check(candidate)['errors']
            for expected in ['committed_product_required', 'source_inventory_mismatch', 'composed_host_policy_mismatch', 'preview_must_remain_noindex']:
                self.assertIn(expected, errors)

    def test_unsafe_and_linked_asset_cannot_escape_the_artifact(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            candidate = self.fixture(root)
            (root / 'outside.txt').write_text('outside fixture')
            (candidate / 'public/link').symlink_to(root, target_is_directory=True)
            manifest = json.loads((candidate / 'candidate-manifest.json').read_text())
            manifest['assetsSha256']['public/link/outside.txt'] = hashlib.sha256(b'outside fixture').hexdigest()
            manifest['assetsSha256']['../outside.txt'] = hashlib.sha256(b'outside fixture').hexdigest()
            (candidate / 'candidate-manifest.json').write_text(json.dumps(manifest))
            result = release.check(candidate)
            self.assertIn('unsafe_asset_path', result['errors'])
            self.assertIn('linked_asset:public/link', result['errors'])
            self.assertIn('linked_asset:public/link/outside.txt', result['errors'])


class VercelPreviewPreparationTests(unittest.TestCase):
    fixture = ReleaseCheckTests.fixture
    update_asset_digest = ReleaseCheckTests.update_asset_digest

    def test_preparation_rejects_a_manifest_changed_after_verification(self):
        import sys
        from unittest.mock import patch
        sys.path.insert(0, str(ROOT / 'bin/web'))
        import prepare_vercel_preview
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            candidate = self.fixture(root)
            (candidate / 'public/404.html').write_text('<title>Not found</title>')
            self.update_asset_digest(candidate, 'public/404.html')
            checked = prepare_vercel_preview.check
            def change_after_check(path):
                result = checked(path)
                (path / 'public/study').mkdir()
                (path / 'public/study/private.sqlite').write_bytes(b'SQLite format 3\x00')
                self.update_asset_digest(path, 'public/study/private.sqlite')
                return result
            with patch.object(prepare_vercel_preview, 'check', change_after_check):
                with self.assertRaisesRegex(ValueError, 'changed_after_verification'):
                    prepare_vercel_preview.prepare(candidate, root / 'must-not-exist')
            self.assertFalse((root / 'must-not-exist').exists())
    def test_public_only_no_project_mutation_and_real_404_configuration(self):
        import sys
        sys.path.insert(0, str(ROOT / 'bin/web'))
        import prepare_vercel_preview
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            candidate = self.fixture(root)
            (candidate / 'public/404.html').write_text('<title>Not found</title>')
            self.update_asset_digest(candidate, 'public/404.html')
            receipt = prepare_vercel_preview.prepare(candidate, root / 'vercel')
            config = json.loads((root / 'vercel/.vercel/output/config.json').read_text())
            self.assertFalse(receipt['deploymentPerformed'])
            self.assertFalse(receipt['projectLinked'])
            self.assertEqual(receipt['releaseStatus'], 'BLOCKED')
            self.assertEqual(config['version'], 3)
            self.assertEqual(config['routes'][-2], {'handle': 'filesystem'})
            self.assertEqual(config['routes'][-1]['status'], 404)
            self.assertNotEqual(config['routes'][-1]['dest'], '/index.html')
            self.assertIn("media-src 'self'", config['routes'][0]['headers']['Content-Security-Policy'])
            self.assertEqual(config['routes'][0]['headers']['X-Robots-Tag'], 'noindex, nofollow')
            self.assertFalse((root / 'vercel/.vercel/project.json').exists())
            self.assertFalse((root / 'vercel/.vercel/output/functions').exists())
            self.assertFalse((root / 'vercel/.vercel/output/static/studio').exists())
            with self.assertRaises(ValueError):
                prepare_vercel_preview.prepare(candidate, root / 'vercel')
            (candidate / 'public/index.html').write_text('changed after verification')
            with self.assertRaisesRegex(ValueError, 'technical_verification'):
                prepare_vercel_preview.prepare(candidate, root / 'invalid')
            self.assertFalse((root / 'invalid').exists())


if __name__ == '__main__':
    unittest.main()
