"""Source-bound independent cross-domain calculations, not approval fixtures."""
from copy import deepcopy
import base64
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import examples_cross_domain_activity_verifier as review
from tools.corpus_engineering.pipeline import digest,sha,canonical
from tools.corpus_engineering.batches import assert_activity_identity


class CrossDomainExamplesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.raw=raw
        cls.sources={r['id']:r for r in json.loads(raw) if r.get('id') in review.READ_SOURCE_SHA256}

    def test_real_six_examples_and_known_two_failures_are_not_silent_passes(self):
        report=review.report(self.sources)
        self.assertEqual(set(self.sources),{f'C6-E{i:03}' for i in range(1,7)})
        self.assertEqual(report,review.report(self.sources))
        self.assertEqual(report,json.loads(canonical(report)))
        self.assertEqual((report['acceptedCount'],report['failedCount'],report['draftReviewedCount']),(4,2,0))
        self.assertEqual(report['failedPublishedEditionIds'],['C6-E003','C6-E004'])
        self.assertEqual(sum(len(r['checks']) for r in report['records']),46)
        for row in report['records']:
            self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publicationAction'],'NONE')
            self.assertTrue(row['originalEditionRetained'])
            self.assertEqual(row['ok'],row['id'] not in review.SOURCE_ISSUES)
            failed=[c for c in row['checks'] if not c['ok']]
            self.assertEqual(len(failed),1 if row['id']=='C6-E003' else 0)
        with self.assertRaises(ValueError):
            assert_activity_identity(report['records'],set(review.READ_SOURCE_SHA256),self.sources)

    def test_pins_match_source_and_asset_actual_git_bytes(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256)
        self.assertEqual((review.APP/'content/C6.json').read_bytes(),self.raw)
        self.assertEqual(sum(len(r['blocks']) for r in self.sources.values()),31)
        self.assertEqual({k:digest(r) for k,r in self.sources.items()},review.READ_SOURCE_SHA256)
        for name,expected in review.READ_ASSETS.items():
            raw=subprocess.check_output(['git','show',review.SOURCE_REF+':officina-di-fisica/static/figures/'+name],cwd=review.APP)
            self.assertEqual(sha(raw),expected)
            self.assertEqual((review.APP/'static/figures'/name).read_bytes(),raw)

    def test_each_missing_changed_source_and_empty_failed_model_rejects(self):
        for key in review.READ_SOURCE_SHA256:
            with self.subTest(key=key):
                sources=deepcopy(self.sources);sources[key]['prompt']+=' changed condition'
                changed=next(r for r in review.verify(sources) if r['id']==key)
                self.assertFalse(changed['ok'])
                self.assertIn('Example differs from independently read original',changed['errors'])
                del sources[key]
                with self.assertRaises(ValueError):review.verify(sources)
                for replacement in ([],[{'ok':False,'claim':'failed model','dimension':{}}]):
                    models=review.independent_checks();models[key]=replacement
                    with patch.object(review,'independent_checks',return_value=models):
                        changed=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(changed['ok'])
                        self.assertIn('Independent example mathematics failed',changed['errors'])

    def test_pump_figure_bytes_and_reference_required(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);file=root/'C6-pompa.svg';raw=(review.APP/'static/figures/C6-pompa.svg').read_bytes()
            for replacement in (None,raw+b'\n'):
                if replacement is not None:file.write_bytes(replacement)
                row=next(r for r in review.verify(self.sources,asset_root=root) if r['id']=='C6-E002')
                self.assertFalse(row['ok']);self.assertIn('Historical example figure changed or missing',row['errors'])
            file.write_bytes(raw)
            self.assertTrue(next(r for r in review.verify(self.sources,asset_root=root) if r['id']=='C6-E002')['ok'])
        sources=deepcopy(self.sources);sources['C6-E002']['blocks'][0]['src']='/figures/else.svg'
        row=next(r for r in review.verify(sources) if r['id']=='C6-E002')
        self.assertIn('Example figures differ from read original',row['errors'])

    def test_all_assigned_exact_quantities_units_and_balances(self):
        groups=review.independent_checks()
        claims={c['claim']:c for checks in groups.values() for c in checks}
        for key,want in {'actual one-way signal speed2e8':'200000000',
                         'actual doublepath echo6nanoseconds':'6',
                         'actual usefulpotential energy24joules':'24',
                         'actual dimensionless efficiency one third':'1/3',
                         'independent temperatureincrease6over7kelvin':'6/7',
                         'intended combined ratio3over20':'3/20',
                         'actual positive gaswork60joules':'60',
                         'actual firstlaw gain25joules':'25',
                         'actual temperatureincrease onehalfkelvin':'1/2'}.items():
            self.assertEqual(claims[key]['independentExact'],want)
        self.assertEqual(claims['actual Joule power2watt']['dimension'],{'[mass]':'1','[length]':'2','[time]':'-3'})
        self.assertEqual(claims['actual dimensionless efficiency one third']['dimension'],{})
        self.assertEqual(claims['actual firstlaw gain25joules']['dimension'],{'[mass]':'1','[length]':'2','[time]':'-2'})
        for checks in groups.values():
            for c in checks:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))

    def test_false_equality_and_detector_counterexample_are_distinct(self):
        exact=sp.Rational(180,210);printed=sp.Rational('0.86')
        self.assertEqual(exact,sp.Rational(6,7));self.assertNotEqual(exact,printed)
        self.assertEqual(exact-printed,-sp.Rational(1,350))
        self.assertTrue(sp.Rational('.855')<exact<sp.Rational('.865'))
        original=self.sources['C6-E003']
        self.assertFalse(any('arrotond' in b.get('text','').casefold() or 'simeq' in b.get('text','') or 'approx' in b.get('text','') for b in original['blocks']))
        # Projected-area detector satisfies source distances/filter, unless the
        # solution-only unchanged orientation is also made a prompt condition.
        intensityratio=sp.Rational(3,5)*sp.Rational(1,2)**2
        self.assertEqual(intensityratio,sp.Rational(3,20))
        rotated=intensityratio*sp.cos(sp.pi/3)
        self.assertEqual(rotated,sp.Rational(3,40));self.assertNotEqual(rotated,intensityratio)
        self.assertNotIn('orientazione',self.sources['C6-E004']['prompt'])
        self.assertIn('orientazione',self.sources['C6-E004']['blocks'][0]['text'])
        records=review.verify(self.sources)
        self.assertFalse(next(r for r in records if r['id']=='C6-E003')['ok'])
        self.assertFalse(next(r for r in records if r['id']=='C6-E004')['ok'])

class CrossDomainRevisionReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['id']:r for r in json.loads((review.APP/'content/C6.json').read_text()) if r['id'] in review.READ_SOURCE_SHA256}
        cls.package=json.loads((review.APP/'editorial/batches/examples-cross-domain-revisions-117.json').read_text())
        cls.bindings=json.loads((review.APP/'editorial/batches/examples-cross-domain-revisions-117-bindings.json').read_text())

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
        self.assertEqual((old['acceptedCount'],old['failedCount']),(4,2))
        self.assertEqual((new['acceptedCount'],new['failedCount'],new['draftReviewedCount']),(6,0,2))
        self.assertEqual(sum(len(r['checks']) for r in new['records']),92)
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

    def test_wrong_results_and_domains_fail_even_after_test_only_token_override(self):
        cases=[(0,'gain'),(0,'inverse'),(0,'input'),(0,'phase'),(1,'ratio'),(1,'inverse'),(1,'offset'),(1,'orientation')]
        for index,case in cases:
            with self.subTest(index=index,case=case):
                p,b=deepcopy(self.package),deepcopy(self.bindings);row=p['records'][index];key=row['id']
                if index==0:
                    if case=='input':row['prompt']=row['prompt'].replace('i=1/2 A','i=1 A')
                    elif case=='phase':row['prompt']=row['prompt'].replace('senza cambiamenti di stato o altro apporto energetico','con cambiamento di stato')
                    else:
                        before,after=(r'\Delta T=\frac{180}{210}\,\mathrm K=\frac67\,\mathrm K',r'\Delta T=\frac{180}{210}\,\mathrm K=\frac{86}{100}\,\mathrm K') if case=='gain' else (r'\Delta t=\frac{180}{3/2}\,\mathrm s=180\cdot\frac23\,\mathrm s=120\,\mathrm s',r'\Delta t=60\,\mathrm s')
                        target=next(a for a in row['blocks'] if a.get('text','').strip()==before);target['text']=after
                else:
                    if case=='offset':row['prompt']=row['prompt'].replace('senza saturazione né fondo additivo','con un fondo additivo')
                    elif case=='orientation':row['prompt']=row['prompt'].replace('mantiene area e orientazione normale al raggio','ruota orientazione di60gradi')
                    else:
                        before,after=(r'\frac{S_2}{S_1}=\frac3{20}=\frac{15}{100}',r'\frac{S_2}{S_1}=\frac14') if case=='ratio' else (r'\frac{r_2}{r_1}=\sqrt{\frac{3/5}{3/20}}=\sqrt4=2',r'\frac{r_2}{r_1}=3')
                        target=next(a for a in row['blocks'] if a.get('text','').strip()==before);target['text']=after
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
                    elif case=='id':binding['sourceId']='C6-E001'
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

    def test_exact_models_and_actual_bar_scales(self):
        for row in self.package['records']:
            checks=review.revised_checks(row,review.APP/'editorial/assets')
            self.assertTrue(all(c['ok'] for c in checks))
            self.assertFalse(any(sp.sympify(c['independentExact']).atoms(sp.Float) for c in checks))
        self.assertEqual(sp.Rational(180,210),sp.Rational(6,7))
        self.assertNotEqual(sp.Rational(6,7),sp.Rational('0.86'))
        self.assertEqual(sp.Rational(3,5)*sp.Rational(1,2)**2,sp.Rational(3,20))
        self.assertEqual(sp.sqrt(sp.Rational(3,5)/sp.Rational(3,20)),2)
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)
            for row in self.package['records']:
                name=next(iter(review.REVISION_ASSETS[row['id']]))
                raw=(review.APP/'editorial/assets'/name).read_text()
                if row['id']=='C6-E003':raw=raw.replace('width="180"','width="240"')
                else:raw=raw.replace('width="48"','width="80"')
                (root/name).write_text(raw)
                self.assertTrue(any(not c['ok'] for c in review.revised_checks(row,root)))


if __name__=='__main__':unittest.main()
