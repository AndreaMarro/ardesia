"""One fresh canonical C4 browser collection; no report adoption or consumer edit."""
from pathlib import Path
import hashlib,importlib.util,json,os,shutil,subprocess,sys,time
D=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica')
RUNTIME='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251'
H=lambda b:hashlib.sha256(b).hexdigest();J=lambda p:json.loads(p.read_bytes())
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def main():
 start=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':'/private/tmp/cric-recovery-venv/bin'+os.pathsep+os.environ.get('PATH','')}
 assert J(D/'preflight-terminal.json')['observedExitCode']==0
 pf=J(D/'actual-preflight-result.json');p=J(D/'prepared448.json')
 assert H((D/'prepared448.json').read_bytes())==pf['preparedSha256'];assert H((D/'request448.json').read_bytes())==pf['requestSha256']
 for i in J(D/'git-inputs.json')['inputs']:
  assert H((D/i['snapshot']).read_bytes())==i['sha256'];assert(APP/str(Path(i['path']).relative_to('officina-di-fisica'))).read_bytes()==(D/i['snapshot']).read_bytes()
 collector=APP/'tools/corpus_engineering/experiment_visibility_ui.mjs';assert H(collector.read_bytes())=='2c48f62282d0db2a692f8a082902392d67e4d96a25d3fc0379478dda38b5fd61'
 assert collector.read_bytes()==(D/'frozen-tools-corpus_engineering-experiment_visibility_ui.mjs').read_bytes()
 v=module('frozen_visibility_validator',D/'frozen-tools-corpus_engineering-experiment_visibility_request.py');model=module('independent_electrostatics_models',D/'independent_models.py')
 def fp():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env))
 before=fp();assert before==p['runtimeFingerprint'] and before['sha256']==RUNTIME
 out=D/'actual-browser';assert not out.exists(),'Never overwrite an earlier browser campaign'
 info={'candidateApp':str(APP),'prepared':str(D/'prepared448.json'),'output':str(out)};(D/'browser-info.json').write_text(json.dumps(info,sort_keys=True)+'\n')
 # The flock wrapper already checked2GiB; this second check is immediate to
 # the Node child. The unchanged collector also checks every25observations.
 free=shutil.disk_usage('/private/tmp').free
 if free<2*1024**3:raise SystemExit('REFUSED: free disk below2GiB immediately before browser child')
 with(D/'actual-browser-process.txt').open('w')as log:r=subprocess.run(['node',str(collector),str(D/'browser-info.json')],cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT)
 receipt={'observedExitCode':r.returncode if r.returncode>=0 else None,'observedSignal':-r.returncode if r.returncode<0 else None,'durationSeconds':time.monotonic()-start,'runtimeSha256':RUNTIME,'collectorSha256':H(collector.read_bytes()),'plannedCases':448,'freeBytesImmediatelyBeforeBrowser':free,'canonicalPer25CaseDiskGuard':'UNCHANGED','reportSha256':H((out/'report.json').read_bytes())if(out/'report.json').exists()else None,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'browser-terminal-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if r.returncode:raise SystemExit(r.returncode)
 report=v.verify_report(out,p,H(collector.read_bytes()));planned=v.planned_interactions(p);states=setups=0;exact=[]
 for entry in report['cases']:
  c=J(out/entry['file']);row,state=planned[entry['caseKey']];v.verify_planned_interaction(c,row,state)
  if state is None:
   assert len(c['questions'])==2 and all(q['status'].startswith('Corretto. ')for q in c['questions']);setups+=1
  else:
   x=state['time']if row['clockInput']and'time'in state else state['x'];want=model.value(row['id'],str(x),require_grid=state['kind']=='grid')
   assert model.rational(str(c['model']['y']))==want,(entry['caseKey'],c['model']['y'],want)
   exact.append({'caseKey':entry['caseKey'],'independentExact':str(want),'unit':row['record']['measure']['unit']});states+=1
 assert(setups,states)==(64,384);assert fp()==before
 (D/'actual-browser-validation.json').write_text(json.dumps({'actualBrowserExitCode':0,'reportAndAllPlannedInteractions':'COMPLETE','setupCases':setups,'actualAcceptedQuestionSubmissions':2*setups,'exactRationalObservedStates':exact,'runtimeBeforeAfterIdentical':True,'independentPNGReading':'PENDING','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'},indent=2)+'\n');print(json.dumps(receipt))
if __name__=='__main__':main()
