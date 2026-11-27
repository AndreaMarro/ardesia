from pathlib import Path
from fractions import Fraction as F
import gzip,hashlib,importlib.util,json,unittest
from unittest.mock import patch
B=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-wave-zero-3ed5-20261127'
spec=importlib.util.spec_from_file_location('wavezero3ed5check',B/'artifact-check.py');CHECK=importlib.util.module_from_spec(spec);spec.loader.exec_module(CHECK)
class DistinctWaveZeroFocused(unittest.TestCase):
 def test_actual98_focused_cases_and_source_pilot_grading(self):
  r=CHECK.check();self.assertEqual(r['actualCases'],98);self.assertEqual(r['actualPaths'],14);self.assertEqual(r['scope'],'FOCUSED_ONLY');self.assertEqual(r['activityCredit'],0)
 def test_zero_crossing_and_persistent_node_keep_distinct_amplitudes_and_small_signs(self):
  rows=CHECK.load(B/'actual-ui-98/report.json')['records'];self.assertEqual(sum(r['state']=='zero-crossing'for r in rows),14)
  for r in rows:
   if r['state']=='zero-crossing':self.assertEqual((r['displacement'],r['actualAmplitude']),('0 mm','4 mm'))
   elif r['state'].startswith('persistent-node'):self.assertEqual((r['displacement'],r['actualAmplitude']),('0 mm','0 mm'))
   elif r['state'].endswith('small'):self.assertEqual(r['displacement'],(''if r['state'].startswith('positive')else'-')+'0,0002513 mm')
 def test_manual_rational_bound_and_unchanged_raw_physics(self):
  lo=F(333,106*50000);hi=F(355,113*50000);self.assertLess(F(25125,100000000),4*(lo-lo**3/6));self.assertLess(4*hi,F(25135,100000000));m=json.loads(gzip.decompress((B/'actual-model-observation.json.gz').read_bytes()));self.assertEqual(len(m['rows']),240);self.assertEqual(sum(len(r['samples'])for r in m['rows']),2160);self.assertNotEqual(m['oldCounterexample']['rawMetres'],0);self.assertEqual(m['oldCounterexample']['newMillimetres'],0)
  for r in m['boundaryCases']:self.assertEqual(r['actual'],r['expected'])
 def test_missing_image_commitment_and_wrong_epoch_are_rejected(self):
  with patch.object(CHECK,'INDEX','0'*64),self.assertRaises(ValueError):CHECK.check()
  with patch.object(CHECK,'RUNTIME','unknown'),self.assertRaises(ValueError):CHECK.check()
  original=CHECK.sha
  with patch.object(CHECK,'sha',side_effect=lambda p:'0'*64 if p.suffix=='.png'else original(p)),self.assertRaises(ValueError):CHECK.check()
if __name__=='__main__':unittest.main()
