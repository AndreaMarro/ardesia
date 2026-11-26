from pathlib import Path
import unittest,json,math
B=Path(__file__).resolve().parents[2]/'editorial/reviews/c1-six-closures-numeric-witness-4c83-20261126'
class RawFloatWitness(unittest.TestCase):
 def test_actual_values_are_recorded_before_unchanged_strict_rejection(self):
  o=B/'actual-ui-6';r=json.loads((o/'report.json').read_bytes());self.assertEqual(len(r['cases']),6);self.assertEqual(r['technicalStatus'],'FAIL');self.assertEqual(json.loads((o/'terminal-receipt.json').read_bytes())['observedExitCode'],1)
  witnesses=[json.loads(x)for x in (o/'pre-comparison-witness.jsonl').read_text().splitlines()];self.assertEqual(len(witnesses),3)
  for w in witnesses:self.assertFalse(w['strictEqual']);self.assertNotEqual(w['actual'],w['expected'])
 def test_transcendental_ulp_drift_and_exact_quadrature_are_distinct(self):
  ws=[json.loads(x)for x in (B/'actual-ui-6/pre-comparison-witness.jsonl').read_text().splitlines()]
  for w in ws:
   if w['caseKey'].startswith('SIM-C1-L005-05'):
    self.assertEqual(abs(w['actual']-w['expected']),math.ulp(w['expected']))
   else:self.assertEqual(w['actual'],0);self.assertEqual(w['expected'],12*math.cos(math.pi/2))
 def test_no_relaxed_comparator_was_introduced(self):
  s=(B/'collector-c1-derived.mjs').read_text();self.assertIn("assert.ok(measured.exactEqualityWitness.strictEqual,'Frozen independently reviewed numerical state drifted')",s);self.assertIn("await fs.appendFile(path.join(out,'pre-comparison-witness.jsonl')",s)
if __name__=='__main__':unittest.main()
