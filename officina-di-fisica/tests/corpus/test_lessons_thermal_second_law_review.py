"""Last real C3 lesson IDs, exact logarithms and explicit second-law domains."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp

from tools.corpus_engineering import lessons_thermal_second_law_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class ThermalSecondLawLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C3.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_only_two_remaining_real_C3_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C3-L09', 'C3-L10'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 36)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_two_assets_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'lesson'},
                         {f'C3-L{i:02}' for i in range(1, 11)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_missing_and_empty_reviews_cannot_inherit_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed thermodynamic condition'
                self.assertFalse(next(r for r in review.verify(sources) if r['id'] == key)['ok'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)
            for replacement in ([], [{'ok': False, 'claim': 'failed independent check', 'dimension': {}}]):
                models = review.independent_checks()
                models[key] = replacement
                with patch.object(review, 'independent_checks', return_value=models):
                    self.assertFalse(next(r for r in review.verify(self.sources) if r['id'] == key)['ok'])

    def test_each_original_figure_requires_exact_bytes(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            for name in review.READ_ASSETS:
                shutil.copyfile(review.APP/'static/figures'/name, root/name)
            for key, names in review.FIGURES_BY_ID.items():
                for name in names:
                    file = root/name
                    raw = file.read_bytes()
                    for replacement in (None, raw+b'\n'):
                        with self.subTest(key=key, asset=name, missing=replacement is None):
                            if replacement is None:
                                file.unlink()
                            else:
                                file.write_bytes(replacement)
                            self.assertFalse(next(r for r in review.verify(self.sources, asset_root=root) if r['id'] == key)['ok'])
                            file.write_bytes(raw)

    def test_exact_logs_are_kept_and_excluded_processes_do_not_pass_second_law(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['toy source600K and300K boundonehalf']['independentExact'], '1/2')
        self.assertEqual(checks['toy higherthanCarnot engine has negative reservoir entropy']['independentExact'], '-1/300')
        self.assertEqual(checks['toy hot-to-cold total entropy positiveone100']['independentExact'], '1/100')
        self.assertEqual(checks['toy unassisted inverse conserves energy but decreases total entropy']['independentExact'], '-1/100')
        finite = checks['toy finite-body entropy stays exact log25over16']
        self.assertIn('log', finite['expectedValue'])
        self.assertFalse(sp.sympify(finite['independentExact']).atoms(sp.Float))
        self.assertEqual(checks['ten independent particles all in one compartment probability']['independentExact'], '1/512')
        self.assertEqual(checks['biased two-state entropy differs fromklogOmega']['scope'],
                         'reviewer_boundary_probe_excluded_by_source_conditions')

    def test_diagram_arrows_show_heat_and_work_directions_not_numeric_magnitudes(self):
        def arrows(name):
            root = ET.fromstring((review.APP/'static/figures'/name).read_bytes())
            return [(int(el.attrib['x2'])-int(el.attrib['x1']), int(el.attrib['y2'])-int(el.attrib['y1']))
                    for el in root.iter() if el.tag.endswith('line') and 'marker-end' in el.attrib]
        self.assertEqual(arrows('C3-macchina.svg'), [(71, 0), (80, 0), (0, 46)])
        self.assertEqual(arrows('C3-entropia.svg'), [(141, 0)])


if __name__ == '__main__':
    unittest.main()
