"""Every requested nonzero directional glyph survives; exact zeros disappear.

This inspects captured instrument calls/elements, not pixels. To replay against
another actually collected epoch, point C3_ARROW_CENSUS at that new census JSON;
the expectations remain unchanged and the old cb9 observation is retained.
"""
import json,os,unittest
from pathlib import Path
FILE=Path(os.environ.get('C3_ARROW_CENSUS',str(Path(__file__).with_name('actual-arrow-census.json'))))
DATA=json.loads(FILE.read_text())
class ArrowCensus(unittest.TestCase):
 def test_all36_instruments_match_effective_elements_and_full_state_coverage(self):
  self.assertEqual(len(DATA['records']),36);self.assertEqual(DATA['states'],1369);self.assertEqual(DATA['unexpectedRawVsInstalled'],[])
 def test_positive_or_negative_nonzero_grid_arrows_are_retained(self):
  for r in DATA['records']:
   for case in r['cases']:
    if case['kind']!='grid':continue
    for arrow in case['arrows']:
     if not arrow['physicalZero']:
      with self.subTest(id=r['id'],x=case['x'],color=arrow['c']):self.assertTrue(arrow['retainedByActualRenderer'])
 def test_nonzero_clock_arrows_are_retained(self):
  for r in DATA['records']:
   for case in r['cases']:
    if case['kind']!='clock':continue
    for arrow in case['arrows']:
     if not arrow['physicalZero']:
      with self.subTest(id=r['id'],x=case['x'],time=case['time'],color=arrow['c']):self.assertTrue(arrow['retainedByActualRenderer'])
 def test_exact_zero_has_no_directional_glyph(self):
  for r in DATA['records']:
   for case in r['cases']:
    for arrow in case['arrows']:
     if arrow['physicalZero']:
      with self.subTest(id=r['id'],x=case['x'],time=case.get('time')):self.assertFalse(arrow['retainedByActualRenderer'])
if __name__=='__main__':unittest.main(verbosity=2)
