import unittest,json,copy
from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
from independent_math import exact,value,inverse,SPECS,verify_record
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 def setUp(self):self.records=json.loads((D/'package.json').read_text(),parse_float=Decimal)['records']
 def test_five_records_independent_primary(self):
  self.assertEqual(len(self.records),5)
  for r in self.records:self.assertTrue(verify_record(r))
 def test_ten_assigned_exact_answers(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
   for x,y in zip(pts,answers):self.assertEqual(value(ident,x,True),exact(y))
 def test_eight_identifiable_inverse_tasks(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
   if ident.endswith('02'):continue
   for x,y in zip(pts,answers):self.assertEqual(inverse(ident,y),exact(x))
 def test_wrong_reference_answers_rejected(self):
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
    for fn in[value,inverse]:
     with self.assertRaises(ValueError):fn(ident,x)
 def test_bounds_and_off_grid(self):
  for ident,(lo,hi,step,*_)in SPECS.items():
   for x in[exact(lo)-1,exact(hi)+1]:
    with self.assertRaises(ValueError):value(ident,x)
   with self.assertRaises(ValueError):value(ident,exact(lo)+exact(step)/2,True)
 def test_unit_and_typed_versions_and_lesson_rejected(self):
  for s in self.records:
   for field,v in[('unit','wrong'),('baseVersion',True),('version',True),('skill','C2-L006')]:
    r=copy.deepcopy(s)
    if field=='unit':r['measure']['unit']=v
    else:r[field]=v
    with self.assertRaises(ValueError):verify_record(r)
 def test_reynolds_dimensions_and_conversion(self):
  self.assertEqual(F(1000)*F(15,100)*F(1,100)/F(1,1000),1500)
  self.assertEqual(F(1000)*F(4,10)*F(1,100)/F(1,1000),4000)
  self.assertEqual(value('SIM-C2-L007-01','0'),0)
 def test_steady_does_not_invert_time(self):
  for t in['0','1','2','4']:self.assertEqual(value('SIM-C2-L007-02',t),6)
  for v in['0','6','8']:
   with self.assertRaises(ValueError):inverse('SIM-C2-L007-02',v)
 def test_dynamic_viscosity_stress_not_total_force(self):
  self.assertEqual(F(1,2)*4,2);self.assertEqual(F(3,2)*4,6)
  self.assertEqual(value('SIM-C2-L007-03','1.5'),6)
 def test_gradient_mm_cancel_or_m_cancel(self):
  self.assertEqual(F(40,1000)/F(2,1000),20)
  self.assertEqual(F(40,1000)/F(5,1000),8)
  self.assertNotEqual(value('SIM-C2-L007-04','2'),F(1,20))
 def test_parabolic_square_and_no_slip(self):
  self.assertEqual(value('SIM-C2-L007-05','0.5'),9);self.assertEqual(value('SIM-C2-L007-05','1'),0)
  self.assertEqual(value('SIM-C2-L007-05','0'),12);self.assertNotEqual(value('SIM-C2-L007-05','0.5'),6)
 def test_inverse_domains(self):
  for ident,y in[('SIM-C2-L007-01','-1'),('SIM-C2-L007-03','0'),('SIM-C2-L007-04','0'),('SIM-C2-L007-05','13'),('SIM-C2-L007-05','-1')]:
   with self.assertRaises(ValueError):inverse(ident,y)
if __name__=='__main__':unittest.main()
