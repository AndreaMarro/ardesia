from pathlib import Path
import hashlib,importlib.util,json,os,subprocess,sys,time
D=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-midpoint-charge-labels-20261127/officina-di-fisica')
SHARED=D.parent/'C4-electrostatics-8-e02b-independent-20261127'
REF='3d060603540c981bf641f776ca65fd3ef76106c3';RUNTIME='2096493ae86311ec459e012032cd1f8fe41293326cc5769d86376aa5a0b59635'
H=lambda b:hashlib.sha256(b).hexdigest();J=lambda p:json.loads(p.read_bytes());C=lambda v:json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()+b'\n'
def main():
 start=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':'/private/tmp/cric-recovery-venv/bin'+os.pathsep+os.environ.get('PATH','')}
 validator=SHARED/'canonical-experiment_visibility_request.py';collector=SHARED/'canonical-experiment_visibility_ui.mjs'
 assert collector.read_bytes()==(APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes()
 assert validator.read_bytes()==(APP/'tools/corpus_engineering/experiment_visibility_request.py').read_bytes()
 assert H(collector.read_bytes())=='2c48f62282d0db2a692f8a082902392d67e4d96a25d3fc0379478dda38b5fd61'
 spec=importlib.util.spec_from_file_location('canonical_six_validator',validator);v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
 def fp():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 before=fp();assert before['sha256']==RUNTIME
 for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
 old=J(D/'old552-prepared.json');source=J(APP/'content/esperienze-C1.json');sourceById={r['id']:r for r in source}
 ids=['SIM-C1-L006-01','SIM-C1-L006-02','SIM-C1-L006-03','SIM-C1-L007-01','SIM-C1-L007-02','SIM-C1-L007-03']
 rows=[r for r in old['records']if r['id']in ids];assert len(rows)==6
 mathReview=J(D.parent/'C1-six-work-energy-980-independent-20261127/independent-review.json');mathById={r['id']:r for r in mathReview['perID']}
 for r in rows:
  assert r['variant']=='published'and r['candidateSha256']is None
  assert v.digest(sourceById[r['id']])==r['sourceSha256'];assert sourceById[r['id']]==r['record']
  r['originalJudgment']={'scope':'Independent same-physics reread; not a new blind primary or editorial acceptance','manualArithmetic':mathById[r['id']]['math'],'UI':'NOT_RUN_BEFORE_THIS_FRESH_COLLECTION'}
 profiles=old['profiles'];assert len(profiles)==8
 keys=[k for k in old['expectedCaseKeys']if k.split('|')[0]in ids];assert len(keys)==296
 request={'schemaVersion':'1.0.0','scope':'BOUND_SIX_C1_WORK_ENERGY296_CURRENT_RUNTIME_NO_GLOBAL_ACCEPTANCE','sourceCommit':REF,'runtimeSha256':RUNTIME,'effectiveIds':ids,'sourceFileSha256':H((APP/'content/esperienze-C1.json').read_bytes()),'collectorSha256':H(collector.read_bytes()),'previousPreparedSha256':H((D/'old552-prepared.json').read_bytes()),'profiles':profiles,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'request.json').write_bytes(C(request))
 p={'schemaVersion':'1.0.0','scope':request['scope'],'sourceCommit':REF,'originalRef':'5d1dc8dc7b601aef959d10d564c75462be74708d','requestSha256':H((D/'request.json').read_bytes()),'course':'C1','runtimeFingerprint':before,'records':rows,'profiles':profiles,'expectedCaseKeys':keys,'inputFiles':{},'packageFiles':[],'draftRecords':[]}
 (D/'prepared.json').write_bytes(C(p));out=D/'actual-browser';assert not out.exists(),'Never overwrite prior browser evidence'
 info={'candidateApp':str(APP),'prepared':str(D/'prepared.json'),'output':str(out)};(D/'info.json').write_bytes(C(info))
 with(D/'actual-browser-process.txt').open('w')as o:r=subprocess.run(['node',str(collector),str(D/'info.json')],cwd=APP,env=env,stdout=o,stderr=subprocess.STDOUT)
 t={'observedExitCode':r.returncode if r.returncode>=0 else None,'observedSignal':-r.returncode if r.returncode<0 else None,'durationSeconds':time.monotonic()-start,'runtimeSha256':RUNTIME,'collectorSha256':H(collector.read_bytes()),'plannedCases':296,'reportSha256':H((out/'report.json').read_bytes())if(out/'report.json').exists()else None,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'terminal-receipt.json').write_text(json.dumps(t,indent=2)+'\n')
 if r.returncode:raise SystemExit(r.returncode)
 report=v.verify_report(out,p,H(collector.read_bytes()));planned=v.planned_interactions(p);setups=states=0
 for e in report['cases']:
  c=J(out/e['file']);row,state=planned[e['caseKey']];v.verify_planned_interaction(c,row,state)
  if state is None:
   assert len(c['questions'])==2 and all(q['status'].startswith('Corretto. ')for q in c['questions']);setups+=1
  else:states+=1
 assert(setups,states)==(48,248);assert fp()==before
 (D/'actual-validator-receipt.json').write_text(json.dumps({'actualProcessExitCode':0,'canonicalReportAndPlannedInteractions':'COMPLETE','setupCases':setups,'observedStates':states,'sourceRecordsIdenticalToPrior980':True,'runtimeBeforeAfterIdentical':True,'independentMathAndPNGRead':'PENDING','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print(json.dumps(t))
if __name__=='__main__':main()
