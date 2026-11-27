from pathlib import Path
import json
import shutil
D = Path(__file__).resolve().parent
O = D.parent / 'short-direction-composed-91f-independent-20261127'
A = Path('/private/tmp/cric-c1-work-axis-20261127/officina-di-fisica')
sources = {x['id']: x for course in ['C1', 'C4', 'C5'] for x in json.loads((A / f'content/esperienze-{course}.json').read_text())}
cases = {}
def add(ident, x, view, width, time=None):
    key = '|'.join(map(str, [ident, width, view, x, '' if time is None else time]))
    source = sources[ident]
    row = {
        'id': ident, 'key': key, 'x': x, 'view': view, 'width': width,
        'fallback': view == 'fixed_projection', 'kind': 'grid' if time is None else 'clock',
        'index': round((x - source['control']['min']) / source['control']['step']) if time is None else 84,
        'source': source, 'hasClock': ident == 'SIM-C1-L007-02',
        'clockInput': ident == 'SIM-C1-L007-02', 'originalNegativeCaseKeys': []}
    if time is not None:
        row['time'] = time
    cases[key] = row
for ident, states, wide, extra in [
    ('SIM-C1-L006-03', [1.25, 1.5, 2, 4], [1.5, 2, 4], [1.5, 4]),
    ('SIM-C1-L007-02', [0, .25, 1, 1.75, 2], [0, .25, 1, 1.75, 2], [.25, 1.75]),
    ('SIM-C1-L007-03', [0, 1, 2, 3, 4], [0, 1, 3, 4], [1, 3]),
    ('SIM-C4-L01-02', [1.5, 2, 2.5, 6], [2, 6], [2, 6]),
    ('SIM-C5-L07-03', [14, 15, 17, 18], [15, 17], [15, 17])]:
    for x in states:
        for view in ['top', 'fixed_projection']:
            add(ident, x, view, 320)
    for x in wide:
        for view in ['top', 'fixed_projection']:
            add(ident, x, view, 1280)
    for x in extra:
        for view in ['orbit', 'side']:
            add(ident, x, view, 320)
for view in ['top', 'fixed_projection']:
    add('SIM-C1-L007-02', 1, view, 320, 1.75)
plan = {
    'candidateRef': '25151fb1c38b4b859d49e02a9255fdd83bcf4341',
    'runtimeSha256': '4fe3c31ff0762c3e9038639320d60d4b8b9a49fe73175e44415c4160b61c1f41',
    'plannedScope': 'Five changed direction-detail families only. Boundary on/off and zero states; unchanged primary operators, 5x/6x/8x/4x gains, symmetric 5x inset and new dark ochre. No full macro or C6 acceptance.',
    'cases': list(cases.values()), 'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
assert len(cases) == 98, len(cases)
(D / 'bounded-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
for name in ['canonical-observer.mjs', 'canonical-visibility-protocol.mjs', 'next-images.py']:
    shutil.copyfile(O / name, D / name)
s = (O / 'browser-canaries.mjs').read_text().replace('/private/tmp/cric-c1-and-flight-contrast-20261127/officina-di-fisica', str(A)).replace('110', '98')
(D / 'browser-canaries.mjs').write_text(s)
s = (O / 'run-browser.py').read_text().replace('/private/tmp/cric-c1-and-flight-contrast-20261127/officina-di-fisica', str(A)).replace('91f08d7f0e253778ebf36d8c2241b644e7809ee43884ca9b87d8a854aba650cf', plan['runtimeSha256'])
(D / 'run-browser.py').write_text(s)
s = (O / 'compare-current.mjs').read_text().replace('/private/tmp/cric-c1-and-flight-contrast-20261127/officina-di-fisica', str(A)).replace('const C=0xd49332', 'const C=0x995a14')
s = s.replace('length<.18', 'length<.38').replace('length)<.16', 'length)<.24')
s = s.replace('a:[k*d,1.90,.82],b:[k*(d-6*length),1.90,.82]', 'a:[k*2.1,1.90,.82],b:[k*(2.1-5*length),1.90,.82]')
s = s.replace("}else if(source.id==='SIM-C1-L007-02'){\n     const length=(v/3)*.65,pos=-2.38+4.76*(v*v)/16;", "}else if(['SIM-C1-L007-02','SIM-C1-L007-03'].includes(source.id)){\n     const speedFactor=source.id==='SIM-C1-L007-02'?v:Math.sqrt(v);\n     const position=source.id==='SIM-C1-L007-02'?v*v:v;\n     const length=(speedFactor/3)*.65,pos=-2.38+4.76*position/16;")
line = "for(const rel of ['static/js/banchi/voci/apparati/campi.js','static/js/banchi/voci/apparati/onde.js'])assert.deepEqual(readFileSync(APP+'/'+rel),readFileSync('/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/'+rel));\n"
assert line in s
s = s.replace(line, '')
s = s.replace('4cce177d6b73ec58bfd265ff164424226501bcff', plan['candidateRef']).replace('91f08d7f0e253778ebf36d8c2241b644e7809ee43884ca9b87d8a854aba650cf', plan['runtimeSha256'])
s = s.replace('comparisonC4C5ConsumerModulesIdenticalTo0184:true', 'comparisonScope:"Old03f primary primitives and model outputs identical; exact new detail operators independently checked"')
(D / 'compare-current.mjs').write_text(s)
(D / 'raster-read-log.json').write_text(json.dumps({'actuallyOpened': [], 'pending': []}) + '\n')
print('Prepared', len(cases))
