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
 def test_ten_inverse_manual_tasks(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
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
 def test_unit_and_typed_versions_rejected(self):
  for s in self.records:
   for field,v in[('unit','wrong'),('baseVersion',True),('version',True),('baseVersion',2),('version',1)]:
    r=copy.deepcopy(s)
    if field=='unit':r['measure']['unit']=v
    else:r[field]=v
    with self.assertRaises(ValueError):verify_record(r)
 def test_nucleon_counts_integer_and_element(self):
  self.assertEqual(value('SIM-C5-L08-01','7'),13);self.assertEqual(inverse('SIM-C5-L08-01','14'),8)
  with self.assertRaises(ValueError):value('SIM-C5-L08-01','6.5')
 def test_nuclear_daughter_not_emitted_charge(self):
  self.assertEqual(value('SIM-C5-L08-03','1'),-2);self.assertEqual(value('SIM-C5-L08-03','2'),1);self.assertEqual(value('SIM-C5-L08-03','3'),0)
  with self.assertRaises(ValueError):value('SIM-C5-L08-03','1.5')
 def test_reflection_geometric_segments_not_velocities(self):
  self.assertEqual(value('SIM-C5-L09-01','20'),40);self.assertNotEqual(value('SIM-C5-L09-01','20'),140)
  self.assertEqual(value('SIM-C5-L09-01','0'),0)
 def test_centimeter_to_meter_and_inverse_power(self):
  self.assertEqual(1/F(5,100),20);self.assertEqual(1/F(20,100),5)
  self.assertNotEqual(value('SIM-C5-L10-01','5'),F(1,5))
 def test_image_sign_zero_vergence_not_finite_q(self):
  self.assertEqual(value('SIM-C5-L10-02','5'),-10);self.assertEqual(value('SIM-C5-L10-02','20'),5);self.assertEqual(value('SIM-C5-L10-02','10'),0)
  self.assertEqual(inverse('SIM-C5-L10-02','0'),10)
 def test_inverse_domains(self):
  for ident,y in[('SIM-C5-L08-01','13.5'),('SIM-C5-L08-03','-1'),('SIM-C5-L10-01','0'),('SIM-C5-L10-01','-1'),('SIM-C5-L10-02','10'),('SIM-C5-L09-01','200')]:
   with self.assertRaises(ValueError):inverse(ident,y)
if __name__=='__main__':unittest.main()
