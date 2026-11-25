"""Independent coverage examples, two real source provenances and estimates."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp
from tools.corpus_engineering import examples_coverage_transfer_activity_verifier as review
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.batches import assert_activity_identity


class CoverageTransferReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={}
        for path in review.SOURCE_FILES:
            raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+path],cwd=review.APP)
            for row in json.loads(raw):
                if row['id'] in review.READ_SOURCE_SHA256:cls.sources[row['id']]=row

    def test_seven_actual_examples_have_complete_independent_nonhuman_reviews(self):
        report=review.report(self.sources)
        self.assertEqual(set(self.sources),{'C3-E021','C3-E022','C3-E023','C4-E021','C5-E021','C5-E022','C6-AE01'})
        self.assertEqual(sum(len(r['blocks']) for r in self.sources.values()),41)
        self.assertEqual((report['acceptedCount'],report['failedCount'],report['draftReviewedCount']),(7,0,0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']),70)
        self.assertEqual(report,review.report(self.sources));self.assertEqual(report,json.loads(canonical(report)))
        assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)
        for row in report['records']:
            self.assertTrue(row['ok']);self.assertTrue(row['checks']);self.assertTrue(all(c['ok'] for c in row['checks']))
            self.assertEqual(row['humanApproval'],'NOT_RUN');self.assertEqual(row['publicationAction'],'NONE')
            self.assertFalse(row['failedPublishedEdition']);self.assertTrue(row['originalEditionRetained'])
            self.assertEqual(row['sourcePath'],review.SOURCE_PATH_BY_ID[row['id']])
            self.assertEqual(row['sourceFileSha256'],review.SOURCE_FILES[row['sourcePath']])
            self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION')

    def test_both_sourcefiles_and_seven_assets_are_actual_pinned_git_bytes(self):
        for path,expected in review.SOURCE_FILES.items():
            raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+path],cwd=review.APP)
            self.assertEqual(sha(raw),expected);self.assertEqual((review.APP.parent/path).read_bytes(),raw)
        for key,pin in review.READ_SOURCE_SHA256.items():self.assertEqual(digest(self.sources[key]),pin)
        self.assertEqual(len(review.READ_ASSETS),7)
        for name,pin in review.READ_ASSETS.items():
            raw=subprocess.check_output(['git','show',review.SOURCE_REF+':officina-di-fisica/static/figures/'+name],cwd=review.APP)
            self.assertEqual(sha(raw),pin);self.assertEqual((review.APP/'static/figures'/name).read_bytes(),raw)

    def test_every_source_or_mathematical_review_mutation_rejects(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources=deepcopy(self.sources);sources[key]['prompt']+=' changed model'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok']);self.assertIn('Example differs from independently read original',changed['errors'])
                del sources[key]
                with self.assertRaises(ValueError):review.verify(sources)
                for replacement in ([],[{'claim':'broken oracle','ok':False,'dimension':{}}]):
                    models=review.independent_checks();models[key]=replacement
                    with patch.object(review,'independent_checks',return_value=models):
                        changed=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(changed['ok']);self.assertIn('Independent example mathematics failed',changed['errors'])

    def test_every_missing_changed_figure_or_reference_rejects(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for name in review.READ_ASSETS:(root/name).write_bytes((review.APP/'static/figures'/name).read_bytes())
            for key,names in review.FIGURES_BY_ID.items():
                for name in names:
                    file=root/name;raw=file.read_bytes()
                    for replacement in (None,raw+b'\n'):
                        if replacement is None:file.unlink()
                        else:file.write_bytes(replacement)
                        self.assertFalse(next(r for r in review.verify(self.sources,asset_root=root) if r['id']==key)['ok'])
                        file.write_bytes(raw)
                sources=deepcopy(self.sources);next(b for b in sources[key]['blocks'] if b['type']=='figure')['src']='/figures/wrong.svg'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertIn('Example figures differ from read original',changed['errors'])

    def test_exact_nominal_arithmetic_and_explicit_estimates_are_distinct(self):
        models=review.independent_checks();claims={c['claim']:c for group in models.values() for c in group}
        expected={'actual fixedpressure nominalgain625over26kelvin':'625/26',
                  'actual nominal internalgain3125over52joules':'3125/52',
                  'actual nominal work2075over52joules':'2075/52',
                  'actual netupwardforce2943over5million':'2943/5000000',
                  'nominal emittedpower exact523636407over125million':'523636407/125000000',
                  'nominal netpower exact64366407over125million':'64366407/125000000',
                  'actual magnitude25microtesla':'25',
                  'actualforwardreceiverinterval19milliseconds':'19/1000',
                  'actualbackwardreceiverinterval21milliseconds':'21/1000',
                  'actual equilibriumimmersion16centimetres':'16'}
        for claim,want in expected.items():self.assertEqual(claims[claim]['independentExact'],want)
        self.assertNotEqual(sp.Rational(625,26),sp.Rational('24.0'))
        self.assertNotEqual(sp.Rational(2943,5000000),sp.Rational('0.000589'))
        self.assertIn('Stima',self.sources['C3-E022']['prompt'])
        self.assertIn('simeq',self.sources['C3-E021']['blocks'][2]['text'])
        self.assertIn('simeq',self.sources['C3-E023']['blocks'][2]['text'])
        self.assertEqual(sp.Integer(310)**4,9235210000)
        for group in models.values():
            for c in group:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))

    def test_domains_wavefront_scale_and_counterexamples(self):
        # Same radiationtemperature gives netzero, not zeroemission.
        coeff=sp.Rational(4,5)*sp.Rational(567,10**10)*sp.Rational(1,100)
        self.assertGreater(coeff*300**4,0);self.assertEqual(coeff*(300**4-300**4),0)
        # Swapping current changesdeflectionsign, not totalmagnitude.
        self.assertEqual(sp.Matrix([0,0,1]).cross(sp.Matrix([0,1,0])),sp.Matrix([-1,0,0]))
        self.assertEqual(sp.sqrt(20**2+15**2),25)
        # Actual shared scale25px/m; not a schematic ratio assumption.
        svg=ET.fromstring((review.APP/'static/figures/C5-due-fronti.svg').read_bytes())
        circle=next(e for e in svg.iter() if e.tag.endswith('circle'))
        new=sp.Rational(circle.attrib['cx']);self.assertEqual(new,sp.Rational('293.5'))
        self.assertEqual((new-285)/sp.Rational('.34'),25)
        self.assertEqual((455-new)/sp.Rational('6.46'),25)
        self.assertEqual((new-115)/sp.Rational('7.14'),25)
        # Dopplerconstantforwardinterval assumes receiverforwardforthetwo
        # comparedemissions. It cannot be extended through a passage.
        c,u,T,D=340,17,sp.Rational('.020'),sp.Rational('.1')
        crossedinterval=T+(u*T-D)/c-D/c
        self.assertNotEqual(crossedinterval,sp.Rational('.019'))
        self.assertGreater(crossedinterval,T)
        # Floatingmodel onlywhilepartialimmersion and noaddedwaterinertia.
        h0=sp.Rational('.32')/(1000*sp.Rational('.002'))
        self.assertTrue(0<h0-sp.Rational('.01')<h0+sp.Rational('.01')<sp.Rational('.30'))
        self.assertEqual(sp.simplify(2*sp.pi*sp.sqrt(sp.Rational('.32')/sp.Rational('19.62'))),8*sp.pi/sp.sqrt(981))
        self.assertEqual(sp.sqrt(2*sp.Rational('.32')/sp.Rational('19.62'))/sp.sqrt(sp.Rational('.32')/sp.Rational('19.62')),sp.sqrt(2))
        self.assertEqual(sp.diff(sp.Integer(1000)*sp.Rational('9.81')*sp.Rational('.002')*sp.Symbol('x'),sp.Symbol('x')),sp.Rational('19.62'))

if __name__=='__main__':unittest.main()
