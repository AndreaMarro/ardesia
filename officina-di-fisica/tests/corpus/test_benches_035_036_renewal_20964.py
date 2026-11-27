from pathlib import Path
import copy,json,tempfile,unittest,os
from unittest.mock import patch
from tools.corpus_engineering import bench_mechanics_fluids_renewal_20964_verifier as a
from tools.corpus_engineering import bench_fields_optics_renewal_20964_verifier as b
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_activity_identity
from renewal_runtime_20964 import immutable_runtime
class ActualWholeBenchRenewals(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.context=immutable_runtime('3d060603540c981bf641f776ca65fd3ef76106c3');cls.app=cls.context.__enter__();cls.addClassCleanup(cls.context.__exit__,None,None,None);cls.all={row['id']:row for row in json.loads((cls.app/'content/banchi.json').read_bytes())}
 def sources(self,module):return{k:self.all[k]for k in module.IDS}
 def test_two_actual_complete_ui_matrices_keep_distinct_semantics(self):
  first=a.evidence();second=b.evidence();self.assertEqual(len(first['cases']),120);self.assertEqual(sum(len(x['observations'])for x in first['clockObservations']),64);self.assertEqual(len(second['cases']),148);self.assertEqual(sum(len(x['observations'])for x in second['clockObservations']),56);self.assertEqual(first['terminalStatus'],'PASS');self.assertEqual(second['terminalStatus'],'PASS')
 def test_fresh_035_all_five_match_saved_and_canonical_shape(self):
  current=a.report(self.sources(a),app=self.app);saved=a.load(a.BASE/'bench-mechanics-fluids-035-renewal-20964.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],5);self.assertTrue(all(r['ok']for r in current['records']));self.assertEqual(sum(len(r['consumerChecks'])for r in current['records']),378);assert_activity_identity(current['records'],a.IDS,self.sources(a))
  for index in range(5):
   rows=copy.deepcopy(current['records']);del rows[index]['calculationScope']
   with self.subTest(id=rows[index]['id']),self.assertRaises(ValueError):assert_activity_identity(rows,a.IDS,self.sources(a))
 def test_fresh_036_preserves_actual_readout_finding_and_rejects_whole_group(self):
  current=b.report(self.sources(b),app=self.app);saved=b.load(b.BASE/'bench-fields-optics-036-renewal-20964.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],4);self.assertEqual({r['id']for r in current['records']if not r['ok']},{'LAB3D-10'});self.assertEqual(sum(r['runtimeComparison']['caseCount']for r in current['records']),1045)
  failed=next(r for r in current['records']if r['id']=='LAB3D-10');self.assertTrue(failed['sourceMathChecksOk']);self.assertTrue(failed['runtimeComparison']['ok']);self.assertFalse(failed['sourceScientificFailureInferredFromUI']);self.assertEqual(failed['consumerUI'],'FAIL_ACTUAL_BOUNDED_READOUT')
  with self.assertRaises(ValueError):assert_activity_identity(current['records'],b.IDS,self.sources(b))
 def test_all_fourteen_actual_quarter_period_visible_dom_readouts_remain_negative(self):
  finding=b.load(b.BASE/'oscillating-zero-original-observations.json');self.assertEqual(finding['amplitudeMm'],4);self.assertEqual(len(finding['actualRows']),14);self.assertTrue(finding['consumerReadoutFinding'])
  for row in finding['actualRows']:
   observation=row['observation'];self.assertEqual(observation['actualInput'],'0.25');self.assertEqual(observation['expectedExactMm'],0);self.assertEqual(observation['actualDisplayed'],'-0,0000000000000007348 mm');self.assertNotEqual(float(observation['actualDisplayed'].split()[0].replace(',','.')),0)
 def test_all_ten_explicit_manual_scopes_have_assumptions_and_worked_arithmetic(self):
  for module,family,batch in [(a,'mechanics-fluids','035'),(b,'fields-optics','036')]:
   rows=module.load(module.BASE/f'bench-{family}-{batch}-renewal-20964.json')['records'];self.assertEqual(len(rows),5)
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
  with immutable_runtime('3d060603540c981bf641f776ca65fd3ef76106c3')as other:
   self.assertNotEqual(other,self.app);self.assertEqual(os.environ['ASTRA_EXTENSIONS'],str(other/'extensions'))
  self.assertEqual(os.environ.get('ASTRA_EXTENSIONS'),previous)
  with self.assertRaises(ValueError):
   with immutable_runtime('unknown'):pass
  for module in[a,b]:
   with patch.object(module,'runtime_fingerprint',return_value={'sha256':'unknown'}),self.assertRaises(ValueError):module.report(self.sources(module),app=self.app)
if __name__=='__main__':unittest.main()
