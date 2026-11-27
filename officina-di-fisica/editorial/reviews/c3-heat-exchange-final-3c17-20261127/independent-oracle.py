from pathlib import Path
from fractions import Fraction as Q
import sys,json,hashlib,unittest,copy
import pint
F=Path(__file__).parent;P=Path(sys.argv.pop(1));O=Path(sys.argv.pop(1));obs=json.loads(O.read_bytes());pkg=json.loads(P.read_bytes());bindings=json.loads(P.with_name(P.stem+'-bindings.json').read_bytes());source={r['id']:r for r in json.loads((F/'source-C3-5d.json').read_bytes())};sha=lambda b:hashlib.sha256(b).hexdigest();canon=lambda r:json.dumps(r,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode();POINTS=[[2,8],[2,3.5],[200,400]];ANSWERS=[[Q(10),Q(5,2)],[Q(84),Q(147)],[Q(-7371,20),Q(3969,4)]];U=pint.UnitRegistry()
def exact(i,x):
 x=Q(str(x))
 return 20/x if i==0 else 42*x if i==1 else Q(567,10**10)*(x**4-300**4)
def ieee(i,x):
 return float(Q.from_float(5.67e-8)*(Q(str(x))**4-300**4))if i==2 else float(exact(i,x))
def validate_tasks(i,row):
 assert row['points']==POINTS[i]and len(row['tasks'])==2
 for t,x in zip(row['tasks'],POINTS[i]):assert t['value']==ieee(i,x)
class HeatExchangeIndependent(unittest.TestCase):
 def test_source_package_binding_identity_and_preserved_physics(self):
  self.assertEqual(len(pkg['records']),3);self.assertEqual(pkg['assets'],[])
  for row,b in zip(pkg['records'],bindings):
   old=source[row['id']];self.assertEqual(row['id'],b['id']);self.assertEqual(sha(canon(row)),b['candidateSha256']);self.assertEqual(sha(canon(old)),b['sourceSha256']);self.assertEqual(row['baseVersion'],old['version']);self.assertEqual(row['version'],old['version']+1)
   for field in['skill','topic','apparatus','control','measure','references','substitution','discrete']:self.assertEqual(row.get(field),old.get(field))
 def test_six_actual_compiled_tasks_match_independent_answers(self):
  for i,row in enumerate(obs['records']):validate_tasks(i,row)
  self.assertEqual([list(map(str,ANSWERS[i]))for i in range(3)],[['10','5/2'],['84','147'],['-7371/20','3969/4']])
 def test_all67_grid_values_explicit_ieee_radiation_without_epsilon(self):
  self.assertEqual(obs['scalarControls'],67);self.assertEqual(obs['stagePairs'],268)
  for i,row in enumerate(obs['records']):
   for g in row['grid']:self.assertEqual(g['y'],ieee(i,g['x']))
 def test_dimensions_and_manual_factorization(self):
  self.assertEqual((1*U.watt/(U.meter*U.kelvin)*.01*U.meter**2*20*U.kelvin/(.02*U.meter)).dimensionality,U.watt.dimensionality);self.assertEqual((1*U.gram/U.second*1*U.joule/(U.gram*U.kelvin)*U.kelvin).dimensionality,U.watt.dimensionality);self.assertEqual((U.watt/U.meter**2/U.kelvin**4*U.kelvin**4).dimensionality,(U.watt/U.meter**2).dimensionality)
  self.assertEqual(Q(567,100)*(2**4-3**4),Q(-7371,20));self.assertEqual(Q(567,100)*(4**4-3**4),Q(3969,4));self.assertEqual(42*Q(7,2),147)
 def test_equilibrium_gross_flux_and_nonlinear_counterexample(self):
  sigma=Q(567,10**10);self.assertEqual(sigma*300**4,Q(45927,100));self.assertEqual(exact(2,300),0);self.assertEqual((sigma*400**4)/(sigma*200**4),16);self.assertEqual(exact(2,400)/exact(2,200),Q(-35,13))
 def test_clock_mass_and_periods_cpu_only(self):
  clock=obs['records'][1]['clocks'];self.assertEqual(len(clock),6)
  for c in clock:self.assertEqual(c['signal'],c['x']*c['t']);self.assertEqual(c['frame']['giri'],c['x']*c['t']/10);self.assertEqual(c['clockUnit'],'s');self.assertEqual(c['unit'],'g')
 def test_wrong_task_mutations_rejected(self):
  for i,row in enumerate(obs['records']):
   wrong=copy.deepcopy(row);wrong['tasks'][0]['value']+=1
   with self.assertRaises(AssertionError):validate_tasks(i,wrong)
if __name__=='__main__':unittest.main(verbosity=2)
