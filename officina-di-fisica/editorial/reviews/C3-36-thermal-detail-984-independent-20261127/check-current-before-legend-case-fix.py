"""Independent actual-observation invariants; no raster approval from elements."""
from pathlib import Path
import copy, hashlib, json, math, shutil

OUT = Path(__file__).resolve().parent
OLD = OUT.parent / 'C3-36-cb9-independent-20261127'
BROWSER = Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/editorial/reviews/thermal-flow-detail-20261127/fusion-detail-final/actual-browser')
RUNTIME = '984466738580ad1a3eba88dd868ddd69b4111f05ff9c17e8869bb6df29cd05bc'
def enc(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()
def stripped(value):
    if isinstance(value, dict):
        return {k: ([stripped(e) for e in v if e.get('dettaglio') is not True] if k == 'elements' else stripped(v)) for k, v in value.items() if k != 'legend'}
    if isinstance(value, list):
        return [stripped(v) for v in value]
    return value

census = json.loads((OUT / 'actual-arrow-census.json').read_bytes())
assert census['unexpectedRawVsInstalled'] == []
assert census['states'] == 1369
details, records, zero_states = [], 0, 0
for group in ('state', 'calorimetry', 'first-law', 'paths', 'entropy'):
    before = json.loads((OLD / (group + '-actual-code.json')).read_bytes())
    after = json.loads((OUT / (group + '-actual-code.json')).read_bytes())
    assert after['runtimeProfileBefore'] == after['runtimeProfileAfter'] == RUNTIME
    assert enc(stripped(before['records'])) == enc(stripped(after['records']))
    for row in after['records']:
        records += 1
        raw_row = next(r for r in census['records'] if r['id'] == row['id'])
        for case in row['cases']:
            frames = [('grid', None, case['elements'])] + [('clock', s['time'], s['elements']) for s in case['clockSamples']]
            for kind, time, elements in frames:
                raw = next(c for c in raw_row['cases'] if c['kind'] == kind and c['x'] == case['x'] and c.get('time') == time)
                added = [e for e in elements if e.get('dettaglio') is True]
                for detail in added:
                    assert detail['kind'] == 'arrow' and detail['c'] == 0xd49332
                    index = next(i for i, arrow in enumerate(raw['arrows']) if all(arrow[k] == detail[k] for k in ('a', 'b', 'c')))
                    assert index > 0
                    primary = raw['arrows'][index - 1]
                    vector = [primary['b'][j] - primary['a'][j] for j in range(3)]
                    assert 0 < math.hypot(*vector) < .03
                    phase = row['id'] == 'SIM-C3-L04-03'
                    factor, shift = (128, [-.85, 1.60, 1.05]) if phase else (32, [.55, 0, .5])
                    origin = [primary['a'][j] + shift[j] for j in range(3)]
                    assert detail['a'] == origin
                    assert detail['b'] == [origin[j] + factor * vector[j] for j in range(3)]
                    assert all((detail['b'][j] - detail['a'][j]) * vector[j] > 0 if vector[j] else detail['b'][j] == detail['a'][j] for j in range(3))
                    details.append({'id': row['id'], 'kind': kind, 'x': case['x'], 'time': time, 'factor': factor, 'exactInstalledOperator': True, 'sensePreserved': True})
                if row['id'] in ('SIM-C3-L09-01', 'SIM-C3-L09-02') and case['x'] == 0:
                    assert not added
                    zero_states += 1
                if row['id'] == 'SIM-C3-L04-03' and kind == 'clock' and time == 0:
                    assert not added
                    zero_states += 1
        if row['id'] == 'SIM-C3-L04-03':
            assert '128' in row['legend'] and 'in alto' in row['legend']
        if row['id'] in ('SIM-C3-L09-01', 'SIM-C3-L09-02'):
            assert '32' in row['legend'] and 'Lavoro' in row['legend']
assert records == 36 and len(details) == 22 and zero_states > 0
for omitted in census['nonzeroOmitted']:
    assert any(d['id'] == omitted['id'] and d['kind'] == omitted['kind'] and d['x'] == omitted['x'] and d['time'] == omitted.get('time') for d in details)
assert len(census['nonzeroOmitted']) == 7
report_raw = (BROWSER / 'report.json').read_bytes()
report = json.loads(report_raw)
terminal_raw = (BROWSER / 'terminal.json').read_bytes()
terminal = json.loads(terminal_raw)
assert terminal['observedExit'] == 0 and terminal['runtimeBefore'] == terminal['runtimeAfter'] == RUNTIME
assert hashlib.sha256(report_raw).hexdigest() == terminal['reportSha256']
assert len(report['actual']) == 80 and report['errors'] == []
assert len({(c['id'], c['width'], c['view'], c['input'], c['instant']) for c in report['actual']}) == 80
for case in report['actual']:
    assert hashlib.sha256((BROWSER / (case['imageSha'] + '.png')).read_bytes()).hexdigest() == case['imageSha']
(OUT / 'author-actual-browser-report.json').write_bytes(report_raw)
(OUT / 'author-actual-browser-terminal.json').write_bytes(terminal_raw)
result = {'candidateRef': '3dd939a87fa54781761d341fbecec826ded928a8', 'runtimeSha256': RUNTIME, 'unchangedModelsAndExistingElements': records, 'actualStates': census['states'], 'declaredDetails': details, 'sevenPreviouslyOmittedNonzeroTransfersHaveSeparateDeclaredDetail': True, 'physicalZeroStatesWithoutDetail': zero_states, 'browserTerminalAndAll80PngHashesValid': True, 'browserReportSha256': terminal['reportSha256'], 'occlusionInferredFromElements': False, 'oldRedFilesRetagged': False, 'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
(OUT / 'actual-independent-invariants.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('36 unchanged models, 1369 states, 22 exact details, 7 missing primary transfers separately represented; actual 80 report/PNG hashes valid')
