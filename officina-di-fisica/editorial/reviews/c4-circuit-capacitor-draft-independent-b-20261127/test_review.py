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
  self.assertEqual(value('SIM-C4-L06-01','12'),3)
  self.assertNotEqual(value('SIM-C4-L06-01','12'),16)
  self.assertEqual(value('SIM-C4-L06-02','3'),27)
  self.assertEqual(value('SIM-C4-L07-01','2'),F(4427,100))
  self.assertEqual(value('SIM-C4-L07-02','5'),10)
  self.assertEqual(value('SIM-C4-L07-03','5'),25)
  self.assertEqual(value('SIM-C4-L08-01','6'),F(3,2))
  self.assertEqual(value('SIM-C4-L08-02','9'),3)
 def test_epsilon_unit_conversion_and_approximate_data(self):
  epsilon=F(8854,10**15);area=F(1,100)
  self.assertEqual(epsilon*area/F(2,1000)*10**12,F(4427,100))
  self.assertEqual(epsilon*area/F(4,1000)*10**12,F(4427,200))
  self.assertNotEqual(value('SIM-C4-L07-01','2'),F(4427,10000))
if __name__=='__main__':unittest.main()
