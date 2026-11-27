from pathlib import Path
import copy,json,os,tempfile,unittest
from unittest.mock import patch
from tools.corpus_engineering import bench_fields_optics_renewal_3ed5_verifier as b
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_activity_identity
from renewal_runtime_3ed5 import immutable_runtime
REF='375faa7a90f5f643840aabb8cc3076f9a2d5f5de'
class FreshWhole036(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.context=immutable_runtime(REF);cls.app=cls.context.__enter__();cls.addClassCleanup(cls.context.__exit__,None,None,None);cls.sources={r['id']:r for r in json.loads((cls.app/'content/banchi.json').read_bytes())if r['id']in b.IDS}
 def test_all_five_fresh_saved_exact_manual_and_canonical_identity(self):
  current=b.report(self.sources,app=self.app);saved=b.load(b.BASE/'scientific-report.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],5);self.assertEqual(sum(r['runtimeComparison']['caseCount']for r in current['records']),1045);assert_activity_identity(current['records'],b.IDS,self.sources)
  for r in current['records']:
   self.assertTrue(r['ok']);self.assertTrue(r['sourceMathChecksOk']);self.assertFalse(r['consumerObservedUiFailure']);self.assertEqual(r['calculationScope'],'EXACT_MANUAL_CALCULATION');self.assertTrue(r['manualArithmetic']);self.assertTrue(r['physicalAssumptions']);self.assertTrue(r['pedagogicalReview']);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['humanApproval'],'NOT_RUN')
  for i in range(5):
   rows=copy.deepcopy(current['records']);del rows[i]['calculationScope']
   with self.subTest(id=rows[i]['id']),self.assertRaises(ValueError):assert_activity_identity(rows,b.IDS,self.sources)
 def test_actual_full_matrix_and_all_fourteen_zero_readouts(self):
  evidence=b.evidence();self.assertEqual(len(evidence['cases']),148);self.assertEqual(sum(len(r['observations'])for r in evidence['clockObservations']),56)
  for r in evidence['clockObservations']:self.assertEqual(r['observations'][1]['actualDisplayed'],'0 mm')
 def test_old_floating_residue_rejected_even_inside_previous_physical_tolerance(self):
  original=b.load;mutated=copy.deepcopy(original(b.BASE/'actual-ui-148/consumer.json'));mutated['clockObservations'][0]['observations'][1]['actualDisplayed']='-0,0000000000000007348 mm'
  def load(p):return mutated if Path(p)==b.BASE/'actual-ui-148/consumer.json'else original(p)
  with patch.object(b,'load',side_effect=load),self.assertRaisesRegex(ValueError,'display must be exact'):b.evidence()
 def test_source_package_and_unread_or_incomplete_evidence_fail_closed(self):
  source=copy.deepcopy(self.sources);source['LAB3D-10']['assessment'][0]['value']=123
  for src,pkg in[(source,None),({},None),(self.sources,{})]:
   with self.subTest(package=pkg),self.assertRaises(ValueError):b.report(src,pkg,app=self.app)
  with tempfile.TemporaryDirectory()as tmp:
   (Path(tmp)/'actual-proof-index.json').write_bytes((b.BASE/'actual-proof-index.json').read_bytes())
   with self.assertRaises((ValueError,FileNotFoundError)):b.evidence(Path(tmp))
  original=b.load;mutated=copy.deepcopy(original(b.BASE/'actual-ui-148/consumer.json'));mutated['cases'].pop()
  with patch.object(b,'load',side_effect=lambda p:mutated if Path(p)==b.BASE/'actual-ui-148/consumer.json'else original(p)),self.assertRaisesRegex(ValueError,'148'):b.evidence()
 def test_stale_epoch_or_physics_dependency_cannot_be_reapproved(self):
  with patch.object(b,'runtime_fingerprint',return_value={'sha256':'unknown'}),self.assertRaises(ValueError):b.report(self.sources,app=self.app)
  with patch.object(b,'PHYSICS_SHA','0'*64),self.assertRaises(ValueError):b.report(self.sources,app=self.app)
 def test_fixture_unknown_ref_rejected_and_environment_restored(self):
  before=os.environ.get('ASTRA_EXTENSIONS')
  with immutable_runtime(REF)as another:self.assertNotEqual(another,self.app);self.assertEqual(os.environ['ASTRA_EXTENSIONS'],str(another/'extensions'))
  self.assertEqual(os.environ.get('ASTRA_EXTENSIONS'),before)
  with self.assertRaises(ValueError):
   with immutable_runtime('unknown'):pass
if __name__=='__main__':unittest.main()
