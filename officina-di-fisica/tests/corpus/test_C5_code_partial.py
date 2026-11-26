"""Original C5 exact/installed-code negative probes, never UI acceptance."""
import copy,json,subprocess,unittest
from unittest.mock import patch
from tools.corpus_engineering import experiments_C5_code_partial_verifier as v
class C5CodePartial(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.sources={r['id']:r for r in json.loads(subprocess.check_output(['git','show',v.REF+':'+v.SOURCE],cwd=v.APP))}
  cls.proofs={g:json.loads((v.APP/('editorial/reviews/C5-'+g+'-installed-code-1a35-20261125.json')).read_bytes()) for g in v.GROUPS}
 def test_all27_actual_tasks_no_ui_credit_and_manual_gaps_separate(self):
  rows=[]
  for g in v.GROUPS:
   r=v.report(g);self.assertEqual(r['activityCredit'],0);self.assertFalse(r['ok']);rows+=r['records']
  self.assertEqual(len(rows),27);self.assertEqual(len({r['id'] for r in rows}),27)
  self.assertEqual(sum(r['gridCount'] for r in rows),430);self.assertEqual(sum(r['clockSampleCount'] for r in rows),860)
  for r in rows:self.assertEqual(r['errors'],[],r['id']);self.assertFalse(r['ok']);self.assertEqual(r['UI'],'NOT_RUN');self.assertEqual(len(r['actualTasks']),2)
  self.assertEqual({r['id'] for r in rows if r['ManualityFailure']},{'SIM-C5-'+k for k in v.MANUALITY_FAILURES})
  self.assertEqual(sum(r['ManualSupportGap'] for r in rows),6)
  self.assertEqual({r['id'] for r in rows if not r['consumerCodeGeometryOk']},{'SIM-C5-L05-03','SIM-C5-L09-02'})
 def test_every_id_wrong_law_and_actual_transfer_value_fail(self):
  for g,p in self.proofs.items():
   for i,r in enumerate(p['records']):
    with self.subTest(id=r['id']):
     q=copy.deepcopy(p);q['records'][i]['cases'][0]['solve']['y']+=1;q['records'][i]['assessment'][1]['value']+=1
     es=v.compare(g,q,self.sources)[i]['errors'];self.assertIn('Installedscalarwrong',es);self.assertIn('Actualtask/math/unit/prompt/manualinputwrong',es)
 def test_actual_categorical_values_and_grid_not_interpolated(self):
  q=copy.deepcopy(self.proofs['energy-sound']);r=q['records'][3]
  self.assertEqual(r['params'][0]['options'],[['1','Aria'],['2','Acqua'],['3','Acciaio']])
  r['cases'][0]['readings'][0][1]='Other';r['params'][0]['options'][0][1]='Other'
  es=v.compare('energy-sound',q,self.sources)[3]['errors'];self.assertIn('Inputreadingwrong',es);self.assertIn('Control/default/gridchanged',es)
 def test_photon_quarters_are_analytic_zeros_not_tolerance_laundering(self):
  q=copy.deepcopy(self.proofs['fields-photons']);r=q['records'][3]
  for c in r['cases']:
   for f in c['clockSamples']:self.assertLess(abs(f['signal']),1e-11)
  r['cases'][0]['clockSamples'][1]['signal']=.0001
  self.assertIn('Clockframewrong',v.compare('fields-photons',q,self.sources)[3]['errors'])
 def test_doppler_retarded_time_and_motion_clock_signal_fail_drift(self):
  q=copy.deepcopy(self.proofs['energy-sound']);r=q['records'][-1]
  c=next(c for c in r['cases'] if c['x']==0)
  self.assertAlmostEqual(c['clockSamples'][1]['signal'],-1)
  c['clockSamples'][1]['signal']=1;r['clock']['clockUnit']='s'
  es=v.compare('energy-sound',q,self.sources)[-1]['errors'];self.assertIn('Clockframewrong',es);self.assertIn('Clocklabels/units/modewrong',es)
 def test_tiny_wavelength_nonzero_is_not_accepted_as_zero(self):
  self.assertFalse(v.close(0,v.F(1,10**12)))
  q=copy.deepcopy(self.proofs['fields-photons']);r=q['records'][2]
  self.assertEqual(r['cases'][-1]['readings'][2][1],1e-12)
  r['cases'][-1]['readings'][2][1]=0
  self.assertIn('Secondaryreadingwrong',v.compare('fields-photons',q,self.sources)[2]['errors'])
 def test_source_version_identity_missing_duplicate_and_unknown_epoch(self):
  q=copy.deepcopy(self.proofs['oscillation-waves']);q['records'][1]['sourceVersion']=1
  self.assertIn('Source/versionidentitydrift',v.compare('oscillation-waves',q,self.sources)[1]['errors'])
  for mode in ['missing','duplicate']:
   q=copy.deepcopy(self.proofs['nuclear-optics'])
   if mode=='missing':q['records'].pop()
   else:q['records'][0]=q['records'][1]
   with self.assertRaises(ValueError):v.compare('nuclear-optics',q,self.sources)
  with patch('tools.corpus_engineering.runtime_fingerprint.runtime_fingerprint',return_value={'sha256':'unknown'}):
   with self.assertRaises(ValueError):v.report('energy-sound')
  with patch.object(v,'MESH_SHA','0'*64):
   with self.assertRaises(ValueError):v.report('energy-sound')
 def test_exact_familiar_angles_roots_thresholds_lens_and_units(self):
  import sympy as S
  self.assertEqual(v.exact('L02-03','1.125'),3*S.sqrt(2)/2)
  self.assertEqual(v.exact('L07-02','2.5'),25*S.sqrt(2)/2);self.assertEqual(v.exact('L08-02','2.5'),8*S.sqrt(2))
  self.assertEqual(v.exact('L07-03',14),0);self.assertEqual(v.exact('L08-03',2),1)
  self.assertEqual(v.exact('L10-02',10),0);self.assertLess(v.exact('L10-02',5),0)
  self.assertEqual(v.exact('L05-01',1),v.F(7500,17));self.assertEqual(len(v.dimensional_checks()),7)
 def test_actual_global_base_occlusion_and_receiver_geometry(self):
  r=v.compare('nuclear-optics',self.proofs['nuclear-optics'],self.sources)[4]
  hits=[o for o in r['geometryObservations'] if o['code']=='GLYPH_SEGMENT_INTERSECTS_OPAQUE_GLOBAL_BASE']
  self.assertEqual([o['input'] for o in hits],list(range(0,65,5)))
  self.assertTrue(any(o['input']==45 for o in hits))
  r=v.compare('energy-sound',self.proofs['energy-sound'],self.sources)[-1]
  hits=[o for o in r['geometryObservations'] if o['code']=='ARROW_TIP_INSIDE_OPAQUE_CAPPED_ROD']
  self.assertEqual(len(hits),22)
if __name__=='__main__':unittest.main()
