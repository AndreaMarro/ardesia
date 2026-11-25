"""Independent sound/photon/decay calculations and a geometry-language sourcefailure."""
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

from tools.corpus_engineering import examples_sound_photons_decay_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class SoundPhotonsDecayExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_judgments_preserve_one_failure_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(9,17)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (7, 1, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 56)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_two_assets_match_actual_git_bytes(self):
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

    def test_exact_logs_manual_estimates_units_and_integer_decay(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['intended distancecentimetres2point1']['independentExact'],'21/10')
        self.assertEqual(checks['actual incoherentsum11eMinus6']['independentExact'],'11/1000000')
        self.assertEqual(checks['working vacuumfrequency5e14Hz']['independentExact'],'500000000000000')
        self.assertEqual(checks['actual companionmagneticamplitude1eMinus7T']['independentExact'],'1/10000000')
        self.assertEqual(checks['actual estimate1point8e13 hasvalidroundingbound']['independentExact'],'1')
        self.assertEqual(sp.simplify(sp.sympify(checks['halfthickness exactlogcancellation']['independentExact'])-sp.Rational(3,2)),0)
        self.assertEqual(checks['actual9hoursdivided3 gives3hourhalflife']['independentExact'],'3')
        self.assertEqual(checks['actual daughterneutrons12']['independentExact'],'12')
        mu=sp.log(4)/3
        self.assertEqual(sp.simplify(sp.log(2)/mu),sp.Rational(3,2))
        self.assertEqual(sp.Rational('0.693')/sp.Rational('0.462'),sp.Rational(3,2))
        self.assertNotEqual(mu,sp.Rational('0.462'))
        self.assertEqual(review.SI.Quantity(mu,'1/cm').to('1/m').magnitude,100*mu)
        # Exact symbolic answer and optional decimal staydistinct.
        exact=70+10*sp.log(sp.Rational(11,10))/sp.log(10)
        self.assertFalse(exact.atoms(sp.Float))
        self.assertNotEqual(exact,sp.Rational('70.4'))
        self.assertNotEqual(sp.Rational(120,820),sp.Rational(100,800))
        self.assertEqual((24-11,11+1,24-(11+1)),(13,12,12))

    def test_perpendicular_interface_ambiguity_is_not_hidden_by_arithmetic(self):
        n1,n2=sp.Matrix([1,0,0]),sp.Matrix([0,1,0])
        self.assertEqual(n1.dot(n2),0)  # mutuallyperpendicularplanes
        bx,by,bz=sp.symbols('bx by bz')
        beam=sp.Matrix([bx,by,bz])
        # Nonzerobeamcannotbenormalto bothmutuallyperpendicularplanes.
        equations=list(beam.cross(n1))+list(beam.cross(n2))
        self.assertEqual(sp.linsolve(equations,(bx,by,bz)),sp.FiniteSet((0,0,0)))
        # Intended parallel normalinterfaces give correctdistance,notwrongarithmetic.
        d1=sp.Rational(1500*40,2*10**6)
        d2=sp.Rational(1500*68,2*10**6)
        self.assertEqual(d2-d1,sp.Rational(21,1000))
        report=review.report(self.sources)
        record=next(r for r in report['records'] if r['id']=='C5-E009')
        self.assertFalse(record['ok']);self.assertTrue(record['failedPublishedEdition'])
        self.assertTrue(all(c['ok'] for c in record['checks']))
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E009'])
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)


if __name__ == '__main__':
    unittest.main()
