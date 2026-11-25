"""Original C6 exact models, actual tasks, clocks, rays and strict partial gates."""
import copy,json,subprocess,unittest
from unittest.mock import patch
from tools.corpus_engineering import experiments_C6_code_partial_verifier as v
class C6CodePartial(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.sources={r['id']:r for r in json.loads(subprocess.check_output(['git','show',v.REF+':'+v.SOURCE],cwd=v.APP))}
  cls.proof=json.loads((v.APP/'editorial/reviews/C6-cross-domain-installed-code-1a35-20261125.json').read_bytes())
 def test_six_actual_tasks_units_clocks_no_complete_credit(self):
  report=v.report('cross-domain');rows=report['records']
  self.assertEqual(len(rows),6);self.assertEqual(len({r['id'] for r in rows}),6)
  self.assertEqual(sum(r['gridCount'] for r in rows),97);self.assertEqual(sum(r['clockSampleCount'] for r in rows),400)
  self.assertEqual(report['consumerCodeFailIds'],['SIM-C6-L01-01']);self.assertEqual(report['sourceManualityFailureIds'],[])
  self.assertFalse(report['ok']);self.assertEqual(report['activityCredit'],0)
  for r in rows:self.assertEqual(r['errors'],[],r['id']);self.assertEqual(len(r['actualTasks']),2);self.assertFalse(r['ok']);self.assertEqual(r['UI'],'NOT_RUN')
 def test_wrong_each_law_and_actual_task_rejected(self):
  for i,r in enumerate(self.proof['records']):
   with self.subTest(id=r['id']):
    p=copy.deepcopy(self.proof);p['records'][i]['cases'][0]['solve']['y']+=1;p['records'][i]['assessment'][1]['value']+=1
    e=v.compare('cross-domain',p,self.sources)[i]['errors'];self.assertIn('Installedscalarwrong',e);self.assertIn('Actualtask/math/unit/prompt/manualinputwrong',e)
 def test_echo_zero_duration_and_roundtrip_signal_and_probe(self):
  r=self.proof['records'][0]
  self.assertEqual(r['cases'][0]['duration'],0);self.assertEqual(len(r['cases'][0]['graphs']),1)
  for c in r['cases']:
   T=c['x']
   for f in c['clockSamples']:
    t=f['time'];want=.34*min(t,T-t)
    self.assertAlmostEqual(f['signal'],want)
    pulse=next(e for e in f['elements'] if e['kind']=='ball' and e.get('r')==.13)
    self.assertAlmostEqual(pulse['p'][0],-2.13+want*79/68)
  p=copy.deepcopy(self.proof);p['records'][0]['cases'][1]['clockSamples'][2]['signal']*=2
  self.assertIn('Clockframewrong',v.compare('cross-domain',p,self.sources)[0]['errors'])
 def test_fluid_clock_mass_tracer_speed_and_height(self):
  r=self.proof['records'][1]
  for c in r['cases']:
   mass=c['x']
   for f in c['clockSamples']:
    t=f['time'];self.assertAlmostEqual(f['signal'],mass*t/4)
    tracer=next(e for e in f['elements'] if e['kind']=='ball' and e.get('r')==.065 and e['c']==0xd49332)
    self.assertAlmostEqual(tracer['p'][0],-2.35+4.7*((mass*t/96)%1))
  p=copy.deepcopy(self.proof);p['records'][1]['clock']['unit']='kg'
  self.assertIn('Clocklabels/units/modewrong',v.compare('cross-domain',p,self.sources)[1]['errors'])
 def test_heater_actual_clock_input_changes_temperature(self):
  c=self.proof['records'][2]['cases'][0]
  self.assertEqual(c['x'],0);self.assertEqual(c['clockSamples'][-1]['input'],100);self.assertEqual(c['clockSamples'][-1]['solve']['y'],2)
  p=copy.deepcopy(self.proof);p['records'][2]['cases'][0]['clockSamples'][-1]['input']=0
  self.assertIn('Clockframewrong',v.compare('cross-domain',p,self.sources)[2]['errors'])
 def test_signed_velocity_area_and_distance_separate(self):
  self.assertEqual(v.exact('L05-01',4),2);self.assertEqual(v.secondary('L05-01',v.F(4),2,2,'m')[1],6)
  p=copy.deepcopy(self.proof);p['records'][4]['cases'][0]['graphs'][0]['series'][0]['points'][2][1]=1
  self.assertIn('Signedvelocityareagraphwrong',v.compare('cross-domain',p,self.sources)[4]['errors'])
 def test_normalized_lens_rays_parallel_at_focus_and_correct_image_side(self):
  for c in self.proof['records'][5]['cases']:
   ratio=c['x'];els=c['elements'];rays=[e for e in els if e['kind']=='line' and len(e['points'])==3 and e['c'] in (0xd49332,0x147979)]
   self.assertEqual(len(rays),2)
   gradients=[];intercepts=[]
   for e in rays:
    a,b=e['points'][-2:];m=(b[1]-a[1])/(b[0]-a[0]);gradients.append(m);intercepts.append(a[1]-m*a[0])
   if ratio==1:self.assertAlmostEqual(gradients[0],gradients[1]);self.assertEqual(c['solve']['y'],0)
   else:
    q=(intercepts[1]-intercepts[0])/(gradients[0]-gradients[1]);self.assertAlmostEqual(q,.9/float(v.exact('L06-01',ratio)))
    self.assertEqual(q<0,ratio<1)
 def test_full_xyz_echo_tip_evidence_not_whole_glyph_claim(self):
  mesh=json.loads((v.APP/v.MESH_PROOF).read_bytes());obs=mesh['observations']
  self.assertEqual(len(obs),120);self.assertTrue(all(o['id']=='SIM-C6-L01-01' for o in obs))
  self.assertTrue(all(o['minimumTipPlaneMargin']>0 and not o['wholeGlyphInsideActualMesh'] for o in obs))
  self.assertEqual(mesh['rodInteriors'],[]);self.assertEqual(mesh['baseIntersections'],[])
 def test_provenance_missing_duplicate_epoch_dimensions(self):
  for action in ['missing','duplicate']:
   p=copy.deepcopy(self.proof)
   if action=='missing':p['records'].pop()
   else:p['records'][0]=p['records'][1]
   with self.assertRaises(ValueError):v.compare('cross-domain',p,self.sources)
  with patch.object(v,'MESH_SHA','0'*64):
   with self.assertRaises(ValueError):v.report('cross-domain')
  with patch('tools.corpus_engineering.runtime_fingerprint.runtime_fingerprint',return_value={'sha256':'unknown'}):
   with self.assertRaises(ValueError):v.report('cross-domain')
  self.assertEqual(len(v.dimensional_checks()),4)
if __name__=='__main__':unittest.main()
