import unittest,json,copy
from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
from independent_math import exact,value,inverse,SPECS,verify_record
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 def setUp(self):self.records=json.loads((D/'package.json').read_text(),parse_float=Decimal)['records']
 def test_six_records_independent_primary(self):
  self.assertEqual(len(self.records),6)
  for r in self.records:self.assertTrue(verify_record(r))
 def test_twelve_assigned_exact_answers(self):
  for ident,(_,_,_,pts,answers,_,_)in SPECS.items():
   for x,y in zip(pts,answers):self.assertEqual(value(ident,x,True),exact(y))
 def test_twelve_inverse_manual_tasks(self):
  for ident,(_,_,_,pts,answers,_,_)in SPECS.items():
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
 def test_unit_and_typed_individual_versions_rejected(self):
  for s in self.records:
   for field,v in[('unit','wrong'),('baseVersion',True),('version',True),('baseVersion',3),('version',1)]:
    r=copy.deepcopy(s)
    if field=='unit':r['measure']['unit']=v
    else:r[field]=v
    with self.assertRaises(ValueError):verify_record(r)
 def test_induction_sign_not_absolute_value(self):
  self.assertEqual(value('SIM-C4-L10-02','3'),F(-3,2));self.assertEqual(value('SIM-C4-L10-02','-2'),1)
  self.assertEqual(value('SIM-C4-L10-04','6'),-3);self.assertEqual(value('SIM-C4-L10-04','-4'),2)
  self.assertNotEqual(value('SIM-C4-L10-04','6'),6)
 def test_milli_micro_and_turns_conversion(self):
  self.assertEqual(F(2,10**7)/F(1,20)*10**6,4)
  self.assertEqual(F(12,100)*100,12)
  self.assertEqual(F(3,10)*F(2,100)*1000,6)
  self.assertEqual(10*F(5,100),F(1,2))
 def test_flux_normal_not_plane_and_zero(self):
  self.assertEqual(value('SIM-C4-L10-01','0'),6);self.assertEqual(value('SIM-C4-L10-01','90'),0)
  self.assertEqual(value('SIM-C4-L10-01','120'),-3);self.assertEqual(value('SIM-C4-L10-01','60'),3)
 def test_linked_flux_not_multiplied_twice_and_average(self):
  self.assertEqual(value('SIM-C4-L10-03','0.5'),-4)
  self.assertNotEqual(value('SIM-C4-L10-03','0.5'),-40)
  with self.assertRaises(ValueError):value('SIM-C4-L10-03','0')
 def test_finite_inverse_domains(self):
  for ident,y in[('SIM-C4-L09-03','0'),('SIM-C4-L09-03','-4'),('SIM-C4-L10-03','0'),('SIM-C4-L10-03','4'),('SIM-C4-L10-01','7'),('SIM-C4-L09-01','100')]:
   with self.assertRaises(ValueError):inverse(ident,y)
 def test_original_lorentz_is_excluded(self):
  self.assertNotIn('SIM-C4-L09-02',SPECS)
  self.assertTrue(all(r['id']!='SIM-C4-L09-02'for r in self.records))
if __name__=='__main__':unittest.main()
