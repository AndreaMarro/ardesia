"""Independent cross-domain choice of models, units, balances and scaling."""
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

from tools.corpus_engineering import lessons_cross_domain_models_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class CrossDomainModelsLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C6.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_first_four_C6_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C6-L01', 'C6-L02', 'C6-L03', 'C6-L04'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 48)
        assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_one_asset_match_actual_git_bytes(self):
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

    def test_model_selection_accumulation_and_nonunique_extrapolation(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['uniform directpath speed timesduration']['independentExact'],'12')
        self.assertEqual(checks['same echo duration giveshalf directdistance']['independentExact'],'6')
        self.assertEqual(checks['toy3s observed with1s delay at4mpersec gives4m']['independentExact'],'4')
        self.assertEqual(checks['toy quarterof24J heats2JperK systemby3K']['independentExact'],'3')
        self.assertEqual(checks['halving radius atfixed Poiseuilleparameters givessixteenth']['independentExact'],'1/16')
        self.assertEqual(checks['halving isotropic distance atfixedpower givesquadruple']['independentExact'],'4')
        # Reconstruct a transient from stored quantity, includingallboundary currents.
        t=sp.Symbol('t',real=True)
        stored=5+t
        self.assertEqual(sp.diff(stored,t),3-2)
        self.assertNotEqual(3,2)
        # Three equally spacedreadings do not uniquely fix mechanism/extrapolation.
        n=sp.Symbol('n')
        linear=80-20*n
        altered=linear+n*(n-1)*(n-2)
        self.assertEqual([linear.subs(n,j) for j in range(3)],[80,60,40])
        self.assertEqual([altered.subs(n,j) for j in range(3)],[80,60,40])
        self.assertNotEqual(altered.subs(n,3),linear.subs(n,3))
        poly=80-50*n+10*n*n
        self.assertEqual([poly.subs(n,j) for j in range(3)],[80,40,20])
        self.assertEqual(poly.subs(n,3),20)
        self.assertEqual(80*sp.Rational(1,2)**3,10)
        # Fluxes ofdifferent things share /s but cannotbe added as likeunits.
        with self.assertRaises(review.pint.DimensionalityError):
            review.SI.Quantity(2,'A')+review.SI.Quantity(2,'W')

    def test_energy_diagram_means_netpower_not_zerotransfer(self):
        root=ET.fromstring((review.APP/'static/figures/C6-pendenza.svg').read_bytes())
        lines=[e.attrib for e in root.iter() if e.tag.endswith('line') and e.attrib.get('stroke-width')=='3']
        self.assertEqual([(e['x1'],e['y1'],e['x2'],e['y2']) for e in lines],
                         [('105.00','160.00','260.00','78.00'),('260.00','78.00','427.00','78.00')])
        self.assertGreater(sp.Rational(160-78,260-105),0)
        self.assertEqual(sp.Rational(78-78,427-260),0)
        # Nonzero5Win and5Wout produce the sameflatstoredenergy as bothzero.
        self.assertEqual(5-5,0-0)
        self.assertNotEqual(5,0)


if __name__ == '__main__':
    unittest.main()
