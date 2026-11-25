"""Independent exact resistor/capacitor calculations, dimensions and energybalances."""
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

from tools.corpus_engineering import examples_circuits_capacitors_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class CircuitsCapacitorsExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C4.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_examples_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C4-E{i:03}' for i in range(9,17)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (8, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 57)
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

    def test_all_eight_actual_numeric_solutions_and_energy_constraints(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        wants={'VversusI slope is200ohm':'200',
               'actualarea halfsquaremillimetre':'1/2',
               'actual totalpower0point270W':'27/100',
               'actual equivalentresistance40ohm':'40',
               'actual fieldenergy50microjoule':'50',
               'actual finalenergy48microJ':'48',
               'actual firstvoltage8V':'8',
               'actual removedfieldenergy54microJ':'54'}
        for claim,want in wants.items():
            self.assertEqual(checks[claim]['independentExact'],want)
        for row in review.verify(self.sources):
            self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')
        self.assertEqual(review.SI.Quantity(1,'mm^2').to('m^2').magnitude,sp.Rational(1,10**6))
        self.assertNotEqual(review.SI.Quantity(1,'mm^2').to('m^2').magnitude,sp.Rational(1,1000))
        # Source-connected vs isolated dielectric insertion aredifferentproblems.
        self.assertEqual(sp.Rational(24**2,2*6),48)
        self.assertEqual(sp.Rational(6*12**2,2),432)
        self.assertNotEqual(48,432)

    def test_positive_resistance_bounds_middle_charge_and_joining_losses(self):
        for r1,r2 in ((1,2),(3,7),(60,120)):
            rp=sp.Rational(r1*r2,r1+r2)
            self.assertLess(rp,min(r1,r2))
            self.assertGreater(r1+r2,max(r1,r2))
        vm=sp.Symbol('Vm')
        neutral=sp.solve(sp.Eq(3*(vm-12)+6*vm,0),vm)[0]
        charged=sp.solve(sp.Eq(3*(vm-12)+6*vm,1),vm)[0]
        self.assertEqual(neutral,4)
        self.assertEqual(charged,sp.Rational(37,9))
        self.assertEqual(3*(12-neutral),6*neutral)
        self.assertNotEqual(3*(12-charged),6*charged)
        # Actual isolated joining preserves nodechargebutnotfieldenergy.
        vf=sp.Rational(2*9+4*0,2+4)
        initial=sp.Rational(2*9**2,2)
        final=sp.Rational((2+4)*vf**2,2)
        self.assertEqual((2+4)*vf,18)
        self.assertEqual((initial,final,initial-final),(81,27,54))
        self.assertGreater(initial,final)
        # Equal initialvoltages wouldinsteadpermit zerofieldenergyloss.
        self.assertEqual(sp.Rational(2*4,2*(2+4))*(3-3)**2,0)


if __name__ == '__main__':
    unittest.main()
