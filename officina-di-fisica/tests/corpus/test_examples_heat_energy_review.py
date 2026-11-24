"""Integrity regressions for the separately reviewed eight original examples."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tempfile
import unittest

from tools.corpus_engineering import examples_heat_energy_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical


class HeatEnergyOriginalReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {row['id']: row for row in json.loads((review.APP/'content/C3.json').read_text())
                       if row['id'] in review.READ_SOURCE_SHA256}

    def test_complete_deterministic_review_has_no_approval_or_publication(self):
        report = review.report(self.sources)
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (8, 0, 0))
        self.assertEqual(sum(len(row['checks']) for row in report['records']), 49)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertEqual(row['calculationScope'], 'EXACT_MANUAL_CALCULATION')
            self.assertTrue(row['originalEditionRetained'])
            self.assertTrue(all(claim['ok'] for claim in row['checks']))

    def test_each_changed_original_fails_its_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['prompt'] += ' changed scientific condition'
                records = {row['id']: row for row in review.verify(sources)}
                self.assertFalse(records[key]['ok'])
                self.assertIn('Source differs from independently read original', records[key]['errors'])
                self.assertTrue(all(row['ok'] for other, row in records.items() if other != key))

    def test_each_missing_original_is_rejected(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = dict(self.sources)
                del sources[key]
                with self.assertRaises(ValueError): review.verify(sources)

    def test_each_historical_asset_is_required_byte_exact(self):
        with tempfile.TemporaryDirectory() as home:
            root = Path(home)
            for name in review.READ_ASSETS:
                shutil.copyfile(review.APP/'static/figures'/name, root/name)
            for key, name in review.FIGURE_BY_ID.items():
                with self.subTest(key=key):
                    file = root/name
                    raw = file.read_bytes()
                    for replacement in (None, raw+b'\n'):
                        if replacement is None: file.unlink()
                        else: file.write_bytes(replacement)
                        records = {row['id']: row for row in review.verify(self.sources, root)}
                        self.assertFalse(records[key]['ok'])
                        self.assertIn('Historical scientific figure changed or missing', records[key]['errors'])
                        self.assertTrue(all(row['ok'] for other, row in records.items() if other != key))
                        file.write_bytes(raw)
            self.assertTrue(all(row['ok'] for row in review.verify(self.sources, root)))


if __name__ == '__main__': unittest.main()
