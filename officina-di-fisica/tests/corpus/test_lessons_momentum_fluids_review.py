"""Integrity and exact scope of four independently read original lessons."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

from tools.corpus_engineering import lessons_momentum_fluids_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MomentumFluidsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for path in review.SOURCE_FILES
                       for r in json.loads((review.APP.parent/path).read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_all_four_full_readings_are_deterministic_and_do_not_publish(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 59)
        self.assertEqual(report['failedPublishedEditionIds'], [])
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])
            self.assertFalse(row['failedPublishedEdition'])
            self.assertEqual(row['sourcePath'], review.SOURCE_PATH_BY_ID[row['id']])

    def test_real_git_sources_and_each_of_four_assets_match_frozen_reading(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        rows = {}
        for path, checksum in review.SOURCE_FILES.items():
            raw = git(path)
            self.assertEqual(sha(raw), checksum)
            rows.update({r['id']: r for r in json.loads(raw)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_each_changed_or_missing_lesson_cannot_reuse_the_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' altered physical condition'
                row = next(r for r in review.verify(sources) if r['id'] == key)
                self.assertFalse(row['ok'])
                self.assertIn('Lesson differs from independently read original', row['errors'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)

    def test_all_four_figures_require_exact_original_bytes(self):
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

    def test_source_figure_arithmetic_is_distinct_from_reviewer_probes(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        for claim, exact in (('source total triangular impulse', '4'),
                             ('source average force over0.20s', '20')):
            self.assertEqual(checks[claim]['independentExact'], exact)
            self.assertEqual(checks[claim]['scope'], 'actual_labelled_source_figure_arithmetic')
        for claim, exact in (('probe signed velocities2kg*3 plus1kg*(-1)', '5/3'),
                             ('probe sticking kinetic loss', '16/3'),
                             ('probe short muscle arm requires60N for10N load', '60'),
                             ('probe20kPa across2cm2 gives4N', '4'),
                             ('probe two layers sum pressure increments', '2800')):
            self.assertEqual(checks[claim]['independentExact'], exact)
            self.assertEqual(checks[claim]['scope'], 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise')
        self.assertEqual(checks['figure gas interface lower than atmospheric interface']['scope'],
                         'read_SVG_depth_order_not_assigned_length_scale')


if __name__ == '__main__':
    unittest.main()
