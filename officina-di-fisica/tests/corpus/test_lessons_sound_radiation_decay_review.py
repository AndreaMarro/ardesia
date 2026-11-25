"""Independent sound, photon, attenuation and stochastic-decay review."""
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

from tools.corpus_engineering import lessons_sound_radiation_decay_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class SoundRadiationDecayLessonReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_original_radiation_lessons_are_reviewed_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {'C5-L05', 'C5-L06', 'C5-L07', 'C5-L08'})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (4, 0, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 54)
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

    def test_exact_manual_fractions_and_instrument_counterexamples(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['source tenfold intensity raises10dB']['independentExact'],'10')
        self.assertEqual(checks['source25percent transmitted leaves75percent absorbed onlynootherloss']['independentExact'],'3/4')
        self.assertEqual(checks['inversecm mustconvert beforemultiplyingmeters']['independentExact'],'600')
        self.assertEqual(checks['toy detector efficiencyquarter activity80 plusbackground3 gives23countspersec']['independentExact'],'23')
        self.assertEqual(checks['toy backgroundsubtraction efficiencyrecovers80Bq']['independentExact'],'80')
        # Four source photons vs one carrydifferent totalenergy, notdifferent hf.
        h,f=sp.symbols('h f',positive=True)
        self.assertEqual((4*h*f)/4,h*f)
        # 1/s hazard over2s isnotprobability2, and half life isnotexactwaitingtime.
        self.assertTrue(0 < 1-sp.exp(-2) < 1)
        self.assertNotEqual(1-sp.exp(-2),2)
        probability_exactly_half=sp.binomial(4,2)*sp.Rational(1,2)**4
        self.assertEqual(probability_exactly_half,sp.Rational(3,8))
        self.assertLess(probability_exactly_half,1)
        # Same speed magnitude, opposite source direction changes Doppler sign.
        self.assertGreater(sp.Rational(23,23-13),1)
        self.assertLess(sp.Rational(23,23+13),1)

    def test_five_diagrams_match_doppler_poynting_halflayers_and_expectations(self):
        def elements(name,tag):
            return [e.attrib for e in ET.fromstring((review.APP/'static/figures'/name).read_bytes()).iter()
                    if e.tag.endswith(tag)]
        fronts=[e for e in elements('C5-doppler.svg','circle') if e['fill']=='none']
        self.assertEqual([(int(float(e['cx'])),int(e['r'])) for e in fronts],[(330,92),(343,69),(356,46),(369,23)])
        right=[int(float(e['cx']))+int(e['r']) for e in fronts]
        left=[int(float(e['cx']))-int(e['r']) for e in fronts]
        self.assertEqual([right[i]-right[i+1] for i in range(3)],[10]*3)
        self.assertEqual([left[i+1]-left[i] for i in range(3)],[36]*3)
        fields=[e for e in elements('C5-campi.svg','line') if 'marker-end' in e]
        self.assertEqual([(int(float(e['x2']))-int(float(e['x1'])),int(float(e['y2']))-int(float(e['y1']))) for e in fields],[(0,-104),(172,0)])
        layerpoints=elements('C5-attenuazione.svg','circle')
        self.assertEqual([sp.Rational(e['cx']) for e in layerpoints],[80,193,306,419])
        self.assertEqual([(191-sp.Rational(e['cy']))/148 for e in layerpoints],[1,sp.Rational(1,2),sp.Rational(1,4),sp.Rational(1,8)])
        dots=elements('C5-emivita.svg','circle')
        counts=[sum(int(bool(lo<=sp.Rational(e['cx'])<hi)) for e in dots) for lo,hi in [(42,195),(243,396),(444,597)]]
        self.assertEqual(counts,[32,16,8])
        spectrum=ET.fromstring((review.APP/'static/figures/C5-spettro.svg').read_bytes())
        labels=[e.text for e in spectrum.iter() if e.tag.endswith('text')]
        self.assertEqual(labels[2:],['radio','microonde','IR','visibile','UV','X','γ'])


if __name__ == '__main__':
    unittest.main()
