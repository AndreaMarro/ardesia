"""Independent interpretation of recorded cb9 C2 geometry; no acceptance side effect.

Matrices are recorded source-derived matrices, not a GPU depth-buffer readback.
Occlusion findings additionally require an actually read, unmodified full PNG.
"""
import hashlib
import json
import math
from pathlib import Path

from . import c2_41_static_cb9_verifier_a as physics

APP = Path(__file__).resolve().parents[2]
BASE = APP / 'editorial/reviews/c2-41-cb9-actual-ui-peer-a-20261127'
ARTIFACT_SHA = '7e7106ecf91b21e16db59443f9d225df252bd9a8289c385287714f3cc297d4f9'
REQUEST_SHA = '9b3651b34beace77fab0ba9d57934a88c00d339dd974596c92e9f83722b0dac5'


def finite(value):
    if type(value) not in (int, float) or not math.isfinite(value):
        raise ValueError('Finite recorded real required')
    return value


def point_in_box(point, box):
    x, y = map(finite, point)
    cx, cy, w, h = (finite(box[k]) for k in ('x', 'y', 'w', 'h'))
    if w <= 0 or h <= 0:
        raise ValueError('Positive label rectangle required')
    return cx - w/2 <= x <= cx + w/2 and cy - h/2 <= y <= cy + h/2


def project(point, case):
    m = list(map(finite, case['sourceDerivedCamera']['matrixWorld']))
    q = list(map(finite, case['sourceDerivedCamera']['projectionMatrix']))
    if len(m) != 16 or len(q) != 16 or q[15] != 1 or any(q[i] != 0 for i in (3, 7, 11)):
        raise ValueError('Recorded orthographic camera required')
    if len(point) != 3:
        raise ValueError('Three-dimensional point required')
    v = [finite(point[i]) - m[12+i] for i in range(3)]
    width, height = (finite(case['canvas'][k]) for k in ('width', 'height'))
    if min(width, height) <= 0:
        raise ValueError('Positive canvas required')
    return [(1 + q[0]*sum(m[i]*v[i] for i in range(3)))*width/2,
            (1 - q[5]*sum(m[4+i]*v[i] for i in range(3)))*height/2]


def glyph_evidence(case, element_index, label_text):
    if case['profile']['fallback']:
        raise ValueError('Native geometry only; fallback has separate SVG and PNG evidence')
    glyph = next(g for g in case['nativeGlyphs'] if g['elementIndex'] == element_index)
    label = next(l for l in case['labels'] if l['text'] == label_text)
    parts = []
    for part in glyph['parts']:
        points = [project(v, case) for v in part['vertices']]
        if not points:
            raise ValueError('Complete nonempty native vertices required')
        inside = sum(point_in_box(p, label['box']) for p in points)
        parts.append({'vertices': len(points), 'insideOpaqueRectangle': inside,
                      'percentInside': 100*inside/len(points),
                      'boundsPixels': [min(p[0] for p in points), min(p[1] for p in points),
                                       max(p[0] for p in points), max(p[1] for p in points)]})
    tip, tail = project(glyph['tip'], case), project(glyph['tail'], case)
    return {'parts': parts, 'allVerticesInside': all(p['vertices'] == p['insideOpaqueRectangle'] for p in parts),
            'tipInside': point_in_box(tip, label['box']), 'tipPixels': tip, 'tailPixels': tail,
            'projectedAxisLengthPixels': math.dist(tip, tail), 'labelBox': label['box']}


def sphere_evidence(case, element_index, label_text):
    sphere = case['elements'][element_index]
    if sphere['kind'] != 'ball':
        raise ValueError('Actual sphere required')
    center = project(sphere['p'], case)
    radius = finite(sphere['r']) * abs(case['sourceDerivedCamera']['projectionMatrix'][0]) * case['canvas']['width']/2
    if radius <= 0:
        raise ValueError('Nonzero projected sphere required')
    label = next(l for l in case['labels'] if l['text'] == label_text)
    corners = [(center[0]-radius, center[1]-radius), (center[0]+radius, center[1]+radius)]
    return {'projectedRadiusPixels': radius, 'projectedDiameterPixels': 2*radius,
            'entireProjectedDiskBoundingSquareInside': all(point_in_box(p, label['box']) for p in corners),
            'labelBox': label['box'], 'centerPixels': center,
            'orientationQualification': 'A sphere has nonzero silhouette in Top; this is not an axial-vector foreshortening inference.'}


def validate_record_identity(prepared):
    sources = physics.frozen_sources()
    draft = json.loads((physics.BASE/'inputs/experiment-stevino-revision-047.json').read_bytes())['records'][0]
    expected = {(k, 'published'): r for k, r in sources.items()}
    expected[(draft['id'], 'draft')] = draft
    rows = prepared['records']
    keys = [(r['id'], r['variant']) for r in rows]
    if len(keys) != 42 or len(set(keys)) != 42 or set(keys) != set(expected):
        raise ValueError('Exactly 41 original editions plus one separate Stevino draft required')
    from .pipeline import digest
    for r in rows:
        key = r['id'], r['variant']
        if r['record'] != expected[key] or r['sourceSha256'] != digest(sources[r['id']]):
            raise ValueError('Source or edition changed')
        if r['variant'] == 'draft' and r['candidateSha256'] != digest(draft):
            raise ValueError('Draft candidate changed')
        if r['variant'] == 'published' and r['candidateSha256'] is not None:
            raise ValueError('Original must remain an original edition')
    return True


def validate_envelope(prepared, report, receipt):
    if receipt['observedExitCode'] != 0 or receipt['error'] is not None or report['errors']:
        raise ValueError('Actual successful acquisition required')
    if report['technicalStatus'] != 'ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED':
        raise ValueError('Technical acquisition cannot grant scientific approval')
    if any(r['activityCredit'] != 0 or r['humanApproval'] != 'NOT_RUN' for r in (prepared, report)):
        raise ValueError('Acquisition is not scientific or human approval')
    if any(x != physics.RUNTIME for x in (receipt['runtimeSha256'], report['runtimeFingerprint']['sha256'], prepared['runtimeFingerprint']['sha256'])):
        raise ValueError('Epoch drift; never retag')
    if any(x != REQUEST_SHA for x in (receipt['requestSha256'], report['requestSha256'], prepared['requestSha256'])):
        raise ValueError('Request mismatch')
    actual = [r['caseKey'] for r in report['cases']]
    if len(actual) != 7440 or len(set(actual)) != 7440 or set(actual) != set(prepared['expectedCaseKeys']):
        raise ValueError('Actual complete unique planned case set required')
    return validate_record_identity(prepared)


def validate_verbatim_metadata(prepared_raw, report_raw, receipt_raw):
    prepared, report, receipt = map(json.loads, (prepared_raw, report_raw, receipt_raw))
    if hashlib.sha256(prepared_raw).hexdigest() != report['preparedSha256'] or report['preparedSha256'] != receipt['preparedSha256']:
        raise ValueError('Verbatim prepared-byte identity required')
    return validate_envelope(prepared, report, receipt)


def validate_witness(row, app=APP):
    raw = (app/row['caseFile']).read_bytes()
    png = (app/row['fullFramePng']).read_bytes()
    if hashlib.sha256(raw).hexdigest() != row['caseSha256'] or hashlib.sha256(png).hexdigest() != row['fullFramePngSha256']:
        raise ValueError('Verbatim witness changed')
    case = json.loads(raw)
    if case['caseKey'] != row['caseKey'] or case['runtimeSha256'] != physics.RUNTIME:
        raise ValueError('Witness edition/epoch changed')
    if case['scientificApproval'] is not False or case['humanApproval'] != 'NOT_RUN' or case['activityCredit'] != 0:
        raise ValueError('Technical witness must not grant approval')
    if row['actualFullFrameManuallyRead'] is not True:
        raise ValueError('Geometry alone is not observed occlusion approval')
    return case
