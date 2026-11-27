"""Bounded distinct review of six exits and Pitot; no macro approval."""
from pathlib import Path
import hashlib,json
from . import c2_fluid_e511_review_a as old
from . import c2_pitot_2047_review_a as svg
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-six-exits-4e-independent-a-20261127'
CANDIDATE='03f9634d7d6a8dcfe9161990c4d5dbc62e3773f5'
RUNTIME='4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b'
SIX={'SIM-C2-'+s for s in ['L005-01','L005-02','L005-03','L006-01','L006-03','L008-01']}

def accept_case(c,p):
    if c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME:raise ValueError('Current candidate required; no retag')
    if c['requestSha256']!=p['requestSha256'] or c['protocolSha256']!=hashlib.sha256((BASE/'canonical-protocol.mjs.txt').read_bytes()).hexdigest():raise ValueError('Executed protocol and request required')
    if c['scientificApproval']is not False or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN' or c['technicalOk']is not True:raise ValueError('Acquisition cannot grant approval')
    row=next(r for r in p['records']if r['id']==c['id']and r['variant']==c['variant'])
    if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']!=row['candidateSha256']:raise ValueError('Source/edition drift')
    if 'interaction'in c:
        old.independent_measure(c['id'],c['sourceReplayedX'],c['model']['y'])
        if c['model'].get('x')!=c['sourceReplayedX']:raise ValueError('Input mismatch')
        b=c['baselineReference']
        if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['clockTime']!=c['sourceReplayedClockTime']:raise ValueError('Exact isolated baseline comparison required')
    return c

def actual(kind):
    if kind not in ('exits','pitot'):raise ValueError('Explicit bounded run required')
    p=json.loads((BASE/(kind+'-prepared.json')).read_bytes());r=json.loads((BASE/(kind+'-actual/report.json')).read_bytes());t=json.loads((BASE/(kind+'-terminal.json')).read_bytes());n=42 if kind=='exits'else 32
    if type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None:raise ValueError('Real completed terminal required')
    if r['sourceCommit']!=CANDIDATE or p['runtimeFingerprint']!=r['runtimeFingerprint']or r['runtimeFingerprint']['sha256']!=RUNTIME:raise ValueError('Current complete fingerprint required')
    if r['preparedSha256']!=hashlib.sha256((BASE/(kind+'-prepared.json')).read_bytes()).hexdigest()or p['requestSha256']!=hashlib.sha256((BASE/(kind+'-metadata.json')).read_bytes()).hexdigest():raise ValueError('Frozen request drift')
    if r['errors']or len(r['cases'])!=n or len({c['caseKey']for c in r['cases']})!=n or {c['caseKey']for c in r['cases']}!=set(p['expectedCaseKeys']):raise ValueError('Exact whole case set required')
    result=[]
    for item in r['cases']:
        raw=(BASE/(kind+'-actual')/item['file']).read_bytes()
        if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Actual case digest drift')
        c=accept_case(json.loads(raw),p)
        if c['caseKey']!=item['caseKey']:raise ValueError('Case key drift')
        for png in c['screenshots']:
            if hashlib.sha256((BASE/(kind+'-actual')/png['file']).read_bytes()).hexdigest()!=png['sha256']:raise ValueError('Raster digest drift')
        result.append(c)
    return result

def compare_new_to_old(current,previous):
    if current['sourceReplayedX']!=previous['sourceReplayedX']or current['profile']!=previous['profile']:raise ValueError('Distinct observations cannot be conflated')
    for name in ['model','sourceDerivedCamera']:
        if current.get(name)!=previous.get(name):raise ValueError('Physics, geometry or camera changed: '+name)
    if len(current.get('nativeGlyphs',[]))!=len(previous.get('nativeGlyphs',[])):raise ValueError('Glyph count changed')
    for a,b in zip(current.get('nativeGlyphs',[]),previous.get('nativeGlyphs',[])):
        expected_glyph=dict(b)
        if current['id']in SIX:expected_glyph['tipInsideOpaqueLabel']=[l for l in b['tipInsideOpaqueLabel']if l['text']!='Uscita']
        if a!=expected_glyph:raise ValueError('Physical mesh or other derived visibility changed')
    expected=[e for e in previous['elements']if not(current['id']in SIX and e['kind']=='label'and e['text']=='Uscita')]
    if current['elements']!=expected:raise ValueError('Unexpected scene primitive change')
    if current['id']in SIX and any(l['text']=='Uscita'for l in current['labels']):raise ValueError('Opaque exit remains')
    if current['id']=='SIM-C2-L006-02':
        arrows=[e for e in current['elements']if e['kind']=='arrow']
        if current['sourceReplayedX']==0:
            if arrows or current.get('nativeGlyphs',[]):raise ValueError('Directed zero indicator')
        elif len(arrows)!=2 or [e['kind']for e in current['elements'][-2:]]!=['arrow','arrow']:raise ValueError('Pitot full indicators/order changed')
        if current['profile']['fallback']and svg.fallback_metal_coverage(current):raise ValueError('Fallback probe still covers head')
    return True
