"""Independent SI oracle over the exported public data; no Core solver imports."""
from pathlib import Path
from decimal import Decimal
import hashlib,json
ROOT=Path('/private/tmp/ardesia-r2-20261024')
raw=(ROOT/'apps/web/src/generated/publicPreviewData.ts').read_text()
data=json.loads(raw.split('export const publicPreviewData = ',1)[1].rsplit(' as const;',1)[0])
cases=data['hydrostatic']['cases'];seen=set();errors=[]
for item in cases:
 p=item['parameters'];r=item['result'];key=(p['depth'],p['density'],p['reference'])
 if key in seen:errors.append({'duplicate':key})
 seen.add(key)
 # SI definition: pressure increment is weight per horizontal area at rest.
 increment=Decimal(str(p['density']))*Decimal('9.81')*Decimal(str(p['depth']))
 expected=increment+(Decimal('101325') if p['reference']=='absolute' else Decimal('0'))
 if abs(Decimal(str(r['value']))-expected)>Decimal('0.000000001'):errors.append({'case':key,'expected':str(expected),'actual':r['value']})
 if r['unit']!='Pa' or p['g']!=9.81 or p['surfacePressure']!=101325:errors.append({'inconsistentUnitsOrConstants':key})
 if r['editorialStatus']!='DRAFT':errors.append({'draftMissing':key})
for depth in [Decimal(n)/2 for n in range(9)]:
 for density in (800,1000):
  if not all((float(depth),density,reference) in seen for reference in ('gauge','absolute')):errors.append({'missing':(str(depth),density)})
provenance={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==sha for p,sha in data['sources'].items()}
report={'states':len(cases),'independentSIOracles':'36/36' if not errors and len(cases)==36 else 'FAIL','errors':errors,'provenanceAllCurrent':all(provenance.values()),'provenance':provenance,'zeroGaugeSurface':next(c['result']['value'] for c in cases if c['parameters']=={'depth':0.0,'density':1000,'g':9.81,'surfacePressure':101325,'reference':'gauge'}),'absoluteSurface':101325,'transfer':23544,'claim':'Numeric deterministic agreement only; scientific review not attested'}
print(json.dumps(report,indent=2))
assert not errors and len(cases)==36 and all(provenance.values())
