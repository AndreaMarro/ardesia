from pathlib import Path
import copy,json,tempfile,unittest
from unittest.mock import patch
from tools.corpus_engineering import bench_mechanics_fluids_renewal_1efc_verifier as a
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_activity_identity
from renewal_runtime_1efc import immutable_runtime
class FreshWhole035(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.context=immutable_runtime('3abd7dce2c2d837c903c9e17ac1d7fd0aa08dcca');cls.app=cls.context.__enter__();cls.addClassCleanup(cls.context.__exit__,None,None,None);cls.sources={r['id']:r for r in json.loads((cls.app/'content/banchi.json').read_bytes())if r['id']in a.IDS}
 def test_fresh_all_five_exact_manual_and_saved_identity(self):
  current=a.report(self.sources,app=self.app);self.assertEqual(canonical(current),canonical(a.load(a.BASE/'scientific-report.json')));self.assertEqual(current['acceptedIndividualCount'],5);self.assertEqual(sum(len(r['consumerChecks'])for r in current['records']),378);assert_activity_identity(current['records'],a.IDS,self.sources)
  for r in current['records']:
   self.assertTrue(r['ok']);self.assertTrue(r['sourceMathChecksOk']);self.assertFalse(r['consumerObservedUiFailure']);self.assertEqual(r['calculationScope'],'EXACT_MANUAL_CALCULATION');self.assertTrue(r['manualArithmetic']);self.assertTrue(r['physicalAssumptions']);self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['activityCredit'],0)
  for i in range(5):
   rows=copy.deepcopy(current['records']);del rows[i]['calculationScope']
   with self.subTest(id=rows[i]['id']),self.assertRaises(ValueError):assert_activity_identity(rows,a.IDS,self.sources)
 def test_complete_actual120_plus64_clock_and_all_assigned_tasks(self):
  evidence=a.evidence();self.assertEqual(len(evidence['cases']),120);self.assertEqual(sum(len(r['observations'])for r in evidence['clockObservations']),64)
  for r in evidence['cases']:
   if'boundary'not in r:self.assertEqual([x['independentlyDerived']for x in r['responses']],a.ANSWERS[r['id']])
 def test_actual_surface_identity_positions_and_old_collision_regression(self):
  evidence=a.evidence();rows=[r for r in evidence['cases']if r['id']=='LAB3D-03'and r['view']=='diagram'and'boundary'in r];self.assertEqual(len(rows),4)
  for r in rows:self.assertEqual(next(t['y']for t in r['hydrostaticLabel']if t['text']=='A'),62+52.5*float(r['inputs']['h']))
  original=a.load;changed=copy.deepcopy(original(a.BASE/'actual-ui-120/consumer.json'));r=next(r for r in changed['cases']if r['id']=='LAB3D-03'and r['view']=='diagram'and r.get('boundary')==0);next(t for t in r['hydrostaticLabel']if t['text']=='A')['y']=38
  with patch.object(a,'load',side_effect=lambda p:changed if Path(p)==a.BASE/'actual-ui-120/consumer.json'else original(p)),self.assertRaisesRegex(ValueError,'probe label'):a.evidence()
 def test_corrected_review_unit_metadata_matches_independent_manual_and_original(self):
  from fractions import Fraction
  self.assertEqual(Fraction(1000)*10*Fraction(1,2),5000);self.assertEqual(Fraction(5000,1000),5);self.assertEqual(Fraction(16000,800*10),2)
  path=a.APP/'editorial/reviews/independent-stevino-label-1efc-20261127/unit-metadata-correction-01/correction.json';meta=a.load(path);self.assertEqual(meta['correctUnits'],['kPa','m']);self.assertEqual([(r['value'],r['unit'])for r in self.sources['LAB3D-03']['assessment']],[(5,'kPa'),(2,'m')])
  original=a.load;changed=copy.deepcopy(meta);changed['correctUnits']=['bar','bar']
  with patch.object(a,'load',side_effect=lambda p:changed if Path(p)==path else original(p)),self.assertRaisesRegex(ValueError,'assigned units metadata'):a.evidence()
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
