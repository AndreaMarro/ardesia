"""Distinct A six-C3 CPU review. UI and activity gates are never implied."""
from pathlib import Path
import json,hashlib,math
from decimal import Decimal
import sympy as s
from . import c3_six_heat_phase_primary_models_a as primary
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127'
PRIMARY=APP/'editorial/reviews/c3-six-heat-phase-source-primary-a-20261127'
SOURCE='b9994b9116e87478905191d85cca8037d17ae4bd'
CANDIDATE='6ae3c2a177bcde74b2bebf8f22c1fa50850b0413'
RUNTIME='7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6'
REVIEWED_PINS={'SIM-C3-L03-01': '639aec5e95e02bdb86e78d7864382161b8c358704a7bc6892e768e39c19e7b24', 'SIM-C3-L03-03': 'b9f4aa6dcd873f95bc1b7484aab03e95dffee9777818e4b5f2ff25cd6c8c49ca', 'SIM-C3-L03-04': '41eaa8dab7c6cfb407f858e091d882b66805a5e719fb88590383b5993058eb06', 'SIM-C3-L04-01': 'a2667583c98036f2adad2e25b78659628bad0a0b269b191b1112e080c50f6ba0', 'SIM-C3-L04-02': 'a7268eadc74f1819f3bd2798d03b1209207492502f9491fabb30c0f8f414c466', 'SIM-C3-L04-03': 'be490f8a7639097f1c52cf5645274c05d33cb5e6d2cef879ccec762959f836d6'}
PRIMARY_MODULE_SHA256='faf3583af19d0c8e9597de1e21280cf1152d96ddae1d2e3a58934c14c2450a76'
TASK_INPUTS=((8,6),(10,11),(200,175),(s.Rational(167,10),s.Rational(1837,100)),(3,0),(19,28))
ENTRIES=((400,300),(s.Rational(4157,50),s.Rational(45727,500)),(50,48),(50,55),(s.Rational(339,50),0),(50,s.Rational(7647,100)))
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
def validate_candidate(package,bindings,originals):
    if package.get('schema')!='astra/1' or package.get('assets')!=[]:raise ValueError('Exact existing Astra package and no new assets required')
    rows=package.get('records',[])
    if tuple(r.get('id')for r in rows)!=primary.IDS or len(bindings)!=6:raise ValueError('Six source IDs in order required')
    src={r['id']:r for r in originals}
    stable=('id','kind','course','skill','order','section','title','topic','anchor','apparatus','control','measure','references','formula','substitution','transferPrompt')
    for row,link in zip(rows,bindings,strict=True):
        original=src[row['id']]
        if sha(canonical(row))!=REVIEWED_PINS[row['id']]:raise ValueError('New candidate bytes require a new distinct reading')
        if type(row.get('version'))is not int or type(row.get('baseVersion'))is not int or row['baseVersion']!=original['version'] or row['version']!=original['version']+1:raise ValueError('Consecutive individual source edition required')
        if any(row.get(k)!=original.get(k)for k in stable):raise ValueError('Stable original physical/source fields changed')
        if link.get('id')!=row['id'] or link.get('sourceId')!=row['id'] or link.get('sourceRef')!='5d1dc8dc7b601aef959d10d564c75462be74708d' or link.get('sourceSha256')!=sha(canonical(original)) or link.get('candidateSha256')!=sha(canonical(row)) or link.get('assetChecksums')!={}:raise ValueError('Exact canonical source/candidate binding required')
    return True

def finite_observation(x):
    if type(x)not in(int,float) or not math.isfinite(x):raise ValueError('Finite JSON number required')
    return x

def roundoff_only(actual,want):
    actual=finite_observation(actual)
    w=float(want)
    if abs(actual-w)>16*math.ulp(max(1.0,abs(w))):raise ValueError('Independent exact law disagrees beyond binary roundoff')

def mathematical_guard(node):
    if node.get('sourceCommit')!=SOURCE or node.get('candidateCommit')!=CANDIDATE or node.get('runtimeExpected')!=RUNTIME or node.get('browser')!='NOT_RUN':raise ValueError('Actual CPU-only source identity required')
    if node.get('physicalApproval')is not False or node.get('visualApproval')is not False or type(node.get('activityCredit'))is not int or node['activityCredit']!=0 or node.get('humanApproval')!='NOT_RUN':raise ValueError('CPU observations cannot grant approval')
    rows=node.get('records',[])
    if tuple(r.get('id')for r in rows)!=primary.IDS:raise ValueError('Complete six actual rows required')
    results=[]
    for index,row in enumerate(rows):
        identifier=row['id']
        if row.get('originalVersion')!=1 or row.get('baseVersion')!=1 or row.get('draftVersion')!=2 or row.get('sourceDraftSceneEquality')is not True:raise ValueError('Actual individual editions and source parity required')
        if len(row.get('tasks',[]))!=2:raise ValueError('Two actual tasks required')
        tasks=[]
        for j,task in enumerate(row['tasks']):
            x=TASK_INPUTS[index][j];want=primary.law(identifier,x)
            roundoff_only(task['input'],x);roundoff_only(task['installed']['value'],want)
            entry=primary.exact(Decimal(task['entryLexeme']))
            if s.simplify(entry-ENTRIES[index][j])!=0 or task['entryAcceptedByExistingNumericRule']is not True:raise ValueError('Reviewed exact manual entry changed')
            error=s.Abs(entry-want)
            tolerance=max(0.000001,abs(finite_observation(task['installed']['value']))*0.005)
            if task['installedTolerance']!=tolerance or float(error)>tolerance:raise ValueError('Existing numerical rule or exact entry acceptance changed')
            if task['installed']['unit']!=('J','J','°C','g','kJ','g')[index]:raise ValueError('Actual task unit changed')
            tasks.append(dict(inputExact=str(x),answerExact=str(want),manualEntryExact=str(entry),entryErrorExact=str(error)))
        exact_grid=list(next(xs for key,xs in primary.grids()if key==identifier))
        if len(row.get('cases',[]))!=len(exact_grid):raise ValueError('All exact legal source grid values required')
        for observation,x in zip(row['cases'],exact_grid,strict=True):
            roundoff_only(observation['x'],x);roundoff_only(observation['model']['x'],x)
            roundoff_only(observation['model']['y'],primary.law(identifier,x))
            if [r['stage']for r in observation['stages']]!=list(range(5)):raise ValueError('All five source stages required')
        results.append(dict(id=identifier,tasks=tasks,gridStates=len(exact_grid),textualScientificReview='POSITIVE_WITHIN_REVIEWED_ASSUMPTIONS',visualReview='NOT_RUN',activityCredit=0))
    return results

def report():
    if sha((APP/'tools/corpus_engineering/c3_six_heat_phase_primary_models_a.py').read_bytes())!=PRIMARY_MODULE_SHA256:raise ValueError('Frozen pre-key physics dependency changed')
    package=json.loads((BASE/'candidate.verbatim.json').read_bytes());bindings=json.loads((BASE/'bindings.verbatim.json').read_bytes());originals=json.loads((BASE/'original-source.verbatim.json').read_bytes())
    validate_candidate(package,bindings,originals)
    node=json.loads((BASE/'actual-current-source.json').read_bytes())
    records=mathematical_guard(node)
    return dict(schemaVersion='1.0.0',candidateCommit=CANDIDATE,sourceCommit=SOURCE,runtimeSha256=RUNTIME,records=records,taskCount=12,sourceGridStates=142,ui='NOT_RUN',visualApproval=False,activityCredit=0,humanApproval='NOT_RUN')
