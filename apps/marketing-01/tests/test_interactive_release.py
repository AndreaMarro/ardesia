import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build

class InteractiveReleaseTests(unittest.TestCase):
    def test_preview_connects_the_real_fluid_course_to_the_experience(self):
        with tempfile.TemporaryDirectory() as folder:
            target = build.build(Path(folder), interactive_preview=True)
            html = (target / 'index.html').read_text()
            self.assertIn('/esperienza/?percorso=fluidi-termodinamica', html)
            self.assertIn('id="dentro-la-lezione"', html)
            self.assertIn('/corsi/strumenti-meccanica/', html)
            self.assertIn('/corsi/elettricita-magnetismo/', html)
            self.assertIn('/corsi/onde-ottica-radiazioni/', html)
            self.assertIn('/esperienza/?modello=molla', html)
            self.assertIn('/esperienza/?modello=idrostatica', html)
            self.assertEqual(json.loads((target / 'source-manifest.json').read_text())['examples'], [])
            self.assertFalse((target / 'esempi').exists())
            self.assertNotIn('/esempi/', html)
            self.assertIn('manifestazione d’interesse', html)
            self.assertIn('nessun account richiesto', html)
            self.assertIn('noindex, nofollow', html)

    def test_default_artifact_does_not_link_to_an_absent_app(self):
        with tempfile.TemporaryDirectory() as folder:
            html = (build.build(Path(folder)) / 'index.html').read_text()
            self.assertNotIn('/esperienza/', html)

    def test_interactive_preview_cannot_bypass_production_gate(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError, 'interactive_demo_preview_only'):
                build.build(Path(folder), site_url='https://example.org/', interactive_preview=True)
            self.assertFalse((Path(folder) / 'index.html').exists())
