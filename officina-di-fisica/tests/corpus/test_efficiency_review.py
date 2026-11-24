"""Independent reviewer regressions, including wrong answers after test-only retoken."""
from copy import deepcopy
import json
import tempfile
import unittest
from unittest.mock import patch
from tools.corpus_engineering import efficiency_verifier as v
from tools.corpus_engineering.pipeline import canonical,digest

BATCH='efficiency-053'

class EfficiencyReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package=json.loads((v.APP/'editorial/batches'/(BATCH+'.json')).read_text())
        cls.bindings=json.loads((v.APP/'editorial/batches'/(BATCH+'-bindings.json')).read_text())

    def retoken(self,package,bindings,key):
        row=next(r for r in package['records'] if r['id']==key)
        binding=next(b for b in bindings if b['id']==key)
        binding['candidateSha256']=digest(row)
        return digest({'record':row,'assets':binding['assetChecksums'],
            'source':{'id':binding['sourceId'],'ref':binding['sourceRef'],'sha256':binding['sourceSha256']}})

    def test_fresh_exact_review_is_deterministic_and_has_no_human_approval(self):
        report=v.report(self.package,self.bindings)
        self.assertEqual(report,v.report(self.package,self.bindings))
        self.assertEqual(report,json.loads(canonical(report)))
        self.assertEqual(len(report['records']),16)
        for row in report['records']:
            self.assertTrue(row['ok'],row['errors'])
            self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publication'],'DRAFT')
            self.assertIn(row['verificationMode'],('EXACT_ORACLE','AI_CONCEPTUAL'))

    def test_all_sixteen_wrong_answers_fail_even_after_rebinding_and_test_only_retoken(self):
        for original in self.package['records']:
            key=original['id']
            with self.subTest(id=key):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                row=next(r for r in package['records'] if r['id']==key)
                answer=row['answer']
                if answer['type']=='numeric':answer['value']+=1
                else:answer['value']=next(value for value in answer['options'] if value!=answer['value'])
                token=self.retoken(package,bindings,key)
                with patch.dict(v.REVIEWED_CANDIDATES,{key:token}):
                    result=next(r for r in v.verify(package,bindings) if r['id']==key)
                self.assertFalse(result['ok'])
                self.assertNotIn('Independent reviewed signature mismatch',result['errors'])
                self.assertTrue(any('Independent' in error for error in result['errors']),result['errors'])

    def test_all_sixteen_rebound_statement_changes_require_new_independent_reading(self):
        for original in self.package['records']:
            key=original['id']
            with self.subTest(id=key):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                next(r for r in package['records'] if r['id']==key)['prompt']+=' changed physical condition'
                self.retoken(package,bindings,key)
                result=next(r for r in v.verify(package,bindings) if r['id']==key)
                self.assertFalse(result['ok'])
                self.assertIn('Independent reviewed signature mismatch',result['errors'])

    def test_empty_partial_and_duplicate_batches_cannot_be_silent_passes(self):
        for records,bindings in [([],[]),(self.package['records'][:-1],self.bindings[:-1]),
                (self.package['records']+[self.package['records'][0]],self.bindings+[self.bindings[0]])]:
            package=deepcopy(self.package);package['records']=records
            with self.assertRaises(ValueError):v.verify(package,bindings)

    def test_source_and_version_guards_survive_test_only_retoken(self):
        key=self.package['records'][0]['id']
        for field in ('sourceSha256','sourceRef','version'):
            with self.subTest(field=field):
                package,bindings=deepcopy(self.package),deepcopy(self.bindings)
                if field=='version':package['records'][0]['version']=2
                else:bindings[0][field]='0'*(40 if field=='sourceRef' else 64)
                token=self.retoken(package,bindings,key)
                with patch.dict(v.REVIEWED_CANDIDATES,{key:token}):
                    result=next(r for r in v.verify(package,bindings) if r['id']==key)
                self.assertFalse(result['ok'])
                self.assertNotIn('Independent reviewed signature mismatch',result['errors'])

    def test_watt_and_joule_per_second_are_duplicate_unit_distractors(self):
        package,bindings=deepcopy(self.package),deepcopy(self.bindings)
        row=package['records'][1];key=row['id']
        options=row['answer']['options']
        options[options.index('N')]='J/s'
        token=self.retoken(package,bindings,key)
        with patch.dict(v.REVIEWED_CANDIDATES,{key:token}):
            result=next(r for r in v.verify(package,bindings) if r['id']==key)
        self.assertFalse(result['ok'])
        self.assertIn('Equivalent unit distractors require editorial review',result['errors'])
        self.assertNotIn('Independent reviewed signature mismatch',result['errors'])

    def test_missing_local_figure_and_corrupt_upload_are_rejected(self):
        with tempfile.TemporaryDirectory() as home:
            rows=v.verify(self.package,self.bindings,asset_root=home)
            failed=[r for r in rows if not r['ok']]
            self.assertEqual([r['id'] for r in failed],[self.package['records'][2]['id']])
            self.assertIn('Reviewed asset changed or missing',failed[0]['errors'])
        package=deepcopy(self.package);package['assets'][0]['data']='d3JvbmcgYXNzZXQ='
        with self.assertRaises(ValueError):v.verify(package,self.bindings)

if __name__=='__main__':unittest.main()
