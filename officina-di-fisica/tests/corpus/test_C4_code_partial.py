"""Independent C4 negative mutations and no-credit partial-review invariants."""
import copy,json,unittest,subprocess
from unittest.mock import patch
from tools.corpus_engineering import experiments_C4_code_partial_verifier as v

class C4CodePartial(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.sources={r['id']:r for r in json.loads(subprocess.check_output(['git','show',v.REF+':'+v.SOURCE],cwd=v.APP))}
  cls.proofs={g:json.loads((v.APP/('editorial/reviews/C4-'+g+'-installed-code-1a35-20261125.json')).read_bytes()) for g in v.GROUPS}
 def test_all29_actual_questions_units_clocks_no_ui_credit(self):
  rows=[]
  for g in v.GROUPS:
   r=v.report(g);self.assertFalse(r['ok']);self.assertEqual(r['activityCredit'],0)
   rows+=r['records']
  self.assertEqual(len(rows),29);self.assertEqual(len({r['id'] for r in rows}),29)
  for r in rows:
   self.assertEqual(r['errors'],[],r['id']);self.assertEqual(len(r['actualTasks']),2);self.assertEqual(r['UI'],'NOT_RUN');self.assertFalse(r['ok'])
  self.assertEqual(sum(r['clockSampleCount'] for r in rows),290)
  self.assertEqual([r['id'] for r in rows if r['ManualityFailure']],['SIM-C4-L09-02'])
  self.assertEqual({r['id'] for r in rows if not r['consumerCodeGeometryOk']},{'SIM-C4-L02-01','SIM-C4-L09-02'})
 def test_wrong_values_both_tasks_and_grid_rejected_for_every_id(self):
  for g,p in self.proofs.items():
   for i,r in enumerate(p['records']):
    with self.subTest(id=r['id']):
     q=copy.deepcopy(p);q['records'][i]['cases'][0]['solve']['y']+=1;q['records'][i]['assessment'][1]['value']+=1
     es=v.compare(g,q,self.sources)[i]['errors'];self.assertIn('Installedscalarwrong',es);self.assertIn('Actualtask/math/unit/prompt/manualinputwrong',es)
 def test_millisecond_clock_actual_input_is_time_not_fixed_parameter(self):
  q=copy.deepcopy(self.proofs['electrostatics']);r=q['records'][4];c=r['cases'][0]
  self.assertEqual(c['x'],0);self.assertEqual(c['clockSamples'][-1]['input'],4);self.assertEqual(c['clockSamples'][-1]['solve']['y'],8)
  c['clockSamples'][-1]['input']=0
  self.assertIn('Clockframewrong',v.compare('electrostatics',q,self.sources)[4]['errors'])
 def test_circular_motion_clock_units_phase_and_source_version(self):
  q=copy.deepcopy(self.proofs['magnetism']);r=q['records'][2]
  self.assertEqual(r['sourceVersion'],2);r['sourceVersion']=1
  r['cases'][0]['clockSamples'][1]['signal']+=1;r['clock']['unit']='m'
  es=v.compare('magnetism',q,self.sources)[2]['errors']
  for e in ['Source/versionidentitydrift','Clockframewrong','Clocklabels/units/modewrong']:self.assertIn(e,es)
 def test_clock_graph_and_secondary_laws_reject_drift(self):
  q=copy.deepcopy(self.proofs['magnetism']);r=q['records'][-2]
  r['cases'][0]['duration']+=1;r['cases'][0]['graphs'][-1]['series'][0]['points'][1][1]+=1
  es=v.compare('magnetism',q,self.sources)[-2]['errors']
  self.assertIn('Clockcoveragewrong',es);self.assertIn('Timegraphwrong',es)
  q=copy.deepcopy(self.proofs['capacitors']);q['records'][-1]['cases'][1]['readings'][2][1]+=1
  self.assertIn('Secondaryreadingwrong',v.compare('capacitors',q,self.sources)[-1]['errors'])
 def test_missing_duplicate_foreign_id_are_rejected(self):
  for kind in ['missing','duplicate','foreign']:
   q=copy.deepcopy(self.proofs['electrostatics'])
   if kind=='missing':q['records'].pop()
   elif kind=='duplicate':q['records'][0]=q['records'][1]
   else:q['records'][0]['id']='SIM-C3-L01-01'
   with self.assertRaises(ValueError):v.compare('electrostatics',q,self.sources)
 def test_lorentz95_numeric_acceptance_does_not_clear_source_manuality_failure(self):
  r=v.compare('magnetism',self.proofs['magnetism'],self.sources)[1]
  self.assertTrue(r['actualTasks'][1]['literalAcceptedByNumericRule']);self.assertEqual(r['actualTasks'][1]['manualNumericLiteral'],'6')
  self.assertTrue(r['ManualityFailure']);self.assertFalse(r['ok']);self.assertIn('ABSENTfromsource',r['manualProcedure'])
 def test_exact_dimensions_signs_zero_and_capacitors(self):
  import sympy as S
  self.assertEqual(v.exact('L01-02',4),S.Rational(45,8));self.assertEqual(v.exact('L02-03',2),2)
  self.assertEqual(v.exact('L03-01','-.5'),0);self.assertEqual(v.exact('L07-01',5),S.Rational(4427,250))
  self.assertEqual(v.exact('L10-01',90),0);self.assertEqual(v.exact('L09-02',180),0)
  self.assertEqual(v.exact('L10-04',-4),2);self.assertEqual(len(v.dimensional_checks()),12)
 def test_provenance_domain_display_and_unit_fail_closed(self):
  q=copy.deepcopy(self.proofs['capacitors']);r=q['records'][0]
  r['params'][0]['step']=.5;r['assessment'][0]['unit']='F';r['assessmentFormat'][0]['parsed']=999999
  es=v.compare('capacitors',q,self.sources)[0]['errors']
  for e in ['Control/default/gridchanged','Actualtask/math/unit/prompt/manualinputwrong','Displayroundtripwrong']:self.assertIn(e,es)
  with patch('tools.corpus_engineering.runtime_fingerprint.runtime_fingerprint',return_value={'sha256':'unknown'}):
   with self.assertRaises(ValueError):v.report('magnetism')
  with patch.dict(v.PROOFS,{'magnetism':'0'*64}):
   with self.assertRaises(ValueError):v.report('magnetism')
if __name__=='__main__':unittest.main()
