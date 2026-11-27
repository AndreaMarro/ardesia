import unittest,json,copy
from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
from independent_math import exact,value,inverse,SPECS,verify_record
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 def setUp(self):self.records=json.loads((D/'package.json').read_text(),parse_float=Decimal)['records']
 def test_four_records_independent_physical_primary(self):
  self.assertEqual(len(self.records),4)
  for r in self.records:self.assertTrue(verify_record(r))
 def test_eight_assigned_exact_answers(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
   for x,y in zip(pts,answers):self.assertEqual(value(ident,x,True),exact(y))
 def test_eight_inverse_tasks_with_nonunique_choice(self):
  for ident,(_,_,_,pts,answers,_)in SPECS.items():
   for x,y in zip(pts,answers):
    if ident.endswith('02'):self.assertIn(exact(x),inverse(ident,y))
    else:self.assertEqual(inverse(ident,y),exact(x))
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
 def test_unit_typed_versions_and_theoretical_lesson(self):
  for s in self.records:
   for field,v in[('unit','wrong'),('baseVersion',True),('version',True),('skill','C2-L007')]:
    r=copy.deepcopy(s)
    if field=='unit':r['measure']['unit']=v
    else:r[field]=v
    with self.assertRaises(ValueError):verify_record(r)
 def test_radius_fourth_not_area_alone(self):
  self.assertEqual(value('SIM-C2-L008-01','2'),16);self.assertNotEqual(value('SIM-C2-L008-01','2'),4)
  self.assertEqual(value('SIM-C2-L008-01','0.5'),F(1,16))
 def test_each_change_restarts_same_reference(self):
  self.assertEqual([value('SIM-C2-L008-02',i)for i in[1,2,3,4]],[16,F(1,2),F(1,2),2])
  self.assertEqual(inverse('SIM-C2-L008-02','0.5'),frozenset([F(2),F(3)]))
 def test_hydraulic_si_units(self):
  self.assertEqual(F(3*10**9)*F(25,10**7),7500);self.assertEqual(F(3*10**9)*F(6,10**6),18000)
  self.assertEqual(value('SIM-C2-L008-03','0'),0)
 def test_percent_radius_not_percent_flow(self):
  self.assertEqual(value('SIM-C2-L008-04','-20'),F(256,625));self.assertEqual(value('SIM-C2-L008-04','20'),F(1296,625))
  self.assertEqual(F(256,625)-1,F(-5904,10000));self.assertEqual(F(1296,625)-1,F(10736,10000))
  self.assertNotEqual(value('SIM-C2-L008-04','20'),F(1,1)/value('SIM-C2-L008-04','-20'))
 def test_exact_decimal_manual_conversion(self):
  self.assertEqual(F(256,625),F(4096,10000));self.assertEqual(F(1296,625),F(20736,10000))
 def test_inverse_domains(self):
  for ident,y in[('SIM-C2-L008-01','0'),('SIM-C2-L008-01','-1'),('SIM-C2-L008-02','3'),('SIM-C2-L008-03','-1'),('SIM-C2-L008-04','0')]:
   with self.assertRaises(ValueError):inverse(ident,y)
if __name__=='__main__':unittest.main()
