"""Independent sourcewave solutions and an unresolved prompt-domain counterexample."""
from copy import deepcopy
import base64
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import sympy as sp

from tools.corpus_engineering import examples_mechanical_waves_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class MechanicalWavesExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_judgments_preserve_one_failure_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(1,9)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (7, 1, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 50)
        with self.assertRaises(ValueError):
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

    def test_seven_solutions_exact_and_rounded_values_are_not_conflated(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        expected={'actual omega exact4pi':'4*pi',
                  'actual harmonic accelerationminus0point30':'-3/10',
                  'actual crestadvance inquartersecond is2metres':'2',
                  'constant phase givesnegative5mpersec':'-5',
                  'actual commonhalfside1minusonehalf givesonehalfcm':'1/2',
                  'actual phase3pi ispi modulo2pi':'pi',
                  'workingenergy rounds1point2eMinus5':'1'}
        for claim,want in expected.items():self.assertEqual(checks[claim]['independentExact'],want)
        self.assertEqual(sp.Rational(5,628)*sp.Rational(3,10000)*5,sp.Rational(3,251200))
        self.assertTrue(sp.Rational('0.0000115')<sp.Rational(3,251200)<sp.Rational('0.0000125'))
        self.assertNotEqual(sp.Rational(3,251200),sp.Rational('0.000012'))
        self.assertFalse(sp.sympify(checks['exact collectedenergy3over80000pi']['independentExact']).atoms(sp.Float))

    def test_same_taut_cord_counterexample_stays_linear_but_gives_nine_eighths(self):
        mu=sp.Rational(1,100)
        c1,c2=20,40
        tension1,tension2=mu*c1*c1,mu*c2*c2
        self.assertEqual((tension1,tension2),(4,16))
        self.assertGreater(tension1,0);self.assertGreater(tension2,0)
        A1,A2=sp.Rational(2,1000),sp.Rational(3,1000)
        f1,f2=80,40
        P=lambda c,A,f:mu*c*(2*sp.pi*f)**2*A*A/2
        self.assertEqual(sp.simplify(P(c2,A2,f2)/P(c1,A1,f1)),sp.Rational(9,8))
        self.assertEqual(sp.simplify(P(c1,A2,f2)/P(c1,A1,f1)),sp.Rational(9,16))
        # Even withupperpi22/7, bothslopes arefarbelow0.1;counterexample isnotnonlinear.
        for c,A,f in ((c1,A1,f1),(c2,A2,f2)):
            self.assertLess(A*(2*sp.Rational(22,7)*f/c),sp.Rational(1,10))
        report=review.report(self.sources)
        record=next(r for r in report['records'] if r['id']=='C5-E008')
        self.assertFalse(record['ok'])
        self.assertTrue(all(c['ok'] for c in record['checks']))
        self.assertTrue(record['failedPublishedEdition'])
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E008'])
        self.assertEqual(record['manualFeasibility'],'FAIL_ORIGINAL_EDITION')
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)


class StringPowerRevisionReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((review.APP/'content/C5.json').read_text())
                     if r['id'] in review.READ_SOURCE_SHA256}
        cls.package=json.loads((review.APP/'editorial/batches/examples-string-power-revisions-094.json').read_text())
        cls.bindings=json.loads((review.APP/'editorial/batches/examples-string-power-revisions-094-bindings.json').read_text())

    @staticmethod
    def rebind(package,bindings):
        row=package['records'][0];binding=bindings[0]
        binding['candidateSha256']=digest(row)
        token=digest({'record':row,'assets':binding['assetChecksums'],
                      'source':{'id':binding['sourceId'],'ref':binding['sourceRef'],'sha256':binding['sourceSha256']}})
        return {row['id']:token}

    def test_effective_draft_is_separate_from_failed_historical_edition(self):
        original=review.report(self.sources)
        effective=review.report(self.sources,self.package,self.bindings)
        self.assertEqual((original['acceptedCount'],original['failedCount']),(7,1))
        self.assertEqual((effective['acceptedCount'],effective['failedCount'],effective['draftReviewedCount']),(8,0,1))
        self.assertEqual(sum(len(r['checks']) for r in effective['records']),69)
        assert_activity_identity(effective['records'],set(review.READ_SOURCE_SHA256),self.sources,
                                 {r['id']:r for r in self.package['records']},{b['id']:b for b in self.bindings})
        old=next(r for r in original['records'] if r['id']=='C5-E008')
        new=next(r for r in effective['records'] if r['id']=='C5-E008')
        self.assertEqual(new['publishedEditionReview'],old)
        self.assertFalse(old['ok']);self.assertTrue(new['ok'])
        self.assertEqual((new['candidateVersion'],new['baseVersion']),(2,1))
        self.assertTrue(new['failedPublishedEdition']);self.assertTrue(new['originalEditionRetained'])
        self.assertEqual(new['humanApproval'],'NOT_RUN');self.assertEqual(new['publicationAction'],'DRAFT')
        self.assertEqual(new['reviewedSignature'],review.REVIEWED_REVISIONS['C5-E008'])
        self.assertTrue(all(c['ok'] for c in new['checks']))
        for record in effective['records']:
            if record['id']!='C5-E008':self.assertEqual(record['publicationAction'],'NONE')

    def test_rebound_mutations_cannot_inherit_science_even_under_test_pin_override(self):
        for mutation in ('wrong_power','wrong_inverse','missing_tension','changed_input'):
            with self.subTest(mutation=mutation):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row=package['records'][0]
                if mutation=='wrong_power':
                    target=next(b for b in row['blocks'] if b.get('text')==r'\frac{P_2}{P_1}=\frac9{16}')
                    target['text']=r'\frac{P_2}{P_1}=\frac9{8}'
                elif mutation=='wrong_inverse':
                    target=next(b for b in row['blocks'] if b.get('text')==r'a=\frac{3/4}{1/2}=\frac32')
                    target['text']=r'a=\frac{3/4}{1/2}=\frac23'
                elif mutation=='missing_tension':
                    row['prompt']=row['prompt'].replace('La tensione T è mantenuta allo stesso valore positivo nei due esperimenti: anche la velocità di propagazione v è quindi invariata.',
                                                         'La tensione può cambiare tra gli esperimenti.')
                else:row['prompt']=row['prompt'].replace('f₂=40 Hz','f₂=20 Hz')
                replacement=self.rebind(package,bindings)
                new=next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E008')
                self.assertFalse(new['ok']);self.assertIn('Independent reviewed signature mismatch',new['errors'])
                # TEST ONLY pin override: still not author approval; exercises the
                # independent bounded arithmetic/domain checks ratherthan hash alone.
                with patch.object(review,'REVIEWED_REVISIONS',replacement):
                    new=next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E008')
                    self.assertFalse(new['ok'])
                    self.assertIn('Independent new draft mathematics or physical domain failed',new['errors'])

    def test_wrong_source_version_kind_and_answer_cannot_pass_with_rebound_token(self):
        cases=('source_ref','source_id','source_hash','version','base','boolean_version','kind','answer')
        for case in cases:
            with self.subTest(case=case):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row,binding=package['records'][0],bindings[0]
                if case=='source_ref':binding['sourceRef']='0'*40
                elif case=='source_id':binding['sourceId']='C5-E007'
                elif case=='source_hash':binding['sourceSha256']='0'*64
                elif case=='version':row['version']=3
                elif case=='base':row['baseVersion']=0
                elif case=='boolean_version':row['version']=True
                elif case=='kind':row['kind']='question'
                else:row['answer']={'type':'text','value':'human approved'}
                with patch.object(review,'REVIEWED_REVISIONS',self.rebind(package,bindings)):
                    self.assertFalse(next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E008')['ok'])
        sources=deepcopy(self.sources);sources['C5-E008']['version']=2
        package,bindings=deepcopy(self.package),deepcopy(self.bindings)
        package['records'][0].update(version=3,baseVersion=2)
        bindings[0]['sourceSha256']=digest(sources['C5-E008'])
        with patch.object(review,'REVIEWED_REVISIONS',self.rebind(package,bindings)):
            self.assertFalse(next(r for r in review.verify(sources,package,bindings) if r['id']=='C5-E008')['ok'])

    def test_complete_identity_payload_and_local_asset_bytes_are_required(self):
        for field in ('records','bindings'):
            for replacement in ([],[None,None]):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                if field=='records':package['records']=[] if not replacement else package['records']*2
                else:bindings=[] if not replacement else bindings*2
                with self.assertRaises(ValueError):review.verify(self.sources,package,bindings)
        with self.assertRaises(ValueError):review.verify(self.sources,self.package,None)
        with self.assertRaises(ValueError):review.verify(self.sources,None,self.bindings)
        package=deepcopy(self.package)
        raw=base64.b64decode(package['assets'][0]['data'])
        package['assets'][0]['data']=base64.b64encode(raw+b' changed').decode()
        with self.assertRaises(ValueError):review.verify(self.sources,package,self.bindings)
        package=deepcopy(self.package)
        orphan=b'<svg xmlns="http://www.w3.org/2000/svg"/>'
        package['assets'].append({'id':sha(orphan),'name':'orphan.svg','mime':'image/svg+xml','data':base64.b64encode(orphan).decode()})
        with self.assertRaises(ValueError):review.verify(self.sources,package,self.bindings)
        with tempfile.TemporaryDirectory() as home:
            root=Path(home);file=root/'string-power-factors.svg'
            for replacement in (None,raw+b'\n'):
                if replacement is not None:file.write_bytes(replacement)
                new=next(r for r in review.verify(self.sources,self.package,self.bindings,asset_root=root) if r['id']=='C5-E008')
                self.assertFalse(new['ok'])
                if file.exists():file.unlink()

    def test_exact_bar_geometry_and_empty_oracle_guard(self):
        raw=(review.APP/'editorial/assets/string-power-factors.svg').read_bytes()
        self.assertEqual(sha(raw),review.REVISION_ASSETS['string-power-factors.svg'])
        self.assertEqual(base64.b64decode(self.package['assets'][0]['data'],validate=True),raw)
        root=ET.fromstring(raw)
        bars=[e for e in root.iter() if e.tag.endswith('rect') and e.attrib.get('height')=='40']
        self.assertEqual([sp.Rational(e.attrib['width']) for e in bars],[128,288,72])
        self.assertEqual(sp.Rational(288,128),sp.Rational(9,4))
        self.assertEqual(sp.Rational(72,128),sp.Rational(9,16))
        with patch.object(review,'revised_checks',return_value=[]):
            self.assertFalse(next(r for r in review.verify(self.sources,self.package,self.bindings) if r['id']=='C5-E008')['ok'])


if __name__ == '__main__':
    unittest.main()
