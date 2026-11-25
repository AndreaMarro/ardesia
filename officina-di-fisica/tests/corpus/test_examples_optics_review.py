"""Independent geometricoptics originaljudgments with two sourceprecision findings."""
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

from tools.corpus_engineering import examples_optics_activity_verifier as review
from tools.corpus_engineering.batches import assert_activity_identity
from tools.corpus_engineering.pipeline import canonical, digest, sha


class OpticsExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = {r['id']: r for r in json.loads((review.APP/'content/C5.json').read_text())
                       if r['id'] in review.READ_SOURCE_SHA256}

    def test_four_original_judgments_preserve_two_failures_without_publication(self):
        report = review.report(self.sources)
        self.assertEqual(set(self.sources), {f'C5-E{i:03}' for i in range(17,21)})
        self.assertEqual(report, review.report(self.sources))
        self.assertEqual(report, json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'], report['failedCount'], report['draftReviewedCount']), (2, 2, 0))
        self.assertEqual(sum(len(r['checks']) for r in report['records']), 29)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'], set(review.READ_SOURCE_SHA256), self.sources)
        for row in report['records']:
            self.assertTrue(row['checks'])
            self.assertEqual(all(c['ok'] for c in row['checks']),row['id'] not in review.SOURCE_ISSUES)
            self.assertEqual(row['humanApproval'], 'NOT_RUN')
            self.assertEqual(row['publicationAction'], 'NONE')
            self.assertTrue(row['originalEditionRetained'])

    def test_source_and_three_assets_match_actual_git_bytes(self):
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
                            changed=next(r for r in review.verify(self.sources,asset_root=root) if r['id']==key)
                            self.assertFalse(changed['ok'])
                            self.assertIn('Historical example figure changed or missing',changed['errors'])
                            file.write_bytes(raw)

    def test_two_failures_are_different_exact_chain_and_optional_rounding(self):
        records={r['id']:r for r in review.verify(self.sources)}
        checkmap=lambda key:{c['claim']:c for c in records[key]['checks']}
        bad17=checkmap('C5-E017')['source exactthetaequalsasinrounded471 wouldrequirezerosquaredsinegap']
        self.assertFalse(bad17['ok'])
        self.assertEqual(sp.Rational(bad17['residual']),sp.Rational(3431,9000000))
        self.assertGreater(sp.Rational(2,9)-sp.Rational(471,1000)**2,0)
        checks18=checkmap('C5-E018')
        self.assertTrue(checks18['actual40deg transmittedangle above58point65']['ok'])
        self.assertTrue(checks18['actual40deg transmittedangle below58point75']['ok'])
        self.assertTrue(checks18['critical48point8 nearesttenth valid']['ok'])
        self.assertFalse(checks18['source58point8 nearesttenth wouldrequireangleatleast58point75']['ok'])
        self.assertTrue(checks18['independent directround58point7 interval holds']['ok'])
        report=review.report(self.sources)
        self.assertEqual(report['failedPublishedEditionIds'],['C5-E017','C5-E018'])
        for key in ('C5-E017','C5-E018'):
            self.assertTrue(records[key]['failedPublishedEdition'])
            self.assertEqual(records[key]['manualFeasibility'],'FAIL_ORIGINAL_EDITION')

    def test_valid_lenses_and_physical_classification_are_retained(self):
        groups=review.independent_checks()
        get=lambda key,claim:next(c for c in groups[key] if c['claim']==claim)
        self.assertEqual(get('C5-E019','actual realimage distance15cm')['independentExact'],'15')
        self.assertEqual(get('C5-E019','actual imageheightnegative1point5cm')['independentExact'],'-3/2')
        self.assertEqual(get('C5-E020','actual virtualimage distance minus12cm')['independentExact'],'-12')
        self.assertEqual(get('C5-E020','actual uprightmagnificationplus2')['independentExact'],'2')
        self.assertTrue(get('C5-E018','40degree Snell upperbound belowone')['ok'])
        self.assertTrue(get('C5-E018','55degree Snell lowerbound aboveone')['ok'])
        q=lambda f,p:sp.Rational(f*p,p-f)
        self.assertEqual((q(10,30),-q(10,30)/30*3),(15,-sp.Rational(3,2)))
        self.assertEqual((q(12,6),-q(12,6)/6),(-12,2))
        self.assertFalse(sp.asin(sp.sqrt(2)/3).atoms(sp.Float))



class RefractionRevisionReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((review.APP/'content/C5.json').read_text()) if r['id'] in review.READ_SOURCE_SHA256}
        cls.package=json.loads((review.APP/'editorial/batches/examples-refraction-revisions-106.json').read_text())
        cls.bindings=json.loads((review.APP/'editorial/batches/examples-refraction-revisions-106-bindings.json').read_text())

    @staticmethod
    def rebind(package,bindings):
        byid={b['id']:b for b in bindings};tokens={}
        for row in package['records']:
            binding=byid[row['id']];binding['candidateSha256']=digest(row)
            tokens[row['id']]=digest({'record':row,'assets':binding['assetChecksums'],'source':{
                'id':binding['sourceId'],'ref':binding['sourceRef'],'sha256':binding['sourceSha256']}})
        return tokens

    def test_two_drafts_keep_two_distinct_failed_originals(self):
        old=review.report(self.sources);new=review.report(self.sources,self.package,self.bindings)
        self.assertEqual((old['acceptedCount'],old['failedCount']),(2,2))
        self.assertEqual((new['acceptedCount'],new['failedCount'],new['draftReviewedCount']),(4,0,2))
        self.assertEqual(sum(len(r['checks']) for r in new['records']),76)
        self.assertEqual(new,review.report(self.sources,self.package,self.bindings))
        assert_activity_identity(new['records'],set(review.READ_SOURCE_SHA256),self.sources,
            {r['id']:r for r in self.package['records']},{b['id']:b for b in self.bindings})
        for r in new['records']:
            self.assertTrue(r['ok']);self.assertTrue(all(c['ok'] for c in r['checks']))
            self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertTrue(r['originalEditionRetained'])
            if r['id'] in review.REVISION_IDS:
                self.assertEqual((r['candidateVersion'],r['baseVersion']),(2,1))
                self.assertEqual(r['publicationAction'],'DRAFT');self.assertTrue(r['failedPublishedEdition'])
                self.assertEqual(r['publishedEditionReview'],next(a for a in old['records'] if a['id']==r['id']))
                self.assertFalse(r['publishedEditionReview']['ok'])
            else:self.assertEqual(r['publicationAction'],'NONE')

    def test_wrong_sines_inverse_and_domains_fail_even_after_test_only_token_override(self):
        cases=[(0,'sine'),(0,'arcsin'),(0,'inverse'),(0,'input'),(1,'sine'),(1,'critical'),(1,'arcsin'),(1,'inverse'),(1,'input')]
        for index,case in cases:
            with self.subTest(index=index,case=case):
                p,b=deepcopy(self.package),deepcopy(self.bindings);row=p['records'][index];key=row['id']
                if index==0:
                    if case=='input':row['prompt']=row['prompt'].replace('n₂=3/2','n₂=2')
                    else:
                        lookup={'sine':(r'\sin\theta_2=\frac{\sqrt2}{3}',r'\sin\theta_2=\frac{\sqrt2}{2}'),
                                'arcsin':(r'\theta_2=\arcsin\!\left(\frac{\sqrt2}{3}\right)',r'\theta_2=\arcsin\!\left(\frac12\right)'),
                                'inverse':(r'n_2=\frac32',r'n_2=\frac23')}
                        before,after=lookup[case];target=next(a for a in row['blocks'] if a.get('text','').strip()==before);target['text']=after
                else:
                    if case=='input':row['prompt']=row['prompt'].replace('n₁=4/3','n₁=3/4')
                    else:
                        lookup={'sine':(r'\sin\theta_{2,A}=\frac23',r'\sin\theta_{2,A}=\frac34'),
                                'critical':(r'\sin\theta_c=\frac34',r'\sin\theta_c=\frac43'),
                                'inverse':(r'\frac1{3/4}=\frac43',r'\frac1{3/4}=\frac34'),
                                'arcsin':(r'\theta_c=\arcsin\!\left(\frac34\right)',r'\theta_c=\arcsin\!\left(\frac12\right)')}
                        before,after=lookup[case];target=next(a for a in row['blocks'] if a.get('text','').strip()==before);target['text']=after
                tokens=self.rebind(p,b)
                result=next(r for r in review.verify(self.sources,p,b) if r['id']==key)
                self.assertFalse(result['ok']);self.assertIn('Independent reviewed signature mismatch',result['errors'])
                with patch.object(review,'REVIEWED_REVISIONS',tokens):
                    result=next(r for r in review.verify(self.sources,p,b) if r['id']==key)
                    self.assertFalse(result['ok']);self.assertIn('Independent new draft mathematics or physical domain failed',result['errors'])

    def test_wrong_provenance_identity_versions_kind_or_answer_cannot_pass(self):
        for index in (0,1):
            for case in ('ref','id','hash','version','base','boolean','kind','answer'):
                with self.subTest(index=index,case=case):
                    p,b=deepcopy(self.package),deepcopy(self.bindings);row=p['records'][index];binding=b[index]
                    if case=='ref':binding['sourceRef']='0'*40
                    elif case=='id':binding['sourceId']='C5-E001'
                    elif case=='hash':binding['sourceSha256']='0'*64
                    elif case=='version':row['version']=3
                    elif case=='base':row['baseVersion']=0
                    elif case=='boolean':row['version']=True
                    elif case=='kind':row['kind']='question'
                    else:row['answer']={'type':'text','value':'not an example'}
                    with patch.object(review,'REVIEWED_REVISIONS',self.rebind(p,b)):
                        self.assertFalse(next(r for r in review.verify(self.sources,p,b) if r['id']==row['id'])['ok'])
            sources=deepcopy(self.sources);key=self.package['records'][index]['id'];sources[key]['version']=2
            p,b=deepcopy(self.package),deepcopy(self.bindings);p['records'][index].update(version=3,baseVersion=2);b[index]['sourceSha256']=digest(sources[key])
            with patch.object(review,'REVIEWED_REVISIONS',self.rebind(p,b)):
                self.assertFalse(next(r for r in review.verify(sources,p,b) if r['id']==key)['ok'])

    def test_payload_asset_completeness_and_reading_required(self):
        for field in ('records','bindings'):
            for duplicate in (False,True):
                p,b=deepcopy(self.package),deepcopy(self.bindings)
                if field=='records':p['records']=p['records'][:1]*2 if duplicate else []
                else:b=b[:1]*2 if duplicate else []
                with self.assertRaises(ValueError):review.verify(self.sources,p,b)
        with self.assertRaises(ValueError):review.verify(self.sources,self.package,None)
        with self.assertRaises(ValueError):review.verify(self.sources,None,self.bindings)
        for index in (0,1):
            p=deepcopy(self.package);raw=base64.b64decode(p['assets'][index]['data']);p['assets'][index]['data']=base64.b64encode(raw+b' changed').decode()
            with self.assertRaises(ValueError):review.verify(self.sources,p,self.bindings)
        p=deepcopy(self.package);raw=b'<svg xmlns="http://www.w3.org/2000/svg"/>'
        p['assets'].append({'id':sha(raw),'name':'orphan.svg','mime':'image/svg+xml','data':base64.b64encode(raw).decode()})
        with self.assertRaises(ValueError):review.verify(self.sources,p,self.bindings)
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for mapping in review.REVISION_ASSETS.values():
                for name in mapping:shutil.copyfile(review.APP/'editorial/assets'/name,root/name)
            for key,mapping in review.REVISION_ASSETS.items():
                name=next(iter(mapping));file=root/name;raw=file.read_bytes()
                for replacement in (None,raw+b'\n'):
                    if replacement is None:file.unlink()
                    else:file.write_bytes(replacement)
                    self.assertFalse(next(r for r in review.verify(self.sources,self.package,self.bindings,asset_root=root) if r['id']==key)['ok'])
                    file.write_bytes(raw)
        for key in review.REVISION_IDS:
            original=review.revised_checks
            def empty(row,root):return [] if row['id']==key else original(row,root)
            with patch.object(review,'revised_checks',side_effect=empty):
                self.assertFalse(next(r for r in review.verify(self.sources,self.package,self.bindings) if r['id']==key)['ok'])

    def test_exact_models_and_distinct_native_diagram_geometry(self):
        for row in self.package['records']:
            checks=review.revised_checks(row,review.APP/'editorial/assets')
            self.assertTrue(all(c['ok'] for c in checks))
            self.assertFalse(any(sp.sympify(c['independentExact']).atoms(sp.Float) for c in checks))
        self.assertEqual(sp.sin(sp.pi/4)/sp.Rational(3,2),sp.sqrt(2)/3)
        self.assertLess(sp.Rational(2,9),sp.Rational(1,4))
        self.assertTrue(sp.Rational(1,2)<sp.Rational(9,16)<sp.Rational(3,4))
        self.assertTrue(sp.Rational(1,4)<sp.Rational(4,9)<sp.Rational(1,2))
        self.assertGreater((sp.Rational(4,3)*sp.sin(sp.pi/3))**2,1)
        # Geometric check independently notices an erroneously reversed ray,
        # even without considering the separate cryptographic asset guard.
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for row in self.package['records']:
                name=next(iter(review.REVISION_ASSETS[row['id']]))
                raw=(review.APP/'editorial/assets'/name).read_text()
                if row['id']=='C5-E017':raw=raw.replace('L424.852814 478.745079','L424.852814 161.254921')
                else:raw=raw.replace('L453.333333 720.928802','L453.333333 1019.071198')
                (root/name).write_text(raw)
                self.assertTrue(any(not c['ok'] for c in review.revised_checks(row,root)))


if __name__ == '__main__':unittest.main()
