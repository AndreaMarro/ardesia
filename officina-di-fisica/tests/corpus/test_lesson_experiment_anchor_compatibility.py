"""Existing experiments retain their paragraph entry points in staged lesson editions."""
import json
from pathlib import Path
import subprocess
import unittest

from tools.corpus_engineering.batches import load_activity_registry

APP = Path(__file__).resolve().parents[2]
REPO = APP.parent
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'


def source_catalog():
    paths = subprocess.check_output(['git', '-C', str(REPO), 'ls-tree', '-r', '--name-only',
                                     SOURCE_REF, 'officina-di-fisica/content'], text=True).splitlines()
    objects = {}
    for path in paths:
        if path.endswith('.json'):
            rows = json.loads(subprocess.check_output(['git', '-C', str(REPO), 'show', SOURCE_REF + ':' + path]))
            for row in rows:
                if row['id'] in objects:
                    raise ValueError('Duplicate historical source identity')
                objects[row['id']] = row
    return objects


def missing_anchors(objects, experiments):
    missing = []
    for row in experiments:
        lesson = objects[row['skill']]
        if not any(block.get('type') == 'text' and block['text'].startswith(row['anchor'])
                   for block in lesson['blocks']):
            missing.append((row['id'], row['skill'], row['anchor']))
    return missing


class LessonExperimentAnchorCompatibility(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.originals = source_catalog()
        cls.experiments = [row for row in cls.originals.values() if row.get('kind') == 'experiment']

    def test_historical_experiments_have_their_original_paragraphs(self):
        self.assertEqual(len(self.originals), 991)
        self.assertEqual(len(self.experiments), 181)
        self.assertEqual(missing_anchors(self.originals, self.experiments), [])

    def test_all_registered_lesson_drafts_preserve_existing_experiment_entry_points(self):
        effective = dict(self.originals)
        for spec in load_activity_registry():
            if spec.get('revisionPackage'):
                package = json.loads((APP / 'editorial/batches' / (spec['revisionPackage'] + '.json')).read_text())
                for row in package['records']:
                    effective[row['id']] = row
        self.assertEqual(missing_anchors(effective, self.experiments), [])


if __name__ == '__main__':
    unittest.main()
