"""Independent solutions ofsix numerical/two qualitative electrostatics examples."""
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

from tools.corpus_engineering import examples_electrostatics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class ElectrostaticsExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C4.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_examples_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C4-E{i:03}' for i in range(1,9)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (8, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 48)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_five_assets_match_actual_git_bytes(self):
        git = lambda path: subprocess.check_output(['git', 'show', review.SOURCE_REF+':'+path], cwd=review.APP)
        raw = git(review.SOURCE_PATH)
        self.assertEqual(sha(raw), review.SOURCE_FILE_SHA256)
        rows = {r['id']: r for r in json.loads(raw)}
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'example'},
                         {f'C4-E{i:03}' for i in range(1,21)})
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

    def test_actual_numeric_results_and_qualitative_physics_are_distinguished(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        expected={'left positivecharge attractedright':'3/50000',
                  'equalcharge symmetry solves conservedtotal':'3',
                  'actual sourcefieldsum is1800right':'1800',
                  'actual verticaldisplacementonefifth':'1/5',
                  'actual negativecharge potentialenergychange':'-60',
                  'actual threeunorderedpairs energy':'27/100000000'}
        for claim,result in expected.items():
            self.assertEqual(checks[claim]['independentExact'],result)
        records={r['id']:r for r in review.verify(self.sources)}
        for key in ('C4-E007','C4-E008'):
            self.assertEqual(records[key]['calculationScope'],'NO_STUDENT_CALCULATION')
            self.assertTrue(records[key]['checks'])
            self.assertTrue(all(c['scope']=='independent_physical_derivation_no_assigned_numeric_calculation' for c in records[key]['checks']))
        for index in range(1,7):
            self.assertEqual(records[f'C4-E{index:03}']['calculationScope'],'EXACT_MANUAL_CALCULATION')
        # No sourcewrong-key dependency: independent point-force/sign/scaling checks.
        k,q1,q2,r=sp.symbols('k q1 q2 r',positive=True)
        force=k*q1*q2/r**2
        self.assertEqual(force.subs(r,2*r),force/4)
        self.assertEqual(force.subs(q2,-q2),-force)
        self.assertEqual(sp.simplify(force.subs(q1,2*q1)/force),2)
        # Threepointcharges have3unorderedpairs,not6orderedpairs.
        pairs={(a,b) for a in range(3) for b in range(a+1,3)}
        self.assertEqual(len(pairs),3)

    def test_operation_order_and_nonuniform_force_have_counterexamples(self):
        C,phi=sp.symbols('C phi',positive=True)
        qground=-C*phi
        self.assertTrue(qground.is_negative)
        self.assertEqual(qground.subs(phi,0),0)
        self.assertNotEqual(qground,0)
        # Same neutrality can coexistwithnonzero force orwithzero force.
        a,d,q,K=sp.symbols('a d q K',positive=True)
        near=-q*K/(d-a)**2;far=q*K/(d+a)**2
        actual=sp.factor(near+far)
        expected=-4*q*K*d*a/(d*d-a*a)**2
        self.assertEqual(sp.simplify(actual-expected),0)
        self.assertEqual(actual.subs({q:1,K:1,d:3,a:1}),-sp.Rational(3,16))
        self.assertEqual(-q*5+q*5,0)
        self.assertEqual(sp.Matrix([2,0,0]).cross(sp.Matrix([0,3,0])),sp.Matrix([0,0,6]))
        # Electrostaticfieldwork inE004 independently matcheskineticgain.
        mass=sp.Rational(2,10**6)
        self.assertEqual(mass*(13-9)/2,sp.Rational(4,10**6))

    def test_five_diagrams_preserve_applicationpoints_directions_and_comparisons(self):
        def marked(name):
            return [e.attrib for e in ET.fromstring((review.APP/'static/figures'/name).read_bytes()).iter()
                    if e.tag.endswith('line') and 'marker-end' in e.attrib]
        coulomb=marked('C4-coulomb.svg')
        self.assertEqual([int(e['x2'])-int(e['x1']) for e in coulomb],[106,-106])
        self.assertNotEqual(coulomb[0]['x1'],coulomb[1]['x1'])
        dipole=marked('C4-dipolo.svg')
        self.assertEqual([int(e['x2'])-int(e['x1']) for e in dipole],[77,77])
        ground=marked('C4-induzione-terra.svg')[0]
        self.assertEqual((ground['x1'],ground['x2']),('184','184'))
        self.assertLess(int(ground['y2']),int(ground['y1']))
        induced=marked('C4-dipolo-indotto.svg')
        self.assertEqual([int(e['x2'])-int(e['x1']) for e in induced],[-96,53])
        self.assertGreater(96,53)
        material=marked('C4-materiali.svg')
        self.assertGreater(int(material[0]['x2']),int(material[0]['x1']))


if __name__ == '__main__':
    unittest.main()
