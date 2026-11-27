from pathlib import Path
import copy,json,tempfile,unittest
from unittest.mock import patch
from tools.corpus_engineering import bench_mechanics_fluids_renewal_3ed5_verifier as a
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_activity_identity
from renewal_runtime_3ed5 import immutable_runtime
class FreshWhole035(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.context=immutable_runtime('375faa7a90f5f643840aabb8cc3076f9a2d5f5de');cls.app=cls.context.__enter__();cls.addClassCleanup(cls.context.__exit__,None,None,None);cls.sources={r['id']:r for r in json.loads((cls.app/'content/banchi.json').read_bytes())if r['id']in a.IDS}
 def test_fresh_all_five_exact_manual_and_saved_identity(self):
  current=a.report(self.sources,app=self.app);self.assertEqual(canonical(current),canonical(a.load(a.BASE/'scientific-report.json')));self.assertEqual(current['acceptedIndividualCount'],4);self.assertEqual(sum(len(r['consumerChecks'])for r in current['records']),378);
  with self.assertRaises(ValueError):assert_activity_identity(current['records'],a.IDS,self.sources)
  for r in current['records']:
   self.assertEqual(r['ok'],r['id']!='LAB3D-03');self.assertTrue(r['sourceMathChecksOk']);self.assertEqual(r['consumerObservedUiFailure'],r['id']=='LAB3D-03');self.assertEqual(r['calculationScope'],'EXACT_MANUAL_CALCULATION');self.assertTrue(r['manualArithmetic']);self.assertTrue(r['physicalAssumptions']);self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['activityCredit'],0)
 def test_complete_actual120_plus64_clock_and_all_assigned_tasks(self):
  evidence=a.evidence();self.assertEqual(len(evidence['cases']),120);self.assertEqual(sum(len(r['observations'])for r in evidence['clockObservations']),64)
  for r in evidence['cases']:
   if'boundary'not in r:self.assertEqual([x['independentlyDerived']for x in r['responses']],a.ANSWERS[r['id']])
 def test_actual_label_finding_keeps_pressure_correct_and_group_rejected(self):
  finding=a.load(a.BASE/'actual-hydrostatic-surface-label-negative.json');self.assertEqual(len(finding['actualRows']),2);self.assertFalse(finding['consumerVisualOk']);self.assertTrue(finding['sourceMathOk']);self.assertEqual([finding['actualPressureAKPa'],finding['actualPressureBKPa'],finding['actualBottomKPa']],[100,100,119.6]);self.assertFalse(finding['sourceScientificFailureInferredFromUI'])
 def test_actual_clock_input_and_display_disagreement_rejected(self):
  original=a.load;mutated=copy.deepcopy(original(a.BASE/'actual-ui-120/consumer.json'));mutated['clockObservations'][0]['observations'][1]['actualInput']='0'
  def load(p):return mutated if Path(p)==a.BASE/'actual-ui-120/consumer.json'else original(p)
  with patch.object(a,'load',side_effect=load),self.assertRaisesRegex(ValueError,'clock/input/readout'):a.evidence()
 def test_source_omission_revision_and_wrong_model_dependency_fail_closed(self):
  changed=copy.deepcopy(self.sources);changed['LAB3D-01']['assessment'][0]['value']=123
  for src,pkg in[(changed,None),({},None),(self.sources,{})]:
   with self.subTest(package=pkg),self.assertRaises(ValueError):a.report(src,pkg,app=self.app)
  with patch.object(a,'PHYSICS_SHA','0'*64),self.assertRaises(ValueError):a.report(self.sources,app=self.app)
 def test_partial_or_unread_proof_and_other_epoch_rejected(self):
  with tempfile.TemporaryDirectory()as tmp:
   base=Path(tmp);(base/'actual-proof-index.json').write_bytes((a.BASE/'actual-proof-index.json').read_bytes())
   with self.assertRaises((FileNotFoundError,ValueError)):a.evidence(base)
  original=a.load;changed=copy.deepcopy(original(a.BASE/'actual-ui-120/consumer.json'));changed['cases'].pop()
  with patch.object(a,'load',side_effect=lambda p:changed if Path(p)==a.BASE/'actual-ui-120/consumer.json'else original(p)),self.assertRaisesRegex(ValueError,'matrix required'):a.evidence()
  with patch.object(a,'runtime_fingerprint',return_value={'sha256':'unknown'}),self.assertRaises(ValueError):a.report(self.sources,app=self.app)
if __name__=='__main__':unittest.main()
