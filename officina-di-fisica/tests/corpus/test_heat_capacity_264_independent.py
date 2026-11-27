import copy,hashlib,json,unittest
from fractions import Fraction as F
from pathlib import Path
from unittest.mock import patch
from tools.corpus_engineering import experiment_heat_capacity_264_independent_verifier as V
APP=Path(__file__).resolve().parents[2];OUT=APP/'editorial/reviews/heat-capacity-264-independent-20261127';KEY='SIM-C3-L03-02'
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
class HeatCapacity264(unittest.TestCase):
 def setUp(self):
  self.sources={r['id']:r for r in json.loads((OUT/'original-source.json').read_bytes())};self.p=json.loads((OUT/'package.json').read_bytes());self.b=json.loads((OUT/'bindings.json').read_bytes());self.probe=json.loads((OUT/'actual-code-probe.json').read_bytes())
 def result(self):return V.report(self.sources,self.p,self.b,self.probe)
 def renew(self):self.b[0]['candidateSha256']=digest(self.p['records'][0])
 def test_fresh_content_review_passes_without_activity_credit(self):
  r=self.result();self.assertEqual(r['candidateTextMathManualPassCount'],1);self.assertTrue(r['records'][0]['candidateTextMathManualReview']['ok']);self.assertFalse(r['overallAcceptanceGranted']);self.assertFalse(r['records'][0]['ok']);self.assertEqual(r['records'][0]['activityCredit'],0)
 def test_original_negative_is_distinct_and_retained(self):
  r=self.result()['records'][0]['publishedEditionReview'];self.assertFalse(r['ok']);self.assertEqual(r['sourceSha256'],self.b[0]['sourceSha256']);self.assertTrue(r['mathematicalLawCorrect']);self.assertEqual(r['publicationAction'],'NONE')
 def test_exact_arithmetic_at_references_and_transfer(self):
  for mass,value in ((100,40),(250,100),(175,70)):
   with self.subTest(mass=mass):self.assertEqual(V.capacity(mass),F(value));self.assertEqual(V.inverse_capacity(F(value)),F(mass))
  self.assertEqual(V.capacity(250)/V.capacity(100),F(5,2))
 def test_all_11_grid_states(self):
  for mass in range(50,301,25):
   with self.subTest(mass=mass):self.assertEqual(V.capacity(mass),F(2*mass,5))
 def test_finite_exact_positive_domains(self):
  for function in (V.capacity,V.inverse_capacity):
   for bad in (True,False,0,-1,F(-1,2),1.0,float('inf'),float('nan'),complex(1,1),'100',None):
    with self.subTest(function=function.__name__,bad=repr(bad)),self.assertRaises(ValueError):function(bad)
 def test_wrong_version_or_original_physics_rejected_after_binding_renewal(self):
  for field,value in (('baseVersion',True),('version',True),('course','C2'),('measure',{'label':'capacity','unit':'J'})):
   self.p=json.loads((OUT/'package.json').read_bytes());self.b=json.loads((OUT/'bindings.json').read_bytes());self.p['records'][0][field]=value;self.renew()
   with self.subTest(field=field),patch.object(V,'REVIEWED_CANDIDATE',digest(self.p['records'][0])),self.assertRaises(ValueError):self.result()
 def test_wrong_source_or_candidate_identity_rejected(self):
  self.b[0]['sourceSha256']='0'*64
  with self.assertRaises(ValueError):self.result()
 def test_missing_or_duplicate_candidate_is_rejected(self):
  self.p['records']+=copy.deepcopy(self.p['records'])
  with self.assertRaises(ValueError):self.result()
 def test_wrong_actual_engine_value_rejected(self):
  self.probe['grid'][0]['solve']['y']=21
  with patch.object(V,'PROBE_CANONICAL',digest(self.probe)),self.assertRaises(ValueError):self.result()
 def test_wrong_actual_transfer_or_unit_rejected(self):
  self.probe['assessment'][1]['value']=71
  with patch.object(V,'PROBE_CANONICAL',digest(self.probe)),self.assertRaises(ValueError):self.result()
  self.probe=json.loads((OUT/'actual-code-probe.json').read_bytes());self.probe['assessment'][1]['unit']='J'
  with patch.object(V,'PROBE_CANONICAL',digest(self.probe)),self.assertRaises(ValueError):self.result()
 def test_doubling_backslide_rejected_even_with_test_only_pin_renewal(self):
  self.p['records'][0]['interpretation']='La massa passa da 100 g a 250 g mentre l’energia raddoppia.';self.renew()
  with patch.object(V,'REVIEWED_CANDIDATE',digest(self.p['records'][0]),create=True):
   with self.assertRaises(ValueError):self.result()
 def test_heat_capacity_units_and_mass_inverse(self):
  import pint
  u=pint.UnitRegistry();c=F(2,5)*u.joule/u.gram/u.kelvin
  self.assertEqual((c*250*u.gram).to(u.joule/u.kelvin).magnitude,F(100));self.assertEqual((70*u.joule/u.kelvin/c).to(u.gram).magnitude,F(175));self.assertEqual((c*250*u.gram*u.kelvin).to(u.joule).magnitude,F(100))
if __name__=='__main__':unittest.main(verbosity=2)
