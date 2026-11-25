"""Independent reading ofgraph meanings, heldparameters and cross-context transfer."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp

from tools.corpus_engineering import lessons_representations_transfer_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class RepresentationsTransferLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C6.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_final_two_C6_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C6-L05', 'C6-L06'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 29)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_real_lesson_inventory_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'lesson'},
                         {f'C6-L{i:02}' for i in range(1, 7)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_missing_and_empty_reviews_cannot_inherit_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed electrical condition'
                self.assertFalse(next(r for r in review.verify(sources) if r['id'] == key)['ok'])
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)
            for replacement in ([], [{'ok': False, 'claim': 'failed independent check', 'dimension': {}}]):
                models = review.independent_checks()
                models[key] = replacement
                with patch.object(review, 'independent_checks', return_value=models):
                    self.assertFalse(next(r for r in review.verify(self.sources) if r['id'] == key)['ok'])

    def test_signedarea_gauge_subtraction_and_pressurework_units(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['signed velocityarea givesdisplacement notdistance']['independentExact'],'0')
        self.assertEqual(checks['same motion totaldistance addsabsolute areas']['independentExact'],'4')
        self.assertEqual(checks['kilopascal litre alsojoule']['independentExact'],'2')
        self.assertEqual(checks['toy absolute130kPa minus110kPa gives20kPa']['independentExact'],'20')
        # A changing zero/reference doesnotcancel, in contrasttocommon gauge shift.
        a,b,c1,c2=sp.symbols('a b c1 c2')
        self.assertEqual(sp.expand((b+c2)-(a+c1)),b-a+c2-c1)
        self.assertNotEqual(sp.expand((b+c2)-(a+c1)),b-a)
        with self.assertRaises(review.pint.DimensionalityError):
            review.SI.Quantity(3,'W').to('m/s')
        # No figure or implied labparameter is excusedas a hidden asset.
        self.assertEqual(review.READ_ASSETS,{})
        for row in self.sources.values():
            self.assertFalse(any(b.get('type')=='figure' for b in row['blocks']))

    def test_hypothesis_changes_defeat_naive_transfer_and_fix_limit_parameters(self):
        Q,S=sp.symbols('Q S',positive=True)
        self.assertEqual(sp.simplify((Q/(S/2))/(Q/S)),2)
        self.assertEqual(sp.simplify(((Q-3*Q/4)/(S/2))/(Q/S)),sp.Rational(1,2))
        p,f,P,t,C=sp.symbols('p f P t C',positive=True)
        image=f*p/(p-f)
        self.assertEqual(sp.limit(image,p,sp.oo),f)
        self.assertEqual(sp.limit(P*t/C,P,0),0)
        self.assertEqual((P*t/C).subs(t,1/P),1/C)
        self.assertNotEqual((P*t/C).subs(t,1/P),0)
        # Echo domains retain two-waypath butnot speed when changingmedium.
        self.assertEqual(review.SI.Quantity(300,'m/s')*review.SI.Quantity(2,'ms')/2,
                         review.SI.Quantity(sp.Rational(3,10),'m'))
        self.assertEqual(review.SI.Quantity(300000000,'m/s')*review.SI.Quantity(2,'ns')/2,
                         review.SI.Quantity(sp.Rational(3,10),'m'))


if __name__ == '__main__':
    unittest.main()
