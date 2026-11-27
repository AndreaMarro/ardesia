from pathlib import Path
import copy,hashlib,json,tempfile,unittest
from unittest.mock import patch
from tools.corpus_engineering import bench_fields_optics_renewal_cb9_verifier as v
from tools.corpus_engineering.pipeline import canonical
from renewal_runtime_cb9 import immutable_runtime
class BenchCb9(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.scope=immutable_runtime('cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc');cls.app=cls.scope.__enter__();cls.addClassCleanup(cls.scope.__exit__,None,None,None)
  cls.sources={r['id']:r for r in json.loads((cls.app/'content/banchi.json').read_bytes())if r['id']in v.IDS}
 def test_complete_actual_profiles_tasks_boundaries_and_nonzero_clock(self):
  proof=v.evidence();self.assertEqual(len(proof['cases']),148);self.assertEqual(len({r['id']for r in proof['cases']}),5);self.assertEqual(sum(len(x['observations'])for x in proof['clockObservations']),56)
  base=[r for r in proof['cases']if'boundary'not in r];self.assertEqual(len(base),40);self.assertEqual(sum(len(r['responses'])for r in base),96)
 def test_actual_fresh_exact_five_matches_saved(self):
  current=v.report(self.sources,app=self.app);saved=v.load(v.BASE/'bench-fields-optics-036-renewal-cb9.json');self.assertEqual(canonical(current),canonical(saved));self.assertEqual(current['acceptedIndividualCount'],3);self.assertEqual([r['runtimeComparison']['caseCount']for r in current['records']],[33,11,18,968,15]);self.assertTrue(all(r['activityCredit']==0 and r['humanApproval']=='NOT_RUN'for r in current['records']))
 def test_observed_visibility_failures_do_not_rewrite_correct_source_physics(self):
  saved=v.load(v.BASE/'bench-fields-optics-036-renewal-cb9.json');rows={r['id']:r for r in saved['records']}
  self.assertEqual({k for k,r in rows.items()if not r['ok']},{'LAB3D-07','LAB3D-10'});self.assertTrue(all(r['sourceMathChecksOk']and r['runtimeComparison']['ok']and not r['sourceScientificFailureInferredFromUI']for r in rows.values()))
  geo=v.load(v.BASE/'field-cone-actual-geometry.json');self.assertTrue(all(w['tipOutsideSphere']and w['allActualBaseRimVerticesOccludedInSideCamera']for w in geo['witnesses']))
  wave=v.load(v.BASE/'wave-section-actual-geometry.json');self.assertTrue(all(r['allProjectedTrianglesDegenerate']and r['maxY']-r['minY']>.6 for r in wave['times']))
 def test_source_mutation_and_unexpected_revision_fail_closed(self):
  altered=copy.deepcopy(self.sources);altered['LAB3D-06']['assessment'][0]['value']=41
  with self.assertRaisesRegex(ValueError,'Original bench source differs'):v.report(altered,app=self.app)
  with self.assertRaisesRegex(ValueError,'no revision package'):v.report(self.sources,{},app=self.app)
  with self.assertRaisesRegex(ValueError,'Exactly five'):v.report({},app=self.app)
 def test_current_proof_mutation_is_not_a_new_approval(self):
  with tempfile.TemporaryDirectory()as tmp:
   base=Path(tmp);(base/'actual-proof-index.json').write_bytes((v.BASE/'actual-proof-index.json').read_bytes());index=v.load(base/'actual-proof-index.json');name=next(iter(index['files']));target=base/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b'altered actual bench evidence')
   with self.assertRaisesRegex(ValueError,'proof bytes changed'):v.evidence(base)
 def test_unknown_runtime_and_changed_source_dependency_fail_closed(self):
  with patch.object(v,'runtime_fingerprint',return_value={'sha256':'unknown'}):
   with self.assertRaisesRegex(ValueError,'Actualcb9'):v.report(self.sources,app=self.app)
  with patch.object(v,'PHYSICS_SHA','0'*64):
   with self.assertRaisesRegex(ValueError,'source/physics dependency changed'):v.report(self.sources,app=self.app)
if __name__=='__main__':unittest.main()
