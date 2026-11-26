"""Independent 168 candidate identity, exact options and adversarial figures."""
import base64
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering import heating_with_losses_verifier as m
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.review_contract import reviewed_rows


class HeatingWithLossesReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.package=json.loads((m.APP/f'editorial/batches/{m.BATCH}.json').read_bytes())
        cls.bindings=json.loads((m.APP/f'editorial/batches/{m.BATCH}-bindings.json').read_bytes())

    def rebound(self,package,bindings):
        by_id={r['id']:r for r in package['records']}
        for binding in bindings:binding['candidateSha256']=digest(by_id[binding['id']])

    def deliberately_replace_reading_guards(self,package,bindings,asset_root=None,asset_sha=None):
        root=asset_root or m.APP/'editorial/assets'
        tokens={r['id']:s for r,b,s,a,e in reviewed_rows(package,bindings,{},m.EXPECTED_IDS,root)}
        kwargs={'REVIEWED_PACKAGE_SHA256':digest(package),'REVIEWED_BINDINGS_SHA256':digest(bindings)}
        if asset_sha is not None:kwargs['REVIEWED_ASSET_SHA256']=asset_sha
        with patch.dict(m.REVIEWED_CANDIDATES,tokens,clear=True),patch.multiple(m,**kwargs):
            return m.verify(package,bindings,root)

    def test_fresh_saved_complete_identity_and_distinct_primary(self):
        fresh=m.report(self.package,self.bindings)
        saved=json.loads((m.APP/f'editorial/reviews/{m.BATCH}.json').read_bytes())
        self.assertEqual(fresh,saved)
        assert_record_identity(fresh['records'],m.EXPECTED_IDS,self.package,self.bindings)
        self.assertEqual(len(fresh['records']),16)
        self.assertEqual(sha((m.APP/m.PRIMARY_PATH).read_bytes()),m.PRIMARY_SHA256)
        self.assertEqual(fresh['oracleSha256'],sha(Path(m.physics.__file__).read_bytes()))
        self.assertTrue(all(r['humanApproval']=='NOT_RUN' and r['publication']=='DRAFT' for r in fresh['records']))

    def test_all_sixteen_wrong_keys_fail_independent_math_after_rebinding_every_guard(self):
        for index in range(16):
            p,b=deepcopy(self.package),deepcopy(self.bindings);answer=p['records'][index]['answer']
            if answer['type']=='numeric':answer['value']+=1
            else:answer['value']=next(x for x in answer['options'] if x!=answer['value'])
            self.rebound(p,b);rows=self.deliberately_replace_reading_guards(p,b)
            with self.subTest(id=p['records'][index]['id']):
                self.assertFalse(rows[index]['ok'])
                self.assertIn('Independent energy-balance answer or unit mismatch',rows[index]['errors'])

    def test_correct_choice_is_not_inferred_from_original_option_position(self):
        p,b=deepcopy(self.package),deepcopy(self.bindings)
        for row in p['records']:
            if row['answer']['type']=='choice':row['answer']['options'].reverse()
        self.rebound(p,b)
        self.assertTrue(all(row['ok'] for row in self.deliberately_replace_reading_guards(p,b)))

    def test_unread_explanation_cannot_inherit_a_correct_numeric_key(self):
        p,b=deepcopy(self.package),deepcopy(self.bindings)
        p['records'][0]['blocks'].append({'type':'text','text':'La dispersione si somma all’ingresso e accelera sempre il riscaldamento.'})
        self.rebound(p,b);row=m.verify(p,b)[0]
        self.assertFalse(row['ok']);self.assertIn('Independent reviewed signature mismatch',row['errors'])
        self.assertEqual(row['manualArithmetic'],m.MANUAL[0])

    def test_wrong_dimension_and_duplicate_compatible_units_are_rejected(self):
        p,b=deepcopy(self.package),deepcopy(self.bindings);p['records'][0]['answer']['unit']='kg';self.rebound(p,b)
        self.assertIn('Independent energy-balance answer or unit mismatch',self.deliberately_replace_reading_guards(p,b)[0]['errors'])
        p,b=deepcopy(self.package),deepcopy(self.bindings)
        p['records'][1]['answer']['options'][1]='ms';self.rebound(p,b)
        self.assertFalse(self.deliberately_replace_reading_guards(p,b)[1]['ok'])

    def test_original_source_and_actual_competency_mapping_cannot_be_rebound(self):
        for mode in ('source','competency'):
            p,b=deepcopy(self.package),deepcopy(self.bindings)
            if mode=='source':b[0]['sourceSha256']='0'*64
            else:p['records'][0]['skill']='C3-L10';self.rebound(p,b)
            rows=self.deliberately_replace_reading_guards(p,b)
            self.assertFalse(rows[0]['ok'])
            self.assertTrue(any('source or provenance' in e or 'competency' in e for e in rows[0]['errors']))

    def test_wrong_physical_bar_and_unreadable_zero_fail_even_with_all_hashes_replaced(self):
        raw=(m.APP/'editorial/assets'/m.ASSET_NAME).read_bytes()
        changes=[(b'width="300"',b'width="250"'),(b'x="76" y="350"',b'x="96" y="350"')]
        for before,after in changes:
            self.assertIn(before,raw);wrong=raw.replace(before,after,1);checksum=sha(wrong)
            p,b=deepcopy(self.package),deepcopy(self.bindings)
            self.assertEqual(len(p['assets']),1)
            p['assets'][0]['id']=checksum;p['assets'][0]['data']=base64.b64encode(wrong).decode()
            for row,binding in zip(p['records'],b):
                if binding.get('assetChecksums'):
                    binding['assetChecksums'][m.ASSET_NAME]=checksum
                    for block in row['blocks']:
                        if block['type']=='figure':block['src']='/asset/'+checksum
            self.rebound(p,b)
            with tempfile.TemporaryDirectory() as directory:
                root=Path(directory);(root/m.ASSET_NAME).write_bytes(wrong)
                rows=self.deliberately_replace_reading_guards(p,b,root,checksum)
            for number in (1,12):
                self.assertFalse(rows[number-1]['ok'])
                self.assertIn('Independent physical figure scale or readable origin check failed',rows[number-1]['errors'])

    def test_helper_dependency_change_invalidates_saved_evidence_without_changing_keys(self):
        saved=m.report(self.package,self.bindings)
        with tempfile.TemporaryDirectory() as directory:
            helper=Path(directory)/'oracle.py';helper.write_text('# different reviewed mathematical implementation\n')
            with patch.object(m.physics,'__file__',str(helper)):
                fresh=m.report(self.package,self.bindings)
        self.assertNotEqual(saved['records'],fresh['records'])
        self.assertTrue(all(r['ok'] for r in fresh['records']))
        self.assertTrue(all(a['candidateSha256']==b['candidateSha256'] for a,b in zip(saved['records'],fresh['records'])))

    def test_partial_batches_unknown_symbolic_options_and_unbounded_arithmetic_fail_closed(self):
        p,b=deepcopy(self.package),deepcopy(self.bindings);p['records'].pop()
        with self.assertRaises(ValueError):m.verify(p,b)
        for text in ['__import__("os")','2**100000000','(1).__class__','r(4)','1/0']:
            with self.subTest(text=text),self.assertRaises((ValueError,SyntaxError)):m.literal(text)
        p,b=deepcopy(self.package),deepcopy(self.bindings);p['records'][2]['answer']['options'][1]='t = arbitrary(E)';self.rebound(p,b)
        self.assertFalse(self.deliberately_replace_reading_guards(p,b)[2]['ok'])


if __name__=='__main__':unittest.main()
