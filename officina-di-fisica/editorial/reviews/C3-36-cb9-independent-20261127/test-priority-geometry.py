"""Actual cb9 elements: priority physical glyph checks, no pixel/UI claims."""
import json,unittest
from pathlib import Path
OUT=Path(__file__).resolve().parent
ROWS={r['id']:r for group in ('state','entropy')for r in json.loads((OUT/(group+'-actual-code.json')).read_text())['records']}
PURPLE=0x7350b0
class PriorityGeometry(unittest.TestCase):
 def test_thermometer_end_cap_is_above_opaque_bulb_at_all31_inputs(self):
  for case in ROWS['SIM-C3-L01-04']['cases']:
   es=case['elements'];ball=next(e for e in es if e['kind']=='ball'and e.get('alpha',1)==1);rod=next(e for e in es if e['kind']=='rod'and e.get('alpha',1)==1)
   with self.subTest(x=case['x']):self.assertGreater(rod['b'][1],ball['p'][1]+ball['r'])
 def test_fridge_positive_work_has_visible_geometry_at_smallest_positive_input(self):
  case=next(c for c in ROWS['SIM-C3-L09-01']['cases']if c['x']==5)
  self.assertEqual(sum(e['kind']=='arrow'and e['c']==PURPLE for e in case['elements']),1,'Qc=5 J gives W=2.5 J, not zero')
 def test_engine_positive_work_has_visible_geometry_at_smallest_positive_input(self):
  case=next(c for c in ROWS['SIM-C3-L09-02']['cases']if c['x']==10)
  self.assertEqual(sum(e['kind']=='arrow'and e['c']==PURPLE for e in case['elements']),1,'Qh=10 J gives W=3 J, not zero')
 def test_degenerate_zero_work_has_no_purple_arrow(self):
  for key in ('SIM-C3-L09-01','SIM-C3-L09-02'):
   case=next(c for c in ROWS[key]['cases']if c['x']==0)
   with self.subTest(id=key):self.assertFalse(any(e['kind']=='arrow'and e['c']==PURPLE for e in case['elements']))
if __name__=='__main__':unittest.main(verbosity=2)
