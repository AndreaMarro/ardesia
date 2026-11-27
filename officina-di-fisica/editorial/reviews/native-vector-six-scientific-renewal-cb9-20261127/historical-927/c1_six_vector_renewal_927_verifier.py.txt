"""Six-ID scientific refresh; recovered physics, new independently read927 UI.

Never changes old family gates/reports. The Core author is not this reviewer.
"""
from pathlib import Path,PurePosixPath
import importlib.util,importlib.machinery,json,types,zipfile,tempfile
from .pipeline import digest,sha
from .review_contract import reviewed_rows
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/native-vector-six-scientific-renewal-927-20261126'
VISUAL=APP/'editorial/reviews/native-vector-six-independent-27503-20261126'
RUNTIME='9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d'
VISUAL_HANDOFF='b67cdecdf76068b62f4a680d227f2e73c963b0cbb45d4034dab6afcec779c18a'
SOURCE_SHA='84d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3'
LEGACY={'experiments_foundations_revision_verifier.py':'5eab7c3526e9b23ab472979acdd6f2d1f9da4996e55be725225e8f330c91127e','experiments_vectors_revision_verifier.py':'763e5442449327970d1d32c93e54e9ef9fe449cbd39a61099812fd5cf254cff7','experiments_force_work_corrected_048_verifier.py':'6dca8735fd6521ef7db0ceb1f87d5353ba0e9e1437c1eb5acbbff05b59f69adf','runtime_fingerprint.py':'c23abf00cb3665ac9d5b90c1f8256852045a7582fa5e8bae5acf31462b619ab8'}
FAMILIES={'experiments_foundations_revision_verifier.py':['SIM-C1-L001-06'],'experiments_vectors_revision_verifier.py':['SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04'],'experiments_force_work_corrected_048_verifier.py':['SIM-C1-L007-01']}
DRAFTS={'SIM-C1-L001-06':'experiment-projection-revision-118','SIM-C1-L002-04':'experiment-products-revision-119'}
IDS=set(sum(FAMILIES.values(),[]))
def load(p):return json.loads(Path(p).read_bytes())
def legacy(name):
    if name not in LEGACY:raise ValueError('Unreviewed recovered dependency')
    path=BASE/'legacy'/name
    if sha(path.read_bytes())!=LEGACY[name]:raise ValueError('Recovered exact oracle source drift')
    # Immutable trusted Python snapshot, not a mathematical expression decoder.
    loader=importlib.machinery.SourceFileLoader(__package__+'._six_frozen_'+name.removesuffix('.py'),str(path))
    spec=importlib.util.spec_from_loader(loader.name,loader);m=importlib.util.module_from_spec(spec);loader.exec_module(m);return m

def bind(fn,app,specs):
    return types.FunctionType(fn.__code__,{**fn.__globals__,'APP':app,'SPECS':specs},fn.__name__,fn.__defaults__,fn.__closure__)

def evidence():
    raw=(VISUAL/'handoff.json').read_bytes()
    if sha(raw)!=VISUAL_HANDOFF:raise ValueError('Independent visual handoff drift')
    h=json.loads(raw)
    if h['verdict']!='INDEPENDENT_POSITIVE_WITH_EXPLICIT_SCOPE_AND_LIMITS'or set(h['sixIds'])!=IDS or h['actualFinalExit']!=0 or h['runtimeSha256']!=RUNTIME:raise ValueError('Incomplete independent six-ID visual judgment')
    for name,pin in h['files'].items():
        path=APP/name
        if not path.resolve().is_relative_to(VISUAL.resolve())or sha(path.read_bytes())!=pin:raise ValueError('Frozen visual proof byte drift')
    a=next(x for x in h['archives']if x['kind']=='final-positive');index=load(VISUAL/a['index']);expected={x['path']:x for x in index['files']}
    with zipfile.ZipFile(VISUAL/a['archive'])as z:
        if len(z.namelist())!=len(expected)or set(z.namelist())!=set(expected):raise ValueError('Raw proof file set differs')
        for name in z.namelist():
            p=PurePosixPath(name)
            if p.is_absolute()or'..'in p.parts or sha(z.read(name))!=expected[name]['sha256']:raise ValueError('Raw proof file unsafe or changed')
        proof=json.loads(z.read('report.json'));plan=json.loads(z.read('prepared.json'));receipt=json.loads(z.read('terminal-receipt.json'))
        if receipt['observedExitCode']!=0 or receipt['error']is not None or proof['technicalStatus']!='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':raise ValueError('No actual complete successful replay')
        if proof['runtimeFingerprint']!=plan['runtimeFingerprint']or proof['runtimeFingerprint']['sha256']!=RUNTIME or sha(z.read('prepared.json'))!=proof['preparedSha256']:raise ValueError('Executed runtime/plan drift')
        cases=proof['cases'];keys={x['caseKey']for x in cases}
        if len(cases)!=264 or len(keys)!=264 or keys!=set(plan['expectedCaseKeys']):raise ValueError('Missing/duplicate actual cases')
        observed=[]
        for x in cases:
            raw=z.read(x['file']);c=json.loads(raw)
            if sha(raw)!=x['sha256']or not x['technicalOk']or not c['technicalOk']or c['scientificApproval']is not False or c['humanApproval']!='NOT_RUN'or c['publicationAction']!='NONE' or c['runtimeSha256']!=RUNTIME:raise ValueError('Unobserved or improperly approved case')
            for png in c['screenshots']:
                if sha(z.read(png['file']))!=png['sha256']:raise ValueError('Actual PNG drift')
            observed.append(c)
    if {x['id']for x in plan['records']}!=IDS or len(plan['records'])!=8:raise ValueError('Exact source and two effective DRAFT editions required')
    geometry=load(VISUAL/'actual-independent-ui-geometry.json');mesh=load(VISUAL/'actual-independent-whole-mesh-framing.json');images=load(VISUAL/'images-actually-read.json')
    if geometry['observedGridStates']!=200 or geometry['nativeParts']!=612 or geometry['fallbackStates']!=50 or mesh['points']!=148 or mesh['projections']!=6660 or mesh['finalHeightUncontained']!=0:raise ValueError('Incomplete actual geometry/frame proof')
    if not all(x['frameMarginPixels']>0 and x['minimumWorldY']>0 and all(y['gapPixels']>0 for y in x['labelSeparation'])for x in geometry['parts']):raise ValueError('Whole shaft/cone separation failed')
    if len(images['wholeApparatusContactSheetsActuallyOpenedAndRead'])!=16 or len(images['selectedFullResolutionPngsActuallyOpenedAndRead'])!=12:raise ValueError('Actual bounded image reading incomplete')
    return proof,plan,observed

def report(sources,packages=None,bindings=None,*,app=APP):
    app=Path(app);fp=legacy('runtime_fingerprint.py').runtime_fingerprint
    before=fp(app)
    if before['sha256']!=RUNTIME:raise ValueError('Actual927 profile required; historical1a/95769 not retagged')
    proof,plan,observed=evidence()
    if before!=proof['runtimeFingerprint']:raise ValueError('Actual runtime differs from executed UI footprint')
    raw=(app/'content/esperienze-C1.json').read_bytes()
    if sha(raw)!=SOURCE_SHA:raise ValueError('Original source file changed')
    original={r['id']:r for r in json.loads(raw)}
    if not IDS<=set(sources)or any(sources[k]!=original[k]for k in IDS):raise ValueError('Unreviewed original source identity')
    packages=packages or {x:load(BASE/'fixtures'/(x+'.json'))for x in DRAFTS.values()}
    bindings=bindings or {x:load(BASE/'fixtures'/(x+'-bindings.json'))for x in DRAFTS.values()}
    if set(packages)!=set(DRAFTS.values())or set(bindings)!=set(packages):raise ValueError('Exact two effective DRAFT packages required')
    results=[];raw_results={};deps={Path(__file__).name:sha(Path(__file__).read_bytes()),'pipeline.py':sha(Path(__file__).with_name('pipeline.py').read_bytes()),'review_contract.py':sha(Path(__file__).with_name('review_contract.py').read_bytes()),**LEGACY,'visualHandoff':VISUAL_HANDOFF}
    for name,selected in FAMILIES.items():
        m=legacy(name);specs={k:m.SPECS[k]for k in selected};effective={k:original[k]for k in selected};draft_rows={}
        for k in selected:
            if digest(original[k])!=m.READ_SOURCE_SHA256[k]:raise ValueError('Recovered source signature differs')
            if k in DRAFTS:
                batch=DRAFTS[k];row,binding,signature,assets,errors=reviewed_rows(packages[batch],bindings[batch],m.REVIEWED_REVISIONS,{k},BASE/'fixtures/assets')[0]
                if errors or binding['sourceRef']!=m.SOURCE_REF or binding['sourceSha256']!=digest(original[k])or row['version']!=2 or row['baseVersion']!=1:raise ValueError('Effective DRAFT identity/version/assets unreviewed')
                ui_row=next(r['record']for r in plan['records']if r['id']==k and r['variant']=='draft')
                if row!=ui_row:raise ValueError('DRAFT differs from the complete actual UI edition')
                effective[k]=row;draft_rows[k]=(binding,signature,assets)
        actual=bind(m.runtime_values,app,specs)(effective);comparisons=bind(m.compare_runtime,app,specs)(actual);math=m.independent_checks();raw_results[name]={'actual':actual,'selectedIndependentChecks':{k:math[k]for k in selected},'selectedComparisons':comparisons}
        for k in selected:
            checks=math[k];summary=comparisons[k];errors=[]
            if not checks or not all(x['ok']for x in checks):errors.append('Fresh recovered exact physics checks failed')
            if not summary['ok']:errors+=summary['errors']
            cases=[c for c in observed if c['id']==k];row={'id':k,'sourceSha256':digest(original[k]),'sourceVersion':original[k]['version'],'sourceRef':m.SOURCE_REF,'sourcePath':m.SOURCE_PATH,'sourceFileSha256':SOURCE_SHA,'ok':not errors,'errors':errors,'checks':checks,'runtimeComparison':summary,'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':m.MANUAL[k],'manualFeasibility':'PASS_AI_EXACT_OR_EXPLICIT_SHORT_ROOT_BOUND'if not errors else'FAIL','physicalAssumptions':m.ASSUMPTIONS[k],'pedagogicalReview':m.PEDAGOGY[k],'runtimeProfileSha256':RUNTIME,'reviewedRuntimeProfileSha256':RUNTIME,'scientificRefreshOnly':True,'recoveredOracleNotNewAuthorship':True,'consumerEvidence':{'visualHandoffSha256':VISUAL_HANDOFF,'actualCasesForId':len(cases),'actualFinalExit':0,'wholeShaftAndConeParts':612,'completeGridProjections':6660,'limits':'Six preset-view/width inputs; actual PNG reading and complete source-mesh CPU proof. GPU buffer readback and arbitrary orbit/zoom excluded. Collinear/end-on vectors are not separately discernible by claim.'},'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0,'registryOrLedgerAction':'NONE','wholeFamilyAcceptance':False}
            if k in draft_rows:
                binding,signature,assets=draft_rows[k];batch=DRAFTS[k];row.update(candidateSha256=digest(effective[k]),candidateVersion=2,baseVersion=1,reviewedSignature=signature,assetChecksums=assets,publicationAction='DRAFT')
                old_specs={k:tuple(list(m.SPECS[k][:5])+[95,m.SPECS[k][6]])};old_actual=bind(m.runtime_values,app,old_specs)({k:original[k]});old_compare=bind(m.compare_runtime,app,old_specs)(old_actual)[k]
                row['publishedEditionReview']={'id':k,'sourceSha256':digest(original[k]),'sourceVersion':original[k]['version'],'ok':False,'errors':[m.SOURCE_ISSUES[k]],'freshNumericRuntimeComparison':old_compare,'sourceManualityIssueRetained':True,'originalGeneratedTransfer':95,'runtimeProfileSha256':RUNTIME,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
                if not old_compare['ok']:errors.append('Original numeric runtime differs in fresh replay')
                row['ok']=not errors;row['errors']=errors
            results.append(row)
    dep=digest(deps)
    for row in results:row['reviewDependencySha256']=dep;row['reviewDependencyFilesSha256']=deps
    if fp(app)!=before:raise ValueError('Runtime drift during fresh pure-physics replay')
    return {'schemaVersion':'1.0.0','batch':'independent-six-vector-scientific-renewal-927','records':results,'acceptedEffectiveIndividualCount':sum(r['ok']for r in results),'originalManualityFailuresRetained':sorted(DRAFTS),'verifierSha256':sha(Path(__file__).read_bytes()),'runtimeSha256':RUNTIME,'dependencies':deps,'rawFreshEngineResults':raw_results,'historicalFamilyGatesAndReportsUnchanged':True,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
