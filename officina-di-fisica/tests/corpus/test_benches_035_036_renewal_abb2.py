from pathlib import Path
import copy,json,tempfile,unittest,os
from unittest.mock import patch
from tools.corpus_engineering import bench_mechanics_fluids_renewal_abb2_verifier as a
from tools.corpus_engineering import bench_fields_optics_renewal_abb2_verifier as b
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_activity_identity
from renewal_runtime_abb2 import immutable_runtime
class ActualWholeBenchRenewals(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.context=immutable_runtime('0184b146513e024d99ce8391fb0a5f4892f79e7e');cls.app=cls.context.__enter__();cls.addClassCleanup(cls.context.__exit__,None,None,None);cls.all={row['id']:row for row in json.loads((cls.app/'content/banchi.json').read_bytes())}
 def sources(self,module):return{k:self.all[k]for k in module.IDS}
 def test_two_actual_complete_ui_matrices_keep_distinct_semantics(self):
  first=a.evidence();second=b.evidence();self.assertEqual(len(first['cases']),120);self.assertEqual(sum(len(x['observations'])for x in first['clockObservations']),64);self.assertEqual(len(second['cases']),148);self.assertEqual(sum(len(x['observations'])for x in second['clockObservations']),56);self.assertEqual(first['terminalStatus'],'PASS');self.assertEqual(second['terminalStatus'],'PASS')
 def test_fresh_035_matches_saved_and_partial_shaft_failure_stays_negative(self):
  current=a.report(self.sources(a),app=self.app);saved=a.load(a.BASE/'bench-mechanics-fluids-035-renewal-abb2.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],4);self.assertEqual({r['id']for r in current['records']if not r['ok']},{'LAB3D-02'});self.assertEqual(sum(len(r['consumerChecks'])for r in current['records']),378)
  geo=a.load(a.BASE/'flight-gravity-shaft-actual-geometry.json');self.assertTrue(geo['gravity']['tipOutsideBase']);self.assertFalse(geo['gravity']['tipOccluded']);self.assertEqual(geo['occludedShaftSurfaceSamples'],1600)
  with self.assertRaises(ValueError):assert_activity_identity(current['records'],a.IDS,self.sources(a))
 def test_fresh_036_matches_saved_and_all_five_canonical_scopes_pass(self):
  current=b.report(self.sources(b),app=self.app);saved=b.load(b.BASE/'bench-fields-optics-036-renewal-abb2.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],5);self.assertEqual(sum(r['runtimeComparison']['caseCount']for r in current['records']),1045);assert_activity_identity(current['records'],b.IDS,self.sources(b))
  for index in range(5):
   rows=copy.deepcopy(current['records']);del rows[index]['calculationScope']
   with self.subTest(id=rows[index]['id']),self.assertRaises(ValueError):assert_activity_identity(rows,b.IDS,self.sources(b))
 def test_all_ten_explicit_manual_scopes_have_assumptions_and_worked_arithmetic(self):
  for module,family,batch in [(a,'mechanics-fluids','035'),(b,'fields-optics','036')]:
   rows=module.load(module.BASE/f'bench-{family}-{batch}-renewal-abb2.json')['records'];self.assertEqual(len(rows),5)
   for row in rows:self.assertEqual(row['calculationScope'],'EXACT_MANUAL_CALCULATION');self.assertTrue(row['manualArithmetic']);self.assertTrue(row['physicalAssumptions']);self.assertTrue(row['pedagogicalReview']);self.assertEqual(row['activityCredit'],0);self.assertEqual(row['humanApproval'],'NOT_RUN')
 def test_source_mutation_and_unexpected_revision_fail_closed(self):
  for module in[a,b]:
   src=self.sources(module);changed=copy.deepcopy(src);changed[sorted(module.IDS)[0]]['assessment'][0]['value']=123456
   with self.subTest(module=module.__name__),self.assertRaises(ValueError):module.report(changed,app=self.app)
   with self.assertRaises(ValueError):module.report(src,{},app=self.app)
   with self.assertRaises(ValueError):module.report({},app=self.app)
 def test_actual_image_or_helper_drift_is_not_reapproved(self):
  for module in[a,b]:
   with tempfile.TemporaryDirectory()as tmp:
    base=Path(tmp);(base/'actual-proof-index.json').write_bytes((module.BASE/'actual-proof-index.json').read_bytes())
    with self.assertRaises((ValueError,FileNotFoundError)):module.evidence(base)
   with patch.object(module,'PHYSICS_SHA','0'*64),self.assertRaises(ValueError):module.report(self.sources(module),app=self.app)
 def test_unknown_runtime_rejected_and_context_restores_environment(self):
  previous=os.environ.get('ASTRA_EXTENSIONS')
  with immutable_runtime('0184b146513e024d99ce8391fb0a5f4892f79e7e')as other:
   self.assertNotEqual(other,self.app);self.assertEqual(os.environ['ASTRA_EXTENSIONS'],str(other/'extensions'))
  self.assertEqual(os.environ.get('ASTRA_EXTENSIONS'),previous)
  with self.assertRaises(ValueError):
   with immutable_runtime('unknown'):pass
  for module in[a,b]:
   with patch.object(module,'runtime_fingerprint',return_value={'sha256':'unknown'}),self.assertRaises(ValueError):module.report(self.sources(module),app=self.app)
if __name__=='__main__':unittest.main()
