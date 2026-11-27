from pathlib import Path
from fractions import Fraction as F
import json,hashlib,subprocess
OUT=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');CANDIDATE='cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc'
d=json.loads((OUT/'actual-arrow-census.json').read_bytes());math=json.loads((OUT/'actual-math-code-review.json').read_bytes());code=json.loads((OUT/'actual-code-receipt.json').read_bytes())
summaries=[];macro=[]
for r in d['records']:
 if r['apparatus']!='motore':continue
 colors={}
 for case in r['cases']:
  if case['kind']!='grid':continue
  for a in case['arrows']:
   color=hex(a['c']);v=colors.setdefault(color,{'present':0,'physicalZero':0,'nonzeroOmitted':0,'rawPositiveWorld':[],'retainedWorld':[],'rawPositiveFallbackViewBox':[],'retainedFallbackViewBox':[]})
   v['physicalZero'if a['physicalZero']else'present'if a['retainedByActualRenderer']else'nonzeroOmitted']+=1
   if not a['physicalZero']:v['rawPositiveWorld'].append(a['worldLength']);v['rawPositiveFallbackViewBox'].append(a['fallbackIntrinsicLength'])
   if a['retainedByActualRenderer']:v['retainedWorld'].append(a['worldLength']);v['retainedFallbackViewBox'].append(a['fallbackIntrinsicLength'])
 for v in colors.values():
  for field in ('rawPositiveWorld','retainedWorld','rawPositiveFallbackViewBox','retainedFallbackViewBox'):
   a=v[field];v[field]=[min(a),max(a)]if a else None
 summaries.append({'id':r['id'],'legend':r['legend'],'gridCount':sum(c['kind']=='grid'for c in r['cases']),'colors':colors,'semantics':'L10-01 purple encodes signed heat transfer; all other motore records use purple work, red hot heat and green cold heat'})
for item in d['nonzeroOmitted']:
 group=next(g for g in ('state','calorimetry','first-law','paths','entropy')if any(r['id']==item['id']for r in json.loads((OUT/(g+'-actual-code.json')).read_text())['records']));r=next(r for r in json.loads((OUT/(group+'-actual-code.json')).read_text())['records']if r['id']==item['id']);index=None
 if item['kind']=='grid':index=next(i for i,c in enumerate(r['cases'])if c['x']==item['x'])
 else:
  flat=[];seen=set()
  for i,c in enumerate(r['cases']):
   for frame in c['clockSamples']:
    token=(i,frame['time'])
    if token not in seen:seen.add(token);flat.append((c['x'],frame['time']))
  index=flat.index((item['x'],item['time']))
 keys=[f"{item['id']}|published|{width}|{view}|{item['kind']}|{index}"for width in (320,1280)for view in ('orbit','side','top','fixed_projection')]
 macro.append({**item,'stateIndex':index,'caseKeysInCurrentMacro':keys})
findings=sorted({x['id']for x in macro});summary={'runtimeSha256':d['runtime'],'candidateRef':CANDIDATE,'runId':45917299096,'runHead':'0dbfa07c4d8abe6d80bc827d0f08a40b62075059','recordCount':36,'gridStates':624,'clockFrames':745,'rawVsInstalledMismatches':d['unexpectedRawVsInstalled'],'thermalMotorSummaries':summaries,'nonzeroOmissions':macro,'findingIds':findings,'currentMacroCasesForOmissions':sum(len(x['caseKeysInCurrentMacro'])for x in macro),'visualLengthMeaning':'scene geometry length and intrinsic SVG viewBox lengths only; no CSS-pixel or screen visibility measurement claimed','UI':'PENDING_CURRENT_REMOTE_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'priority-census-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
# Original radical and separate DRAFT selected points, without changing the law.
assert F(316,100)**2<10<F(317,100)**2
bound=[8*F(316,100),8*F(317,100)];entered=F('25.3');max_relative_error=max(abs(entered-b)for b in bound)/min(bound);assert max_relative_error<F(5,1000)
draft=json.loads((OUT/'actual-draft263-probe.json').read_bytes());assert draft['assessmentSelection']['points']==[2.25,4];assert draft['packageSha256']=='ecd99ef570fe1756980243b80e0877cfc58454dbcae562c8837d8390a7ff75b3';assert len(draft['assessment'])==2
radical={'id':'SIM-C3-L07-05','original':{'version':1,'points':['4','5/2'],'exactValues':['25/2','8√10'],'numericInputs':['12.5','25.3'],'sqrt10Bounds':['3.16','3.17'],'pressureBounds':[str(b)for b in bound],'maximumRelativeInputErrorBound':str(max_relative_error),'gradingRelativeTolerance':'1/200','symbolicRadicalInputAcceptedByNumber':False,'manualBoundProcedureSuppliedByIndependentReviewer':True,'originalPublicationUnchanged':True},'separateDraft':{'version':2,'baseVersion':1,'points':['9/4','4'],'exactValues':['800/27','25/2'],'numericInputs':['29.63','12.5'],'explicitLongDivisionInLearnerBlocks':True,'actualInstalledProbe':draft},'samePhysicalLaw':True,'separateEditionNotOriginalRepair':True,'UI':'PENDING_CURRENT_REMOTE_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'original-radical-vs-draft263.json').write_text(json.dumps(radical,ensure_ascii=False,indent=2)+'\n')
# Verbatim dependencies, never old report/signature retagging.
inputs=[]
paths=['static/js/banchi/voci/modelli/C3.js','static/js/banchi/voci/apparati/termica.js','static/js/banchi/voci/geometria.js','static/js/banchi/voci/tavola.js','static/js/banchi/voci/legende.js','static/js/banchi/voci/esperimento.js','static/js/banchi/voci/orologi.js','static/js/banchi/scena.js','tools/corpus_engineering/experiments_C3_code_partial_verifier.py','editorial/reviews/C3-36-source-only-primary-20261125.json']
for i,path in enumerate(paths):
 raw=(ROOT/path).read_bytes();frozen=subprocess.check_output(['git','show',CANDIDATE+':officina-di-fisica/'+path],cwd=ROOT.parent);assert raw==frozen,path;name=f'frozen-input-{i:02d}'+Path(path).suffix;(OUT/name).write_bytes(raw);inputs.append({'commit':CANDIDATE,'path':'officina-di-fisica/'+path,'snapshot':name,'sha256':hashlib.sha256(raw).hexdigest()})
source_ref='5d1dc8dc7b601aef959d10d564c75462be74708d';path='officina-di-fisica/content/esperienze-C3.json';raw=subprocess.check_output(['git','show',source_ref+':'+path],cwd=ROOT.parent);(OUT/'frozen-original-C3.json').write_bytes(raw);inputs.append({'commit':source_ref,'path':path,'snapshot':'frozen-original-C3.json','sha256':hashlib.sha256(raw).hexdigest()});(OUT/'git-inputs.json').write_text(json.dumps({'schemaVersion':'1.0.0','inputs':inputs},ensure_ascii=False,indent=2)+'\n')
status={'phase':'PARTIAL_C3_CB9_MATH_AND_CONSUMER_CODE_WITH_REAL_RED_PENDING_CURRENT_UI','records':[{'id':r['id'],'math':'PASS_REFRESH','consumerCode':'NONZERO_ARROW_OMISSION'if r['id']in findings else'CHECKED_CODE_NO_FINDING','UI':'PENDING_CURRENT_REMOTE_RUN','complete':False}for r in math['records']],'mathPassed':36,'knownCodeFindingIds':findings,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(OUT/'per-id-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'mathPassed':36,'codeFindingIds':findings,'nonzeroOmissions':len(macro),'affectedCurrentMacroCases':summary['currentMacroCasesForOmissions'],'dependencySnapshots':len(inputs)}))
