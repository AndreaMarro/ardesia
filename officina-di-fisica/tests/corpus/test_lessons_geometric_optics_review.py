"""Independent exact Snell, ray intersections and thinlens sign domains."""
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

from tools.corpus_engineering import lessons_geometric_optics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class GeometricOpticsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_last_two_original_C5_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C5-L09', 'C5-L10'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 34)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_three_assets_match_actual_git_bytes(self):
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

    def test_real_virtual_and_singular_lens_domains_and_exact_snell(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['actual p3f givesmagnificationminusonehalf']['independentExact'],'-1/2')
        self.assertEqual(checks['actual pfOver2 givesuprightdoubleimage']['independentExact'],'2')
        self.assertEqual(checks['source n1one n2threehalves incidence45 exact transmittedsine']['independentExact'],'sqrt(2)/3')
        self.assertEqual(checks['toy totalinternalreflectionsquaredsine exceedsone']['independentExact'],'1/8')
        # Criticalangle test uses exact squaredsines ratherthan numericalinverse-trig.
        self.assertLess(sp.Rational(4,9),sp.Rational(1,2))
        self.assertGreater(sp.Rational(3,2)**2*sp.Rational(1,2),1)
        f,p=sp.symbols('f p',positive=True)
        q=f*p/(p-f)
        self.assertEqual(sp.limit(q,p,f,dir='+'),sp.oo)
        self.assertEqual(sp.limit(q,p,f,dir='-'),-sp.oo)
        self.assertEqual(q.subs(p,f/3),-f/2)
        self.assertEqual((-q/p).subs(p,f/3),sp.Rational(3,2))
        self.assertFalse(sp.asin(sp.sqrt(2)/3).atoms(sp.Float))
        # The rounded drawing label28deg isnot an exact Snell solution.
        self.assertNotEqual(sp.sin(sp.Rational(28,180)*sp.pi),sp.sqrt(2)/3)

    def test_three_diagrams_match_ray_intersections_and_refraction(self):
        def lines(name):
            return [e.attrib for e in ET.fromstring((review.APP/'static/figures'/name).read_bytes()).iter()
                    if e.tag.endswith('line')]
        def coord(e,k):return sp.Rational(e[k])
        x=sp.Symbol('x')
        def ray(e):
            return coord(e,'y1')+(x-coord(e,'x1'))*(coord(e,'y2')-coord(e,'y1'))/(coord(e,'x2')-coord(e,'x1'))
        real=lines('C5-lente-reale.svg')
        green=next(e for e in real if e.get('stroke')=='#126862' and e['x1']=='320.00')
        red=next(e for e in real if e.get('stroke')=='#a93825' and e['x1']=='320.00')
        xi=sp.solve(sp.Eq(ray(green),ray(red)),x)[0]
        self.assertEqual((xi,ray(green).subs(x,xi)),(sp.Rational('429.5'),158))
        virtual=lines('C5-lente-virtuale.svg')
        back=[e for e in virtual if e.get('stroke-dasharray')=='5 4']
        self.assertEqual(len(back),2)
        xv=sp.solve(sp.Eq(ray(back[0]),ray(back[1])),x)[0]
        self.assertEqual((xv,ray(back[0]).subs(x,xv)),(247,79))
        refracted=next(e for e in lines('C5-rifrazione.svg') if e.get('stroke')=='#a93825')
        dx=coord(refracted,'x2')-coord(refracted,'x1');dy=coord(refracted,'y2')-coord(refracted,'y1')
        self.assertEqual((dx,dy),(54,101))
        self.assertLess(abs(dx**2/(dx**2+dy**2)-sp.Rational(2,9)),sp.Rational(1,1000))
        # Angle is measuredfromtheverticalnormal,notfromhorizontalinterface.
        self.assertLess(dx,dy)


if __name__ == '__main__':
    unittest.main()
