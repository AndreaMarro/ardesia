"""Read-only aggregation of 139 ORIGINAL experimental reviews, not a registry.

No verifier imports, source/model execution, approval or publication. Preserves
original failures, historical UI observations and explicitly separate addenda.
"""
from pathlib import Path
from collections import Counter
import hashlib,json,subprocess
APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PINS={
'editorial/reviews/experiments-pressure-hydrostatics-047-delivery-20261125.json':'2017738cb7a8d29313b20e38c42536413afb550fd6b641fddad53c2ecd6bdfa3',
'editorial/reviews/experiments-pressure-hydrostatics-047-originals-frozen-1a35-20261125/editorial/reviews/experiments-pressure-hydrostatics-047-originals.json':'32ef90d2393511097a0caa5497090e2abf78094117b2e3cc80d6604ac13f8859',
'editorial/reviews/C2-hydraulics-buoyancy-code-partial-delivery-20261125.json':'7299d1729fb139dac1ff43e7165370d85c070b06ab987ce3c567ece3f07ead48',
'editorial/reviews/experiments-C2-hydraulics-buoyancy-code-partial-20261125.json':'80b7ce8c82ff776898f2fbf16acb892d17e3e1cdb9570ea17c948bf057c63400',
'editorial/reviews/C2-remaining26-code-partial-20261125/delivery.json':'0b2e8d5edf92488d0f660b0d1e10079bdccc745cb90b1a2fcc220ebcd4fa731c',
'editorial/reviews/C3-36-code-partial-20261125/delivery.json':'b48b4171936c979caa7199f6e03bd658163aa26e22f567e3d1f5841239396580',
'editorial/reviews/C3-L07-05-manuality-addendum-20261125/delivery.json':'1f538c032dac9c469e49d00d5533d34f6f561c0cb6aea5be6e3683e1e8bdcac0',
'editorial/reviews/C4-29-code-partial-20261125/delivery.json':'ab8376fa819b4e4593ed30079692ca56cc7fce32c43a16468dbc00f6b4175484',
'editorial/reviews/C5-27-code-partial-20261125/delivery.json':'d1982e496127ebae3af38596b2560fb6ea8715c4dd803678d12e9fd71344021d',
'editorial/reviews/C6-6-code-partial-20261125/delivery.json':'877afab10fa6cf423633480f8649af9a22119c200af8bac7384c064706eaf736'}
SOURCE_PINS={'C2':'33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1','C3':'2738799d5195ca5eda77c4dce1cdc79f708237e5660bb9cabcc7fac4f80ea3ff'}
SOURCE_PINS.update({'C4':'b56b6df61c44009e1508cf0e2cb7992b936db985e37f8c21fc9afd51b811e58d','C5':'7fff6e6703886003c45695e95b3361f8e09875da4b080ae17e6aa26d33f9bd84','C6':'6e6877e96bd91712fbcc15e530486c31a4c8087227e1292b9093876b465c292c'})
COURSE_COUNTS={'C2':41,'C3':36,'C4':29,'C5':27,'C6':6}

def sha(b):return hashlib.sha256(b).hexdigest()
def digest(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def load(path,expected=None):
    blob=(APP/path).read_bytes()
    pin=expected or PINS.get(path)
    if pin and sha(blob)!=pin:raise ValueError('Frozen inventory input drift: '+path)
    return json.loads(blob)
def frozen_manifests():
    docs={p:load(p,h) for p,h in PINS.items()}
    for path,doc in docs.items():
        files=doc.get('files',[])
        if not isinstance(files,list):continue # 047 legacy snapshot uses its own immutable map.
        for f in files:
            if sha((APP/f['path']).read_bytes())!=f['sha256']:raise ValueError('Frozen child drift: '+f['path'])
    return docs

def source_records():
    rows={}
    for course,pin in SOURCE_PINS.items():
        path='officina-di-fisica/content/esperienze-'+course+'.json'
        raw=subprocess.check_output(['git','show',REF+':'+path],cwd=APP)
        if sha(raw)!=pin:raise ValueError('Original source file changed')
        items=json.loads(raw)
        if len(items)!=COURSE_COUNTS[course] or len({r['id'] for r in items})!=len(items):raise ValueError('Source count/identity differs')
        for row in items:
            if row['id'] in rows:raise ValueError('Duplicate source ID')
            rows[row['id']]=dict(row)
    return rows

def validate_identity(records,sources):
    ids=[r['id'] for r in records]
    if len(ids)!=139 or len(set(ids))!=139 or set(ids)!=set(sources):raise ValueError('139 unique original IDs required; no draft duplicate/omission')
    for r in records:
        original=sources[r['id']]
        if r['sourceVersion']!=original['version'] or r['sourceSha256']!=digest(original):raise ValueError('Original version/hash binding differs: '+r['id'])
        if len(r['actualAssignedTasks'])!=2:raise ValueError('Two ACTUAL tasks required')
        if r['activityCreditGrantedByInventory']!=0 or r['humanApproval']!='NOT_RUN' or r['publicationAction']!='NONE':raise ValueError('Inventory must not approve/publish')

def build():
    docs=frozen_manifests();sources=source_records();out=[];references=dict(PINS)
    def append(r,path,stage,science,manualfail,gap,codefail,uifail,ui,task,grid,frames,detail,historical=False):
        source=sources[r['id']];sourcehash=r.get('sourceSha256',digest(source))
        if sourcehash!=digest(source) or r.get('sourceVersion',source['version'])!=source['version']:raise ValueError('Review/source mismatch')
        out.append({'id':r['id'],'course':source['course'],'sourceVersion':source['version'],'sourceSha256':sourcehash,
          'sourceRef':REF,'sourcePath':'officina-di-fisica/content/esperienze-'+source['course']+'.json',
          'reviewPath':path,'reviewFileSha256':sha((APP/path).read_bytes()),'stage':stage,
          'sourceScientificFailure':science,'sourceManualityFailure':manualfail,'manualSupportGap':gap,
          'consumerCodeGeometryFailure':codefail,'consumerObservedUiFailure':uifail,
          'UI':ui,'actualAssignedTasks':task,'installedLegalGridStates':grid,'clockObservationRecords':frames,
          'findingsAndLimits':detail,'historicalOverallOkPreserved':historical,
          'activityCreditGrantedByInventory':0,'overallAcceptanceGrantedByInventory':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    original_path=next(p for p in PINS if p.endswith('047-originals.json'))
    original=docs[original_path]
    frozen_prefix='editorial/reviews/experiments-pressure-hydrostatics-047-originals-frozen-1a35-20261125/'
    browser_path=frozen_prefix+'editorial/reviews/experiments-pressure-hydrostatics-047-1a35-20261125/browser-raw.json'
    legacy=docs['editorial/reviews/experiments-pressure-hydrostatics-047-delivery-20261125.json']
    browser_pin=legacy['snapshotFiles'][browser_path.removeprefix(frozen_prefix)]
    browser=load(browser_path,browser_pin);references[browser_path]=browser_pin
    ui_cases=Counter(c['id'] for c in browser['cases'])
    if sum(ui_cases.values())!=228 or browser['terminalStatus']!='COMPLETED':raise ValueError('Historical047 UI proof invalid')
    for r in original['records']:
        append(r,original_path,'FROZEN_047_SOURCE_AND_ACTUAL_UI',not r['sourceScientificReview']['ok'],False,False,False,not r['consumerReview']['ok'],
          'OBSERVED_NATIVE_FALLBACK_320_1280',r['runtimeComparison']['tasks'],r['runtimeComparison']['caseCount'],r['runtimeComparison'].get('clockSampleCount',0),
          {'sourceErrors':r['sourceScientificReview']['errors'],'consumerErrors':r['consumerReview']['errors'],'manualProcedure':r['manualArithmetic'],'baseUiCaseCountForThisId':ui_cases[r['id']],'groupTargetedUiSupplementCases':8,'supplementCountScope':'8forthewhole047group,not8foreachID;notaddedtoperIDbasecount','evidence':r['consumerEvidence']},r['ok'])
    hydpath='editorial/reviews/experiments-C2-hydraulics-buoyancy-code-partial-20261125.json'
    hyd=docs[hydpath]
    if hyd['sourceFileSha256']!=SOURCE_PINS['C2']:raise ValueError('Hydraulics whole-source pin differs')
    for r in hyd['records']:
        append(r,hydpath,'FROZEN_SOURCE_MATH_INSTALLED_CODE_PARTIAL',False,False,False,False,False,'NOT_RUN',r['installedCode']['actualAssignedTasks'],r['installedCode']['caseCount'],0,{'scope':'Fivewhole-source-pinnedexact/code reviews;noUIclaim','exactChecks':r['exactChecks'],'installedCode':r['installedCode']})
    for group in ('flow-continuity','bernoulli','viscosity-poiseuille','networks','capillarity'):
        path='editorial/reviews/C2-'+group+'-code-partial-20261125/report.json';d=load(path)
        references[path]=sha((APP/path).read_bytes())
        for r in d['records']:
            c=r['installedConsumerCode']
            append(r,path,'FROZEN_SOURCE_MATH_INSTALLED_CODE_PARTIAL',not r['mathOk'],False,False,not c['geometryCodeOk'],False,'NOT_RUN',c['actualAssignedTasks'],c['caseCount'],c['clockFrameCount'],{'mathChecks':r['exactChecks'],'consumerCode':c,'manualProcedure':r['manualArithmetic'],'limits':'NoUI;geometricfailuresremaincodeonly,notobservedpixels'})
    groups={'C3':['state','calorimetry','first-law','paths','entropy'],'C4':['electrostatics','materials-current','capacitors','magnetism'],'C5':['oscillation-waves','energy-sound','fields-photons','nuclear-optics'],'C6':['cross-domain']}
    counts={'C3':36,'C4':29,'C5':27,'C6':6}
    for course,parts in groups.items():
        for group in parts:
            path=f'editorial/reviews/{course}-{counts[course]}-code-partial-20261125/{group}-report.json';d=load(path)
            if d['runtimeSha256']!=RUNTIME:raise ValueError('Do not retag unknown runtime')
            references[path]=sha((APP/path).read_bytes())
            for r in d['records']:
                append(r,path,'FROZEN_SOURCE_MATH_INSTALLED_CODE_PARTIAL',not r['sourceMathAndActualTasksOk'],r['ManualityFailure'],r.get('ManualSupportGap',False) or r['ManualityFailure'],not r['consumerCodeGeometryOk'],False,'NOT_RUN',r['actualTasks'],r['gridCount'],r['clockSampleCount'],{'manualProcedure':r['manualProcedure'],'sourceAssumptions':r['assumptionsAndDomain'],'geometryObservations':r['geometryObservations'],'errors':r['errors'],'limits':r['checkedGeometryScope']})
    addpath='editorial/reviews/C3-L07-05-manuality-addendum-20261125/addendum.json';add=load(addpath);references[addpath]=sha((APP/addpath).read_bytes())
    row=next(r for r in out if r['id']=='SIM-C3-L07-05')
    row['manualSupportGap']=True;row['findingsAndLimits']['separateManualityAddendum']={'path':addpath,'sha256':references[addpath],'sourceManualityReady':add['sourceManualityReady'],'judgment':add['manualityJudgment'],'supersedesPriorPartialReadinessFlag':True,'originalFrozenReportUntouched':True,'procedureCost':add['prerequisitesAndCost']}
    for r in out:
        if r['sourceScientificFailure']:action='SEPARATE_AUTHOR_SOURCE_EDITION_AND_INDEPENDENT_REVIEW'
        elif r['sourceManualityFailure']:action='SEPARATE_AUTHOR_MANUAL_TASK_OR_METHOD_EDITION_AND_INDEPENDENT_REVIEW'
        elif r['consumerObservedUiFailure'] or r['consumerCodeGeometryFailure']:action='SEPARATE_RUNTIME_AUTHOR_FIX_AND_TRUE_NEW_RUNTIME_UI_REPLAY'
        elif r['manualSupportGap']:action='EDITORIAL_MANUAL_SUPPORT_DECISION_OR_SEPARATE_EDITION_THEN_UI'
        elif r['historicalOverallOkPreserved']:action='INTEGRATOR_DISPOSITION_OF_EXISTING_FROZEN_POSITIVE_NOT_NEW_CREDIT'
        else:action='ACTUAL_CANONICAL_UI_AND_PEDAGOGICAL_GATE_BEFORE_ACCEPTANCE'
        r['nextAction']=action;r['separateCorrectionAuthorRequired']=bool(r['sourceScientificFailure'] or r['sourceManualityFailure'] or r['consumerObservedUiFailure'] or r['consumerCodeGeometryFailure'])
    validate_identity(out,sources);out.sort(key=lambda r:r['id'])
    summary={'records':139,'byCourse':dict(Counter(r['course'] for r in out)),
      'actualAssignedNumericTasks':sum(len(r['actualAssignedTasks'])for r in out),
      'installedLegalGridStates':sum(r['installedLegalGridStates']for r in out),
      'clockObservationRecordsIncludingRepeatedStates':sum(r['clockObservationRecords']for r in out),
      'sourceScientificFailureIds':[r['id']for r in out if r['sourceScientificFailure']],
      'sourceManualityFailureIds':[r['id']for r in out if r['sourceManualityFailure']],
      'manualSupportGapIds':[r['id']for r in out if r['manualSupportGap']],
      'supportGapOnlyIds':[r['id']for r in out if r['manualSupportGap']and not r['sourceManualityFailure']],
      'consumerObservedUiFailureIds':[r['id']for r in out if r['consumerObservedUiFailure']],
      'consumerCodeGeometryFailureIds':[r['id']for r in out if r['consumerCodeGeometryFailure']],
      'uiObservedIds':[r['id']for r in out if r['UI']!='NOT_RUN'],
      'uiNotRunCount':sum(r['UI']=='NOT_RUN'for r in out),
      'historical047PositiveCountPreserved':sum(r['historicalOverallOkPreserved']for r in out),
      'historical047BaseUiCases':228,'historical047TargetedSupplementCases':8,
      'activityCreditGrantedByInventory':0}
    draft_path='editorial/reviews/experiment-stevino-revision-047-text-math-review-20261125.json'
    references[draft_path]=sha((APP/draft_path).read_bytes())
    return {'phase':'AUDIT_INVENTORY_139_ORIGINALS_NOT_A_REGISTRY_OR_APPROVAL','sourceRef':REF,'runtimeEvidenceEpoch':RUNTIME,
      'sourceFilePins':SOURCE_PINS,'referencedFrozenFiles':references,'summary':summary,'records':out,
      'candidateCorrectionNotDoubleCounted':{'id':'SIM-C2-L002-01','draftTextMathReview':draft_path,'draftTextMathReviewSha256':references[draft_path],'status':'MATH_ONLY_DRAFT_REVIEW_DOES_NOT_CLEAR_ORIGINAL_SOURCE_OR_CONSUMER_FAILURE','addsOriginals':0},
      'limits':'AggregationofheterogeneousFROZENreviews;no freshmodel/browsercheck, noretags, noPASSfromsourcekeys. 047actualUIpreserved separatelyfrom129UI_NOT_RUN. Allnewruntimefixes needactualreplay, notfingerprintreplacement. ManualsourceFAILdistinctfrom reviewer-onlyfeasibleprocedure/supportgap. No source/candidate/runtime/registry/ledger edits. Separateauthormustwritecorrections;AIreviewerdoesnotselfapprove.',
      'registryModified':False,'overallAcceptanceGranted':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}

if __name__=='__main__':print(json.dumps(build(),ensure_ascii=False,sort_keys=True,indent=2))
