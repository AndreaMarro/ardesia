"""Canonical IDs, immutable sources, exact thermal arithmetic and precision scope."""
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

from tools.corpus_engineering import lessons_thermal_basics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class ThermalBasicsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C3.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_canonical_two_digit_ids_are_fully_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C3-L01', 'C3-L02', 'C3-L03', 'C3-L04'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 56)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])
            self.assertFalse(row['failedPublishedEdition'])

    def test_records_and_assets_match_actual_git_originals(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_each_changed_or_omitted_lesson_invalidates_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed physical condition'
                row = next(r for r in review.verify(sources) if r['id'] == key)
                self.assertFalse(row['ok'])
                self.assertIn('Lesson differs from independently read original', row['errors'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)

    def test_each_original_figure_is_required_byte_exact(self):
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

    def test_working_precision_and_constructed_budgets_are_not_overclaimed(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        self.assertNotEqual(review.WORKING_R, review.EXACT_SI_R)
        self.assertEqual(checks['printed gas constant is correct rounded working value']['scope'],
                         'rounded_tabulated_working_coefficient_not_exact_SI_identity')
        self.assertEqual(checks['printed workingR differs from exactSI by quantified amount']['independentExact'],
                         '11565453831/25000000000000')
        for claim, exact, unit in (
            ('Celsius to kelvin at20degrees', '5863/20', 'K'),
            ('toyC200at80C andC100at20C give60C', '60', 'degC'),
            ('toyincludecontainerC100at20C gives50C', '50', 'degC'),
            ('toybudget170kJ melts onlyhalfkg afterwarming', '1/2', 'kg'),
            ('toybudget340kJ endsatplus5Celsius', '5', 'degC'),
            ('toy500W takes600s for300kJ fusion', '600', 's')):
            self.assertEqual(checks[claim]['independentExact'], exact)
            self.assertEqual(checks[claim]['unit'], unit)
            self.assertEqual(checks[claim]['scope'], 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise')

    def test_every_isotherm_vertex_agrees_with_equal_rectangle_hyperbola(self):
        root = ET.fromstring((review.APP/'static/figures/C3-isoterma.svg').read_bytes())
        curve = next(el.attrib['d'] for el in root.iter()
                     if el.tag.endswith('path') and el.attrib.get('d', '').startswith('M150.0'))
        pairs = re.findall(r'[ML]([0-9.]+),([0-9.]+)', curve)
        self.assertEqual(len(pairs), 119)
        errors = [abs(Fraction(y)-(211-Fraction(9828)/(Fraction(x)-72))) for x, y in pairs]
        self.assertLessEqual(max(errors), Fraction(1, 20))
        self.assertEqual((150-72)*(211-85), (306-72)*(211-169))


if __name__ == '__main__':
    unittest.main()
