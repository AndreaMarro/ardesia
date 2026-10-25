import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('upload', Path(__file__).resolve().parents[1] / 'web/prepare_vercel_upload.py')
upload = importlib.util.module_from_spec(spec)
spec.loader.exec_module(upload)


class PublicUploadTests(unittest.TestCase):
    def fixture(self, directory):
        root = Path(directory)
        output = root / '.vercel/output'
        public = output / 'static'
        public.mkdir(parents=True)
        (public / 'source-manifest.json').write_text('{"examples":[]}')
        (public / 'index.html').write_text('Original public demo')
        config = b'{"version":3,"routes":[{"src":"/.*","status":404,"dest":"/404.html"}]}'
        (output / 'config.json').write_bytes(config)
        receipt = {'privateBetaIncluded': False, 'configSha256': hashlib.sha256(config).hexdigest(),
                   'publicAssetsSha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in public.iterdir()},
                   'binding': {'sourceCommit': 'a' * 40, 'candidateManifestSha256': 'b' * 64, 'sourceTreeSha256': 'c' * 64}}
        (root / 'preview-manifest.json').write_text(json.dumps(receipt))
        return root, public, receipt

    def test_exact_static_files_and_routes_without_rebuilding_studio(self):
        with tempfile.TemporaryDirectory() as directory:
            root, _, _ = self.fixture(directory)
            request = upload.prepare(root)
            self.assertEqual(request['teamId'], upload.TEAM)
            body = request['requestBody']
            self.assertEqual(body['project'], upload.PROJECT)
            self.assertEqual(body['projectSettings']['outputDirectory'], 'public')
            self.assertEqual(body['projectSettings']['buildCommand'], '')
            self.assertNotIn('target', body)  # Preview first, never implicit production.
            self.assertEqual({f['file'] for f in body['files']}, {'public/index.html', 'public/source-manifest.json', 'vercel.json'})
            config = json.loads(body['files'][-1]['data'])
            self.assertEqual(config['version'], 2)
            self.assertEqual(config['routes'][0]['status'], 404)

    def test_rejects_mutation_and_even_correctly_rehashed_editorial_examples(self):
        with tempfile.TemporaryDirectory() as directory:
            root, public, receipt = self.fixture(directory)
            (public / 'index.html').write_text('changed')
            with self.assertRaisesRegex(ValueError, 'changed_public_assets'):
                upload.prepare(root)
            (public / 'source-manifest.json').write_text('{"examples":[{"editorialStatus":"DRAFT"}]}')
            receipt['publicAssetsSha256'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in public.iterdir()}
            (root / 'preview-manifest.json').write_text(json.dumps(receipt))
            with self.assertRaisesRegex(ValueError, 'unreleased_editorial_or_private_content'):
                upload.prepare(root)

    def test_full_editorial_courses_cannot_be_uploaded_as_the_public_demo(self):
        with tempfile.TemporaryDirectory() as directory:
            root, public, receipt = self.fixture(directory)
            (public/'courses-manifest.json').write_text('{"releaseScope":"PRIVATE_EDITORIAL_REVIEW"}')
            receipt['publicAssetsSha256']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in public.iterdir()}
            (root/'preview-manifest.json').write_text(json.dumps(receipt))
            with self.assertRaisesRegex(ValueError,'protected_editorial_preview_required'):
                upload.prepare(root)
            body=upload.prepare(root,True)['requestBody']
            self.assertNotIn('target',body)
            self.assertEqual(body['meta']['scope'],'PRIVATE_EDITORIAL_REVIEW')
