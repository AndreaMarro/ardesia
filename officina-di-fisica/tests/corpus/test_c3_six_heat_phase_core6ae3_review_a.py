import unittest,json,copy,math
from tools.corpus_engineering import c3_six_heat_phase_core6ae3_review_a as v
class DistinctDraftReview(unittest.TestCase):
 def setUp(self):
  self.package=json.loads((v.BASE/'candidate.verbatim.json').read_bytes());self.bindings=json.loads((v.BASE/'bindings.verbatim.json').read_bytes());self.originals=json.loads((v.BASE/'original-source.verbatim.json').read_bytes());self.raw=json.loads((v.BASE/'actual-current-source.json').read_bytes())
 def test_fresh_and_saved(self):
  r=v.report();saved=json.loads((v.BASE/'independent-cpu-report.json').read_bytes());self.assertEqual(r,saved)
 def test_all_metadata_and_rebound_source_backslides(self):
  self.assertTrue(v.validate_candidate(self.package,self.bindings,self.originals))
  for index in range(6):
   for field,value in [('version',3),('baseVersion',True),('section','changed'),('control',{'min':0,'max':999}),('formula','wrong'),('references',[[1,999]])]:
    p=copy.deepcopy(self.package);b=copy.deepcopy(self.bindings);p['records'][index][field]=value;b[index]['candidateSha256']=v.sha(v.canonical(p['records'][index]))
    with self.assertRaises(ValueError):v.validate_candidate(p,b,self.originals)
 def test_rebound_actual_numeric_countermodels(self):
  for index in range(6):
   for j in range(2):
    r=copy.deepcopy(self.raw);r['records'][index]['tasks'][j]['installed']['value']+=1
    with self.assertRaises(ValueError):v.mathematical_guard(r)
   r=copy.deepcopy(self.raw);r['records'][index]['cases'][-1]['model']['y']+=1
   with self.assertRaises(ValueError):v.mathematical_guard(r)
 def test_wrong_units_and_manual_entry_rejected(self):
  for index in range(6):
   for kind in ('unit','entry'):
    r=copy.deepcopy(self.raw)
    if kind=='unit':r['records'][index]['tasks'][0]['installed']['unit']='wrong'
    else:r['records'][index]['tasks'][0]['entryLexeme']='-999'
    with self.assertRaises(ValueError):v.mathematical_guard(r)
 def test_roundoff_guard_rejects_invalid_and_real_model_shifts(self):
  for x in (True,False,float('nan'),float('inf'),-float('inf'),'50',None):
   with self.assertRaises(ValueError):v.roundoff_only(x,50)
  for x in (50.000001,49.9999,51):
   with self.assertRaises(ValueError):v.roundoff_only(x,50)
  v.roundoff_only(math.nextafter(50,51),50)
 def test_no_approval_or_identity_bypass(self):
  for key,value in [('physicalApproval',True),('visualApproval',True),('activityCredit',True),('activityCredit',1),('humanApproval','PASS'),('sourceCommit','wrong'),('runtimeExpected','wrong')]:
   r=copy.deepcopy(self.raw);r[key]=value
   with self.assertRaises(ValueError):v.mathematical_guard(r)
 def test_zero_plateau_inverse_and_finite_domains_remain_exact(self):
  from tools.corpus_engineering import c3_six_heat_phase_primary_models_a as p
  self.assertEqual(p.law(p.IDS[5],0),0);self.assertEqual(p.law(p.IDS[5],54),100)
  self.assertEqual(p.inverse(p.IDS[5],0),(0,2));self.assertEqual(p.inverse(p.IDS[5],100),(36,54))
if __name__=='__main__':unittest.main(verbosity=2)
