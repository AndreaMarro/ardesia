from pathlib import Path
import os,sys,fcntl,shutil,json,subprocess,time,hashlib,importlib.util
F=Path(__file__).resolve().parent;APP=F.parents[2];PY='/private/tmp/cric-recovery-venv/bin/python'
spec=importlib.util.spec_from_file_location('c5_prelaunch',F/'prepare-and-prelaunch.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);free=shutil.disk_usage(APP).free
 if free<2*1024**3:raise ValueError('Need2GiB before Chrome')
 sys.path.insert(0,str(APP));from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
 prepared=json.loads((F/'prepared.json').read_text());info=json.loads((F/'run-info.json').read_text())
 assert runtime_fingerprint(APP)==prepared['runtimeFingerprint']
 assert p.sha(F/'request.json')==prepared['requestSha256'] and prepared['sourceCommit']==p.RUNTIME_REF and prepared['draftCandidateCommit']==p.DRAFT_REF
 owner=p.verify(prepared);assert owner==json.loads((F/'owner-record-canonical-authority.json').read_text())
 env={**os.environ,'PATH':str(Path(PY).parent)+os.pathsep+os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1','GIT_NO_LAZY_FETCH':'1','ASTRA_EXTENSIONS':str(APP/'extensions')}
 start=time.time();print(json.dumps({'actualAcquired':True,'expectedCases':264,'freeBytesAtStart':free}),flush=True)
 try:
  with(F/'actual-ui-process.txt').open('xb')as stream:run=subprocess.run(['node',str(p.PROTOCOL),str(F/'run-info.json')],cwd=APP,env=env,stdout=stream,stderr=subprocess.STDOUT,timeout=360)
  code=run.returncode;timeout=False
 except subprocess.TimeoutExpired:
  code=None;timeout=True
 # No false success on report written before teardown: actual child terminal controls receipt.
 (F/'actual-ui-terminal.json').write_text(json.dumps({'actualExitCode':code,'timeout':timeout,'elapsedSeconds':time.time()-start,'freeBytesAtStart':free,'sourceRuntimeCommit':p.RUNTIME_REF,'draftCandidateCommit':p.DRAFT_REF,'collectorSha256':p.PIN,'productUI':'OBSERVATIONS_ONLY_NOT_SCIENTIFIC_APPROVAL','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n')
 assert p.verify(prepared)==owner and runtime_fingerprint(APP)==prepared['runtimeFingerprint']
 print(json.dumps({'actualTerminal':code,'timeout':timeout,'elapsedSeconds':time.time()-start}),flush=True)
 if timeout or code!=0:raise SystemExit(1)
