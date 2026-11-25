"""Independent classical magnetic and Faraday/Lenz domain counterexamples."""
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

from tools.corpus_engineering import lessons_magnetism_induction_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MagnetismInductionLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C4.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_last_two_C4_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C4-L09', 'C4-L10'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 36)
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
        self.assertEqual({r['id'] for r in json.loads(raw) if r['kind'] == 'lesson'},
                         {f'C4-L{i:02}' for i in range(1, 11)})
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

    def test_vector_orientation_speed_and_induction_counterexamples(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['outgoing wire current gives upward field at right']['independentExact'],'1')
        self.assertEqual(checks['reversed wire current reverses field']['independentExact'],'-1')
        self.assertEqual(checks['average emf toy3turns flux2to8 in2s']['independentExact'],'-9')
        self.assertEqual(checks['nonlinear flux average differs from terminalinstantaneous']['independentExact'],'-2')
        self.assertEqual(checks['same nonlinear flux endpoint emf isminus4']['independentExact'],'-4')
        # Generic vector sample (not just axis-aligned choices) independently conserves speed.
        for q in (-2,3):
            for v,b in [(sp.Matrix([1,2,3]),sp.Matrix([4,-2,1])),(sp.Matrix([-3,1,2]),sp.Matrix([2,5,-4]))]:
                force=q*v.cross(b)
                self.assertEqual(force.dot(v),0)
                self.assertEqual(force.dot(b),0)
                self.assertNotEqual(force,sp.zeros(3,1))
        # Fullspeed5/transverse3 in a helical toy orbit: using5 overestimatesradius.
        self.assertEqual(sp.sqrt(3**2+4**2),5)
        self.assertNotEqual(sp.Rational(2*3,1*2),sp.Rational(2*5,1*2))
        # Initial RL current cannot be inferred from nonzero emf dividedbyR.
        t=sp.Symbol('t',real=True)
        current=3*(1-sp.exp(-2*t))
        self.assertEqual(current.subs(t,0),0)
        self.assertEqual(sp.limit(current,t,sp.oo),3)
        self.assertEqual(sp.diff(current,t)/2+current,3)

    def test_diagram_arrows_and_normal_angle_are_physical_not_decorative(self):
        def elements(name,tag):
            return [e.attrib for e in ET.fromstring((review.APP/'static/figures'/name).read_bytes()).iter()
                    if e.tag.endswith(tag)]
        wire=[e for e in elements('C4-filo-b.svg','line') if 'marker-end' in e]
        self.assertEqual(len(wire),1)
        self.assertEqual((wire[0]['x1'],wire[0]['x2']),('370','370'))
        self.assertLess(int(wire[0]['y2']),int(wire[0]['y1']))
        orbit=[e for e in elements('C4-orbita.svg','line') if 'marker-end' in e]
        self.assertEqual([(int(e['x2'])-int(e['x1']),int(e['y2'])-int(e['y1'])) for e in orbit],[(88,0),(0,-43)])
        self.assertIn({'cx':'279','cy':'110','r':'66'},
                      [{k:e[k] for k in ('cx','cy','r')} for e in elements('C4-orbita.svg','circle')])
        normal=[e for e in elements('C4-flusso.svg','line') if 'marker-end' in e][0]
        self.assertEqual(normal['x1'],normal['x2'])
        # SVG y points down; onrightside bottom-to-top arc withsweep0 is CCW physically.
        arcs=[e for e in elements('C4-lenz.svg','path') if 'marker-end' in e]
        self.assertEqual([e['d'] for e in arcs],['M375 147 A72 72 0 0 0 373 81'])


if __name__ == '__main__':
    unittest.main()
