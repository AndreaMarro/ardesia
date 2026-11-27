"""Fresh original bench01..05 physics joined only to actual whole abb2 evidence."""
from pathlib import Path
import json,types
from . import bench_mechanics_fluids_activity_verifier as physics
from .pipeline import canonical,digest,sha
from .runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/renewal-bench-mechanics-fluids-035-abb2-20261127'
RUNTIME='abb2bf2ac567438953766cf3550644b3d6ea501d75d610fb6291b2cffc5a428b'
INDEX='d63c1db12ac593c9648a923129ce72c30af8ee8a706138c1863d2a37671cf139'
PHYSICS_SHA='bea3c473770ffe287a5e9b5b50fccfb5b25b73b2dc217353456e5461b860d193'
IDS=set(physics.READ_SOURCE_SHA256)
PROFILES={(w,v)for w in(320,1280)for v in('orbit','side','top','diagram')}
ANSWERS={'LAB3D-01':[8,3],'LAB3D-02':[1,3.6,1,4],'LAB3D-03':[5,2],'LAB3D-04':[2,10,12,6],'LAB3D-05':[180,150,80,45]}
def load(p):return json.loads(p.read_bytes())
def bind(fn,**changes):
    fn=getattr(fn,'__wrapped__',fn)
    return types.FunctionType(fn.__code__,{**fn.__globals__,**changes},fn.__name__,fn.__defaults__,fn.__closure__)
def evidence(base=BASE):
    base=Path(base);index=load(base/'actual-proof-index.json')
    if sha((base/'actual-proof-index.json').read_bytes())!=INDEX:raise ValueError('Actually read abb2 bench commitment changed')
    for name,pin in index['files'].items():
        p=base/name
        if p.is_symlink()or sha(p.read_bytes())!=pin:raise ValueError('Actually observed bench proof bytes changed: '+name)
    report=load(base/'actual-ui-120/consumer.json');receipt=load(base/'actual-ui-120/terminal-receipt.json')
    if receipt['actualExitCode']!=0 or receipt['error']is not None or receipt['before']!=receipt['after']or receipt['before']['sha256']!=RUNTIME:raise ValueError('Actual fresh terminal/epoch failed')
    if report['runtimeProfileSha256']!=RUNTIME or not report.get('matrixComplete')or report['terminalStatus']!='PASS'or report['errors']or report.get('failure')or report.get('consumerUiFailures'):raise ValueError('Whole actual matrix incomplete or failed')
    if receipt['protocolSha256']!=sha((base/'browser-bench-mechanics-fluids-abb2.mjs').read_bytes())or report['protocolSha256']!=receipt['protocolSha256']or receipt['supervisorSha256']!=sha((base/'run-bounded.py').read_bytes()):raise ValueError('Actually executed protocol changed')
    rows=report['cases'];core=[r for r in rows if'boundary'not in r];bounds=[r for r in rows if'boundary'in r]
    if len(rows)!=120 or len(core)!=40 or len(bounds)!=80 or{(r['id'],r['width'],r['view'])for r in core}!={(k,w,v)for k in IDS for w,v in PROFILES}or{(r['id'],r['width'],r['view'],r['boundary'])for r in bounds}!={(k,w,v,b)for k in IDS for w,v in PROFILES for b in(0,1)}:raise ValueError('Exact complete bench profile/boundary matrix required')
    if any(not row['technicalOk']or row['layout']['axe']for row in core):raise ValueError('Actual accessibility/layout failed')
    for r in core:
        if r['noWebGL']!=(r['view']=='diagram')or r['layout']['documentWidth']>r['width']+1:raise ValueError('Actual mode/width differs')
        phase=[x for x in r['modes']if type(x['phase'])is int]
        if [x['phase']for x in phase]!=[1,2,3,4]or any(x['phaseLayout']['scroll']>x['phaseLayout']['width']+1 for x in phase):raise ValueError('Four-stage delivery/layout omitted')
        if len(r['responses'])!=len(ANSWERS[r['id']])or r['answerCount']!=len(r['responses']):raise ValueError('Actual assigned task omitted')
        for got,want in zip(r['responses'],ANSWERS[r['id']]):
            if got['independentlyDerived']!=want or float(got['input'].replace(',','.'))!=want or not got['accepted'].startswith('Corretto. ')or not got['rejected'].startswith('Rivedi il calcolo. '):raise ValueError('Wrong/correct actual independent input differs')
    clocks=report['clockObservations']
    if len(clocks)!=24 or{(r['id'],r['width'],r['view'])for r in clocks}!={(k,w,v)for k in('LAB3D-02','LAB3D-04','LAB3D-05')for w,v in PROFILES}or sum(len(r['observations'])for r in clocks)!=64:raise ValueError('Actual clock coverage incomplete')
    for r in clocks:
        times={'LAB3D-02':[0,.5,1],'LAB3D-04':[0,1],'LAB3D-05':[0,3,6]}[r['id']]
        if [x['time']for x in r['observations']]!=times or any(float(x['actualInput'])!=x['time']or any(c['actualDisplay']!=c['expectedDisplay']for c in x['comparisons'])for x in r['observations']):raise ValueError('Observed source clock/input/readout differs')
    visual=load(base/'independent-visual-reading.json')
    if set(visual['records'])!=IDS or{key for key,row in visual['records'].items()if not row['consumerVisualOk']}!={'LAB3D-02'}:raise ValueError('Independent current partial-shaft negative cannot be silently closed')
    geometry=load(base/'flight-gravity-shaft-actual-geometry.json')
    if geometry['parameters']!={'speed':4,'elevation':50,'azimuth':15}or geometry['time']!=0 or geometry['sceneLevel']!=2 or not geometry['gravity']['tipOutsideBase']or geometry['gravity']['tipOccluded']or geometry['occludedShaftSurfaceSamples']!=1600 or geometry['sampleCount']!=3232:raise ValueError('Actual partial-shaft witness differs; tip is not the failure')
    return report

def report(sources,package=None,bindings=None,*,app=APP):
    if set(sources)!=IDS:raise ValueError('Exactly five original source IDs required')
    if package is not None or bindings is not None:raise ValueError('Original benches require no candidate package')
    profile=runtime_fingerprint(Path(app))
    if profile['sha256']!=RUNTIME:raise ValueError('Actualabb2 runtime required; no historical UI retag')
    if sha(Path(physics.__file__).read_bytes())!=PHYSICS_SHA:raise ValueError('Independently read model dependency changed')
    for key,row in sources.items():
        if row.get('kind')!='bench'or digest(row)!=physics.READ_SOURCE_SHA256[key]:raise ValueError('Original independently read source changed')
    ui=evidence();models=physics.exact_checks();raw=bind(physics.runtime_values,APP=Path(app))();checks=bind(physics.runtime_checks,runtime_values=lambda:raw)();visual=load(BASE/'independent-visual-reading.json')
    if set(checks)!=IDS or sum(len(r)for r in checks.values())!=378:raise ValueError('Fresh installed-model grid incomplete')
    deps={str(p.relative_to(APP)):sha(p.read_bytes())for p in[Path(__file__),Path(physics.__file__),Path(__file__).with_name('pipeline.py'),Path(__file__).with_name('runtime_fingerprint.py'),BASE/'actual-proof-index.json']};dep=digest(deps);records=[]
    for key in sorted(IDS):
        row=sources[key];errors=[];physical=models[key];model_ok=bool(physical)and all(c['ok']for c in physical)and bool(checks[key])and all(c['ok']for c in checks[key]);read=visual['records'][key]
        if not model_ok:errors.append('Fresh independent exact/unit/installed model check failed')
        if len(row['assessment'])!=2 or any(a['unit']!=physics.ASSESSMENT_UNITS[key][i]or physics.sp.Rational(str(a['value']))!=physics.sp.sympify(physical[i]['independentExact'])for i,a in enumerate(row['assessment']))or row['prediction']['correct']!=physics.EXPECTED_PREDICTIONS[key]:errors.append('Assigned source task/units differ from independent solution')
        if not read['consumerVisualOk']:errors.append(read['failure'])
        records.append({'id':key,'sourceRef':physics.SOURCE_REF,'sourcePath':physics.SOURCE_PATH,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'ok':not errors,'errors':errors,'checks':physical,'consumerChecks':checks[key],'sourceMathChecksOk':model_ok,'calculationScope':'EXACT_MANUAL_CALCULATION','manualFeasibility':'PASS_AI_EXACT','dimension':{c['claim']:c.get('dimension',{})for c in physical},'manualArithmetic':physics.MANUAL[key],'physicalAssumptions':physics.ASSUMPTIONS[key],'pedagogicalReview':'Original mandatory source/pilot tasks independently solved. Arbitrary trig/log readouts are observations, not additional mandatory numeric calculations. Current UI failures remain separate.','consumerUI':'PASS_ACTUAL_BOUNDED_8_PROFILES'if read['consumerVisualOk']else'FAIL_ACTUAL_BOUNDED_CONSUMER','consumerObservedUiFailure':not read['consumerVisualOk'],'sourceScientificFailureInferredFromUI':False,'consumerEvidence':{'caseCount':sum(r['id']==key for r in ui['cases']),'clockObservationCount':sum(len(r['observations'])for r in ui['clockObservations']if r['id']==key),'matrixTerminalActualExitCode':0,'matrixComplete':True,'scope':'Eight profiles and declared boundary/clock cases only. Current terminal0 and positive independent image reading both required; previous completed-negative matrices remain immutable. Not exhaustive control Cartesian products or GPUinstrumentation.'},'runtimeProfileSha256':RUNTIME,'reviewDependencySha256':dep,'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':False,'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0,'registryOrLedgerAction':'NONE'})
    if runtime_fingerprint(Path(app))!=profile:raise ValueError('Runtime drift during fresh review')
    return{'schemaVersion':'1.0.0','batch':'bench-mechanics-fluids-035-renewal-abb2','records':records,'acceptedIndividualCount':sum(r['ok']for r in records),'dependencies':deps,'verifierSha256':sha(Path(__file__).read_bytes()),'runtimeSha256':RUNTIME,'sourceReadingScope':'Prior original-source readings disclosed; full five source records reread from pinned Git and assigned tasks solved, existing pure models recomputed fresh. No inherited UI judgments.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
