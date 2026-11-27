from pathlib import Path
import fcntl,json,os,shutil,subprocess,sys,time
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5]
OVERLAY=TASK/'work/cric-a-c3-53bd-preview-app-20261127/officina-di-fisica'
PYTHON=TASK/'work/cric-runtime-env-20261127/bin/python';LOCK=TASK/'work/.cric-browser.lock'
for name in ('experiments_c3_vaporization_l0402_53bd_verifier.py','c3_six_heat_phase_primary_models_a.py','c3_six_heat_phase_core6ae3_review_a.py','c3_draft_bounded_browser_review_a.py','c3_l0402_53bd_browser_a.py'):
 shutil.copyfile(APP/'tools/corpus_engineering'/name,OVERLAY/'tools/corpus_engineering'/name)
target=OVERLAY/'editorial/reviews'/D.name;shutil.copytree(D,target,dirs_exist_ok=True)
source=APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/original-source.verbatim.json'
shutil.copyfile(source,target/'original-source.verbatim.json')
preview=target/'private-preview/actual/report.json'
shutil.copyfile(preview,OVERLAY/'editorial/reviews/experiment-c3-vaporization-l0402-reading-53bd-20261127-browser.json')
code=r'''
from pathlib import Path
import copy,json,unittest
from fractions import Fraction
from tools.corpus_engineering import experiments_c3_vaporization_l0402_53bd_verifier as v
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_activity_identity,validate_browser_preview
from tools.corpus_engineering.integration import exercise_package
APP=v.APP;D=v.PROOF;B='experiment-c3-vaporization-l0402-reading-53bd-20261127'
pkgpath=APP/'editorial/batches'/(B+'.json');pkg=json.loads(pkgpath.read_text());bindings=json.loads((APP/'editorial/batches'/(B+'-bindings.json')).read_text())
sources={r['id']:r for r in json.loads((D/'original-source.verbatim.json').read_text())if r['id']==v.KEY}
r=v.report(sources,pkg,bindings);(D/'canonical-science-report.json').write_text(json.dumps(r,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
assert v.report(sources,pkg,bindings)==r
assert_activity_identity(r['records'],{v.KEY},sources,{v.KEY:pkg['records'][0]},{v.KEY:bindings[0]})
integrated=exercise_package(pkgpath);(D/'canonical-integration.json').write_text(json.dumps(integrated,sort_keys=True,indent=2)+'\n')
assert integrated['firstImport']['saved']==1 and integrated['repeatedImport']['saved']==0 and integrated['repeatedImport']['unchanged']==1 and integrated['beforePublishedCount']==integrated['afterPublishedCount']==991
browser,n=validate_browser_preview(B,pkgpath,pkg,{v.KEY},APP);assert n==3
(D/'canonical-components-result.json').write_text(json.dumps(dict(runtimeSha256=v.RUNTIME,identity='PASS',freshSaved='PASS',canonicalImport='1_THEN_0_UNCHANGED1',browserCases=n,registryAcceptance='NOT_RUN_ROOT_INTEGRATOR',activityCredit=0,humanApproval='NOT_RUN'),sort_keys=True,indent=2)+'\n')
class Boundary(unittest.TestCase):
 def test_original_terminal_strict(self):
  base=dict(actualObservedExitCode=0,signal=None,timedOut=False,assistedTermination=False,intervention=[]);v.terminal_identity(base)
  for missing in base:
   changed=copy.deepcopy(base);del changed[missing]
   with self.assertRaises(ValueError):v.terminal_identity(changed)
  for k,val in [('actualObservedExitCode',True),('actualObservedExitCode',1),('signal',15),('timedOut',True),('assistedTermination',True),('intervention',['SIGTERM'])]:
   changed=copy.deepcopy(base);changed[k]=val
   with self.assertRaises(ValueError):v.terminal_identity(changed)
 def test_approval_identity_false(self):
  for key,val in [('ok',False),('humanApproval','PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('publicationAction','PUBLISHED')]:
   bad=copy.deepcopy(r['records']);bad[0][key]=val
   with self.assertRaises(ValueError):assert_activity_identity(bad,{v.KEY},sources,{v.KEY:pkg['records'][0]},{v.KEY:bindings[0]})
 def test_source_changes_rejected(self):
  bad=copy.deepcopy(sources);bad[v.KEY]['version']=2
  with self.assertRaises(ValueError):v.report(bad,pkg,bindings)
 def test_candidate_text_and_key_rebound_rejected(self):
  for field,val in [('title','different'),('baseVersion',2),('version',3),('formula','Q=500x')]:
   p=copy.deepcopy(pkg);p['records'][0][field]=val;b=copy.deepcopy(bindings);b[0]['candidateSha256']=digest(p['records'][0])
   with self.assertRaises(ValueError):v.report(sources,p,b)
 def test_independent_exact_domain(self):
  for i in range(-10,11):
   m=Fraction(i,2);q=v.law(v.KEY,m);self.assertEqual(50*q,113*m);self.assertEqual(v.inverse(v.KEY,q),m)
  for x in [True,0.5,-6,6,float('inf')]:
   with self.assertRaises(ValueError):v.law(v.KEY,x)
 def test_sign_readout_and_phase_rejected(self):
  _,cases,_=v.load_proof();c=next(r for r in cases.values()if r.get('interaction',{}).get('index')==1)
  for change in ['model','readout','liquid']:
   r=copy.deepcopy(c)
   if change=='model':r['model']['y']=4.52
   elif change=='readout':r['readings']=r['readings'].replace('-4,52','4,52')
   else:r['elements']=[e for e in r['elements']if not(e['kind']=='rod'and e.get('r')==.87)]
   with self.assertRaises(ValueError):v.verify_case(r)
 def test_archive_hash_guard(self):
  self.assertEqual(sha((D/'observations.zip').read_bytes()),v.ARCHIVE);self.assertEqual(sha((D/'observations-manifest.json').read_bytes()),v.MANIFEST)
 def test_exact_filtered_record(self):
  draft,_,_=v.load_proof();self.assertEqual(pkg['records'],[draft]);self.assertEqual(pkg['assets'],[])
result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Boundary))
raise SystemExit(not result.wasSuccessful())
'''
with LOCK.open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 free=shutil.disk_usage(TASK).free
 if free<2*1024**3:raise SystemExit('Disk guard before CPU child')
 started=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':str(PYTHON.parent)+os.pathsep+os.environ['PATH'],'ASTRA_EXTENSIONS':str(OVERLAY/'extensions')}
 run=subprocess.run([str(PYTHON),'-c',code],cwd=OVERLAY,env=env,capture_output=True,timeout=90)
 (D/'checks-stdout.txt').write_bytes(run.stdout);(D/'checks-stderr.txt').write_bytes(run.stderr)
 terminal=dict(actualObservedExitCode=run.returncode,elapsedSeconds=time.monotonic()-started,freeBytesAtAcquisition=free,activityCredit=0,humanApproval='NOT_RUN')
 (D/'checks-terminal.json').write_text(json.dumps(terminal,sort_keys=True,indent=2)+'\n')
 for name in ['canonical-science-report.json','canonical-integration.json','canonical-components-result.json']:
  if (target/name).exists():shutil.copyfile(target/name,D/name)
 print(json.dumps(terminal));print(run.stderr.decode()[-3500:]);raise SystemExit(run.returncode)
