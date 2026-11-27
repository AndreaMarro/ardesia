from pathlib import Path
import copy,json,tempfile,importlib.util,unittest
APP=Path(__file__).resolve().parents[2];BASE=APP/'editorial/reviews/independent-stevino-label-1efc-20261127'
spec=importlib.util.spec_from_file_location('independent_stevino_1efc',BASE/'artifact-check.py');artifact=importlib.util.module_from_spec(spec);spec.loader.exec_module(artifact)
class FocusedStevinoLabel(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.raw=json.loads((BASE/'actual-ui-16/consumer.json').read_bytes())
 def test_actual_pinned_complete_sixteen_and_four_stages_with_real_grading(self):
  result=artifact.review();self.assertTrue(result['ok']);self.assertEqual(result['actualCases'],16);self.assertEqual(result['scope'],'FOCUSED16_NOT_WHOLE035');self.assertEqual(result['activityCredit'],0);self.assertEqual(result['humanApproval'],'NOT_RUN')
 def test_old_surface_collision_position_is_rejected_on_actual_h0_record(self):
  data=copy.deepcopy(self.raw);r=next(x for x in data['cases']if x['noWebGL']and x['h']==0)
  next(t for t in r['svg']['texts']if t['text']=='A')['y']=38
  with self.assertRaisesRegex(ValueError,'labelposition'):artifact.semantic(data)
 def test_wrong_pressure_partial_actual_profile_and_nonterminal_epoch_rejected(self):
  for kind in['pressure','omission','epoch']:
   data=copy.deepcopy(self.raw)
   if kind=='pressure':data['cases'][0]['exactAbsolutePaFraction']=[123,1]
   elif kind=='omission':data['cases'].pop()
   else:data['runtimeSha256']='0'*64
   with self.subTest(kind=kind),self.assertRaises(ValueError):artifact.semantic(data)
 def test_missing_raw_inputs_not_replaced_with_current_or_metadata(self):
  with tempfile.TemporaryDirectory()as tmp:
   base=Path(tmp);(base/'actual-proof-index.json').write_bytes((BASE/'actual-proof-index.json').read_bytes())
   with self.assertRaises((FileNotFoundError,ValueError)):artifact.review(base)
if __name__=='__main__':unittest.main()
