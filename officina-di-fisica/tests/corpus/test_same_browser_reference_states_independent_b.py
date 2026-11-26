"""Adversarial checks over genuine bounded UI, not scientific acceptance."""
from pathlib import Path
from copy import deepcopy
import importlib.util, json, hashlib, os, shutil, tempfile, unittest
APP=Path(__file__).resolve().parents[2]
TARGET=Path(os.environ.get('CRIC_REFERENCE_REVIEW_APP',str(APP)))
spec=importlib.util.spec_from_file_location('independent_state_visibility',TARGET/'tools/corpus_engineering/experiment_visibility_request.py')
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
HOME=APP/'editorial/reviews/same-browser-reference-independent-20261126'
class ActualStateBoundary(unittest.TestCase):
 def copy(self,mode='actual-opt-in11'):
  t=tempfile.TemporaryDirectory(prefix='cric-139-state-boundary-');self.addCleanup(t.cleanup);p=Path(t.name)/'evidence';shutil.copytree(HOME/mode,p);return p
 def verify(self,p):
  plan=json.loads((p/'prepared.json').read_bytes());r=json.loads((p/'report.json').read_bytes());return v.verify_report(p,plan,r['protocolSha256'])
 def mutate(self,p,needle,operation):
  rp=p/'report.json';r=json.loads(rp.read_bytes());item=next(x for x in r['cases']if needle in x['caseKey']);cp=p/item['file'];c=json.loads(cp.read_bytes());operation(c);raw=(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode();cp.write_bytes(raw);item['sha256']=hashlib.sha256(raw).hexdigest();rp.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
 def rejected(self,needle,operation):
  p=self.copy();self.mutate(p,needle,operation)
  with self.assertRaises(ValueError):self.verify(p)
 def test_actual_eleven_has_both_clocks_draft_and_auxiliary(self):
  p=self.copy();r=self.verify(p);keys=[x['caseKey']for x in r['cases']];self.assertEqual(len(keys),11);self.assertEqual(sum('|clock|'in x for x in keys),2);self.assertEqual(sum('|auxiliary|'in x for x in keys),1);self.assertTrue(any('|draft|'in x for x in keys));self.assertEqual(len(r['fullOwnerRecordIdentity']['records']),9);self.assertEqual(r['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403')
 def test_actual_legacy_five_without_helper_is_accepted(self):
  p=self.copy('actual-legacy-no-helper5');r=self.verify(p);self.assertEqual(len(r['cases']),5);self.assertNotIn('baselineReference',r);launch=json.loads((p/'independent-launch.json').read_bytes());self.assertTrue(launch['helperAbsentAtLegacyLaunch']);self.assertEqual(json.loads((p/'terminal-receipt.json').read_bytes())['observedExitCode'],0)
 def test_missing_or_wrong_interaction_all_three_kinds(self):
  for needle in ('|grid|','|clock|','|auxiliary|'):
   for fn in (lambda c:c.pop('interaction'),lambda c:c.update(interaction={'kind':'grid','index':0,'x':999})):
    with self.subTest(kind=needle):self.rejected(needle,fn)
 def test_zero_tolerance_full_model_all_three_kinds(self):
  for needle in ('|grid|','|clock|','|auxiliary|'):
   with self.subTest(kind=needle):self.rejected(needle,lambda c:c['model'].__setitem__('y',c['model']['y']+1e-12))
 def test_distinct_module_and_solve_identities_required(self):
  for key in ('distinctModuleIdentity','distinctSolveIdentity'):
   with self.subTest(key=key):self.rejected('|clock|',lambda c:c['baselineReference'].__setitem__(key,False))
 def test_baseline_namespace_and_dom_must_match(self):
  for fn in (lambda c:c['baselineReference'].__setitem__('namespace','/__cric_baseline/candidate/'),lambda c:c['baselineReference'].__setitem__('actualDOMControls',[]),lambda c:c['baselineReference'].__setitem__('observedX',999)):
   with self.subTest(operation=repr(fn)):self.rejected('|clock|',fn)
 def test_clock_requested_time_and_source_replay_required(self):
  for prefix in ('SIM-C6-L01-01|published|320|orbit|clock|','SIM-C6-L03-01|published|320|orbit|clock|'):
   for fn in (lambda c:c['interaction'].__setitem__('time',999),lambda c:c.__setitem__('sourceReplayedClockTime',999),lambda c:c.__setitem__('sourceReplayedX',999),lambda c:c['actualDOMControls'][0].__setitem__('value','999')):
    with self.subTest(clock=prefix):self.rejected(prefix,fn)
 def test_auxiliary_middle_circuit_and_index_required(self):
  for name,value in (('middle','0'),('circuit','open')):
   def mutate(c):
    control=next(x for x in c['actualDOMControls']if x['name']==name);control['value']=value
   with self.subTest(control=name):self.rejected('|auxiliary|',mutate)
  self.rejected('|auxiliary|',lambda c:c['interaction'].__setitem__('index',True))
 def test_nonfinite_observations_rejected_even_with_matching_baseline(self):
  for value in (float('nan'),float('inf'),True):
   def mutate(c):c['model']['y']=value;c['baselineReference']['model']['y']=value
   with self.subTest(value=str(value)):self.rejected('|clock|',mutate)
 def test_setup_cannot_be_disguised_as_model_state(self):self.rejected('|setup',lambda c:c.__setitem__('interaction',{'kind':'grid','index':0,'x':0}))
 def test_case_coverage_and_bytes_cannot_be_rebound(self):
  for mode in ('duplicate','missing','png'):
   with self.subTest(mode=mode):
    p=self.copy();rp=p/'report.json';r=json.loads(rp.read_bytes())
    if mode=='duplicate':r['cases'][-1]=deepcopy(r['cases'][0])
    elif mode=='missing':r['cases'].pop()
    else:
     c=json.loads((p/r['cases'][0]['file']).read_bytes());(p/c['screenshots'][0]['file']).write_bytes(b'not the actual png')
    rp.write_text(json.dumps(r)+'\n')
    with self.assertRaises(ValueError):self.verify(p)
 def test_report_no_credit_and_namespace_provenance_cannot_change(self):
  for key,value in (('activityCredit',1),('humanApproval','PASS'),('publicationAction','PUBLISH')):
   with self.subTest(key=key):
    p=self.copy();rp=p/'report.json';r=json.loads(rp.read_bytes());r[key]=value;rp.write_text(json.dumps(r)+'\n')
    with self.assertRaises(ValueError):self.verify(p)
if __name__=='__main__':unittest.main(verbosity=2)
