"""Frozen code-level instruction finding; no fresh UI or activity approval."""
from pathlib import Path
from fractions import Fraction
import json,unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/manual-guide-scope-addendum-20261126'
class ManualGuideScope(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.proof=json.loads((BASE/'actual-guide-code.json').read_bytes())
 def test_eight_real_nonpilot_legal_nonselected_probes_and_unchanged_sixteen_forms(self):
  rows=self.proof['records'];self.assertEqual(len(rows),8);self.assertEqual(len({r['id']for r in rows}),8)
  self.assertEqual(sum(len(r['actualGradedQuestions'])for r in rows),16)
  for r in rows:
   self.assertFalse(r['pilotOverride']);self.assertNotIn(r['nonSelectedInput'],r['selectedAssessmentInputs']);self.assertFalse(r['additionalGradedForm'])
   a=r['control'];x=Fraction(str(r['nonSelectedInput']));lo=Fraction(str(a['min']));step=Fraction(str(a['step']))
   self.assertTrue(lo<=x<=Fraction(str(a['max'])));self.assertEqual((x-lo)%step,0)
 def test_exact_imperative_is_generated_even_at_nonselected_cursor(self):
  for r in self.proof['records']:
   self.assertEqual(r['samples'][2]['steps'][2][0],'Controlla il calcolo')
   self.assertIn('Sostituisci i dati e confronta il risultato',r['actionInstructionAtNonselectedInput'])
   self.assertEqual(r['generatedModelEquation'],r['samples'][2]['measurement']['calculation'])
   self.assertIn('≈',r['generatedModelEquation'])
 def test_generated_value_is_given_and_no_new_ui_or_credit_is_implied(self):
  self.assertEqual(self.proof['newBrowserCases'],0);self.assertEqual(self.proof['activityCredit'],0)
  for r in self.proof['records']:
   self.assertEqual(r['UI'],'NOT_RUN');self.assertEqual(r['activityCredit'],0)
   self.assertEqual(len(r['samples']),3);self.assertIn('≈',r['generatedModelEquation'])
if __name__=='__main__':unittest.main()
