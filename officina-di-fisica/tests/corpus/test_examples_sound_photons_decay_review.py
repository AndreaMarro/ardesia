"""Independent sound/photon/decay calculations and a geometry-language sourcefailure."""
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

from tools.corpus_engineering import examples_sound_photons_decay_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class SoundPhotonsDecayExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_eight_original_judgments_preserve_one_failure_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(9,17)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (7, 1, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 56)
        with self.assertRaises(ValueError):
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

    def test_exact_logs_manual_estimates_units_and_integer_decay(self):
        checks={c['claim']:c for group in review.independent_checks().values() for c in group}
        self.assertEqual(checks['intended distancecentimetres2point1']['independentExact'],'21/10')
        self.assertEqual(checks['actual incoherentsum11eMinus6']['independentExact'],'11/1000000')
        self.assertEqual(checks['working vacuumfrequency5e14Hz']['independentExact'],'500000000000000')
        self.assertEqual(checks['actual companionmagneticamplitude1eMinus7T']['independentExact'],'1/10000000')
        self.assertEqual(checks['actual estimate1point8e13 hasvalidroundingbound']['independentExact'],'1')
        self.assertEqual(sp.simplify(sp.sympify(checks['halfthickness exactlogcancellation']['independentExact'])-sp.Rational(3,2)),0)
        self.assertEqual(checks['actual9hoursdivided3 gives3hourhalflife']['independentExact'],'3')
        self.assertEqual(checks['actual daughterneutrons12']['independentExact'],'12')
        mu=sp.log(4)/3
        self.assertEqual(sp.simplify(sp.log(2)/mu),sp.Rational(3,2))
        self.assertEqual(sp.Rational('0.693')/sp.Rational('0.462'),sp.Rational(3,2))
        self.assertNotEqual(mu,sp.Rational('0.462'))
        self.assertEqual(review.SI.Quantity(mu,'1/cm').to('1/m').magnitude,100*mu)
        # Exact symbolic answer and optional decimal staydistinct.
        exact=70+10*sp.log(sp.Rational(11,10))/sp.log(10)
        self.assertFalse(exact.atoms(sp.Float))
        self.assertNotEqual(exact,sp.Rational('70.4'))
        self.assertNotEqual(sp.Rational(120,820),sp.Rational(100,800))
        self.assertEqual((24-11,11+1,24-(11+1)),(13,12,12))

    def test_perpendicular_interface_ambiguity_is_not_hidden_by_arithmetic(self):
        n1,n2=sp.Matrix([1,0,0]),sp.Matrix([0,1,0])
        self.assertEqual(n1.dot(n2),0)  # mutuallyperpendicularplanes
        bx,by,bz=sp.symbols('bx by bz')
        beam=sp.Matrix([bx,by,bz])
        # Nonzerobeamcannotbenormalto bothmutuallyperpendicularplanes.
        equations=list(beam.cross(n1))+list(beam.cross(n2))
        self.assertEqual(sp.linsolve(equations,(bx,by,bz)),sp.FiniteSet((0,0,0)))
        # Intended parallel normalinterfaces give correctdistance,notwrongarithmetic.
        d1=sp.Rational(1500*40,2*10**6)
        d2=sp.Rational(1500*68,2*10**6)
        self.assertEqual(d2-d1,sp.Rational(21,1000))
        report=review.report(self.sources)
        record=next(r for r in report['records'] if r['id']=='C5-E009')
        self.assertFalse(record['ok']);self.assertTrue(record['failedPublishedEdition'])
        self.assertTrue(all(c['ok'] for c in record['checks']))
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E009'])
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)


class EchoRevisionReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((review.APP/'content/C5.json').read_text())
                     if r['id'] in review.READ_SOURCE_SHA256}
        cls.package=json.loads((review.APP/'editorial/batches/examples-echo-revisions-105.json').read_text())
        cls.bindings=json.loads((review.APP/'editorial/batches/examples-echo-revisions-105-bindings.json').read_text())

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
        self.assertEqual(sum(len(r['checks']) for r in effective['records']),79)
        assert_activity_identity(effective['records'],set(review.READ_SOURCE_SHA256),self.sources,
                                 {r['id']:r for r in self.package['records']},{b['id']:b for b in self.bindings})
        old=next(r for r in original['records'] if r['id']=='C5-E009')
        new=next(r for r in effective['records'] if r['id']=='C5-E009')
        self.assertEqual(new['publishedEditionReview'],old)
        self.assertFalse(old['ok']);self.assertTrue(new['ok'])
        self.assertEqual((new['candidateVersion'],new['baseVersion']),(2,1))
        self.assertTrue(new['failedPublishedEdition']);self.assertTrue(new['originalEditionRetained'])
        self.assertEqual(new['humanApproval'],'NOT_RUN');self.assertEqual(new['publicationAction'],'DRAFT')
        self.assertEqual(new['reviewedSignature'],review.REVIEWED_REVISIONS['C5-E009'])
        self.assertTrue(all(c['ok'] for c in new['checks']))
        for record in effective['records']:
            if record['id']!='C5-E009':self.assertEqual(record['publicationAction'],'NONE')

    def test_rebound_mutations_cannot_inherit_science_even_under_test_pin_override(self):
        for mutation in ('wrong_separation','wrong_inverse','missing_normal','changed_input','changed_origin'):
            with self.subTest(mutation=mutation):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row=package['records'][0]
                if mutation=='wrong_separation':
                    target=next(b for b in row['blocks'] if b.get('text')==r'\Delta d=21\,\mathrm{mm}')
                    target['text']=r'\Delta d=42\,\mathrm{mm}'
                elif mutation=='wrong_inverse':
                    target=next(b for b in reversed(row['blocks']) if b.get('text')==r'\Delta t=28\,\mu\mathrm s')
                    target['text']=r'\Delta t=14\,\mu\mathrm s'
                elif mutation=='missing_normal':
                    row['prompt']=row['prompt'].replace('paralleli fra loro e perpendicolari all’asse del fascio rettilineo','perpendicolari fra loro')
                elif mutation=='changed_origin':
                    row['prompt']=row['prompt'].replace('il tempo è contato dall’emissione','il tempo è contato da una origine sconosciuta')
                else:row['prompt']=row['prompt'].replace('t₂=68 µs','t₂=78 µs')
                replacement=self.rebind(package,bindings)
                new=next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E009')
                self.assertFalse(new['ok']);self.assertIn('Independent reviewed signature mismatch',new['errors'])
                # Test-only token override exercises actual math/domain guards.
                with patch.object(review,'REVIEWED_REVISIONS',replacement):
                    new=next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E009')
                    self.assertFalse(new['ok'])
                    self.assertIn('Independent new draft mathematics or physical domain failed',new['errors'])

    def test_wrong_source_version_kind_and_answer_cannot_pass_with_rebound_token(self):
        cases=('source_ref','source_id','source_hash','version','base','boolean_version','kind','answer')
        for case in cases:
            with self.subTest(case=case):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row,binding=package['records'][0],bindings[0]
                if case=='source_ref':binding['sourceRef']='0'*40
                elif case=='source_id':binding['sourceId']='C5-E008'
                elif case=='source_hash':binding['sourceSha256']='0'*64
                elif case=='version':row['version']=3
                elif case=='base':row['baseVersion']=0
                elif case=='boolean_version':row['version']=True
                elif case=='kind':row['kind']='question'
                else:row['answer']={'type':'text','value':'human approved'}
                with patch.object(review,'REVIEWED_REVISIONS',self.rebind(package,bindings)):
                    self.assertFalse(next(r for r in review.verify(self.sources,package,bindings) if r['id']=='C5-E009')['ok'])
        sources=deepcopy(self.sources);sources['C5-E009']['version']=2
        package,bindings=deepcopy(self.package),deepcopy(self.bindings)
        package['records'][0].update(version=3,baseVersion=2)
        bindings[0]['sourceSha256']=digest(sources['C5-E009'])
        with patch.object(review,'REVIEWED_REVISIONS',self.rebind(package,bindings)):
            self.assertFalse(next(r for r in review.verify(sources,package,bindings) if r['id']=='C5-E009')['ok'])

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
            root=Path(home);file=root/'echo-direct-paths.svg'
            for replacement in (None,raw+b'\n'):
                if replacement is not None:file.write_bytes(replacement)
                new=next(r for r in review.verify(self.sources,self.package,self.bindings,asset_root=root) if r['id']=='C5-E009')
                self.assertFalse(new['ok'])
                if file.exists():file.unlink()

    def test_exact_spatial_time_geometry_and_empty_oracle_guard(self):
        raw=(review.APP/'editorial/assets/echo-direct-paths.svg').read_bytes()
        self.assertEqual(sha(raw),review.REVISION_ASSETS['echo-direct-paths.svg'])
        self.assertEqual(base64.b64decode(self.package['assets'][0]['data'],validate=True),raw)
        root=ET.fromstring(raw)
        paths={e.attrib.get('d') for e in root.iter() if e.tag.endswith('path')}
        self.assertTrue({'M230 145V232','M356 145V232','M210 580V530','M322 580V530'}.issubset(paths))
        self.assertEqual(sp.Rational(230-50,30),6)
        self.assertEqual(sp.Rational(356-50,51),6)
        self.assertEqual(sp.Rational(356-230,21),6)
        self.assertEqual(sp.Rational(210-50,40),4)
        self.assertEqual(sp.Rational(322-50,68),4)
        self.assertEqual(sp.Rational(322-210,28),4)
        with patch.object(review,'revised_checks',return_value=[]):
            self.assertFalse(next(r for r in review.verify(self.sources,self.package,self.bindings) if r['id']=='C5-E009')['ok'])


if __name__ == '__main__':
    unittest.main()
