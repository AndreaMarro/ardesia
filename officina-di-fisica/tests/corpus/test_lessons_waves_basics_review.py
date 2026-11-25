"""Independent wave models, actual manual examples, figures and immutable sources."""
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

from tools.corpus_engineering import lessons_waves_basics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class WavesBasicsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_original_wave_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C5-L01', 'C5-L02', 'C5-L03', 'C5-L04'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 58)
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
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'lesson'},
                         {f'C5-L{i:02}' for i in range(1, 11)})
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

    def test_actual_source_arithmetic_and_wave_constraint_counterexamples(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['peaktopeak4cm means amplitude2cm']['independentExact'],'2')
        self.assertEqual(checks['sourcegraph periodonehalfsecond gives2Hz']['independentExact'],'2')
        self.assertEqual(checks['sourcepulse2cm plusnegative1cm equals1cm']['independentExact'],'1')
        self.assertEqual(checks['source6Jin3s gives2W']['independentExact'],'2')
        self.assertEqual(checks['doubledradius givesquarterintensity']['independentExact'],'1/4')
        self.assertEqual(checks['doubling amplitude atfixedfrequency quadruplespower']['independentExact'],'4')
        # Equal amplitude alone permits maxima, ordinary sums or cancellation.
        for delta,expected in [(0,4),(sp.pi/2,2),(sp.pi,0)]:
            self.assertEqual(sp.simplify(2+2*sp.cos(delta)),expected)
        # Same position but opposite velocity at center is only half an oscillation.
        t=sp.Symbol('t',real=True)
        y=sp.sin(4*sp.pi*t)
        self.assertEqual(y.subs(t,0),y.subs(t,sp.Rational(1,4)))
        self.assertEqual(sp.diff(y,t).subs(t,0),-sp.diff(y,t).subs(t,sp.Rational(1,4)))
        # Samefrequency implies a differentwavelength when mediumspeedchanges.
        self.assertEqual(sp.Rational(8,2),4)
        self.assertEqual(sp.Rational(12,2),6)
        # Actualarea, seconds and cm-to-m units are not interchangeable.
        self.assertEqual(review.SI.Quantity(2,'cm').to('m').magnitude,sp.Rational(1,50))

    def test_five_figures_have_consistent_temporal_spatial_and_vertical_scales(self):
        def elements(name,tag):
            return [e.attrib for e in ET.fromstring((review.APP/'static/figures'/name).read_bytes()).iter()
                    if e.tag.endswith(tag)]
        def points(name):
            return [[tuple(sp.Rational(z) for z in pair.split(',')) for pair in e['points'].split()]
                    for e in elements(name,'polyline')]
        time=points('C5-orologio.svg')[0]
        # Halfperiod95px, fullperiod190px; y is sampled to0.01px precision.
        ys=dict(time)
        self.assertEqual(ys[84],ys[274])
        self.assertEqual(ys[179],ys[369])
        self.assertLess(ys[130],ys[129])
        self.assertGreater(ys[225],ys[224])
        space=dict(points('C5-istantanea.svg')[0])
        for crest in (119,295,471):
            self.assertEqual(space[crest],84)
        pulses=points('C5-somma.svg')
        self.assertEqual(len(pulses),3)
        for (xa,ya),(xb,yb),(xc,yc) in zip(*pulses):
            self.assertEqual((xa,xb),(xc,xc))
            self.assertEqual((52-ya)+(119-yb),199-yc)
        radii=sorted(sp.Rational(e['r']) for e in elements('C5-sfere.svg','circle') if e['fill']=='none')
        self.assertEqual(radii,[49,98])
        layers=[sp.Rational(e['x1']) for e in elements('C5-suono.svg','line') if e['y1']=='86.00']
        self.assertGreater(layers[17]-layers[16],layers[1]-layers[0])
        self.assertEqual(layers[33]-layers[0],sp.Rational('252.45'))


if __name__ == '__main__':
    unittest.main()
