"""Distinct C2 source/math/current-code partial. UI remains pending, never registrable."""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math,zipfile,importlib.util,importlib.machinery,types,sys
from .pipeline import digest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-41-cb9-independent-a-20261127'
RUNTIME='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
MODELS={}
def load(name):
    if name in MODELS:return MODELS[name]
    folder=BASE/'recovered';pins={x['snapshot']:x['sha256']for x in json.loads((folder/'git-inputs.json').read_bytes())['inputs']}
    p=folder/name
    if hashlib.sha256(p.read_bytes()).hexdigest()!=pins[name]:raise ValueError('Frozen model source changed')
    package=__package__+'._c2_41_frozen_a'
    if package not in sys.modules:
        parent=types.ModuleType(package);parent.__path__=[str(folder)];sys.modules[package]=parent
        from . import pipeline,review_contract
        sys.modules[package+'.pipeline']=pipeline
        sys.modules[package+'.review_contract']=review_contract
    full=package+'.'+name.removesuffix('.py');loader=importlib.machinery.SourceFileLoader(full,str(p));spec=importlib.util.spec_from_loader(full,loader);m=importlib.util.module_from_spec(spec);sys.modules[full]=m
    if name=='experiments_pressure_hydrostatics_047_verifier.py':load('runtime_fingerprint.py')
    if name in ['experiments_flow_continuity_code_verifier.py','experiments_C2_flows_interfaces_code_verifier.py']:
        boundary=load('experiments_C2_code_partial_review.py');boundary.APP=folder
    loader.exec_module(m);MODELS[name]=m;return m

def frozen_sources():
    raw=(BASE/'inputs/original-esperienze-C2.json').read_bytes()
    if hashlib.sha256(raw).hexdigest()!='33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1':raise ValueError('Original immutable source changed')
    return {r['id']:r for r in json.loads(raw)}
def collected():
    receipt=json.loads((BASE/'actual-current-node-receipt.json').read_bytes())
    if receipt['actualNodeExit']!=0 or receipt['runtimeBefore']!=receipt['runtimeAfter']or receipt['runtimeBefore']['sha256']!=RUNTIME:raise ValueError('Actual current collection required')
    zpath=BASE/'actual-current-node-verbatim.zip'
    if hashlib.sha256(zpath.read_bytes()).hexdigest()!=receipt['zipSha256']:raise ValueError('Collection ZIP drift')
    with zipfile.ZipFile(zpath)as z:
        if z.namelist()!=['actual-current-node.json']:raise ValueError('Unexpected archive members')
        raw=z.read('actual-current-node.json')
    if hashlib.sha256(raw).hexdigest()!=receipt['rawSha256']:raise ValueError('Actual raw collection drift')
    p=json.loads(raw)
    if p['UI']!='NOT_RUN'or p['scientificApproval']is not False or len(p['records'])!=42:raise ValueError('No UI/approval inference')
    return p

def exact_number(x):
    import sympy as sp
    if type(x)not in(int,Fraction)and not isinstance(x,sp.Expr):raise ValueError('Exact finite real required, before casts')
    v=sp.sympify(x)
    if v.is_number is not True or v.is_real is not True or v.is_finite is not True:raise ValueError('Exact finite real required')
    return v

def model_for(key):
    for name in ['experiments_pressure_hydrostatics_047_verifier.py','experiments_hydraulics_buoyancy_code_verifier.py','experiments_flow_continuity_code_verifier.py','experiments_C2_flows_interfaces_code_verifier.py']:
        m=load(name)
        if key in m.SPECS:return m
    raise ValueError('Unknown C2 activity')

def exact_value(key,x):
    x=exact_number(x);m=model_for(key);spec=m.SPECS[key];lo,hi=map(lambda v:exact_number(Fraction(str(v))),spec[:2])
    if not lo<=x<=hi:raise ValueError('Outside actual control domain')
    if key in ['SIM-C2-L001-01','SIM-C2-L008-02']and x.is_integer is not True:raise ValueError('Discrete physical selector')
    return m.exact_value(key,x)

def compare(proof):
    sources=frozen_sources();editions=proof.get('records',[])
    expected={f"{k}@{r['version']}:original"for k,r in sources.items()}|{'SIM-C2-L002-01@2:draft'}
    if len(editions)!=42 or {r.get('editionKey')for r in editions}!=expected:raise ValueError('Missing/duplicate current edition identities')
    for r in editions:
        want=2 if r['variant']=='draft'else sources[r['id']]['version']
        if type(r.get('sourceVersion'))is not int or r['sourceVersion']!=want:raise ValueError('Exact original/draft version required')
    rows={r['id']:r for r in editions if r['variant']=='original'}
    if len(rows)!=41 or set(rows)!=set(sources):raise ValueError('Missing/duplicate exact original activity IDs')
    out={};pressure=load('experiments_pressure_hydrostatics_047_verifier.py')
    current={k:{**rows[k],'cases':[{**c,'output':c['solve']}for c in rows[k]['cases']],'formatRoundtrip':rows[k]['assessmentFormat']}for k in pressure.SPECS}
    pressure_cmp=pressure.compare_runtime(current);pressure_math=pressure.independent_checks()
    for k in pressure.SPECS:out[k]={'checks':pressure_math[k],'codeComparison':pressure_cmp[k]}
    hydro=load('experiments_hydraulics_buoyancy_code_verifier.py');hydro_cmp=hydro.compare_installed({'records':[rows[k]for k in hydro.SPECS]});hydro_math=hydro.exact_checks()
    for k in hydro.SPECS:out[k]={'checks':hydro_math[k],'codeComparison':hydro_cmp[k]}
    boundary=load('experiments_C2_code_partial_review.py');flow=load('experiments_flow_continuity_code_verifier.py');fc=boundary.compare(flow,{'records':[rows[k]for k in flow.SPECS]},sources);fm=flow.exact_checks()
    for k in flow.SPECS:out[k]={'checks':fm[k],'codeComparison':fc[k]}
    other=load('experiments_C2_flows_interfaces_code_verifier.py')
    for group in ['bernoulli','viscosity-poiseuille','networks','capillarity']:
        m=other.for_group(group);comp=boundary.compare(m,{'records':[rows[k]for k in m.SPECS]},sources);checks=m.exact_checks()
        for k in m.SPECS:out[k]={'checks':checks[k],'codeComparison':comp[k]}
    return out

def draft_review(proof):
    from .review_contract import reviewed_rows
    package=json.loads((BASE/'inputs/experiment-stevino-revision-047.json').read_bytes());bindings=json.loads((BASE/'inputs/experiment-stevino-revision-047-bindings.json').read_bytes());r=package['records'][0];b=bindings[0];source=frozen_sources()[r['id']]
    token=digest({'record':r,'assets':b['assetChecksums'],'source':{'id':b['sourceId'],'ref':b['sourceRef'],'sha256':b['sourceSha256']}})
    row,link,signature,assets,errors=reviewed_rows(package,bindings,{r['id']:token},{r['id']},BASE/'inputs')[0]
    if errors or b['sourceSha256']!=digest(source)or r['version']!=2 or r['baseVersion']!=1:raise ValueError('Separate Stevino identity/provenance')
    if r['assessmentSelection']!={'schemaVersion':'1.0.0','points':[2,1.5]}or '981/100'not in r['formula']or '981/100'not in r['transferPrompt']:raise ValueError('Reviewed common gravity/domain altered')
    actual=next(x for x in proof['records']if x['variant']=='draft');m=load('experiment_stevino_revision_047_math_verifier.py');checks=m.independent_checks();tasks=[]
    for task,x in zip(actual['assessment'],[2,Fraction(3,2)],strict=True):
        want=Fraction(981,100)*x;tasks.append({'input':str(x),'requiredExact':str(want),'actual':task['value'],'unit':task['unit'],'ok':load('experiments_C2_code_partial_review.py').near(task['value'],want)and task['unit']=='kPa','actualPrompt':task['prompt']})
    return {'id':r['id'],'candidateVersion':2,'sourceVersion':1,'sourceSha256':digest(source),'candidateSha256':digest(r),'reviewedSignature':signature,'checks':checks,'tasks':tasks,'textMathOk':all(c['ok']for c in checks)and all(t['ok']for t in tasks),'originalPublishedIssueRetained':True,'UI':'PENDING_ACTUAL_REMOTE_DRAFT_CASES','ok':False,'overallComplete':False,'activityCredit':0}

def current_geometry(proof):
    near=load('experiments_C2_code_partial_review.py').near
    ids={'SIM-C2-L001-02','SIM-C2-L001-05','SIM-C2-L002-01','SIM-C2-L002-02','SIM-C2-L003-01','SIM-C2-L005-05','SIM-C2-L006-02','SIM-C2-L007-03','SIM-C2-L007-04','SIM-C2-L008-02'}
    out={}
    for row in proof['records']:
        key=row['id']
        if key not in ids:continue
        errors=[];checks=[]
        for case in row['cases']:
            elements=case['elements'];arrows=[e for e in elements if e.get('kind')=='arrow'];labels=[e['text']for e in elements if e.get('kind')=='label'];x=case['x']
            if key in ['SIM-C2-L001-02','SIM-C2-L007-03','SIM-C2-L007-04']:
                green=[e for e in arrows if e.get('c')==0x147979];plates=[e for e in elements if e.get('kind')=='box'and e.get('alpha',1)==1]
                # Full native cone maximum radial extent:0.028*2.9. All
                # Couette arrows share z1.1, strictly in front of plate z<=.9.
                for e in green:
                    if not near(e['a'][2],1.1)or not near(e['b'][2],1.1)or any(e['a'][2]-.028*2.9<=p['p'][2]+p['size'][2]/2 for p in plates):errors.append('Full Couette body does not clear opaque plates')
                if not green and not(key=='SIM-C2-L001-02'and x==0):errors.append('Positive Couette velocity missing')
                if 'piano davanti alle lastre'not in row['legend']:errors.append('Detached layer plane not explained')
            if key in ['SIM-C2-L001-05','SIM-C2-L002-01','SIM-C2-L002-02']:
                if any(v in labels for v in ['Sonda','Superficie']):errors.append('Occluding probe/surface sprite remains')
                probes=[e for e in elements if e.get('kind')=='ball'and e.get('c')==0x7350b0]
                if len(probes)!=2 or not near(probes[0]['p'][1],probes[1]['p'][1]):errors.append('Equal-height pair missing')
                if not all(t in row['legend']for t in ['due punti viola','stessa quota','livello superiore']):errors.append('Probe/surface HTML association missing')
            if key=='SIM-C2-L003-01':
                if any(v in labels for v in ['A₁','4 A₁']):errors.append('Piston tip sprites remain')
                if not all(t in row['legend']for t in ['sinistra','A₁','destra','4 A₁']):errors.append('Piston area HTML association missing')
            if key=='SIM-C2-L005-05':
                inlet=[e for e in arrows if e.get('c')==0xd49332 and near(e['a'][0],-2.5)and near(e['a'][1],1.43)and near(e['a'][2],0)]
                branches=[e for e in arrows if near(abs(e['a'][2]),.9)]
                if len(inlet)!=1 or not near(inlet[0]['b'][0]-inlet[0]['a'][0],1.1)or not near(sum(e['b'][0]-e['a'][0]for e in branches),1.1):errors.append('Inlet and branch sum do not share flow scale')
                for color,want in [(0x7350b0,x/12),(0x147979,(12-x)/12)]:
                    selected=[e for e in branches if e.get('c')==color];length=sum(e['b'][0]-e['a'][0]for e in selected)
                    if not near(length,1.1*want):errors.append('Branch flow differs from assigned control')
                if any(v in labels for v in ['Nodo A','Nodo B']):errors.append('Junction tip sprites remain')
                if not all(t in row['legend']for t in ['freccia ocra','alla stessa scala','somma delle due uscite']):errors.append('Network HTML/scale association missing')
            if key=='SIM-C2-L006-02':
                glass=[e for e in elements if e.get('kind')=='rod'and near(e.get('r'),.09)and near(e['a'][0],1.4)];fill=[e for e in elements if e.get('kind')=='rod'and near(e.get('r'),.062)and near(e['a'][0],1.4)]
                if len(glass)!=1 or len(fill)!=1 or fill[0]['b'][1]>glass[0]['b'][1]:errors.append('Pitot liquid exceeds containing tube')
                if not fill or not near(fill[0]['b'][1],2.19+.3*(x/4)**2):errors.append('Pitot head is not a common unclamped quadratic scale')
            checks.append({'input':x,'errorsAtOrBeforeThisInput':len(errors)})
        if key=='SIM-C2-L008-02':errors.extend(load('experiments_C2_flows_interfaces_code_verifier.py').cross_case_geometry_errors(key,row))
        out[row['editionKey']]={'id':key,'checks':checks,'ok':not errors,'errors':sorted(set(errors)),'scope':'CURRENT_SOURCE_GEOMETRY_NOT_ACTUAL_UI'}
    return out

def report(proof=None):
    proof=proof or collected()
    if proof.get('UI')!='NOT_RUN'or proof.get('scientificApproval')is not False:raise ValueError('Code-only input cannot claim UI/approval')
    comparisons=compare(proof);geometries=current_geometry(proof);sources=frozen_sources();records=[]
    for key,entry in comparisons.items():
        m=model_for(key);primary={r['id']:r for r in json.loads((BASE/'recovered/editorial/reviews/experiments-C2-hydraulics-continuity-prompt-primary-20261125.json').read_bytes())['records']};manual=m.MANUAL[key] if hasattr(m,'MANUAL') else primary[key]['independentDerivation']+'. '+primary[key]['manualProcedure'];assumptions=m.ASSUMPTIONS[key] if hasattr(m,'ASSUMPTIONS') else primary[key]['assumptionsAndDomain'];code=entry['codeComparison'];math_ok=all(c['ok']for c in entry['checks']);errors=code.get('errors',[]);geometry=code.get('geometryErrors',[])
        code_ok=code.get('ok',code.get('installedScalarTasksAndClocksOk',not errors));geometry_ok=code.get('geometryCodeOk',not geometry)
        current=geometries.get(f"{key}@{sources[key]['version']}:original")
        if key=='SIM-C2-L005-05'and geometry and all('SOURCE_ASSIGNED_COMPARISON_FAIL'in e for e in geometry):geometry_ok=bool(current and current['ok'])
        elif current:geometry_ok=geometry_ok and current['ok']
        if key=='SIM-C2-L002-01':science=False;issue='Original transfer explicitly g10, required15kPa at1.5m; engine/task9.81 gives14.715. Separate DRAFT2 declares9.81.'
        else:science=math_ok and code_ok;issue=None
        records.append({'id':key,'version':sources[key]['version'],'sourceSha256':digest(sources[key]),'exactChecks':entry['checks'],'sourceMathOk':science,'sourceIssue':issue,'installedCode':code,'codeGeometryOk':geometry_ok,'currentSpecificGeometry':current,'recoveredGeometrySelectorNote':'Historical inlet selector b.x<=-1.62 misses the newly present orange arrow ending inside the node at-1.4; retained above, separately checked by color, origin, direction and common flow gain.'if key=='SIM-C2-L005-05'else None,'manualArithmeticRecovered':manual,'physicalAssumptionsRecovered':assumptions,'freshSourceReading':True,'currentRuntimeSha256':RUNTIME,'UI':'PENDING_ACTUAL_REMOTE_REPORT','visualReview':'PENDING','ok':False,'overallComplete':False,'activityCredit':0,'humanApproval':'NOT_RUN'})
    return {'schemaVersion':'1.0.0','phase':'NEW_DISTINCT_CURRENT_SOURCE_MATH_CODE_PARTIAL_NOT_REGISTRABLE','runtimeSha256':RUNTIME,'records':records,'separateStevinoDraft':draft_review(proof),'UI':'PENDING_ACTUAL_REMOTE_REPORT','acceptedActivityCount':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','originalHistoricalReportsUnchanged':True}
