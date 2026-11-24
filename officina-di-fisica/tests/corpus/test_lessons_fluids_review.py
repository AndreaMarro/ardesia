"""Full-source and asset integrity; models cannot exceed their stated scope."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

from tools.corpus_engineering import lessons_fluids_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class FluidsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C2.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_complete_readings_are_deterministic_and_do_not_publish(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 58)
        self.assertEqual(report['failedPublishedEditionIds'], [])
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])
            self.assertFalse(row['failedPublishedEdition'])

    def test_frozen_records_and_four_assets_are_the_real_git_originals(self):
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
                sources[key]['blocks'][0]['text'] += ' changed model assumption'
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

    def test_domain_probes_do_not_claim_unqualified_ideal_laws(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        boundary = 'reviewer_limit_probe_excluded_by_explicit_source_approximation'
        self.assertEqual(checks['retained hydrostatic head costs fluid gravitational energy']['scope'], boundary)
        self.assertNotEqual(checks['retained hydrostatic head costs fluid gravitational energy']['independentExact'], '0')
        self.assertEqual(checks['relative head-work correction vanishes for short stroke']['independentExact'], '0')
        self.assertEqual(checks['parabolic profile needs kinetic correction2']['scope'], boundary)
        self.assertEqual(checks['parabolic profile needs kinetic correction2']['independentExact'], '2')
        probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
        for claim, exact in (
            ('probe output20N times0.02m', '2/5'),
            ('probe tether force must supply4N downward', '4'),
            ('probe denser1200kg/m3 body1L has negative free net force', '-2'),
            ('probe400 parallel radiiR/10 total area4piR2', '4*pi*R**2'),
            ('probe1000kg/m3 and1to2m/s gives1500Pa drop', '1500')):
            self.assertEqual(checks[claim]['scope'], probe)
            self.assertEqual(checks[claim]['independentExact'], exact)


if __name__ == '__main__':
    unittest.main()
