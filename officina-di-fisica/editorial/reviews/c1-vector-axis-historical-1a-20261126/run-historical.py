"""Bounded real C1 reviewer context; does not alter the139 workflow or acceptance."""
from pathlib import Path
import sys,os,json,subprocess,fcntl,shutil,signal
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
v.REPO=Path('/private/tmp/cric-work-axis-author-20261126')
BASE=Path(__file__).resolve().parent
REF='eb51d0e9bdc3f992e9ae0ae76810098376e2ab79'
FP='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
def check(info,plan):
 request_path=BASE/'review-request.json';raw=request_path.read_bytes();r=json.loads(raw)
 if plan['requestSha256']!=v.sha(raw)or r['candidateRef']!=REF or plan['sourceCommit']!=REF or r['runtimeSha256']!=FP or plan['runtimeFingerprint']['sha256']!=FP:raise ValueError('Epoch/request rebound')
 if r['numericalHelperSha256']!=v.sha((BASE/'numerical-observation.mjs').read_bytes())or plan['numericalHelperSha256']!=r['numericalHelperSha256']:raise ValueError('Numerical review helper drift')
 if r['collectorSha256']!=v.sha((BASE/'collector-c1-derived.mjs').read_bytes()):raise ValueError('Collector drift')
 if r['primarySha256']!=v.sha((BASE/'independent-reused-primary.json').read_bytes()):raise ValueError('Independent primary drift')
 if r['inputFiles']!=plan['inputFiles']or r['packageFiles']!=plan['packageFiles']or r['draftRecords']!=plan['draftRecords']:raise ValueError('Prepared complete inputs rebound')
 directory=Path(info['candidateApp'])/'editorial/batches'
 if set(directory.iterdir())!={Path(p)for p in r['inputFiles']}:raise ValueError('Exact six package/binding inputs required')
 for name,pin in r['inputFiles'].items():
  p=Path(name)
  if p.is_symlink()or v.sha(p.read_bytes())!=pin:raise ValueError('Prepared input byte drift')
  if v.sha(v.git_bytes(REF,'officina-di-fisica/editorial/batches/'+p.name))!=pin:raise ValueError('Input not immutable candidate Git bytes')
 rows=[row for p in r['packageFiles']for row in v.load(p)['records']]
 if len(rows)!=3 or v.canonical(rows)!=v.canonical(plan['draftRecords']):raise ValueError('Complete three DRAFT records differ')
 for row in plan['records']:
  if row['variant']=='draft'and row['record']!=next(r for r in rows if r['id']==row['id']):raise ValueError('Cohort DRAFT rebound')
 return {'checkedFiles':r['inputFiles'],'allThreeCompleteDrafts':True,'activityCredit':0}
def main():
 info=v.load(sys.argv[1]);out=Path(info['output']);plan=v.load(info['prepared']);script=BASE/'collector-c1-derived.mjs'
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(Path(info['candidateApp'])/'extensions'),'PATH':'/private/tmp/cric-recovery-venv/bin:'+os.environ['PATH']}
 def fp():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=info['candidateApp'],env=env))
 code=None;error=None;process=None
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if shutil.disk_usage(out).free<2*1024**3:raise ValueError('Need at least2GiB free')
  try:
   checked=check(info,plan);assert fp()==plan['runtimeFingerprint'];(out/'input-preflight.json').write_bytes(v.canonical(checked)+b'\n')
   with (out/'actual-ui-process.log').open('wb')as log:
    process=subprocess.Popen(['node',str(script),sys.argv[1]],cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
    code=process.wait(timeout=100*60)
   if code!=0:raise ValueError('Actual UI terminal exit: '+str(code))
   v.verify_report(out,plan,v.sha(script.read_bytes()));check(info,plan);assert fp()==plan['runtimeFingerprint']
  except BaseException as e:
   error=type(e).__name__+': '+str(e)
   if process is not None and process.poll()is None:
    process.terminate()
    try:process.wait(timeout=20)
    except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait(timeout=10)
    code=process.returncode
  receipt={'runtimeSha256':FP,'candidateRef':REF,'collectorSha256':v.sha(script.read_bytes()),'supervisorSha256':v.sha(Path(__file__).read_bytes()),'preparedSha256':v.sha(Path(info['prepared']).read_bytes()),'observedExitCode':code,'error':error,'status':'REAL_UI_TECHNICAL_COMPLETE_REQUIRES_INDEPENDENT_IMAGE_GEOMETRY_REVIEW'if error is None else'FAIL','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
  (out/'terminal-receipt.json').write_bytes(v.canonical(receipt)+b'\n')
 if error:raise ValueError(error)
 print(json.dumps(receipt))
if __name__=='__main__':main()
