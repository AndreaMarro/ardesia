"""Independent sourcewave solutions and an unresolved prompt-domain counterexample."""
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

from tools.corpus_engineering import examples_mechanical_waves_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MechanicalWavesExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_judgments_preserve_one_failure_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(1,9)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (7, 1, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 50)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_four_assets_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'example'},
                         {f'C5-E{i:03}' for i in range(1,21)})
        for key, checksum in review.READ_SOURCE_SHA256.items():
            self.assertEqual(digest(rows[key]), checksum)
        for name, checksum in review.READ_ASSETS.items():
            self.assertEqual(sha(git('officina-di-fisica/static/figures/'+name)), checksum)

    def test_changed_missing_and_empty_reviews_cannot_inherit_reading(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources = deepcopy(self.sources)
                sources[key]['blocks'][0]['text'] += ' changed electrical condition'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok'])
                self.assertTrue(any('differs from independently read' in error for error in changed['errors']))
                del sources[key]
                with self.assertRaises(ValueError):
                    review.verify(sources)
            for replacement in ([], [{'ok': False, 'claim': 'failed independent check', 'dimension': {}}]):
                models = review.independent_checks()
                models[key] = replacement
                with patch.object(review, 'independent_checks', return_value=models):
                    result=next(r for r in review.verify(self.sources) if r['id']==key)
                    self.assertFalse(result['ok'])
                    self.assertIn('Independent example mathematics failed',result['errors'])

    def test_each_original_figure_requires_exact_bytes(self):
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
                            self.assertFalse(next(r for r in review.verify(self.sources, asset_root=root) if r['id'] == key)['ok'])
                            file.write_bytes(raw)

    def test_seven_solutions_exact_and_rounded_values_are_not_conflated(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        expected={'actual omega exact4pi':'4*pi',
                  'actual harmonic accelerationminus0point30':'-3/10',
                  'actual crestadvance inquartersecond is2metres':'2',
                  'constant phase givesnegative5mpersec':'-5',
                  'actual commonhalfside1minusonehalf givesonehalfcm':'1/2',
                  'actual phase3pi ispi modulo2pi':'pi',
                  'workingenergy rounds1point2eMinus5':'1'}
        for claim,want in expected.items():self.assertEqual(checks[claim]['independentExact'],want)
        self.assertEqual(sp.Rational(5,628)*sp.Rational(3,10000)*5,sp.Rational(3,251200))
        self.assertTrue(sp.Rational('0.0000115')<sp.Rational(3,251200)<sp.Rational('0.0000125'))
        self.assertNotEqual(sp.Rational(3,251200),sp.Rational('0.000012'))
        self.assertFalse(sp.sympify(checks['exact collectedenergy3over80000pi']['independentExact']).atoms(sp.Float))

    def test_same_taut_cord_counterexample_stays_linear_but_gives_nine_eighths(self):
        mu=sp.Rational(1,100)
        c1,c2=20,40
        tension1,tension2=mu*c1*c1,mu*c2*c2
        self.assertEqual((tension1,tension2),(4,16))
        self.assertGreater(tension1,0);self.assertGreater(tension2,0)
        A1,A2=sp.Rational(2,1000),sp.Rational(3,1000)
        f1,f2=80,40
        P=lambda c,A,f:mu*c*(2*sp.pi*f)**2*A*A/2
        self.assertEqual(sp.simplify(P(c2,A2,f2)/P(c1,A1,f1)),sp.Rational(9,8))
        self.assertEqual(sp.simplify(P(c1,A2,f2)/P(c1,A1,f1)),sp.Rational(9,16))
        # Even withupperpi22/7, bothslopes arefarbelow0.1;counterexample isnotnonlinear.
        for c,A,f in ((c1,A1,f1),(c2,A2,f2)):
            self.assertLess(A*(2*sp.Rational(22,7)*f/c),sp.Rational(1,10))
        report=review.report(self.sources)
        record=next(r for r in report['records'] if r['id']=='C5-E008')
        self.assertFalse(record['ok'])
        self.assertTrue(all(c['ok'] for c in record['checks']))
        self.assertTrue(record['failedPublishedEdition'])
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E008'])
        self.assertEqual(record['manualFeasibility'],'FAIL_ORIGINAL_EDITION')
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)


if __name__ == '__main__':
    unittest.main()
