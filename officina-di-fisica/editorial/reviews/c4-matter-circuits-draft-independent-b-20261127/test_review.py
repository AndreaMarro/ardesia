import unittest,json,copy
from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
from independent_math import exact,value,SPECS,verify_record
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 def setUp(self):self.records=json.loads((D/'package.json').read_text(),parse_float=Decimal)['records']
 def test_seven_records_independent_primary(self):
  for r in self.records:self.assertTrue(verify_record(r))
 def test_fourteen_assigned_exact_answers(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
   for x,y in zip(pts,answers):self.assertEqual(value(ident,x,True),exact(y))
 def test_wrong_reference_answer_each_task_rejected(self):
  for source in self.records:
   for j in range(2):
    r=copy.deepcopy(source);r['references'][j][1]=exact(r['references'][j][1])+1
    with self.assertRaises(ValueError):verify_record(r)
 def test_retargeted_points_rejected(self):
  for source in self.records:
   r=copy.deepcopy(source);r['assessmentSelection']['points'][1]=r['assessmentSelection']['points'][0]
   with self.assertRaises(ValueError):verify_record(r)
 def test_no_binary_float_bool_complex_nonfinite(self):
  bad=[True,False,1.0,float('inf'),float('nan'),complex(1,1),'nan','NaN','oo','-oo','Infinity','I','1e999','1/0',Decimal('Infinity'),Decimal('NaN')]
  for ident in SPECS:
   for x in bad:
    with self.assertRaises(ValueError):value(ident,x)
 def test_bounds_and_off_grid(self):
  for ident,(lo,hi,step,*_)in SPECS.items():
   for x in [exact(lo)-1,exact(hi)+1]:
    with self.assertRaises(ValueError):value(ident,x)
   with self.assertRaises(ValueError):value(ident,exact(lo)+exact(step)/2,True)
 def test_unit_and_typed_version_rejected(self):
  for s in self.records:
   for field,v in [('unit','wrong'),('baseVersion',True),('version',True)]:
    r=copy.deepcopy(s)
    if field=='unit':r['measure']['unit']=v
    else:r[field]=v
    with self.assertRaises(ValueError):verify_record(r)
 def test_constitutive_distinctions(self):
  self.assertEqual(value('SIM-C4-L04-01','8'),0)
  self.assertEqual(value('SIM-C4-L04-02','9'),3)
  self.assertNotEqual(value('SIM-C4-L04-02','9'),27)
  self.assertEqual(value('SIM-C4-L05-01','4'),8)
  self.assertEqual(value('SIM-C4-L05-02','6'),2)
  self.assertEqual(value('SIM-C4-L05-03','-4'),-1)
  self.assertEqual(value('SIM-C4-L05-04','2'),1)
  self.assertEqual(value('SIM-C4-L05-05','0.8'),F(8,5))
if __name__=='__main__':unittest.main()
