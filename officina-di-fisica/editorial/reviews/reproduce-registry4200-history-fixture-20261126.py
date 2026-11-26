"""Add nonempty historical study fixtures to the existing coexistence replay.

Only the private test setup and extra preservation assertions are inserted.
No production, importer, grading, adaptation, or existing assertions are changed.
"""
import fcntl,hashlib,json,os,shutil,subprocess,sys,tempfile,time
from pathlib import Path
from tools.corpus_engineering import integration
from tools.corpus_engineering.batches import load_registry,load_activity_registry
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();OUT=APP/'editorial/reviews/registry4200-history-fixture-20261126';OUT.mkdir(exist_ok=True)
base=integration.COHORT_CODE
before=' attempts_before=db.execute(\'SELECT count(*) FROM attempts\').fetchone()[0]'
fixture=''' from server import learning
 student={'id':'root-private-preservation-fixture','role':'lettore'}
 _pinned={}
 for _index,_key in enumerate(('C1-Q001','C2-Q001','C4-Q091')):
  _q=next(q for q in before if q['id']==_key)
  _rid=learning.start(db,student,before,{'course':_q['course'],'mode':'practice','item':_key,'requestId':'preserve'+str(_index)})['id']
  if _index==1:learning.details(db,student,before,_rid,{'action':'hint','idx':0})
  _answer=_q['answer']['value']
  if _index==2:
   assert _q['answer']['type']=='numeric'and _answer!=0
   _answer=0
  _shown=learning.details(db,student,before,_rid,{'action':'answer','idx':0,'value':_answer})
  assert _shown['items'][0]['correct'] is (_index!=2)
  assert _shown['items'][0]['aided'] is (_index==1)
  _pinned[_rid]=_shown['items'][0]
 _attempt_rows_before=[tuple(r)for r in db.execute('SELECT * FROM attempts ORDER BY run,idx')]
 _run_rows_before=[tuple(r)for r in db.execute('SELECT * FROM runs ORDER BY id')]
 _old_attempt_payloads={(r['id'],r['v']):store.record(db,r['id'],r['v'])for r in db.execute('SELECT id,v FROM attempts')}
 assert len(_attempt_rows_before)==len(_run_rows_before)==3
'''
after=' assert attempts_after==attempts_before'
assertions=''' assert [tuple(r)for r in db.execute('SELECT * FROM attempts ORDER BY run,idx')]==_attempt_rows_before
 assert [tuple(r)for r in db.execute('SELECT * FROM runs ORDER BY id')]==_run_rows_before
 for _rid,_item in _pinned.items():assert learning.details(db,student,after,_rid)['items'][0]==_item
 for (_id,_v),_payload in _old_attempt_payloads.items():assert store.record(db,_id,_v)==_payload
'''
assert base.count(before)==base.count(after)==1
code=base.replace(before,fixture+before).replace(after,after+'\n'+assertions)
needle="  'learnerAttemptsBefore':attempts_before"
assert code.count(needle)==1
code=code.replace(needle,"  'nonemptyHistoricalFixture':True,'pinnedRunItemsRetained':len(_pinned),'preexistingAttemptRowsSha256':digest(_attempt_rows_before),'preexistingRunRowsSha256':digest(_run_rows_before),\n"+needle)
(OUT/'base-cohort-fixture.py.txt').write_text(base);(OUT/'actual-augmented-cohort-fixture.py.txt').write_text(code)
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>2*1024**3
 registry=(APP/'editorial/batches/registry.json').read_bytes();specs=load_registry();activities=load_activity_registry();assert sum(len(s['questionIds'])for s in specs)==4200
 names=[r['id']for r in specs]+list(dict.fromkeys(r['revisionPackage']for r in activities if r.get('revisionPackage')))
 paths=[APP/'editorial/batches'/(n+'.json')for n in names];pins={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest()for p in paths};runtime=runtime_fingerprint(APP)
 started=time.monotonic()
 with tempfile.TemporaryDirectory(prefix='cric4200-nonempty-history-')as home:
  result=subprocess.run([sys.executable,'-B','-c',code,json.dumps([str(p)for p in paths])],env={**os.environ,'ASTRA_DATA':home,'ASTRA_HOSTED':'0','ASTRA_EXTENSIONS':str(APP/'extensions')},stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=240)
 elapsed=time.monotonic()-started;(OUT/'actual-stderr.txt').write_bytes(result.stderr)
 print('ACTUAL_HISTORY_FIXTURE_EXIT',result.returncode,result.stderr.decode()[-600:],flush=True);assert result.returncode==0
 data=json.loads(result.stdout);assert len(data['records'])==4200 and data['learnerAttemptsBefore']==data['learnerAttemptsAfter']==3 and data['pinnedRunItemsRetained']==3 and data['newPublications']==0
 assert registry==(APP/'editorial/batches/registry.json').read_bytes()and runtime==runtime_fingerprint(APP)
 assert pins=={str(p.relative_to(APP)):hashlib.sha256(p.read_bytes()).hexdigest()for p in paths}
 (OUT/'actual-full-coexistence.json').write_bytes(result.stdout)
 receipt={'scope':'Private technical preservation fixture on sole canonical importer; no independent scientific/publication credit','actualExit':0,'elapsedSeconds':elapsed,'questionProofs':4200,'packageCount':data['packageCount'],'candidateRecords':data['candidateCount'],'firstSaved':data['firstImportSaved'],'repeatSaved':data['repeatedImportSaved'],'repeatUnchanged':data['repeatedImportUnchanged'],'preexistingAttempts':3,'preexistingRuns':3,'pinnedRunItemsRetained':3,'historicalAttemptAndRunRowsExactlyRetained':True,'oldAttemptVersionPayloadsExactlyRetained':True,'published991ExactlyRetained':data['beforePublishedCount']==data['afterPublishedCount']==991 and data['beforePublishedSha256']==data['afterPublishedSha256'],'baseExistingCohortCodeSha256':hashlib.sha256(base.encode()).hexdigest(),'augmentedPrivateFixtureCodeSha256':hashlib.sha256(code.encode()).hexdigest(),'existingImporterModuleSha256':hashlib.sha256(Path(integration.__file__).read_bytes()).hexdigest(),'registrySha256':hashlib.sha256(registry).hexdigest(),'packageSha256ByPath':pins,'runtimeSha256':runtime['sha256'],'existingCoexistenceAssertions':'ALL_RETAINED; only private historical setup and additional exact preservation assertions inserted','openScientificWithdrawal':'STILL_OPEN; this technical import does not close it','humanApproval':'NOT_RUN','publicationAction':'NONE','scientificCredit':0}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('4200QUESTION_PROOFS_AND_THREE_HISTORIC_RUNS_PRESERVED',elapsed,flush=True)
