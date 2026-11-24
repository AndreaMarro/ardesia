"""Binding and editorial-gate regressions for the independently read originals."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

import sympy as sp

from tools.corpus_engineering import examples_fluids_thermo_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest


class FluidsThermoOriginalReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {
            row['id']: row for name in review.SOURCE_FILES
            for row in json.loads((review.APP.parent/name).read_text())
            if row['id'] in review.READ_SOURCE_SHA256
        }
        cls.package = json.loads((review.APP/'editorial/batches/examples-thermo-revisions-042.json').read_text())
        cls.bindings = json.loads((review.APP/'editorial/batches/examples-thermo-revisions-042-bindings.json').read_text())

    def test_original_failure_remains_separate_from_valid_manual_rounding(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual((report['acceptedCount'], report['failedCount']), (7, 1))
        self.assertEqual(report['failedPublishedEditionIds'], ['C3-E003'])
        row = next(row for row in report['records'] if row['id'] == 'C3-E003')
        failed = [claim for claim in row['checks'] if not claim['ok']]
        self.assertEqual(len(failed), 1)
        self.assertEqual(sp.Rational(failed[0]['residual']), -sp.Rational(1, 6250000))
        self.assertTrue(all(claim['ok'] for claim in row['checks'] if claim['relation'].startswith('reported_precision')))
        # A viable approximation does not turn an undeclared exact equality into PASS.
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for record in report['records']:
            self.assertEqual(record['humanApproval'], 'NOT_RUN')
            self.assertEqual(record['publicationAction'], 'NONE')
            self.assertTrue(record['originalEditionRetained'])

    def test_each_changed_source_requires_another_independent_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['prompt'] += ' changed statement'
                result = {row['id']: row for row in review.verify(sources)}[key]
                self.assertFalse(result['ok'])
                self.assertTrue(any('Source differs' in error for error in result['errors']))

    def test_each_missing_original_is_rejected(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = dict(self.sources)
                del sources[key]
                with self.assertRaises(ValueError): review.verify(sources)

    def test_each_historical_figure_is_required(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            for name in review.READ_ASSETS:
                shutil.copyfile(review.APP/'static/figures'/name, root/name)
            for key, name in review.FIGURE_BY_ID.items():
                with self.subTest(key=key):
                    raw = (root/name).read_bytes()
                    (root/name).unlink()
                    result = {row['id']: row for row in review.verify(self.sources, asset_root=root)}[key]
                    self.assertFalse(result['ok'])
                    self.assertTrue(any('figure changed or missing' in error for error in result['errors']))
                    (root/name).write_bytes(raw)

    def test_only_purely_conceptual_record_omits_student_numeric_calculation(self):
        records = review.verify(self.sources)
        self.assertEqual([row['id'] for row in records if row['calculationScope'] == 'NO_STUDENT_CALCULATION'], ['C3-E002'])
        symbolic = next(row for row in records if row['id'] == 'C3-E002')
        self.assertTrue(symbolic['ok'])
        self.assertTrue(all(claim['ok'] and claim['relation'].startswith('symbolic_conceptual') for claim in symbolic['checks']))

    def test_corrected_draft_does_not_approve_failed_original(self):
        report = review.report(self.sources, self.package, self.bindings)
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (8, 0, 1))
        self.assertEqual(report, review.report(self.sources, self.package, self.bindings))
        self.assertEqual(json.loads(canonical(report)), report)
        records = report['records']
        candidates = {row['id']: row for row in self.package['records']}
        bindings = {row['id']: row for row in self.bindings}
        assert_activity_identity(records, set(review.READ_SOURCE_SHA256), self.sources, candidates, bindings)
        draft = next(row for row in records if row['id'] == 'C3-E003')
        original = next(row for row in review.verify_originals(self.sources) if row['id'] == 'C3-E003')
        self.assertEqual(draft['publishedEditionReview'], original)
        self.assertFalse(original['ok'])
        self.assertTrue(draft['failedPublishedEdition'])
        self.assertEqual((draft['candidateVersion'], draft['baseVersion'], draft['publicationAction']), (2, 1, 'DRAFT'))
        self.assertTrue(all(claim['ok'] for claim in draft['checks']))

    def test_changed_candidate_even_with_rebinding_needs_new_reading(self):
        package, bindings = deepcopy(self.package), deepcopy(self.bindings)
        package['records'][0]['blocks'][0]['text'] += ' changed scientific claim'
        bindings[0]['candidateSha256'] = digest(package['records'][0])
        draft = next(row for row in review.verify(self.sources, package, bindings) if row['id'] == 'C3-E003')
        self.assertFalse(draft['ok'])
        self.assertIn('Independent reviewed signature mismatch', draft['errors'])

    def test_provenance_and_version_guards_survive_a_test_only_retoken(self):
        for field in ('sourceRef', 'sourceSha256', 'baseVersion', 'version', 'answer'):
            with self.subTest(field=field):
                package, bindings = deepcopy(self.package), deepcopy(self.bindings)
                row, binding = package['records'][0], bindings[0]
                if field == 'sourceRef': binding[field] = '0'*40
                elif field == 'sourceSha256': binding[field] = '0'*64
                elif field == 'answer': row[field] = {'type': 'numeric', 'value': '0.49884'}
                else: row[field] += 1
                binding['candidateSha256'] = digest(row)
                signature = digest({'record': row, 'assets': binding['assetChecksums'],
                    'source': {'id': binding['sourceId'], 'ref': binding['sourceRef'], 'sha256': binding['sourceSha256']}})
                with patch.dict(review.REVIEWED_REVISIONS, {'C3-E003': signature}):
                    draft = next(row for row in review.verify(self.sources, package, bindings) if row['id'] == 'C3-E003')
                self.assertFalse(draft['ok'])
                self.assertNotIn('Independent reviewed signature mismatch', draft['errors'])

    def test_revision_package_requires_exact_identity_and_asset_bytes(self):
        with self.assertRaises(ValueError): review.verify(self.sources, {'records': [], 'assets': []}, [])
        duplicate = deepcopy(self.package)
        duplicate['records'] *= 2
        with self.assertRaises(ValueError): review.verify(self.sources, duplicate, self.bindings)
        with self.assertRaises(ValueError): review.verify(self.sources, self.package)
        with tempfile.TemporaryDirectory() as home:
            draft = next(row for row in review.verify(self.sources, self.package, self.bindings, asset_root=home) if row['id'] == 'C3-E003')
            self.assertFalse(draft['ok'])
            self.assertIn('Reviewed asset changed or missing', draft['errors'])
        corrupt = deepcopy(self.package)
        corrupt['assets'][0]['data'] = 'bm90IHRoZSByZXZpZXdlZCBmaWd1cmU='
        with self.assertRaises(ValueError): review.verify(self.sources, corrupt, self.bindings)


if __name__ == '__main__': unittest.main()
