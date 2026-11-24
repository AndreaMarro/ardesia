"""Original whole-lesson/asset integrity and independent exact model checks."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

from tools.corpus_engineering import lessons_mechanics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MechanicsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C1.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_all_four_complete_lessons_are_reproducibly_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 66)
        self.assertEqual(report['failedPublishedEditionIds'], [])
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])
            self.assertFalse(row['failedPublishedEdition'])

    def test_pins_are_the_actual_immutable_git_sources_and_assets(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_blocks_or_omitted_lessons_cannot_reuse_reading(self):
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

    def test_all_three_figures_are_required_byte_exact(self):
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

    def test_exact_probes_are_labelled_separately_from_student_requirements(self):
        checks = review.independent_checks()
        by_claim = {c['claim']: c for group in checks.values() for c in group}
        for claim, exact in (
            ('probe upward-accelerating contact N=2(10+3)', '26'),
            ('probe sliding acceleration (40-24)/8', '2'),
            ('probe exact final speed no decimal radical required', 'sqrt(13)'),
            ('probe final speed from18J and1kg', '6')):
            self.assertEqual(by_claim[claim]['independentExact'], exact)
            self.assertEqual(by_claim[claim]['scope'], 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise')
        self.assertEqual(by_claim['interior shell potential independent of r']['independentExact'], '0')
        self.assertEqual(by_claim['uniform planet central field limit']['independentExact'], '0')
        self.assertEqual(by_claim['diagram vertical arrow shaft lengths balanced']['scope'], 'read_SVG_geometry_not_physical_unit_scale')


if __name__ == '__main__':
    unittest.main()
