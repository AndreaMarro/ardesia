from pathlib import Path
from decimal import Decimal
from fractions import Fraction as F
import json, math, collections

D = Path('officina-di-fisica/editorial/reviews/c2-l00501-53bd-both-editions-independent-b-20261127')
J = lambda p: json.loads(p.read_text(), parse_float=Decimal)
index = J(D / 'verified-raw-index.json')
rows, hits = [], []
for row in index['cases']:
    c = J(D / row['caseFile'])
    if not c.get('interaction'):
        continue
    x = F(c['requestedX'])
    time = F(c['requestedTime'] or 0)
    assert F(c['model']['y']) == 4 * x
    assert F(c['sourceReplayedX']) == x
    assert F(c['sourceReplayedClockTime']) == time
    assert 'Portata volumetrica' + str(4 * x) + ' mL/s' in c['readings']
    assert 'Distanza alla velocità media' + str(x * time) + ' cm' in c['readings']
    rows.append({'caseKey': c['caseKey'], 'meanSpeedCmS': str(x), 'timeS': str(time), 'exactFlowMlS': str(4*x), 'exactDistanceCm': str(x*time), 'volumePassedMlIfIntegratedOverThisTime': str(4*x*time)})
    camera = c.get('sourceDerivedCamera')
    if not camera:
        continue
    matrix = camera['matrixWorld']
    normal = [F(matrix[i]) for i in [8, 9, 10]]
    n2 = sum(a*a for a in normal)
    for arrow in [e for e in c['elements'] if e['kind'] == 'arrow']:
        tip = list(map(F, arrow['b']))
        for ball in [e for e in c['elements'] if e['kind'] == 'ball' and e.get('alpha', 1) == 1]:
            offset = [F(a)-b for a,b in zip(ball['p'], tip)]
            dot = sum(a*b for a,b in zip(offset, normal))
            length2 = sum(a*a for a in offset)
            r2 = F(ball['r'])**2
            projected_distance2 = length2 - dot*dot/n2
            if dot > 0 and projected_distance2 < r2:
                hits.append({'caseKey': c['caseKey'], 'arrowColor': hex(arrow['c']), 'tip': list(map(str, tip)), 'ballCenter': list(map(str, ball['p'])), 'ballRadius': str(ball['r']), 'ballColor': hex(ball['c']), 'closestProjectedSquaredDistance': str(projected_distance2), 'ballSquaredRadius': str(r2), 'pointInside3DBall': length2 < r2, 'caseFile': row['caseFile'], 'pngSha256': c['screenshots'][0]['sha256']})
assert len(rows) == 144
(D / 'independent-current-raw-arithmetic.json').write_text(json.dumps({'phase': 'FRESH_CHECK_OF_CURRENT_RAW_WITH_HISTORICAL_PRIMARY_ANCHOR', 'sourcePrimaryCommit': '5114b5439eff1daaa143c674459fc470018a126d', 'physicalLaw': 'Q=A*meanSpeed, A=4cm²; 1cm³=1mL; distance=meanSpeed*time', 'strictCheckedInteractions': len(rows), 'rows': rows, 'newChrome': 'NOT_RUN', 'activityCredit': 0}, indent=2) + '\n')
(D / 'projected-tip-occlusions.json').write_text(json.dumps({'method': 'Exact rational arithmetic on raw camera-basis/ball metadata. Ray toward orthographic camera, not physical3Dinclusion. Correlated with entire native PNGs. No positive visibility inferred from a negative screen.', 'count': len(hits), 'profileCounts': dict(collections.Counter('|'.join(r['caseKey'].split('|')[2:4]) for r in hits)), 'rows': hits}, indent=2) + '\n')
print(json.dumps({'rawArithmeticInteractions':len(rows), 'projectedTipHits':len(hits), 'profileCounts':dict(collections.Counter('|'.join(r['caseKey'].split('|')[2:4]) for r in hits))}))
