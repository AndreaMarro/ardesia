"""Independent retained-evidence validation for338/e511, never automatic credit."""
from pathlib import Path
import hashlib
import json
import math
from fractions import Fraction
from .pipeline import digest
from . import c2_41_static_cb9_verifier_a as physics
from . import c2_pitot_2047_review_a as svg_geometry

APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-fluid-labels-e511-independent-a-20261127'
RUNTIME='e511baf54338ccddf47934fc2a580027effb94162f2146d4c4e74912b90d24f9'
CANDIDATE='338be5246e0c74d348cf5f905e83c7957dd9441a'


def independent_measure(key, x, y):
    for number in (x, y):
        if type(number) not in (int, float) or not math.isfinite(number):
            raise ValueError('Finite observed real before conversion required')
    want = physics.exact_value(key, Fraction(str(x)))
    # Verbatim recovered scientific observation comparator from the original
    # independent model work; no tolerance is added or broadened in this epoch.
    boundary = physics.load('experiments_C2_code_partial_review.py')
    if not boundary.near(y, want):
        raise ValueError('Independent exact physical model rejects observed scalar')
    return want


def observed_run(kind):
    if kind not in ('canary','targeted'):raise ValueError('Explicit observed run required')
    expected=56 if kind=='canary' else 624
    metadata='request-metadata.json'if kind=='canary'else'targeted-request-metadata.json'
    raw=(BASE/(kind+'-prepared.json')).read_bytes()
    prepared=json.loads(raw)
    report=json.loads((BASE/(kind+'-actual/report.json')).read_bytes())
    terminal=json.loads((BASE/(kind+'-actual-terminal.json')).read_bytes())
    if type(terminal['actualObservedExitCode']) is not int or terminal['actualObservedExitCode']!=0 or terminal['signal'] is not None:
        raise ValueError('Actual terminal zero required, no pending or failed run adoption')
    if prepared['sourceCommit']!=CANDIDATE or report['sourceCommit']!=CANDIDATE:
        raise ValueError('Candidate changed')
    if prepared['runtimeFingerprint']!=report['runtimeFingerprint']or prepared['runtimeFingerprint']['sha256']!=RUNTIME:
        raise ValueError('Runtime drift, no retag')
    if hashlib.sha256(raw).hexdigest()!=report['preparedSha256']:
        raise ValueError('Prepared bytes changed')
    if hashlib.sha256((BASE/metadata).read_bytes()).hexdigest()!=prepared['requestSha256']or prepared['requestSha256']!=report['requestSha256']:
        raise ValueError('Own exact current request changed')
    if report['errors']or report['technicalStatus']!='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':
        raise ValueError('Incomplete acquisition')
    if report['activityCredit']!=0 or report['humanApproval']!='NOT_RUN':
        raise ValueError('Acquisition cannot grant scientific/human credit')
    keys=[r['caseKey']for r in report['cases']]
    if len(keys)!=expected or len(set(keys))!=expected or set(keys)!=set(prepared['expectedCaseKeys']):
        raise ValueError('Complete exact unique current case set required')
    sources=physics.frozen_sources()
    draft=json.loads((physics.BASE/'inputs/experiment-stevino-revision-047.json').read_bytes())['records'][0]
    rows={(r['id'],r['variant']):r for r in prepared['records']}
    if len(rows)!=len(prepared['records'])or len(rows)!=(1 if kind=='canary' else 26):
        raise ValueError('Whole planned edition set required')
    if kind=='targeted':
        frozen=json.loads((APP/'editorial/reviews/c2-fluid-label-candidate-independent-a-20261127/next-candidate-targeted-ui-plan.json').read_bytes())
        if set(rows)!={(r['id'],r['variant'])for r in frozen['records']}:
            raise ValueError('Target scope changed')
        b=report['baselineReference']
        if b['kind']!='IMMUTABLE_BASELINE_ISOLATED_BROWSER_CONTEXT_V2'or b['allManifestBytesCheckedBeforeAndAfter']is not True or b['scientificAuthority']!='NONE_TECHNICAL_REGRESSION_PARITY_ONLY':
            raise ValueError('Existing exact isolated reference contract required')
    for (key,variant),r in rows.items():
        if r['sourceSha256']!=digest(sources[key]):raise ValueError('Original source token drift')
        expected_record=sources[key]if variant=='published'else draft
        if r['record']!=expected_record:raise ValueError('Whole source/draft record drift')
        if r['candidateSha256']!=(None if variant=='published'else digest(draft)):
            raise ValueError('Original and draft cannot be interchanged')
    result=[]
    for item in report['cases']:
        data=(BASE/(kind+'-actual')/item['file']).read_bytes()
        if hashlib.sha256(data).hexdigest()!=item['sha256']:raise ValueError('Actual case bytes changed')
        c=json.loads(data)
        if c['caseKey']!=item['caseKey']or c['sourceCommit']!=CANDIDATE or c['runtimeSha256']!=RUNTIME or c['technicalOk'] is not True:
            raise ValueError('Actual case identity changed')
        row=rows[(c['id'],c['variant'])]
        if c['sourceSha256']!=row['sourceSha256']or c['candidateSha256']!=row['candidateSha256']:
            raise ValueError('Edition source/candidate binding drift')
        if c['scientificApproval']is not False or c['activityCredit']!=0 or c['humanApproval']!='NOT_RUN':
            raise ValueError('No automatic approval')
        for png in c['screenshots']:
            if hashlib.sha256((BASE/(kind+'-actual')/png['file']).read_bytes()).hexdigest()!=png['sha256']:
                raise ValueError('Actual PNG bytes changed')
        if 'interaction'in c:
            for n in c['model'].values():
                if type(n)not in(int,float)or not math.isfinite(n):raise ValueError('Finite recorded model required')
            if c['model'].get('x') != c['sourceReplayedX']:
                raise ValueError('Model input differs from the observed controller input')
            independent_measure(c['id'], c['sourceReplayedX'], c['model']['y'])
            if kind=='targeted':
                b=c['baselineReference']
                if b['isolation']!='DISTINCT_CONTEXT_AND_ORIGIN'or b['model']!=c['model']or b['actualDOMControls']!=c['actualDOMControls']or b['observedX']!=c['sourceReplayedX']or b['clockTime']!=c['sourceReplayedClockTime']:
                    raise ValueError('Exact same-browser isolated reference parity failed')
        result.append(c)
    return result


def pitot_canary_checks():
    result=[]
    for c in observed_run('canary'):
        if 'interaction'not in c:continue
        arrows=[e for e in c['elements']if e['kind']=='arrow']
        if c['sourceReplayedX']==0:
            if arrows or c.get('nativeGlyphs',[]):raise ValueError('Zero velocity must not show directed arrows')
        else:
            if len(arrows)!=2 or [e['kind']for e in c['elements'][-2:]]!=['arrow','arrow']:
                raise ValueError('Only the two indicators must be the final primitives')
            for a in arrows:
                if a['a'][1:]!=[1.05,.23]or a['b'][1:]!=[1.05,.23]:raise ValueError('Graphical position changed')
        if c['profile']['fallback']:
            intersections=svg_geometry.fallback_metal_coverage(c)
            if intersections:raise ValueError('Later-painted opaque probe still covers a head')
        elif c['labels']:
            raise ValueError('Pitot opaque labels must be outside the scene')
        result.append({'caseKey':c['caseKey'],'zero':c['sourceReplayedX']==0,'checksOk':True})
    return result
