"""Frozen-read integrity, original failure and independent entropy-draft guards."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering import examples_cycles_entropy_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest


class CycleEntropyReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {row['id']: row for row in json.loads((review.APP/'content/C3.json').read_text())
                       if row['id'] in review.READ_SOURCE_SHA256}
        cls.package = json.loads((review.APP/'editorial/batches/examples-entropy-revisions-043.json').read_text())
        cls.bindings = json.loads((review.APP/'editorial/batches/examples-entropy-revisions-043-bindings.json').read_text())

    def test_original_false_equality_is_not_repaired_by_possible_rounding(self):
        report = review.report(self.sources)
        self.assertEqual((report['acceptedCount'], report['failedCount']), (7, 1))
        self.assertEqual(report['failedPublishedEditionIds'], ['C3-E020'])
        original = next(row for row in report['records'] if row['id'] == 'C3-E020')
        self.assertEqual(len([claim for claim in original['checks'] if not claim['ok']]), 1)
        self.assertTrue(next(claim for claim in original['checks'] if claim['relation'].startswith('viable_nearest'))['ok'])
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        # The source explicitly marks E013's approximation; it is a different case.
        self.assertTrue(review.manual_adiabatic_bound()['ok'])

    def test_mixed_draft_keeps_original_judgment_and_serializes_deterministically(self):
        report = review.report(self.sources, self.package, self.bindings)
        self.assertEqual(report, review.report(self.sources, self.package, self.bindings))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (8, 0, 1))
        self.assertEqual(sum(len(row['checks']) for row in report['records']), 47)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources,
            {row['id']: row for row in self.package['records']}, {row['id']: row for row in self.bindings})
        draft = next(row for row in report['records'] if row['id'] == 'C3-E020')
        original = next(row for row in review.verify_originals(self.sources) if row['id'] == 'C3-E020')
        self.assertEqual(draft['publishedEditionReview'], original)
        self.assertFalse(original['ok'])
        self.assertTrue(draft['failedPublishedEdition'])
        self.assertEqual((draft['candidateVersion'], draft['baseVersion'], draft['publicationAction']), (2, 1, 'DRAFT'))
        for row in report['records']:
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertTrue(row['originalEditionRetained'])
            self.assertTrue(all(claim['ok'] for claim in row['checks']))

    def test_all_eight_changed_originals_need_another_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['prompt'] += ' changed condition'
                row = next(row for row in review.verify_originals(sources) if row['id'] == key)
                self.assertFalse(row['ok'])
                self.assertIn('Source differs from independently read original', row['errors'])

    def test_each_missing_original_is_rejected(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = dict(self.sources)
                del sources[key]
                with self.assertRaises(ValueError): review.verify_originals(sources)

    def test_each_historical_figure_is_required(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            for name in review.READ_ASSETS: shutil.copyfile(review.APP/'static/figures'/name, root/name)
            for key, name in review.FIGURE_BY_ID.items():
                with self.subTest(key=key):
                    file = root/name
                    raw = file.read_bytes()
                    file.unlink()
                    row = next(row for row in review.verify_originals(self.sources, root) if row['id'] == key)
                    self.assertFalse(row['ok'])
                    self.assertIn('Historical scientific figure changed or missing', row['errors'])
                    file.write_bytes(raw)

    def test_changed_candidate_with_binding_still_fails_frozen_signature(self):
        package, bindings = deepcopy(self.package), deepcopy(self.bindings)
        package['records'][0]['blocks'][0]['text'] += ' changed claim'
        bindings[0]['candidateSha256'] = digest(package['records'][0])
        row = next(row for row in review.verify(self.sources, package, bindings) if row['id'] == 'C3-E020')
        self.assertFalse(row['ok'])
        self.assertIn('Independent reviewed signature mismatch', row['errors'])

    def test_version_and_source_guards_survive_test_only_retoken(self):
        for field in ('sourceRef', 'sourceSha256', 'baseVersion', 'version', 'answer'):
            with self.subTest(field=field):
                package, bindings = deepcopy(self.package), deepcopy(self.bindings)
                row, binding = package['records'][0], bindings[0]
                if field == 'sourceRef': binding[field] = '0'*40
                elif field == 'sourceSha256': binding[field] = '0'*64
                elif field == 'answer': row[field] = {'type': 'numeric', 'value': '5.76'}
                else: row[field] += 1
                binding['candidateSha256'] = digest(row)
                token = digest({'record': row, 'assets': binding['assetChecksums'],
                    'source': {'id': binding['sourceId'], 'ref': binding['sourceRef'], 'sha256': binding['sourceSha256']}})
                with patch.dict(review.REVIEWED_REVISIONS, {'C3-E020': token}):
                    result = next(row for row in review.verify(self.sources, package, bindings) if row['id'] == 'C3-E020')
                self.assertFalse(result['ok'])
                self.assertNotIn('Independent reviewed signature mismatch', result['errors'])

    def test_revision_requires_complete_unique_identity_and_exact_asset(self):
        with self.assertRaises(ValueError): review.verify(self.sources, {'records': [], 'assets': []}, [])
        duplicate = deepcopy(self.package)
        duplicate['records'] *= 2
        with self.assertRaises(ValueError): review.verify(self.sources, duplicate, self.bindings)
        with self.assertRaises(ValueError): review.verify(self.sources, self.package)
        with tempfile.TemporaryDirectory() as home:
            result = next(row for row in review.verify(self.sources, self.package, self.bindings, asset_root=home) if row['id'] == 'C3-E020')
            self.assertFalse(result['ok'])
            self.assertIn('Reviewed asset changed or missing', result['errors'])
        corrupt = deepcopy(self.package)
        corrupt['assets'][0]['data'] = 'd3JvbmcgYXNzZXQ='
        with self.assertRaises(ValueError): review.verify(self.sources, corrupt, self.bindings)

    def test_only_free_expansion_concept_has_no_student_numeric_calculation(self):
        rows = review.verify_originals(self.sources)
        self.assertEqual([row['id'] for row in rows if row['calculationScope'] == 'NO_STUDENT_CALCULATION'], ['C3-E014'])
        concept = next(row for row in rows if row['id'] == 'C3-E014')
        self.assertTrue(all(claim['relation'].startswith('symbolic_conceptual') and claim['ok'] for claim in concept['checks']))


if __name__ == '__main__': unittest.main()
