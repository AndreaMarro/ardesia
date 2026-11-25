"""Original domain failure stays explicit; source/figure hashes are not opinions."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering import lessons_viscous_capillary_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class ViscousCapillaryLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C2.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}
        cls.package = json.loads((review.APP/'editorial/batches/lessons-viscous-revisions-073.json').read_text())
        cls.bindings = json.loads((review.APP/'editorial/batches/lessons-viscous-revisions-073-bindings.json').read_text())

    def test_original_missing_condition_is_not_approved_by_correct_steady_formulas(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (3, 1, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 71)
        self.assertEqual(report['failedPublishedEditionIds'], ['C2-L007'])
        byid = {r['id']: r for r in report['records']}
        self.assertEqual(byid['C2-L007']['publishedEditionIssue']['priority'], 'P2')
        self.assertEqual(sum(not c['ok'] for c in byid['C2-L007']['checks']), 1)
        self.assertTrue(all(byid[key]['ok'] for key in ('C2-L008', 'C2-L009', 'C2-L010')))
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])

    def test_pins_are_actual_four_records_and_assets_from_git(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_every_changed_or_missing_lesson_invalidates_original_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed condition'
                row = next(r for r in review.verify(sources) if r['id'] == key)
                self.assertFalse(row['ok'])
                self.assertIn('Lesson differs from independently read original', row['errors'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)

    def test_every_original_svg_is_required_byte_exact(self):
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

    def test_counterexample_is_an_exact_solution_with_failed_claim_not_failed_boundary(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        for claim in ('unsteady counterexample solves axial Navier-Stokes',
                      'unsteady counterexample satisfies no-slip',
                      'unsteady counterexample smooth axis gradient',
                      'unsteady counterexample independent of axial coordinate'):
            self.assertEqual(checks[claim]['independentExact'], '0')
            self.assertTrue(checks[claim]['ok'])
        failed = checks['original half-maximum claim without stationarity']
        self.assertEqual(failed['independentExact'], 'R**4*b/6')
        self.assertFalse(failed['ok'])
        self.assertEqual(failed['scope'], 'original_domain_counterexample_not_a_student_exercise')

    def test_manual_exact_values_units_and_interface_counts(self):
        checks = {c['claim']: c for group in review.independent_checks().values() for c in group}
        for claim, exact in (
            ('halving radius at fixed pressure gives one-sixteenth flow', '1/16'),
            ('fixed flow requires16fold pressure after halving radius', '16'),
            ('toy exact flow in mL persecond', 'pi/100'),
            ('closing branch2 returns equivalent R1', 'R1'),
            ('theta90deg gives zero capillary height', '0'),
            ('toy capillary1mm,g10,density1000,theta0 gives1cm', '1/100'),
            ('toy spherical drop1mm has100Pa excess', '100'),
            ('toy soap bubble1mm has200Pa excess', '200')):
            self.assertEqual(checks[claim]['independentExact'], exact)
            self.assertTrue(checks[claim]['ok'])

    def test_new_draft_retains_separate_original_failure_and_repairs_only_new_edition(self):
        report = review.report(self.sources, self.package, self.bindings)
        self.assertEqual(report, review.report(self.sources, self.package, self.bindings))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 1))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 80)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources,
            {r['id']: r for r in self.package['records']}, {r['id']: r for r in self.bindings})
        originals = {r['id']: r for r in review.verify_originals(self.sources)}
        for row in report['records']:
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            if row['id'] == 'C2-L007':
                self.assertEqual((row['candidateVersion'], row['baseVersion'], row['publicationAction']), (2, 1, 'DRAFT'))
                self.assertTrue(row['failedPublishedEdition'])
                self.assertEqual(row['publishedEditionReview'], originals[row['id']])
                self.assertFalse(row['publishedEditionReview']['ok'])
            else:
                self.assertEqual(row, originals[row['id']])

    def test_rebound_changed_new_lesson_requires_fresh_independent_reading(self):
        package, bindings = deepcopy(self.package), deepcopy(self.bindings)
        package['records'][0]['blocks'][10]['text'] += ' different scientific condition'
        bindings[0]['candidateSha256'] = digest(package['records'][0])
        row = next(r for r in review.verify(self.sources, package, bindings) if r['id'] == 'C2-L007')
        self.assertFalse(row['ok'])
        self.assertIn('Independent reviewed signature mismatch', row['errors'])

    def test_source_and_additive_version_guards_survive_test_only_signature_refresh(self):
        for field in ('sourceRef', 'sourceId', 'sourceSha256', 'baseVersion', 'version', 'kind', 'answer', 'booleanVersion'):
            with self.subTest(field=field):
                package, bindings = deepcopy(self.package), deepcopy(self.bindings)
                row, binding = package['records'][0], bindings[0]
                if field in ('sourceRef', 'sourceSha256'):
                    binding[field] = '0'*len(binding[field])
                elif field == 'sourceId':
                    binding[field] = 'C2-L008'
                elif field == 'kind':
                    row[field] = 'example'
                elif field == 'answer':
                    row[field] = {'type': 'numeric', 'value': 4}
                elif field == 'booleanVersion':
                    row['baseVersion'] = True
                else:
                    row[field] += 1
                binding['candidateSha256'] = digest(row)
                token = digest({'record': row, 'assets': binding['assetChecksums'],
                    'source': {'id': binding['sourceId'], 'ref': binding['sourceRef'], 'sha256': binding['sourceSha256']}})
                with patch.dict(review.REVIEWED_REVISIONS, {'C2-L007': token}):
                    result = next(r for r in review.verify(self.sources, package, bindings) if r['id'] == 'C2-L007')
                self.assertFalse(result['ok'])
                self.assertNotIn('Independent reviewed signature mismatch', result['errors'])

    def test_new_edition_requires_complete_unique_identity_and_uploaded_local_asset(self):
        with self.assertRaises(ValueError):
            review.verify(self.sources, {'records': [], 'assets': []}, [])
        package = deepcopy(self.package)
        package['records'] += package['records'][:1]
        with self.assertRaises(ValueError):
            review.verify(self.sources, package, self.bindings)
        with self.assertRaises(ValueError):
            review.verify(self.sources, self.package)
        package = deepcopy(self.package)
        package['assets'][0]['data'] = 'd3JvbmcgYXNzZXQ='
        with self.assertRaises(ValueError):
            review.verify(self.sources, package, self.bindings)
        with tempfile.TemporaryDirectory() as home:
            row = next(r for r in review.verify(self.sources, self.package, self.bindings, asset_root=Path(home))
                       if r['id'] == 'C2-L007')
            self.assertFalse(row['ok'])
        checks = {c['claim']: c for c in review.revised_checks()}
        self.assertEqual(checks['new Couette worked gradient4mm/s over2mm']['independentExact'], '2')
        self.assertEqual(checks['new Couette worked stress2Pas times2persecond']['independentExact'], '4')
        self.assertEqual(checks['new Couette worked stress2Pas times2persecond']['scope'],
                         'new_edition_worked_example_arithmetic')


if __name__ == '__main__':
    unittest.main()
