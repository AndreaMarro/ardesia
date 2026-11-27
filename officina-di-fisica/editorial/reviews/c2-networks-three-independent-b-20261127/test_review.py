import unittest,copy,json,hashlib
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal
from independent_math import exact,value,inverse,SPECS,verify_record
D=Path(__file__).resolve().parent
class Review(unittest.TestCase):
 def setUp(self):self.rs=json.loads((D/'package.json').read_text(),parse_float=Decimal)['records']
 def test_01_all_independent_records(self):
  self.assertEqual(len(self.rs),3)
  for r in self.rs:self.assertTrue(verify_record(r))
 def test_02_six_manual_forward_inverse(self):
  for ident,(_,_,_,ps,ys,_)in SPECS.items():
   for x,y in zip(ps,ys):self.assertEqual(value(ident,x,True),exact(y));self.assertEqual(inverse(ident,y),exact(x))
 def test_03_all24_grid_inverses(self):
  for ident in SPECS:
   for x in range(1,9):self.assertEqual(inverse(ident,value(ident,x,True)),x)
 def test_04_bad_references_rejected(self):
  for s in self.rs:
   for i in range(2):
    r=copy.deepcopy(s);r['references'][i][1]=exact(r['references'][i][1])+1
    with self.assertRaises(ValueError):verify_record(r)
 def test_05_points_units_lesson_typed_versions(self):
  for s in self.rs:
   for f,v in [('skill','C2-L008'),('baseVersion',True),('version',True)]:
    r=copy.deepcopy(s);r[f]=v
    with self.assertRaises(ValueError):verify_record(r)
   r=copy.deepcopy(s);r['measure']['unit']='1'
   with self.assertRaises(ValueError):verify_record(r)
   r=copy.deepcopy(s);r['assessmentSelection']['points'][1]=1
   with self.assertRaises(ValueError):verify_record(r)
 def test_06_exact_finite_public_helper_guards(self):
  bad=[True,False,1.0,float('nan'),float('inf'),complex(1,1),'nan','oo','-oo','NaN','Infinity','I','1/0','1e999',Decimal('Infinity'),Decimal('NaN')]
  for ident in SPECS:
   for x in bad:
    for fn in [value,inverse]:
     with self.assertRaises(ValueError):fn(ident,x)
 def test_07_input_bounds_grid(self):
  for ident in SPECS:
   for x in ['0','9']:
    with self.assertRaises(ValueError):value(ident,x)
   with self.assertRaises(ValueError):value(ident,'1.5',True)
 def test_08_inverse_invalid_domains(self):
  for ident,ys in [(list(SPECS)[0],['0','2','-1','3']),(list(SPECS)[1],['0','-1','13']),(list(SPECS)[2],['0','10','11','-1'])]:
   for y in ys:
    with self.assertRaises(ValueError):inverse(ident,y)
 def test_09_parallel_less_than_both_not_series(self):
  for x in range(1,9):y=value(list(SPECS)[0],x);self.assertLess(y,min(F(2),F(x)));self.assertNotEqual(y,2+x)
 def test_10_parallel_total_not_upper(self):
  self.assertEqual([value(list(SPECS)[1],x)for x in[3,6]],[4,2]);self.assertEqual([4+value(list(SPECS)[1],x)for x in[3,6]],[8,6])
 def test_11_node_pressure_both_paths_and_monotonicity(self):
  ys=[]
  for x in range(1,9):q=F(10,2+x);p=value(list(SPECS)[2],x);self.assertEqual(p,x*q);self.assertEqual(p,10-2*q);self.assertTrue(0<p<10);ys.append(p)
  self.assertEqual(ys,sorted(ys))
 def test_12_hydraulic_units(self):
  self.assertEqual(F(3*10**9)*F(4,10**6),12000);self.assertEqual(F(6*10**9)*F(2,10**6),12000);self.assertEqual(F(2*10**9)*F(5,4*10**6),2500)
 def test_13_raw_immutable_input_hashes(self):
  for e in json.loads((D/'git-inputs.json').read_text())['inputs']:self.assertEqual(hashlib.sha256((D/e['snapshot']).read_bytes()).hexdigest(),e['sha256'])
 def test_14_actual48_comparison_scope(self):
  a=json.loads((D/'actual-comparison.json').read_text());self.assertEqual(a['states'],48);self.assertEqual(a['actualDraftTasks'],6);self.assertEqual(a['literalServedDraftPromptsMatched'],6);self.assertEqual(a['Chrome'],'NOT_RUN')
if __name__=='__main__':unittest.main()
