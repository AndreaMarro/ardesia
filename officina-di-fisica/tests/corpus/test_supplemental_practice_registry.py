"""Unreviewed supplements and protected exam records stay outside practice."""
import json
import tempfile
import unittest
from pathlib import Path

from tools.corpus_engineering.batches import load_registry, reviewed_supplemental_practice
from tools.corpus_engineering.pipeline import canonical, digest, sha


class SupplementalPracticeRegistryTests(unittest.TestCase):
    def setUp(self):
        self.app = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.folder = self.app / 'editorial/supplemental/fixture-practice'
        self.folder.mkdir(parents=True)
        self.candidate = {'id': 'SUP-1', 'kind': 'question', 'version': 1, 'baseVersion': 0,
                          'skill': 'fixture-lesson', 'family': 'fixture-transfer'}
        self.package = {'schema': 'astra/1', 'records': [self.candidate], 'assets': []}
        self.build_fixture()

    def build_fixture(self):
        package_bytes = canonical(self.package).encode()
        self.review = {'schemaVersion': '1.0.0', 'packageSha256': sha(package_bytes),
                       'author': 'fixture-author', 'independentReviewer': 'fixture-reviewer',
                       'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
                       'records': [{'id': 'SUP-1', 'candidateSha256': digest(self.candidate), 'ok': True,
                                    'manualArithmetic': 'Fixture only', 'pedagogicalReview': 'Fixture only'}]}
        (self.folder / 'package.json').write_bytes(package_bytes)
        self.item = {'id': 'fixture-practice', 'questionIds': ['SUP-1'], 'packageSha256': sha(package_bytes)}
        self.save_review()

    def save_review(self):
        review_bytes = canonical(self.review).encode()
        (self.folder / 'independent-review.json').write_bytes(review_bytes)
        self.item['reviewSha256'] = sha(review_bytes)

    def test_supplemental_records_do_not_extend_source_registry(self):
        source = {'id': 'original', 'questionIds': ['SRC-1'], 'verifier': 'fixture_verifier'}
        registry = {'schemaVersion': '1.0.0', 'batches': [source], 'supplementalPractice': [self.item]}
        file = self.app / 'fixture-registry.json'
        file.write_text(json.dumps(registry))
        self.assertEqual(load_registry(file), [source])
        self.assertEqual(reviewed_supplemental_practice(registry, self.app)['fixture-practice']['ids'], {'SUP-1'})
        source['questionIds'] = ['SUP-1']
        file.write_text(json.dumps(registry))
        with self.assertRaisesRegex(ValueError, 'Duplicate supplemental'):
            load_registry(file)

    def test_rehashed_exam_flag_cannot_enter_practice(self):
        self.candidate['exam'] = 1
        self.build_fixture()
        with self.assertRaisesRegex(ValueError, 'Invalid individual'):
            reviewed_supplemental_practice({'supplementalPractice': [self.item]}, self.app)

    def test_author_signoff_does_not_satisfy_distinct_review(self):
        self.review['independentReviewer'] = self.review['author']
        self.save_review()
        with self.assertRaisesRegex(ValueError, 'distinct reviewed draft'):
            reviewed_supplemental_practice({'supplementalPractice': [self.item]}, self.app)
