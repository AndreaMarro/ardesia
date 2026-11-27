"""Fresh five original bench models joined to genuinely replayed cb9 UI.

Prior independent original-source reading is disclosed, not a blind new review.
The legacy epoch verifier is not called or re-pinned. Six authored vectors absent.
"""
from pathlib import Path
import json,math
from . import bench_fields_optics_activity_verifier as physics
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-bench-fields-optics-036-cb9-20261127'
RUNTIME='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
PHYSICS_SHA='47eaceb1497a3a1db95248f271028670ebc2716050dd427a09a580586870ed8b'
INDEX='bb4780817dc0913c77b0806a8b80f0504a3a9116fbab44322e15ea9a12f195f7'
IDS=set(physics.READ_SOURCE_SHA256)
PROFILES={(w,v)for w in(320,1280)for v in('orbit','side','top','diagram')}
def load(p):return json.loads(p.read_bytes())
def evidence(base=BASE):
    base=Path(base);index=load(base/'actual-proof-index.json')
    if sha((base/'actual-proof-index.json').read_bytes())!=INDEX:raise ValueError('Actually read current bench proof commitment changed')
    for name,pin in index['files'].items():
        p=base/name
        if p.is_symlink()or sha(p.read_bytes())!=pin:raise ValueError('Actually replayed bench proof bytes changed: '+name)
    report=load(base/'actual-ui-148/consumer.json');receipt=load(base/'actual-ui-148/terminal-receipt.json')
    if receipt['actualExitCode']!=0 or receipt['error']is not None or receipt['before']!=receipt['after']or receipt['before']['sha256']!=RUNTIME:raise ValueError('Actual bench terminal evidence must be complete0')
    if report['runtimeProfileSha256']!=RUNTIME or report['terminalStatus']!='PASS'or report['errors']or report.get('failure'):raise ValueError('Actual bench evidence failed or stale')
    if report['protocolSha256']!=sha((base/'browser-bench-fields-optics-cb9.mjs').read_bytes())or receipt['protocolSha256']!=report['protocolSha256']or receipt['supervisorSha256']!=sha((base/'run-bounded.py').read_bytes()):raise ValueError('Actual executed bench protocol differs')
    rows=report['cases'];core=[r for r in rows if'boundary'not in r];bounds=[r for r in rows if'boundary'in r]
    if len(rows)!=148 or len(core)!=40 or len(bounds)!=108 or{(r['id'],r['width'],r['view'])for r in core}!={(k,w,v)for k in IDS for w,v in PROFILES}:raise ValueError('Exact148 bench profile/boundary coverage required')
    boundaryCount={'LAB3D-06':2,'LAB3D-07':3,'LAB3D-08':2,'LAB3D-09':3,'LAB3D-10':2}
    expected={(k,w,v,v,b)for k in IDS for w,v in PROFILES for b in range(boundaryCount[k])}
    expected|={('LAB3D-10',w,v,'section',b)for w in(320,1280)for v in('orbit','side','top')for b in(0,1)}
    if {(r['id'],r['width'],r['entryView'],r['view'],r['boundary'])for r in bounds}!=expected or len(expected)!=108:raise ValueError('Bench boundary/profile omitted or duplicated')
    for row in core:
        if row['noWebGL']!=(row['view']=='diagram')or row['layout']['axe']or row['layout']['documentWidth']>row['width']+1:raise ValueError('Actual rendering/layout/accessibility failed')
        phases=[x for x in row['modes']if type(x['phase'])is int]
        if [x['phase']for x in phases]!=[1,2,3,4]or any(x['phaseLayout']['scroll']>x['phaseLayout']['width']+1 for x in phases):raise ValueError('Actual four-stage delivery/layout incomplete')
        wants=[float(v)for v,u in physics.ASSESSMENT_ORACLES[row['id']]]+([1.,0.]if row['id']=='LAB3D-10'else[])
        if row['answerCount']!=len(wants)or len(row['responses'])!=len(wants):raise ValueError('Actual graded task omitted')
        for actual,want in zip(row['responses'],wants):
            if actual['independentlyDerived']!=want or float(actual['input'].replace(',','.'))!=want or not actual['accepted'].startswith('Corretto')or not actual['rejected'].startswith('Rivedi il calcolo. '):raise ValueError('Actual independently solved wrong/correct grading differs')
    clocks=report['clockObservations'];expectedClock={(w,v,v)for w,v in PROFILES}|{(w,v,'section')for w in(320,1280)for v in('orbit','side','top')}
    if len(clocks)!=14 or {(r['width'],r['entryView'],r['view'])for r in clocks}!=expectedClock:raise ValueError('Actual clock profile omitted or duplicated')
    for row in clocks:
        if row['id']!='LAB3D-10'or row['setup']!={'f':1,'d':1.2,'x':0,'z':0,'phase':0}or len(row['observations'])!=4:raise ValueError('Actual equal-path clock setup differs')
        for observation,(t,want)in zip(row['observations'],[(0,4),(.25,0),(.5,-4),(1,4)]):
            actual=float(observation['actualDisplayed'].replace('−','-').split()[0].replace(',','.'))
            if observation['time']!=t or float(observation['actualInput'])!=t or observation['expectedExactMm']!=want or not math.isfinite(actual)or abs(actual-want)>1e-12:raise ValueError('Actual clock/time/exact extremum or root differs')
    visual=load(base/'independent-visual-reading.json')
    if set(visual['records'])!=IDS or{key for key,row in visual['records'].items()if not row['consumerVisualOk']}!={'LAB3D-07','LAB3D-10'}:raise ValueError('Actually read visual judgments changed')
    field=load(base/'field-cone-actual-geometry.json');wave=load(base/'wave-section-actual-geometry.json')
    if len(field['witnesses'])!=2 or any(not w['tipOutsideSphere']or not w['allActualBaseRimVerticesOccludedInSideCamera']for w in field['witnesses']):raise ValueError('Partial head-mask witness missing; do not claim tip containment')
    if [r['time']for r in wave['times']]!=[0,.5]or any(not r['allProjectedTrianglesDegenerate']or r['maxY']-r['minY']<.6 for r in wave['times']):raise ValueError('Nonflat edge-on section witness missing')
    return report

def report(sources,package=None,bindings=None,*,app=APP):
    if package is not None or bindings is not None:raise ValueError('Original benches have no revision package')
    if set(sources)!=IDS:raise ValueError('Exactly five independently reviewed original bench sources required')
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actualcb9 runtime required; historical UI cannot be retagged')
    if sha(Path(physics.__file__).read_bytes())!=PHYSICS_SHA:raise ValueError('Independently read source/physics dependency changed')
    for key,row in sources.items():
        if row.get('kind')!='bench'or digest(row)!=physics.READ_SOURCE_SHA256[key]:raise ValueError('Original bench source differs from independently read version')
    observed=evidence();models=physics.independent_checks();actual=physics.runtime_values(app);comparisons=physics.compare_runtime(actual)
    if set(comparisons)!=IDS or sum(c['caseCount']for c in comparisons.values())!=1045:raise ValueError('Complete independently planned installed-model grid required')
    deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in[Path(__file__),Path(physics.__file__),Path(__file__).with_name('pipeline.py'),Path(__file__).with_name('runtime_fingerprint.py'),BASE/'actual-proof-index.json']};dependency=digest(deps);records=[]
    for key in sorted(IDS):
        row=sources[key];checks=models[key];errors=[]
        if row.get('kind')!='bench'or digest(row)!=physics.READ_SOURCE_SHA256[key]:raise ValueError('Original bench source differs from independently read version')
        if not checks or not all(c['ok']for c in checks)or not comparisons[key]['ok']:errors.append('Independent exact/unit/installed-engine comparison failed')
        expected=physics.ASSESSMENT_ORACLES[key]
        if len(row['assessment'])!=len(expected)or any(physics.sp.Rational(str(r['value']))!=v or r['unit']!=u for r,(v,u)in zip(row['assessment'],expected)):errors.append('Actual source assessment differs from independent solution')
        if row.get('prediction',{}).get('correct')!=physics.EXPECTED_PREDICTIONS[key]:errors.append('Source prediction differs from physical comparison')
        if key=='LAB3D-10':
            extra=actual.get('_addedWaveAssessments',[])
            if len(extra)!=2 or any(r['value']!=v or r['unit']!='mm'for r,v in zip(extra,[1,0])):errors.append('Consumer-appended actual task differs from independent solution')
        view=load(BASE/'independent-visual-reading.json')['records'][key]
        if not view['consumerVisualOk']:errors.append('Actual current consumer visibility failure: '+view['failure'])
        cases=[r for r in observed['cases']if r['id']==key]
        records.append({'id':key,'sourceRef':physics.SOURCE_REF,'sourcePath':physics.SOURCE_PATH,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'ok':not errors,'errors':errors,'checks':checks,'runtimeComparison':comparisons[key],
            'manualArithmetic':physics.MANUAL[key],'physicalAssumptions':physics.ASSUMPTIONS[key],'pedagogicalReview':physics.PEDAGOGY[key],
            'sourceMathChecksOk':all(c['ok']for c in checks),'consumerObservedUiFailure':not view['consumerVisualOk'],'sourceScientificFailureInferredFromUI':False,'consumerUI':'PASS_ACTUAL_BOUNDED_8_PROFILES'if view['consumerVisualOk']else'FAIL_ACTUAL_BOUNDED_VISIBILITY','consumerEvidence':{'caseCount':len(cases),'actualProfiles':sorted([list(x)for x in PROFILES]),'wrongCorrectGrading':True,'nonzeroWaveClockObservations':56 if key=='LAB3D-10' else 0,'scope':'Actual four-stage UI, existing scientific analytic models across1045 installed-Node cases, eight native/fallback profiles, observed selected boundary frames and independent image reading. Not all arbitrary control combinations/cameras or GPU raster proof.'},
            'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dependency,'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':False,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0,'registryOrLedgerAction':'NONE'})
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime changed during fresh review')
    return{'schemaVersion':'1.0.0','batch':'bench-fields-optics-036-renewal-cb9','records':records,'acceptedIndividualCount':sum(r['ok']for r in records),'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'runtimeSha256':RUNTIME,'sourceReadingScope':'Previously independently read original source/models reused with fresh exact/unit/Node recomputation; no new blind reading or inherited UI acceptance','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
