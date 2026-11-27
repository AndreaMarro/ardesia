"""Fresh bounded C4 preflight using the installed canonical collector and verifier.

Never starts a browser or changes a consumer. The historical verifier report()
remains pinned to its original epoch; only its pure compare() is reused here.
"""
from pathlib import Path
import hashlib,importlib.util,json,os,shutil,subprocess,sys,time
D=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica')
REF='375faa7a90f5f643840aabb8cc3076f9a2d5f5de'
RUNTIME='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251'
H=lambda b:hashlib.sha256(b).hexdigest()
J=lambda p:json.loads(p.read_bytes())
C=lambda v:json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()+b'\n'
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def guard():
 free=shutil.disk_usage('/private/tmp').free
 if free<2*1024**3:raise RuntimeError('FAIL_CLOSED: free disk below2GiB before child')
 return free
def main():
 start=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'}
 guard()
 for i in J(D/'git-inputs.json')['inputs']:
  assert H((D/i['snapshot']).read_bytes())==i['sha256']
  path=APP/str(Path(i['path']).relative_to('officina-di-fisica'))
  assert path.read_bytes()==(D/i['snapshot']).read_bytes()
 model=module('independent_electrostatics_models',D/'independent_models.py')
 verifier=module('canonical_c4_partial_math',D/'frozen-tools-corpus_engineering-experiments_C4_code_partial_verifier.py')
 validator=module('canonical_visibility_request',D/'frozen-tools-corpus_engineering-experiment_visibility_request.py')
 def fingerprint():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 before=fingerprint();assert before['sha256']==RUNTIME
 protocol=APP/'tests/corpus/collect-C4-bounded-code-only.mjs'
 assert H(protocol.read_bytes())=='a188910901eac6c43a43acf871e6659e0b227e50577420438aa811dc0cc5ad2a'
 guard();assert not(D/'actual-code-collection.raw.json').exists(),'Never overwrite prior collection'
 with(D/'actual-code-collection.raw.json').open('w')as out,(D/'actual-code-collection.stderr.txt').open('w')as err:
  run=subprocess.run(['node',str(protocol),'electrostatics'],cwd=APP,env=env,stdout=out,stderr=err,timeout=45)
 (D/'actual-code-process-terminal.json').write_bytes(C({'observedExitCode':run.returncode,'UI':'NOT_RUN','protocolSha256':H(protocol.read_bytes()),'rawSha256':H((D/'actual-code-collection.raw.json').read_bytes())}))
 if run.returncode:raise SystemExit(run.returncode)
 proof=J(D/'actual-code-collection.raw.json');sources={r['id']:r for r in J(APP/'content/esperienze-C4.json')}
 records=verifier.compare('electrostatics',proof,sources)
 assert len(records)==8 and all(r['sourceMathAndActualTasksOk']for r in records),records
 exact_tasks=model.exact_tasks();codeById={r['id']:r for r in proof['records']};codeStates=clockStates=0
 for row in proof['records']:
  for case in row['cases']:
   assert verifier.close(case['solve']['y'],model.value(row['id'],str(case['x']),require_grid=True));codeStates+=1
   for frame in case['clockSamples']:
    assert verifier.close(frame['solve']['y'],model.value(row['id'],str(frame['input'])));clockStates+=1
 assert(codeStates,clockStates)==(110,85)
 (D/'actual-current-math-compare.json').write_bytes(C({'candidateCommit':REF,'runtimeSha256':RUNTIME,'records':records,'independentExactTasks':exact_tasks,'actualInstalledControls':codeStates,'actualInstalledClockFrames':clockStates,'scope':'CODE/MATH_ONLY_NOT_RASTER_OR_ACTIVITY_APPROVAL','UI':'NOT_RUN','activityCredit':0}))
 plan=J(D/'plan448.json');literalAnswers=[['6','4'],['10','5.625'],['10','3.6'],['0','22.5'],['4.5','2'],['4.5','1.8'],['-6','0'],['15','12']]
 rows=[]
 for i,ident in enumerate(model.IDS):
  src=sources[ident];code=codeById[ident];grid=plan['grid'][ident]
  for j,x in enumerate(model.TASK_INPUTS[i]):assert model.rational(literalAnswers[i][j])==model.value(ident,x,require_grid=True)
  clocks=[{'gridIndex':grid.index(c['anchor']),'time':c['time']}for c in plan['clock']if c['id']==ident]
  rows.append({'id':ident,'course':'C4','variant':'published','record':src,'sourceSha256':validator.digest(src),'candidateSha256':None,'grid':grid,'expectedValues':[float(model.value(ident,str(x),require_grid=True))for x in grid],'clockCases':clocks,'auxiliaryCases':[],'clockInput':ident=='SIM-C4-L02-03','hasClock':ident=='SIM-C4-L02-03','sourcePrediction':model.PREDICTIONS[i],'questions':[{'input':literalAnswers[i][j],'expectedAccepted':True,'sourceManualReadiness':True,'prompt':code['assessment'][j]['prompt']}for j in range(2)],'originalJudgment':{'scope':'Independent original mathematical derivations reused explicitly; fresh installed-code comparison, no UI approval','manualProcedure':records[i]['manualProcedure'],'actualTasks':exact_tasks[i]['tasks'],'UI':'NOT_RUN_BEFORE_FRESH_COLLECTION'}})
 profiles=plan['profilesExplicit'];keys=[]
 for row in rows:
  for profile in profiles:
   stem='|'.join((row['id'],row['variant'],str(profile['width']),profile['view']))
   keys.append(stem+'|setup');keys.extend(stem+'|grid|'+str(i)for i in range(len(row['grid'])))
   keys.extend(stem+'|clock|'+str(i)for i in range(len(row['clockCases'])))
 assert len(keys)==len(set(keys))==448
 request={'schemaVersion':'1.0.0','scope':'BOUNDED_ORIGINAL_C4_ELECTROSTATICS8_ACTUAL448_NOT_GLOBAL139','sourceCommit':REF,'runtimeSha256':RUNTIME,'sourceFileSha256':H((APP/'content/esperienze-C4.json').read_bytes()),'ids':list(model.IDS),'grid':plan['grid'],'clock':plan['clock'],'profiles':profiles,'collectorSha256':H((APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'request448.json').write_bytes(C(request))
 prepared={'schemaVersion':'1.0.0','scope':request['scope'],'sourceCommit':REF,'originalRef':'5d1dc8dc7b601aef959d10d564c75462be74708d','requestSha256':H((D/'request448.json').read_bytes()),'course':'C4','runtimeFingerprint':before,'records':rows,'profiles':profiles,'expectedCaseKeys':keys,'inputFiles':{},'packageFiles':[],'draftRecords':[]}
 (D/'prepared448.json').write_bytes(C(prepared));assert fingerprint()==before
 result={'candidateCommit':REF,'runtimeSha256':RUNTIME,'phase':'PREFLIGHT_ONLY_NO_CHROME','actualNodeExitCode':0,'actualMathCompareRecords':8,'actualCodeControls':110,'actualClockFrames':85,'preparedUIKeys':448,'preparedSetups':64,'preparedGridAndClockStates':384,'preparedActualQuestionSubmissions':128,'preparedUniqueTasks':16,'preparedSha256':H((D/'prepared448.json').read_bytes()),'requestSha256':H((D/'request448.json').read_bytes()),'runtimeBeforeAfterIdentical':True,'elapsedSeconds':time.monotonic()-start,'geometryObservationsAreSourceOnly':[{'id':r['id'],'observations':r['geometryObservations']}for r in records if r['geometryObservations']],'historicalVerifierReportReused':False,'browser':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'actual-preflight-result.json').write_bytes(C(result));print(json.dumps(result))
if __name__=='__main__':main()
