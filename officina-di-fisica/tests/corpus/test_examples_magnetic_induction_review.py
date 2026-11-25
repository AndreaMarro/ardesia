"""Independent protonradius, wireforce and Faraday/Lenz exact models."""
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

from tools.corpus_engineering import examples_magnetic_induction_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MagneticInductionExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C4.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_final_C4_examples_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C4-E{i:03}' for i in range(17,21)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 29)
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

    def test_actual_finite_manual_division_rounding_and_coil_units(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['actual exact radius167Over8000m']['independentExact'],'167/8000')
        self.assertEqual(checks['actual exact centimetres167Over80']['independentExact'],'167/80')
        self.assertEqual(sp.Rational(167,80),2+sp.Rational(7,80))
        self.assertEqual(sp.Rational(7,80),sp.Rational('0.0875'))
        self.assertTrue(sp.Rational('2.05')<sp.Rational(167,80)<sp.Rational('2.15'))
        self.assertNotEqual(sp.Rational(167,80),sp.Rational('2.1'))
        self.assertEqual(checks['actual wireforcemagnitude0point040N']['independentExact'],'1/25')
        self.assertEqual(checks['actual meanemfmagnitudeonefifthvolt']['independentExact'],'1/5')
        self.assertEqual(review.SI.Quantity(5,'cm^2').to('m^2').magnitude,sp.Rational(1,2000))
        self.assertEqual(review.SI.Quantity(20,'ms').to('s').magnitude,sp.Rational(1,50))
        records={r['id']:r for r in review.verify(self.sources)}
        self.assertEqual(records['C4-E017']['sourceVersion'],2)
        self.assertEqual(records['C4-E019']['sourceVersion'],2)
        self.assertEqual(records['C4-E020']['calculationScope'],'NO_STUDENT_CALCULATION')
        self.assertTrue(records['C4-E020']['checks'])
        for key in ('C4-E017','C4-E018','C4-E019'):
            self.assertEqual(records[key]['calculationScope'],'EXACT_MANUAL_CALCULATION')

    def test_lenz_direction_doesnot_claim_arbitrary_stored_current_vanishes(self):
        t=sp.Symbol('t',positive=True)
        flux=-2+t  # outward normal; incomingfieldweakens while0<t<2
        self.assertEqual(-sp.diff(flux,t),-1)
        self.assertLess(-sp.diff(flux,t),0)  # positiveCCW convention -> clockwise
        stored=-sp.exp(-t)
        self.assertEqual(sp.diff(stored,t)+stored,0)
        self.assertNotEqual(stored,0)  # forcingzero, but existinginductorcurrent nonzero
        # Clockwise arc isactuallyrightside top-to-bottom withthe correctSVG sweep.
        root=ET.fromstring((review.APP/'static/figures/C4-lenz-decrescente.svg').read_bytes())
        arcs=[e.attrib['d'] for e in root.iter() if e.tag.endswith('path') and 'marker-end' in e.attrib]
        self.assertEqual(arcs,['M367 83 A72 72 0 0 1 369 150'])
        # Outgoingwireforce isrightcurrent crossupfield.
        self.assertEqual(sp.Matrix([1,0,0]).cross(sp.Matrix([0,1,0])),sp.Matrix([0,0,1]))


if __name__ == '__main__':
    unittest.main()
