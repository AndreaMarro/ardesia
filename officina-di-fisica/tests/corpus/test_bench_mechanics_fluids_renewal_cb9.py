from pathlib import Path
import copy,json,tempfile,unittest
from unittest.mock import patch
from tools.corpus_engineering import bench_mechanics_fluids_renewal_cb9_verifier as v
from tools.corpus_engineering.pipeline import canonical
from renewal_runtime_cb9 import immutable_runtime
class BenchCb9(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.scope=immutable_runtime('cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc');cls.app=cls.scope.__enter__();cls.addClassCleanup(cls.scope.__exit__,None,None,None);cls.sources={r['id']:r for r in json.loads((cls.app/'content/banchi.json').read_bytes())if r['id']in v.IDS}
 def test_actual_complete_negative_matrix_keeps_accessibility_failure(self):
  proof=v.evidence();self.assertTrue(proof['matrixComplete']);self.assertEqual(len(proof['cases']),120);self.assertEqual(sum(len(x['observations'])for x in proof['clockObservations']),64);self.assertEqual([(r['id'],r['width'],r['view'])for r in proof['consumerUiFailures']],[('LAB3D-04',320,'diagram'),('LAB3D-04',1280,'diagram')]);self.assertEqual(sum(len(r['responses'])for r in proof['cases']if'boundary'not in r),128)
 def test_actual_fresh_five_matches_saved_without_turning_negative_matrix_into_pass(self):
  got=v.report(self.sources,app=self.app);self.assertEqual(canonical(got),canonical(v.load(v.BASE/'bench-mechanics-fluids-035-renewal-cb9.json')));self.assertEqual(got['acceptedIndividualCount'],2);self.assertEqual({r['id']for r in got['records']if not r['ok']},{'LAB3D-01','LAB3D-02','LAB3D-04'});self.assertEqual(sum(len(r['consumerChecks'])for r in got['records']),378);self.assertTrue(all(r['sourceMathChecksOk']and not r['sourceScientificFailureInferredFromUI']and r['activityCredit']==0 for r in got['records']))
 def test_plane_tip_actual_box_ray_and_particle_positive_negative_are_distinct(self):
  geo=v.load(v.BASE/'plane-weight-tip-actual-geometry.json');self.assertTrue(geo['tipInsideOpaqueBase']);self.assertTrue(geo['actualSideRay']['tipOccluded']);self.assertLess(geo['actualSideRay']['firstBaseHitDistance'],geo['actualSideRay']['tipDistance']);self.assertTrue(geo['solver']['rest']);self.assertEqual(geo['solver']['a'],0)
  for x,a,b in zip(geo['tip'],geo['opaqueBase']['actualFloat32Bounds']['min'],geo['opaqueBase']['actualFloat32Bounds']['max']):self.assertLess(a,x);self.assertLess(x,b)
  positive=v.BASE/'actual-ui-120/LAB3D-02-1280-side-clock0.5.png';negative=v.BASE/'actual-ui-120/LAB3D-02-1280-side-clock1.png';self.assertNotEqual(positive.read_bytes(),negative.read_bytes())
 def test_source_subset_candidate_and_actual_source_change_fail_closed(self):
  with self.assertRaisesRegex(ValueError,'Exactly five'):v.report({},app=self.app)
  with self.assertRaisesRegex(ValueError,'no candidate'):v.report(self.sources,{},app=self.app)
  altered=copy.deepcopy(self.sources);altered['LAB3D-03']['assessment'][0]['value']=6
  with self.assertRaisesRegex(ValueError,'source changed'):v.report(altered,app=self.app)
 def test_canonical_identity_can_never_credit_the_completed_negative_group(self):
  from tools.corpus_engineering.batches import assert_activity_identity
  rows=v.load(v.BASE/'bench-mechanics-fluids-035-renewal-cb9.json')['records'];positive=[r for r in rows if r['ok']];self.assertTrue(all(r['calculationScope']=='EXACT_MANUAL_CALCULATION'for r in rows));assert_activity_identity(positive,{r['id']for r in positive},self.sources)
  with self.assertRaisesRegex(ValueError,'Invalid individual activity evidence'):assert_activity_identity(rows,v.IDS,self.sources)
 def test_observed_proof_mutation_rejected(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp);(root/'actual-proof-index.json').write_bytes((v.BASE/'actual-proof-index.json').read_bytes());index=v.load(root/'actual-proof-index.json');name=next(iter(index['files']));target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b'altered actual capture')
   with self.assertRaisesRegex(ValueError,'proof bytes changed'):v.evidence(root)
 def test_runtime_or_independent_model_drift_is_not_reapproved(self):
  with patch.object(v,'runtime_fingerprint',return_value={'sha256':'unknown'}):
   with self.assertRaisesRegex(ValueError,'Actualcb9'):v.report(self.sources,app=self.app)
  with patch.object(v,'PHYSICS_SHA','0'*64):
   with self.assertRaisesRegex(ValueError,'dependency changed'):v.report(self.sources,app=self.app)
if __name__=='__main__':unittest.main()
