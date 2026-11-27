from pathlib import Path
import xml.etree.ElementTree as ET,json,re,hashlib
p=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews/C4-L02-01-f357-independent-b-20261127');J=lambda f:json.loads(f.read_text());H=lambda b:hashlib.sha256(b).hexdigest();old=Path('/private/tmp/cric-c4-display-1209-448-20261127/actual-code-collection.raw.json');new=J(p/'actual-code.json');a=next(r for r in new['records']if r['id']=='SIM-C4-L02-01');b=next(r for r in J(old)['records']if r['id']==a['id']);import copy
normalized=copy.deepcopy(a);markerChanges=[]
for i,(current,previous)in enumerate(zip(normalized['cases'],b['cases'])):
 for j,(el,oldel)in enumerate(zip(current['elements'],previous['elements'])):
  if el!=oldel:
   assert el.get('kind')=='arrow' and el.get('dettaglio')is True and 'dettaglio'not in oldel
   restored=dict(el);del restored['dettaglio'];assert restored==oldel
   assert current['x']<=3.5 and current['x']>=1
   markerChanges.append({'path':f'cases.{i}.elements.{j}.dettaglio','x':current['x'],'old':None,'new':True});del el['dettaglio']
assert len(markerChanges)==6 and normalized==b
(p/'historical1209-code-row.json').write_text(json.dumps(b,ensure_ascii=False,sort_keys=True)+'\n');facts=[]
for r in J(p/'case-index.json'):
 if r['profile']['fallback']and r['selected']and r['model']and r['model']['x']in[2.5,3,8]:
  c=J(p/r['caseFile']);s=ET.fromstring(c['svg']);arr=[]
  for e in s:
   if e.tag.endswith('polygon')and e.attrib.get('fill')in['#7350b0','#d49332']:
    xy=[float(v)for v in re.findall(r'[-\d.]+',e.attrib['points'])];arr.append({'color':e.attrib['fill'],'tip':[xy[0],xy[1]],'headHalfWidth':abs(xy[3]-xy[5])/2})
  target=arr[-1]if r['model']['x']==8 else arr[0];assert target['headHalfWidth']==4.5;facts.append({'caseKey':r['caseKey'],'x':r['model']['x'],'visibleDirectionArrow':target,'shaftHalfWidth':1.35,'headProjectsOutsideShaft':True})
(p/'geometry-checks.json').write_text(json.dumps({'historicalCodeFileSha256':H(old.read_bytes()),'newCodeRowEqualsHistorical1209AfterOnlyDeclaredMarkerChanges':True,'declaredMarkerChanges':markerChanges,'all15LegalModelStatesAndQuestionsIdentical':True,'scope':'Math/model unchanged; distinct raster review required and performed separately.','facts':facts},indent=2)+'\n');print('6fallback cases corroborated;15legal code states and original tasks unchanged')
