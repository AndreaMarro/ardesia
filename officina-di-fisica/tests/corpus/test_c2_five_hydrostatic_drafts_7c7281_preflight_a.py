import unittest,json,copy
from fractions import Fraction
import sympy as sp
from tools.corpus_engineering import c2_five_hydrostatic_drafts_7c7281_preflight_a as v
class FiveDraftPreflight(unittest.TestCase):
 def test_actual_six_editions102states(self):
  r=v.report();self.assertEqual((r['draftCount'],r['sourceEditionCount'],r['sourceStates']),(5,6,102));self.assertEqual(r['browser'],'NOT_RUN');self.assertEqual(r['phase'],'PREFLIGHT_BLOCKED_COLLECTOR_OWNER_VERSION_PIN')
 def test_original_physics_conflict_retained(self):
  self.assertEqual(v.original_transfer(Fraction(3,2)),15);self.assertEqual(v.law(v.FIRST,Fraction(3,2)),sp.Rational(2943,200));self.assertNotEqual(v.original_transfer(Fraction(3,2)),v.law(v.FIRST,Fraction(3,2)))
 def test_draft_exact_inverse_units(self):
  self.assertEqual(v.law(v.FIRST,2),sp.Rational(981,50));self.assertEqual(v.law(v.FIRST,0),0);self.assertEqual(v.law(v.FIRST,3),sp.Rational(2943,100))
 def test_domain_nonfinite_before_cast(self):
  for key in v.IDS:
   for x in [sp.I,sp.oo,-sp.oo,sp.nan,True,1.,'1',None]:
    with self.assertRaises(ValueError):v.law(key,x)
  for x in [-1,4]:
   with self.assertRaises(ValueError):v.law(v.FIRST,x)
 def test_records_and_bindings_are_verbatim(self):
  p=json.loads((v.BASE/'canonical-inputs/experiment-c2-five-hydrostatic-drafts.json').read_bytes());b=json.loads((v.BASE/'canonical-inputs/experiment-c2-five-hydrostatic-drafts-bindings.json').read_bytes());v.validate_bundle(p,b);self.assertEqual([r['version']for r in p['records']],[2,2,2,3,2])
  for i in range(5):
   q=copy.deepcopy(p);links=copy.deepcopy(b);q['records'][i]['version']=2 if q['records'][i]['version']==3 else 3;links[i]['candidateSha256']=v.digest(q['records'][i])
   with self.assertRaises(ValueError):v.validate_bundle(q,links)
 def test_seven_bounded_groups312(self):
  p=json.loads((v.BASE/'bounded-subgroups.json').read_bytes());self.assertEqual(len(p['groups']),7);self.assertEqual(p['totalCasesPlanned'],312);self.assertEqual(p['maxCasesPerChild'],48);self.assertTrue(all(r['executionAuthorization']=='NOT_GRANTED'for r in p['groups']))
 def test_original_negative_and_grader_contrasts(self):
  D=v.BASE/'plans';bad=json.loads((D/'original-stevino-correct-physics-rejected/prepared.json').read_bytes());ok=json.loads((D/'original-stevino-installed-grader-accepted/prepared.json').read_bytes());self.assertEqual((bad['records'][0]['questions'][1]['input'],bad['records'][0]['questions'][1]['expectedAccepted']),('15',False));self.assertEqual((ok['records'][0]['questions'][1]['input'],ok['records'][0]['questions'][1]['expectedAccepted']),('14.715',True))
 def test_owner_guest_future_gate_explicit(self):
  r=v.report();self.assertIn('NOT_RUN',r['ownerGuestGate']);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['knownCollectorBlocker']['correctDraftVersion'],3)
 def test_authentic_collector_negative_preserved(self):
  n=json.loads((v.BASE/'owner-v3-negative-terminal.json').read_bytes());self.assertEqual(n['actualObservedExitCode'],1);self.assertEqual(n['signal'],None);self.assertIn('Full normalized owner record differs',(v.BASE/'owner-v3-negative.stderr.txt').read_text())
if __name__=='__main__':unittest.main()
