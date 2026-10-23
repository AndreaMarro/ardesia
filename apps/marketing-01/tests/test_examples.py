import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
import build
import examples


class ExampleTests(unittest.TestCase):
    def test_drafts_are_preview_only_and_generated_files_do_not_survive_production_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            build.build(out, review_examples=True)
            self.assertEqual(len(list((out/'esempi').glob('*/index.html'))), 4)
            for p in (out/'esempi').glob('*/index.html'):
                html = p.read_text()
                self.assertIn('DRAFT in revisione', html)
                self.assertIn('noindex, nofollow', html)
                self.assertNotIn('<script', html)
                self.assertEqual(html.count('<details'), 3)
            # A reused directory cannot retain a DRAFT page from an earlier preview.
            build.build(out, 'https://fisica.andreamarro.it/')
            self.assertFalse((out/'esempi').exists())
            self.assertNotIn('Guarda un esercizio', (out/'index.html').read_text())
            self.assertNotIn('noindex', (out/'_headers').read_text())
            self.assertIn('rel="canonical" href="https://fisica.andreamarro.it/"', (out/'index.html').read_text())
            self.assertIn('https://fisica.andreamarro.it/sitemap.xml', (out/'robots.txt').read_text())
            self.assertEqual(json.loads((out/'source-manifest.json').read_text())['examples'], [])
            with self.assertRaisesRegex(ValueError, 'preview_only'):
                build.build(out, 'https://fisica.andreamarro.it/', review_examples=True)

    def test_approval_binds_exact_source_and_presentation_and_requires_named_authorization(self):
        _, courses, _ = build.load_catalog()
        selected = examples.load_examples(courses, review=True)
        self.assertEqual(len(selected), 4)
        self.assertEqual(examples.load_examples(courses, production=True), [])
        entry = json.loads((HERE/'examples/selection.json').read_text())['examples'][0]
        approval = {'id': entry['id'], 'contentSHA256': examples.digest(entry), 'scientificReviewer': 'Fixture reviewer', 'editorialAuthorizer': 'Fixture editor', 'authorizationReference': 'TEST ONLY'}
        original = Path.read_text
        def fake_read(path, *args, **kwargs):
            return json.dumps({'approved': [approval]}) if path.name == 'approvals.json' else original(path, *args, **kwargs)
        with patch.object(Path, 'read_text', fake_read):
            self.assertEqual(len(examples.load_examples(courses, production=True)), 1)
            approval['contentSHA256'] = '0'*64
            self.assertEqual(examples.load_examples(courses, production=True), [])
            approval['contentSHA256'] = examples.digest(entry)
            approval['editorialAuthorizer'] = ''
            self.assertEqual(examples.load_examples(courses, production=True), [])

    def test_source_record_changes_fail_closed(self):
        _, courses, _ = build.load_catalog()
        source = json.loads((HERE/'examples/selection.json').read_text())
        source['examples'][0]['record']['answerDisplay'] = 'A'
        original = Path.read_text
        def fake_read(path, *args, **kwargs):
            return json.dumps(source) if path.name == 'selection.json' else original(path, *args, **kwargs)
        with patch.object(Path, 'read_text', fake_read):
            with self.assertRaisesRegex(ValueError, 'source_mismatch'):
                examples.load_examples(courses, review=True)
