"""Targeted independent negative on immutable fluid-label candidate 6d6dd15a.

This is a canary, not the complete C2 renewal and not scientific acceptance.
The projection functions are reused mathematical instruments, with exposure
disclosed. They do not transport a cb9 approval to this new runtime.
"""
import hashlib
import json
from pathlib import Path
from . import c2_41_actual_ui_cb9_review_a as geometry

APP = Path(__file__).resolve().parents[2]
BASE = APP/'editorial/reviews/c2-fluid-label-candidate-independent-a-20261127'
RUNTIME = '1674db0b94546fd7859b728d200cde0f1c428a67865151c6020395713985a03f'
CANDIDATE = '6d6dd15ab1b7666c3c95becbc9a8c40149735b01'


def actual_canary(base=BASE):
    prepared_raw = (base/'canary-prepared.json').read_bytes()
    prepared = json.loads(prepared_raw)
    report = json.loads((base/'canary-actual/report.json').read_bytes())
    terminal = json.loads((base/'canary-actual-terminal.json').read_bytes())
    if terminal['actualObservedExitCode'] != 0 or terminal['signal'] is not None:
        raise ValueError('Actual acquisition must have a terminal zero, never inferred')
    if prepared['sourceCommit'] != CANDIDATE or report['sourceCommit'] != CANDIDATE:
        raise ValueError('Immutable candidate mismatch')
    if prepared['runtimeFingerprint']['sha256'] != RUNTIME or report['runtimeFingerprint'] != prepared['runtimeFingerprint']:
        raise ValueError('Runtime drift, no retag')
    if report['preparedSha256'] != hashlib.sha256(prepared_raw).hexdigest():
        raise ValueError('Prepared bytes changed')
    if report['errors'] or report['technicalStatus'] != 'ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':
        raise ValueError('Complete canary acquisition required')
    if report['activityCredit'] != 0 or report['humanApproval'] != 'NOT_RUN':
        raise ValueError('Acquisition must not grant approval')
    keys = [r['caseKey'] for r in report['cases']]
    if len(keys) != 12 or len(set(keys)) != 12 or set(keys) != set(prepared['expectedCaseKeys']):
        raise ValueError('Exactly the twelve planned canary cases required')
    cases=[]
    for item in report['cases']:
        raw = (base/'canary-actual'/item['file']).read_bytes()
        if hashlib.sha256(raw).hexdigest() != item['sha256']:
            raise ValueError('Actual case changed')
        case=json.loads(raw)
        if case['caseKey'] != item['caseKey'] or case['runtimeSha256'] != RUNTIME or not case['technicalOk']:
            raise ValueError('Actual case identity failed')
        if case['scientificApproval'] is not False or case['activityCredit'] != 0 or case['humanApproval'] != 'NOT_RUN':
            raise ValueError('No approval can be inferred')
        for png in case['screenshots']:
            if hashlib.sha256((base/'canary-actual'/png['file']).read_bytes()).hexdigest() != png['sha256']:
                raise ValueError('Actual screenshot changed')
        cases.append(case)
    return cases


def residual_proofs():
    result=[]
    for case in actual_canary():
        if case.get('interaction',{}).get('kind')=='grid' and not case['profile']['fallback']:
            result.append({'caseKey':case['caseKey'],'x':case['sourceReplayedX'],
                           'profile':case['profile'],'elementIndex':14,'label':'Presa frontale',
                           'proof':geometry.glyph_evidence(case,14,'Presa frontale'),
                           'screenshot':case['screenshots'][0]})
    return result
