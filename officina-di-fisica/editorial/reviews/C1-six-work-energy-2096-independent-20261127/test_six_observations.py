import hashlib,json,math,pathlib,unittest
from decimal import Decimal,localcontext
from fractions import Fraction as F
D=pathlib.Path(__file__).resolve().parent
H=lambda b:hashlib.sha256(b).hexdigest()
J=lambda p:json.loads(p.read_text())
class SixObservations(unittest.TestCase):
 def setUp(self):
  self.p=J(D/'prepared.json');self.rows=J(D/'selected-index.json');self.cases=[J(D/r['file'])for r in self.rows]
 def test_integrity_actual_terminal_and_complete_raster_read(self):
  t=J(D/'terminal-receipt.json');self.assertEqual(t['observedExitCode'],0);self.assertEqual(H((D/'actual-browser/report.json').read_bytes()),t['reportSha256'])
  self.assertEqual(t['runtimeSha256'],'2096493ae86311ec459e012032cd1f8fe41293326cc5769d86376aa5a0b59635')
  self.assertEqual(len(self.cases),296);self.assertEqual(len({r['caseKey']for r in self.rows}),296)
  seen=J(D/'raster-read-log.json');self.assertEqual(seen['pending'],[])
  fresh={r['imageSha256']for r in seen['actuallyOpened']};reuse=J(D/'raster-identity-reuse.json');prior={r['imageSha256']for r in J(D/'prior-raster-read-log.json')['actuallyOpened']}
  self.assertEqual(fresh,{i['sha256']for r in J(D/'priority-raster-index.json')for i in r['screenshots']})
  self.assertEqual(fresh|set(reuse['reusedImageSha256']),{i['sha256']for r in self.rows for i in r['screenshots']})
  self.assertLessEqual(set(reuse['reusedImageSha256']),prior)
  self.assertEqual(len(seen['actuallyOpened']),len({i['sha256']for r in J(D/'priority-raster-index.json')for i in r['screenshots']}))
  self.assertGreaterEqual(len(seen['actuallyOpened']),48)
  for r in self.rows:
   self.assertEqual(H((D/r['file']).read_bytes()),r['sha256'])
   for i in r['screenshots']:self.assertEqual(H((D/i['file']).read_bytes()),i['sha256'])
 def test_independent_physics_every_observed_state(self):
  counts={}
  for c in self.cases:
   if c['caseKey'].endswith('setup'):continue
   k=c['id'][-7:];x=F(str(c['sourceReplayedX']));y=c['model']['y']
   if k=='L006-01':v=x if x<=6 else F(3)
   elif k=='L006-02':v=-x/2
   elif k=='L006-03':v=1/x**2
   elif k=='L007-01':v={F(0):12,F(90):0,F(120):-6,F(180):-12}[x]
   elif k=='L007-02':v=6*x
   elif k=='L007-03':
    with localcontext()as ctx:ctx.prec=50;v=(Decimal(x.numerator)/Decimal(x.denominator)).sqrt()
   else:raise AssertionError(k)
   # Existing canonical representation allowance, not a relaxed physical law.
   self.assertTrue(math.isclose(y,float(v),rel_tol=1e-10,abs_tol=1e-9),(c['caseKey'],y,v));counts[k]=counts.get(k,0)+1
  self.assertEqual(sum(counts.values()),248)
 def test_actual_twelve_tasks_submitted_across_eight_profiles(self):
  expected={'L006-01':['3','6'],'L006-02':['-2','-0.5'],'L006-03':['0.25','0.1322'],'L007-01':['-6','0'],'L007-02':['18','12'],'L007-03':['3','2.83']}
  setups=[c for c in self.cases if c['caseKey'].endswith('setup')];self.assertEqual(len(setups),48)
  for c in setups:
   self.assertEqual([q['input']for q in c['questions']],expected[c['id'][-7:]])
   for q in c['questions']:self.assertTrue(q['status'].startswith('Corretto.'));self.assertTrue(q['actualPrompt'])
  self.assertTrue(F(282,100)**2<8<F(283,100)**2)
  self.assertTrue(F(1,100)/F(282,100)<F(5,1000))
  self.assertEqual(abs(F(1322,10000)-F(16,121))/F(16,121),F(19,80000))
 def test_zeros_and_clock_semantics(self):
  for c in self.cases:
   if c['caseKey'].endswith('setup'):continue
   if c['id'].endswith(('L007-02','L007-03'))and c['model']['x']==0:
    self.assertEqual([e for e in c['elements']if e['kind']=='arrow'],[])
    if c['id'].endswith('L007-02'):self.assertIn('Non definita (intervallo nullo)',c['readings'])
   if c['id'].endswith('L007-01')and c['model']['x']==90:
    self.assertEqual(c['model']['y'],0);self.assertGreaterEqual(len([e for e in c['elements']if e['kind']=='arrow']),2)
   if '|clock|'in c['caseKey']:
    self.assertEqual(c['sourceReplayedX'],c['requestedTime']);self.assertEqual(c['model']['y'],6*c['requestedTime'])
 def test_short_force_not_hidden_in_mass_and_fallback_margin(self):
  states=[c for c in self.cases if c['id'].endswith('L006-02')and not c['caseKey'].endswith('setup')and c['model']['x']==1]
  self.assertEqual(len(states),8)
  for c in states:
   ball=next(e for e in c['elements']if e['kind']=='ball');a=next(e for e in c['elements']if e['kind']=='arrow')
   self.assertAlmostEqual(math.dist(a['a'],ball['p']),.3);self.assertAlmostEqual(math.dist(a['b'],ball['p']),.5)
   self.assertGreater(math.dist(a['a'],ball['p']),ball['r'])
  # 47*0.2 projection; head halfwidth1.504 exceeds shaft halfwidth1.35.
  self.assertEqual(F(47)*F(1,5)/3*F(48,100)-F(27,20),F(77,500))
 def test_legends_and_no_draft_substitution(self):
  records=[r for r in self.p['records']if r['id'].startswith(('SIM-C1-L006','SIM-C1-L007'))]
  self.assertEqual(len(records),6)
  self.assertTrue(all(r['variant']=='published'and r['candidateSha256']is None for r in records))
  for c in self.cases:
   if c['caseKey'].endswith('setup'):continue
   if c['id'].endswith('L006-03'):self.assertIn('cinque volte',c['legend'])
   if c['id'].endswith(('L007-02','L007-03')):self.assertIn('sei volte',c['legend'])
   if c['id'].endswith('L007-01'):self.assertIn('L’asse x è etichettato',c['legend'])
if __name__=='__main__':unittest.main(verbosity=2)
