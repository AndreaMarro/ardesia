"""Independent 2047 Pitot native clearance and actual SVG paint-order negative."""
from pathlib import Path
from fractions import Fraction as Q
import json
import hashlib
import xml.etree.ElementTree as ET
from . import c2_pitot_label_geometry_a as geometry

APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/c2-fluid-labels-2047-independent-a-20261127'
RUNTIME='20472044aa6ff10eb8d1b062517cab50f5fa30c5db5765683568d7a9c6bad811'
CANDIDATE='e5e74638d1fcab1bc8ad3f98e4f745f7927689a5'


def actual_cases():
    prepared_raw=(BASE/'canary-prepared.json').read_bytes()
    prepared=json.loads(prepared_raw)
    report=json.loads((BASE/'canary-actual/report.json').read_bytes())
    receipt=json.loads((BASE/'canary-actual-terminal.json').read_bytes())
    if receipt['actualObservedExitCode']!=0 or receipt['signal'] is not None:
        raise ValueError('Actual terminal zero required')
    if report['sourceCommit']!=CANDIDATE or prepared['sourceCommit']!=CANDIDATE:
        raise ValueError('Candidate edition drift')
    if report['runtimeFingerprint']!=prepared['runtimeFingerprint'] or report['runtimeFingerprint']['sha256']!=RUNTIME:
        raise ValueError('Runtime drift, never retag')
    if report['preparedSha256']!=hashlib.sha256(prepared_raw).hexdigest():
        raise ValueError('Prepared bytes drift')
    metadata_raw=(BASE/'request-metadata.json').read_bytes()
    if prepared['requestSha256']!=hashlib.sha256(metadata_raw).hexdigest() or report['requestSha256']!=prepared['requestSha256']:
        raise ValueError('Own current request identity failed')
    keys=[i['caseKey']for i in report['cases']]
    if len(keys)!=56 or len(set(keys))!=56 or set(keys)!=set(prepared['expectedCaseKeys']):
        raise ValueError('Exactly56 actual requested observations required')
    if report['errors'] or report['technicalStatus']!='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':
        raise ValueError('Incomplete acquisition')
    result=[]
    for item in report['cases']:
        raw=(BASE/'canary-actual'/item['file']).read_bytes()
        if hashlib.sha256(raw).hexdigest()!=item['sha256']:raise ValueError('Actual case changed')
        case=json.loads(raw)
        if case['caseKey']!=item['caseKey'] or case['runtimeSha256']!=RUNTIME or not case['technicalOk']:
            raise ValueError('Actual case identity failed')
        if case['scientificApproval']is not False or case['activityCredit']!=0 or case['humanApproval']!='NOT_RUN':
            raise ValueError('Evidence cannot grant acceptance')
        for png in case['screenshots']:
            if hashlib.sha256((BASE/'canary-actual'/png['file']).read_bytes()).hexdigest()!=png['sha256']:
                raise ValueError('Actual PNG changed')
        result.append(case)
    return result


def fallback_metal_coverage(case):
    """Exact SVG polygon fill intersections; deliberately excludes strokes.

    Later opaque probe fills are the conservative occluders. Fractions are
    parsed from the actual DOM coordinate strings, not a recreated drawing.
    """
    if not case['profile']['fallback']:raise ValueError('Actual fallback SVG required')
    polygons=[e for e in ET.fromstring(case['svg']).iter()if e.tag.split('}')[-1]=='polygon']
    result=[]
    for index,head in enumerate(polygons):
        if head.get('fill')!='#7350b0':continue
        points=[tuple(Q(v)for v in p.split(','))for p in head.get('points').split()]
        poly=geometry.hull(points);total=geometry.area(poly)
        if total<=0:raise ValueError('Nonzero SVG head required')
        for later,body in enumerate(polygons[index+1:],index+1):
            if body.get('fill')!='#726d81' or Q(body.get('opacity','1'))!=1:continue
            p=[tuple(Q(v)for v in pair.split(','))for pair in body.get('points').split()]
            xs=[x for x,y in p];ys=[y for x,y in p]
            if len(set(xs))!=2 or len(set(ys))!=2:continue
            box={'x':(min(xs)+max(xs))/2,'y':(min(ys)+max(ys))/2,
                 'w':max(xs)-min(xs),'h':max(ys)-min(ys)}
            covered=geometry.area(geometry.clip(poly,box))
            if covered:
                apex=points[0]
                result.append({'headOrder':index,'opaqueProbeOrder':later,
                    'fraction':covered/total,'apexHidden':min(xs)<=apex[0]<=max(xs)and min(ys)<=apex[1]<=max(ys),
                    'headPoints':points,'probePoints':p})
    return result
