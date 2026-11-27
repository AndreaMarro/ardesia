import unittest,json,copy,math
from tools.corpus_engineering import c2_exact_integer_json_identity_a as v
from pathlib import Path
A=Path(__file__).resolve().parents[2]
D=A/'editorial/reviews/c2-hydrostatic-exact-json-number-identity-addendum-a-20261127'
class ExactIdentity(unittest.TestCase):
 def test_actual_six_identity_pairs(self):
  doc=json.loads((D/'identity-addendum.json').read_bytes());self.assertEqual(len(doc['records']),6)
  for row in doc['records']:
   p=json.loads((A/row['preparedPath']).read_bytes());record=p['records'][0]['record'];canonical=next(r for r in p['draftRecords']if r['id']==row['id']);self.assertEqual(v.digest(record),row['declaredPreparedCandidateSha256']);self.assertEqual(v.digest(canonical),row['bindingCandidateSha256']);self.assertEqual(v.compare(record,canonical),row['changedNumericLexemes'])
 def test_safe_integer_control_reference_positive(self):self.assertEqual(len(v.compare({'control':{'min':-2.0},'references':[[2.0,20.0]]},{'control':{'min':-2},'references':[[2,20]]})),3)
 def test_noninteger_perturbation_rejected(self):
  for a,b in [(1.36,1),(9.81,10),(14.715,15),(.2,.20000000000000004)]:
   with self.assertRaises(ValueError):v.compare({'control':{'min':a}},{'control':{'min':b}})
 def test_boolean_never_numeric(self):
  for a,b in [(False,0),(True,1),(False,0.0)]:
   with self.assertRaises(ValueError):v.compare({'control':{'min':a}},{'control':{'min':b}})
 def test_versions_and_unknown_paths_stay_strict(self):
  for a,b in [({'version':3.0},{'version':3}),({'baseVersion':2.0},{'baseVersion':2}),({'control':{'value':2.0}},{'control':{'value':2}})]:
   with self.assertRaises(ValueError):v.compare(a,b)
 def test_strings_formulas_and_keys_stay_strict(self):
  for a,b in [({'formula':'g=9.81'},{'formula':'g=10'}),({'unit':'N'},{'unit':'kPa'}),({'control':{'min':1}},{'control':{'max':1}})]:
   with self.assertRaises(ValueError):v.compare(a,b)
 def test_nonfinite_or_precision_loss_rejected(self):
  for a,b in [(float('nan'),float('nan')),(float('inf'),float('inf')),(-float('inf'),0),(float(2**53),2**53+1),(1e20,10**20)]:
   with self.assertRaises(ValueError):v.compare({'control':{'min':a}},{'control':{'min':b}})
 def test_array_shape_and_null_rejected(self):
  for a,b in [({'references':[[1.0]]},{'references':[[1,2]]}),({'control':{'min':None}},{'control':{'min':0}})]:
   with self.assertRaises(ValueError):v.compare(a,b)
 def test_final_pascal_has_identical_sha(self):
  row=next(r for r in json.loads((D/'identity-addendum.json').read_bytes())['records']if r['name']=='finalPascal');self.assertEqual(row['computedPreparedRecordSha256'],row['bindingCandidateSha256']);self.assertEqual(row['changedNumericLexemes'],[])
if __name__=='__main__':unittest.main()
