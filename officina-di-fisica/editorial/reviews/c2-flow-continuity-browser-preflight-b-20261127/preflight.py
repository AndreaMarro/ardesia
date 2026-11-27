"""Bounded preflight for the existing canonical collector, not the global139 pipeline."""
from pathlib import Path
from fractions import Fraction as F
import hashlib,json,subprocess,sys,importlib.util,shutil,time
D=Path(__file__).resolve().parent
APP=Path('/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica')
REF='b9994b9116e87478905191d85cca8037d17ae4bd'
COLLECTOR='e24c46b4c11403821b026c304875f68edc76b679aa6928b1716bd597c5d15e55'
C=lambda v:json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()+b'\n'
H=lambda b:hashlib.sha256(b).hexdigest()
J=lambda p:json.loads(p.read_bytes())
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def main():
 start=time.monotonic();assert shutil.disk_usage(D).free>=2*1024**3
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=APP,text=True).strip()==REF
 fpmod=module('installed_runtime_fp',APP/'tools/corpus_engineering/runtime_fingerprint.py');before=fpmod.runtime_fingerprint(APP)
 assert before['sha256'].startswith('7c7281')
 assert H((APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes())==COLLECTOR
 # The consumer bytes are actual immutable Git inputs, not a replacement fingerprint.
 for name,pin in before['files'].items():
  if name.startswith('node_modules/'):continue
  raw=subprocess.check_output(['git','show',REF+':officina-di-fisica/'+name],cwd=APP)
  assert H(raw)==pin,name
 for i in J(D/'git-inputs.json')['inputs']:assert H((D/i['snapshot']).read_bytes())==i['sha256']
 package=D/'inputs/experiment-c2-flow-continuity-reading-20261127.json';bindings=package.with_name(package.stem+'-bindings.json')
 assert set((D/'inputs').iterdir())=={package,bindings}
 assert H(package.read_bytes())=='c54a02b832d1a54e7401180e917ed550e5b483329e11599d65149f4b469cdfa5'
 assert H(bindings.read_bytes())=='728e87d7ca4b8ba0b725b69a657150784d243211b45fd5a9d4b0b88aff82fd3c'
 assert not(D/'actual-code.json').exists(),'Never overwrite previous producer output'
 p=subprocess.run(['node',str(D/'collect-code.mjs'),str(APP)],capture_output=True)
 (D/'actual-code.stdout.txt').write_bytes(p.stdout);(D/'actual-code.stderr.txt').write_bytes(p.stderr)
 (D/'code-terminal.json').write_bytes(C({'exitCode':p.returncode,'signal':None if p.returncode>=0 else -p.returncode,'moduleSha256':H((D/'collect-code.mjs').read_bytes()),'Chrome':'NOT_RUN'}));p.check_returncode()
 (D/'actual-code.json').write_bytes(p.stdout);code=J(D/'actual-code.json')['rows'];assert len(code)==10
 ids=['SIM-C2-L005-0'+str(i)for i in range(1,6)]
 expected=[['24','28'],['2.4','2'],['4','4.8'],['5','3'],['4','6']]
 def value(id,x):
  x=F(str(x));return [lambda:4*x,lambda:F(4,5)*x,lambda:F(24)/x,lambda:x/2,lambda:12-x][ids.index(id)]()
 for r in code:
  assert r['questionDisplays']==[x.replace('.',',')for x in expected[ids.index(r['id'])]]
  for s in r['states']:
   # Installed raw floats are retained separately; exact task quantities come from the frozen independent primary.
   exact=value(r['id'],s['x'])
   expected_binary=0.8*float(s['x']) if r['id'].endswith('02') else float(exact)
   assert s['solve']['y']==expected_binary # Strict equality, no rational reconstruction or epsilon
   for c in s['clock']:
    signal=(F(str(s['x'])) if r['id'].endswith('01')else F(3,4)*F(str(s['x'])))*F(str(c['time']))
    assert F(str(c['signal']))==signal
 inputs={str(p.resolve()):H(p.read_bytes())for p in (package,bindings)};drafts=J(package)['records']
 grids=dict(zip(ids,[[0,1,6,7,12],[0,.25,2.5,3,5],[1,5,6,8],[0,1,6,10,12],[0,6,8,12]]))
 clockplans={ids[0]:[(0,6),(1,3),(7,3),(12,6)],ids[3]:[(0,5),(1,2.5),(6,2.5),(10,5),(12,5)]}
 validator=module('installed_visibility_request',APP/'tools/corpus_engineering/experiment_visibility_request.py')
 old=J(D/'four-original-visual-negatives.json');allkeys=[];blocks=[]
 inputhashes={p.name:h for p,h in ((package,inputs[str(package.resolve())]),(bindings,inputs[str(bindings.resolve())]))}
 for id in ids:
  for width in (320,1280):
   profiles=[{'width':width,'fallback':f,'view':v}for f,v in [(False,'orbit'),(False,'side'),(False,'top'),(True,'fixed_projection')]]
   rows=[]
   for r in [v for v in code if v['id']==id]:
    grid=grids[id];clock=[{'gridIndex':grid.index(x),'time':t}for x,t in clockplans.get(id,[])]
    states={s['x']:s for s in r['states']}
    for c in clock:
     assert r['clock'] and not r['clock']['input'] and 0<=c['time']<=r['clock']['duration']
    rows.append({'id':id,'course':'C2','variant':r['variant'],'record':r['record'],'sourceSha256':validator.digest(next(v['record']for v in code if v['id']==id and v['variant']=='published')),'candidateSha256':validator.digest(r['record'])if r['variant']=='draft'else None,'grid':grid,'expectedValues':[states[x]['solve']['y']for x in grid],'independentExactValues':[str(value(id,x))for x in grid],'clockCases':clock,'auxiliaryCases':[],'clockInput':False,'hasClock':bool(r['clock']),'sourcePrediction':r['prediction'],'questions':[{'input':s,'expectedAccepted':True,'sourceManualReadiness':'FROZEN_INDEPENDENT_READING_820f32eb','prompt':q['prompt']}for s,q in zip(expected[ids.index(id)],r['questions'],strict=True)],'originalJudgment':{'scope':'Bounded original and five reviewed draft tasks; no UI approval','mathematicalPrimaryCommit':'5114b5439eff1daaa143c674459fc470018a126d','newDraftReadingCommit':'820f32eb94aeab1c4abbec24264d9ede8847d2c4','knownDecimalRenderingFinding':id==ids[1],'oldVisualNegativeKeys':[v['caseKey']for v in old if v['id']==id]}})
   request={'schemaVersion':'1.0.0','scope':'BOUNDED_C2_FIVE_FLOW_DRAFTS_BOTH_EDITIONS_PREFLIGHT_ONLY','sourceCommit':REF,'runtimeSha256':before['sha256'],'collectorSha256':COLLECTOR,'id':id,'width':width,'editions':['published','draft'],'grid':grids[id],'clock':clockplans.get(id,[]),'profiles':profiles,'importInputs':inputhashes,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
   name=id.rsplit('-',1)[-1]+'-'+str(width); folder=D/'blocks'/name;folder.mkdir(parents=True)
   (folder/'bounded-request.json').write_bytes(C(request))
   keys=[]
   for r in rows:
    for profile in profiles:
     stem='|'.join((id,r['variant'],str(width),profile['view']));keys.append(stem+'|setup')
     for kind,values in [('grid',r['grid']),('clock',r['clockCases'])]:keys.extend(stem+'|'+kind+'|'+str(i)for i in range(len(values)))
   prepared={'schemaVersion':'1.0.0','scope':request['scope'],'sourceCommit':REF,'originalRef':'5d1dc8dc7b601aef959d10d564c75462be74708d','requestSha256':H((folder/'bounded-request.json').read_bytes()),'runtimeFingerprint':before,'course':'C2','records':rows,'profiles':profiles,'expectedCaseKeys':keys,'inputFiles':inputs,'packageFiles':[str(package.resolve())],'draftRecords':drafts,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
   assert len(validator.planned_interactions(prepared))==len(keys)==len(set(keys))
   (folder/'prepared.json').write_bytes(C(prepared));info={'candidateApp':str(APP),'prepared':str(folder/'prepared.json'),'output':str(folder/'actual-browser-NOT-RUN')};(folder/'collector-input.json').write_bytes(C(info))
   blocks.append({'block':name,'id':id,'width':width,'expectedCases':len(keys),'setupCases':len(rows)*len(profiles),'gridStates':len(rows)*len(profiles)*len(grids[id]),'clockStates':len(rows)*len(profiles)*len(clockplans.get(id,[])),'preparedSha256':H((folder/'prepared.json').read_bytes()),'requestSha256':prepared['requestSha256'],'collectorInput':str(folder/'collector-input.json'),'Chrome':'NOT_RUN'})
   allkeys+=keys
 assert len(allkeys)==len(set(allkeys))==592
 assert len(blocks)==10 and max(b['expectedCases']for b in blocks)==88
 assert fpmod.runtime_fingerprint(APP)==before
 (D/'candidate-runtime.json').write_bytes(C(before));(D/'block-plan.json').write_bytes(C({'blocks':blocks,'expectedCaseKeys':allkeys,'aggregateCases':len(allkeys),'mutuallyDisjoint':True,'maxBlockCases':88,'maxPerBlockConservativeOutputBytes':88*(256+128)*1024,'executionPolicy':'ONE_AUTHORIZED_BLOCK_AT_A_TIME_UNDER_FLOCK_2GIB_GUARD; preserve any partial block, never resume by overwriting case IDs; no Chrome authorized now','Chrome':'NOT_RUN','activityCredit':0}))
 result={'phase':'CPU_PREFLIGHT_ONLY','sourceCommit':REF,'runtimeSha256':before['sha256'],'collectorSha256':COLLECTOR,'codeExitCode':p.returncode,'records':10,'uniqueIds':5,'compiledTasks':20,'uniqueTaskDefinitions':10,'legalControlStatesBothEditions':sum(len(r['states'])for r in code),'clockFramesBothEditions':sum(len(s['clock'])for r in code for s in r['states']),'plannedBrowserCases':592,'blocks':10,'maxBlockCases':88,'canonicalPlannedInteractionsValidated':True,'runtimeBeforeAfterIdentical':True,'elapsedSeconds':time.monotonic()-start,'ownerGuestImporter':'REQUIREMENTS_PLANNED_NOT_RUN','Chrome':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'preflight-result.json').write_bytes(C(result));print(json.dumps(result))
if __name__=='__main__':main()
