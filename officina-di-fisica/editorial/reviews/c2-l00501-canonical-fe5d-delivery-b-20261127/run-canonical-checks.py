"""Canonical science/import/preview checks in the private FE5D fixture only."""
from pathlib import Path
import fcntl,json,os,shutil,subprocess,time,sys
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5];OVERLAY=TASK/'work/cric-b-c2-fe5d-canonical-20261127/officina-di-fisica';PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python';LOCK=TASK/'work/.cric-browser.lock'
for name in['experiments_c2_continuity_l00501_fe5d_verifier.py','c2_continuity_exact_readout_b.py','c2_l00501_fe5d_capture_verifier.py']:shutil.copyfile(APP/'tools/corpus_engineering'/name,OVERLAY/'tools/corpus_engineering'/name)
target=OVERLAY/'editorial/reviews'/D.name;shutil.copytree(D,target,dirs_exist_ok=True)
BATCH='experiment-c2-continuity-l00501-reading-fe5d-20261127';shutil.copyfile(D/'private-preview/actual/report.json',OVERLAY/'editorial/reviews'/(BATCH+'-browser.json'))
code=r'''
from pathlib import Path
from decimal import Decimal
from fractions import Fraction
import copy,json,tempfile,unittest
from unittest.mock import patch
from jsonschema import Draft202012Validator
from tools.corpus_engineering import experiments_c2_continuity_l00501_fe5d_verifier as v
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity,validate_browser_preview
from tools.corpus_engineering.integration import exercise_package
APP=v.APP;D=v.PROOF;BATCH=v.BATCH
pkgpath=APP/'editorial/batches'/(BATCH+'.json');pkg=json.loads(pkgpath.read_text());bindings=json.loads((APP/'editorial/batches'/(BATCH+'-bindings.json')).read_text());sources={r['id']:r for r in json.loads((D/'original-source.verbatim.json').read_text())}
spec=json.loads((D/'activity-spec-proposal.json').read_text());rule=json.loads((APP/'contracts/corpus-batches-v1.schema.json').read_text())['properties']['activityBatches']['items'];Draft202012Validator(rule).validate(spec)
r=v.report(sources,pkg,bindings);(D/'canonical-science-report.json').write_text(json.dumps(r,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
assert v.report(sources,pkg,bindings)==r
assert_activity_identity(r['records'],{v.KEY},sources,{v.KEY:pkg['records'][0]},{v.KEY:bindings[0]})
integration=exercise_package(pkgpath);(D/'canonical-integration.json').write_text(json.dumps(integration,sort_keys=True,indent=2)+'\n');assert integration['firstImport']['saved']==1 and integration['repeatedImport']['saved']==0 and integration['repeatedImport']['unchanged']==1 and integration['beforePublishedCount']==integration['afterPublishedCount']==991
browser,n=validate_browser_preview(BATCH,pkgpath,pkg,{v.KEY},APP);assert n==3
(D/'canonical-components-result.json').write_text(json.dumps({'runtimeSha256':v.RUNTIME,'identity':'PASS','freshSaved':'PASS','canonicalImport':'1_THEN_0_UNCHANGED1','publishedCount':991,'browserCases':n,'specSchema':'PASS','registryAcceptance':'NOT_RUN_ROOT_INTEGRATOR','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},sort_keys=True,indent=2)+'\n')
class Boundary(unittest.TestCase):
 def test_original_terminal_receipt_strict(self):
  base={'observedExitCode':0,'timeoutTriggered':False,'startingFreeBytes':3*1024**3,'seconds':1.5};v.terminal_identity(base)
  for field in base:
   t=copy.deepcopy(base);del t[field]
   with self.assertRaises(ValueError):v.terminal_identity(t)
  for field,value in [('observedExitCode',True),('observedExitCode',1),('timeoutTriggered',True),('startingFreeBytes',1),('seconds',float('nan')),('seconds',True)]:
   t=copy.deepcopy(base);t[field]=value
   with self.assertRaises(ValueError):v.terminal_identity(t)
 def test_canonical_approval_identity_rejected(self):
  for field,value in [('ok',False),('humanApproval','PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('publicationAction','PUBLISHED')]:
   bad=copy.deepcopy(r['records']);bad[0][field]=value
   with self.assertRaises(ValueError):assert_activity_identity(bad,{v.KEY},sources,{v.KEY:pkg['records'][0]},{v.KEY:bindings[0]})
 def test_source_identity_rejected(self):
  bad=copy.deepcopy(sources);bad[v.KEY]['version']=2
  with self.assertRaises(ValueError):v.report(bad,pkg,bindings)
 def test_candidate_retokenized_rebinding_rejected(self):
  for field,value in [('title','Different source'),('baseVersion',2),('version',3),('formula','Q=5v')]:
   p=copy.deepcopy(pkg);p['records'][0][field]=value;b=copy.deepcopy(bindings);b[0]['candidateSha256']=digest(p['records'][0])
   with self.assertRaises(ValueError):v.report(sources,p,b)
 def test_readout_and_clock_backslides_rejected(self):
  _,cases,_=v.load_proof();source=next(c for c in cases.values()if c.get('requestedX')==7 and c.get('requestedTime')==3);source=json.loads(json.dumps(source),parse_float=Decimal);config={'id':v.KEY,'sourceCommit':v.SOURCE_COMMIT,'runtimeSha256':v.RUNTIME,'sourceSha256':v.SOURCE_SHA,'candidateSha256':v.CANDIDATE}
  for mutation in['flow','time','distance']:
   c=copy.deepcopy(source)
   if mutation=='flow':c['model']['y']=29
   elif mutation=='time':c['sourceReplayedClockTime']=4
   else:c['readings']=c['readings'].replace('21 cm','22 cm')
   with self.assertRaises(ValueError):v.verify_case(c,config)
 def test_exact_flow_and_integrated_volume_domains(self):
  for speed in range(13):
   for t in[0,3,6]:
    e=v.expected_readout(speed,t);self.assertEqual(e['Q_mL_s'],4*speed);self.assertEqual(e['distance_cm'],speed*t);self.assertEqual(e['volume_mL'],4*speed*t)
  for speed in[True,1.0,float('nan'),float('inf'),-1,13]:
   with self.assertRaises(ValueError):v.expected_readout(speed,3)
 def test_sealed_archive_corruption_rejected(self):
  with tempfile.TemporaryDirectory()as home:
   p=Path(home);(p/'observations-manifest.json').write_bytes((D/'observations-manifest.json').read_bytes());(p/'observations.zip').write_bytes((D/'observations.zip').read_bytes()+b'corrupt')
   with patch.object(v,'PROOF',p):
    with self.assertRaises(ValueError):v.load_proof()
 def test_exact_filtered_record_and_both_visual_editions(self):
  draft,cases,visual=v.load_proof();self.assertEqual(pkg['records'],[draft]);self.assertEqual(pkg['assets'],[]);self.assertEqual(len(cases),160);self.assertEqual(set(visual),{'draft','published'})
  self.assertTrue(all(len(row['readFiles'])==8 and row['representativeSubsetOfRead160']is True for row in visual.values()))
result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Boundary));raise SystemExit(not result.wasSuccessful())
'''
with LOCK.open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('Disk guard before canonical CPU child')
 start=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':str(PYTHON.parent)+os.pathsep+os.environ['PATH'],'ASTRA_EXTENSIONS':str(OVERLAY/'extensions')};p=subprocess.run([str(PYTHON),'-c',code],cwd=OVERLAY,env=env,capture_output=True,timeout=120)
 (D/'checks-stdout.txt').write_bytes(p.stdout);(D/'checks-stderr.txt').write_bytes(p.stderr);terminal={'actualObservedExitCode':p.returncode,'signal':None if p.returncode>=0 else-p.returncode,'elapsedSeconds':time.monotonic()-start,'freeBytesAtAcquisition':free,'activityCredit':0,'humanApproval':'NOT_RUN'};(D/'checks-terminal.json').write_text(json.dumps(terminal,sort_keys=True,indent=2)+'\n')
 for name in['canonical-science-report.json','canonical-integration.json','canonical-components-result.json']:
  if(target/name).exists():shutil.copyfile(target/name,D/name)
 print(json.dumps(terminal));print(p.stderr.decode()[-5000:]);raise SystemExit(p.returncode)
