"""Distinct bounded hydrostatic edition review; no consumer credit is granted."""
from pathlib import Path
import hashlib,json,math
from fractions import Fraction
from . import c2_five_hydrostatic_drafts_7c7281_preflight_a as pre
from . import c2_41_static_cb9_verifier_a as frozen
APP=Path(__file__).resolve().parents[2]
SOURCE=pre.SOURCE
RUNTIME=pre.RUNTIME
PROTOCOL='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def exact_owner_versions(owner,records):
    expected={r['id']:r['version'] for r in records}
    actual=owner.get('records',[])
    if len(actual)!=5 or {r['id'] for r in actual}!=set(expected):raise ValueError('All five complete owner records required')
    for row in actual:
        if type(row['version'])is not int or row['version']!=expected[row['id']]:raise ValueError('Actual successive owner edition required')
    return True

def actual(folder):
    folder=Path(folder)
    p=json.loads((folder/'prepared.json').read_bytes())
    r=json.loads((folder/'actual/report.json').read_bytes())
    t=json.loads((folder/'actual-terminal.json').read_bytes())
    if (type(t['actualObservedExitCode'])is not int or t['actualObservedExitCode']!=0 or t['signal']is not None or t['timedOut']is not False or t['assistedTermination']is not False):raise ValueError('Actual undisturbed terminal0 required')
    if p['sourceCommit']!=SOURCE or p['runtimeFingerprint']['sha256']!=RUNTIME or r['runtimeFingerprint']!=p['runtimeFingerprint'] or r['protocolSha256']!=PROTOCOL or r['sourceCommit']!=SOURCE:raise ValueError('Exact immutable runtime/protocol required')
    if r['preparedSha256']!=sha((folder/'prepared.json').read_bytes()) or p['requestSha256']!=sha(Path(p['requestFile']).read_bytes()):raise ValueError('Prepared/request drift')
    if r['errors'] or len(r['cases'])!=len(p['expectedCaseKeys']) or {x['caseKey']for x in r['cases']}!=set(p['expectedCaseKeys']) or len({x['caseKey']for x in r['cases']})!=len(r['cases']):raise ValueError('Exact complete unique subgroup required')
    if r['guestIsolation']!='ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403':raise ValueError('Actual guest source/draft separation required')
    exact_owner_versions(r['fullOwnerRecordIdentity'],p['draftRecords'])
    imported=r['canonicalImport']
    if imported['publishedCount']!=991 or len(imported['imports'])!=1 or imported['imports'][0]['first']['saved']!=5 or imported['imports'][0]['second']['saved']!=0:raise ValueError('Canonical5→0/5 import and preserved originals required')
    results=[]
    for entry in r['cases']:
        raw=(folder/'actual'/entry['file']).read_bytes()
        if sha(raw)!=entry['sha256']:raise ValueError('Raw case hash drift')
        c=json.loads(raw)
        row=next(x for x in p['records']if x['id']==c['id'] and x['variant']==c['variant'])
        if c['caseKey']!=entry['caseKey'] or c['sourceCommit']!=SOURCE or c['runtimeSha256']!=RUNTIME or c['protocolSha256']!=PROTOCOL or c['sourceSha256']!=row['sourceSha256'] or c['candidateSha256']!=row['candidateSha256'] or c['technicalOk']is not True:raise ValueError('Actual edition identity or acquisition failed')
        if c['scientificApproval']is not False or type(c['activityCredit'])is not int or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN':raise ValueError('Technical evidence cannot grant approval')
        for png in c['screenshots']:
            if sha((folder/'actual'/png['file']).read_bytes())!=png['sha256']:raise ValueError('Raw raster drift')
        if 'interaction'in c:
            x=c['sourceReplayedX'];y=c['model']['y']
            if c['model']['x']!=x or not math.isfinite(x) or not math.isfinite(y) or not math.isclose(y,float(pre.law(c['id'],Fraction(str(x)))),rel_tol=1e-12,abs_tol=1e-12):raise ValueError('Independent source law disagrees')
            if not frozen.model_for(c['id']).geometry_semantics(c['id'],x,c['elements']):raise ValueError('Independent apparatus geometry differs')
            baseline=c['baselineReference']
            if baseline['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN' or baseline['model']!=c['model'] or baseline['actualDOMControls']!=c['actualDOMControls']:raise ValueError('Actual isolated DOM/numerical parity required')
            if not c['legendLayout']['visible'] or c['legendLayout']['scrollWidth']>c['legendLayout']['width']+1:raise ValueError('Readable accessible association required')
        else:
            if len(c['phases'])!=4 or len(c['questions'])!=2 or c['axe']:raise ValueError('Actual phases/questions/accessibility required')
            for q,expected in zip(c['questions'],row['questions'],strict=True):
                if q['input']!=expected['input'] or q['expectedAccepted']!=expected['expectedAccepted'] or q['status'].startswith('Corretto. ')!=expected['expectedAccepted']:raise ValueError('Actual original/draft grading contrast changed')
            if c['variant']=='draft':
                reading=c['reading']
                if reading is None or len(reading['formulas'])<sum(b['type']=='formula'for b in row['record']['blocks']):raise ValueError('Actual complete authored formula DOM required')
                if any(f['scroll']>f['width']+1 or f['typeset']<=0 or f['typeset']>f['width']+1 for f in reading['formulas']):raise ValueError('Formula overflow')
        results.append(c)
    return results
