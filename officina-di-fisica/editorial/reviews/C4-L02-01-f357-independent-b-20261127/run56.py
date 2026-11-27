"""Fresh independent bounded56, exact canonical collector719, one immutable published ID."""
from pathlib import Path
from fractions import Fraction as F
import json,hashlib,importlib.util,subprocess,sys,os,shutil,time,copy
D=Path(__file__).resolve().parent;P=D.parent/'visibility-protocol719-b-preflight-20261127';APP=Path('/private/tmp/cric-midpoint-charge-labels-20261127/officina-di-fisica');REF='1dbd137840444b5a38ae49f17b00b6591f27f7d0';FP='f357b970906cb827c8e8046a42e45b35d8745179752f2a756b2affdf56bbe5f4';PIN='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15';J=lambda p:json.loads(p.read_bytes());H=lambda b:hashlib.sha256(b).hexdigest();C=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()+b'\n'
def save(n,x):
 with(D/n).open('xb')as f:f.write(C(x))
def mod(n,p):
 s=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def capacity():
 free=shutil.disk_usage('/private/tmp').free
 if free<2*1024**3:raise SystemExit('REFUSED below2GiB before child')
 return free
start=time.monotonic();env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PATH':'/private/tmp/cric-recovery-venv/bin'+os.pathsep+os.environ['PATH']};capacity();assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=APP,text=True).strip()==REF
v=mod('request719',P/'experiment_visibility_request.py');collector=P/'experiment_visibility_ui.mjs';assert H(collector.read_bytes())==PIN
fp=lambda:json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP,env=env));before=fp();assert before['sha256']==FP
protocol=APP/'tests/corpus/collect-C4-bounded-code-only.mjs';assert H(protocol.read_bytes())=='a188910901eac6c43a43acf871e6659e0b227e50577420438aa811dc0cc5ad2a';capacity()
with(D/'actual-code.json').open('x')as out,(D/'actual-code.stderr.txt').open('x')as err:r=subprocess.run(['node',str(protocol),'electrostatics'],cwd=APP,env=env,stdout=out,stderr=err,timeout=45)
save('actual-code-terminal.json',{'observedExitCode':r.returncode,'signal':None if r.returncode>=0 else -r.returncode,'protocolSha256':H(protocol.read_bytes()),'rawSha256':H((D/'actual-code.json').read_bytes())});assert r.returncode==0
ident='SIM-C4-L02-01';code=next(r for r in J(D/'actual-code.json')['records']if r['id']==ident);src=next(r for r in J(APP/'content/esperienze-C4.json')if r['id']==ident)
exact=[]
for case in code['cases']:
 x=F(str(case['x']));want=F(90)/(x*x);assert case['solve']['y']==float(want);exact.append({'x':str(x),'independentExact':str(want),'observed':case['solve']['y']})
assert [q['value']for q in code['assessment']]==[10,3.6];assert [q['unit']for q in code['assessment']]==['kN/C','kN/C'];assert src['control']['min']==1 and src['control']['max']==8 and src['control']['step']==.5
old=J(Path('/private/tmp/cric-c4-display-1209-448-20261127/prepared448.json'));row=copy.deepcopy(next(r for r in old['records']if r['id']==ident));assert row['record']==src;grid=[1,2,2.5,3,5,8];row.update({'record':src,'sourceSha256':v.digest(src),'grid':grid,'expectedValues':[float(F(90)/F(str(x))**2)for x in grid]})
profiles=old['profiles'];keys=[]
for p in profiles:
 stem='|'.join([ident,'published',str(p['width']),p['view']]);keys.append(stem+'|setup');keys.extend(stem+'|grid|'+str(i)for i in range(6))
assert len(keys)==len(set(keys))==56
request={'schemaVersion':'1.0.0','scope':'INDEPENDENT_ONE_C4_ID_FRESH56_NOT_GLOBAL','id':ident,'grid':grid,'profiles':profiles,'sourceCommit':REF,'runtimeSha256':FP,'collectorSha256':PIN,'originalManualAnswers':['10','18/5'],'predecessorRecipeOnly':{'path':'/private/tmp/cric-c4-display-1209-448-20261127/prepared448.json','sha256':H(Path('/private/tmp/cric-c4-display-1209-448-20261127/prepared448.json').read_bytes())},'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};save('request56.json',request)
plan={**old,'scope':request['scope'],'sourceCommit':REF,'runtimeFingerprint':before,'records':[row],'profiles':profiles,'expectedCaseKeys':keys,'requestSha256':H((D/'request56.json').read_bytes()),'inputFiles':{},'packageFiles':[],'draftRecords':[]};save('prepared56.json',plan);assert len(v.planned_interactions(plan))==56 and fp()==before
save('preflight56.json',{'candidateCommit':REF,'runtimeSha256':FP,'actualCodeStates':exact,'actualTasks':[{'input_cm':3,'exact_kN_per_C':'10'},{'input_cm':5,'exact_kN_per_C':'18/5'}],'preparedSha256':H((D/'prepared56.json').read_bytes()),'collectorSha256':PIN,'plannedCases':56,'Chrome':'NOT_RUN_BEFORE_THIS_POINT','activityCredit':0})
out=D/'actual';assert not out.exists();info={'candidateApp':str(APP),'prepared':str(D/'prepared56.json'),'output':str(out)};save('collector-input.json',info);free=capacity();clock=time.monotonic()
with(D/'collector.stdout.txt').open('x')as log:r=subprocess.run(['node',str(collector),str(D/'collector-input.json')],cwd=APP,env=env,stdout=log,stderr=subprocess.STDOUT)
receipt={'observedExitCode':r.returncode if r.returncode>=0 else None,'signal':-r.returncode if r.returncode<0 else None,'browserElapsedSeconds':time.monotonic()-clock,'fullElapsedSeconds':time.monotonic()-start,'freeBytesBeforeBrowser':free,'sourceCommit':REF,'runtimeSha256':FP,'collectorSha256':PIN,'plannedCases':56,'reportSha256':H((out/'report.json').read_bytes())if(out/'report.json').exists()else None,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};save('terminal.json',receipt);print(json.dumps(receipt),flush=True)
if r.returncode:raise SystemExit(r.returncode)
report=v.verify_report(out,plan,PIN);mapping=v.planned_interactions(plan);states=[];setups=0
for e in report['cases']:
 c=J(out/e['file']);r,s=mapping[e['caseKey']];v.verify_planned_interaction(c,r,s)
 if s is None:assert len(c['questions'])==2 and all(q['status'].startswith('Corretto. ')for q in c['questions']);setups+=1
 else:
  want=F(90)/F(str(s['x']))**2;assert c['model']['y']==float(want);states.append({'caseKey':c['caseKey'],'exact':str(want)})
assert len(states)==48 and setups==8 and fp()==before;save('validation.json',{'canonicalReportValidation':'PASS','plannedInteractions':'PASS','exactStates':states,'setups':setups,'acceptedManualSubmissions':16,'runtimeBeforeAfterIdentical':True,'PNGreading':'PENDING','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
