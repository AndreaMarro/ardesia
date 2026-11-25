"""Immutable original sources and exact domains/signs of thermal path models."""
from copy import deepcopy
from fractions import Fraction
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET

from tools.corpus_engineering import lessons_thermal_paths_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class ThermalPathsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C3.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_complete_original_readings_are_deterministic_and_do_not_publish(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C3-L05', 'C3-L06', 'C3-L07', 'C3-L08'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 54)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])
            self.assertFalse(row['failedPublishedEdition'])

    def test_whole_records_and_four_assets_are_actual_git_sources(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_each_changed_or_missing_lesson_invalidates_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed model condition'
                row = next(r for r in review.verify(sources) if r['id'] == key)
                self.assertFalse(row['ok'])
                self.assertIn('Lesson differs from independently read original', row['errors'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)

    def test_every_original_figure_is_required_byte_exact(self):
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
                            row = next(r for r in review.verify(self.sources, asset_root=root) if r['id'] == key)
                            self.assertFalse(row['ok'])
                            self.assertIn('Historical lesson figure changed or missing', row['errors'])
                            file.write_bytes(raw)

    def test_signs_work_units_and_constructed_boundary_probes(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        for claim, exact in (
            ('actual source kPa litre identity', '1'),
            ('toy positive heat5J with greater work8J still lowersU', '-3'),
            ('toy compression2kPa timesminus3L givesminus6J', '-6'),
            ('toy reversibleadiabatic work32kPa1L to1kPa8L', '36'),
            ('toy rectangle3minus1kPa and4minus1L gives6J', '6'),
            ('toy heatin10J heatout7J givesnet3J not10J', '3')):
            self.assertEqual(checks[claim]['independentExact'], exact)
            self.assertTrue(checks[claim]['ok'])
        self.assertNotEqual(checks['arbitrarily slow dry friction still dissipates positiveFdistance']['independentExact'], '0')
        self.assertEqual(checks['arbitrarily slow dry friction still dissipates positiveFdistance']['scope'],
                         'reviewer_boundary_probe_slow_does_not_imply_reversible')
        self.assertIn('15', checks['body twice ambient absoluteT gives15ambient emission units net']['expectedValue'])
        self.assertEqual(checks['emitted power itself scales by16 on doubled absoluteT']['independentExact'], '16')

    def test_both_complete_drawn_expansion_curves_share_start_and_correct_order(self):
        root = ET.fromstring((review.APP/'static/figures/C3-percorsi.svg').read_bytes())
        curves = [re.findall(r'[ML]([0-9.]+),([0-9.]+)', p.attrib['d']) for p in root.iter()
                  if p.tag.endswith('path') and p.attrib.get('d', '').startswith('M167.0')]
        self.assertEqual([len(c) for c in curves], [153, 153])
        self.assertEqual(curves[0][0], curves[1][0])
        self.assertTrue(all(a[0] == b[0] for a, b in zip(*curves)))
        for curve in curves:
            self.assertTrue(all(Fraction(a[0]) < Fraction(b[0]) and Fraction(a[1]) < Fraction(b[1])
                                for a, b in zip(curve, curve[1:])))
            self.assertTrue(all(Fraction(y) < 205 for _, y in curve))
        self.assertTrue(all(Fraction(b[1]) > Fraction(a[1]) for a, b in zip(curves[0][1:], curves[1][1:])))


if __name__ == '__main__':
    unittest.main()
