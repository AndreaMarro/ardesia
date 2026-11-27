from pathlib import Path
from fractions import Fraction as F
import hashlib,json,re,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent;SRC=Path('/private/tmp/cric-c4-composed-448-20261127')
H=lambda b:hashlib.sha256(b).hexdigest();index=json.loads((D/'verified-case-index.json').read_text());rows=index['records'];selection=json.loads((D/'selected-canaries.json').read_text());log=json.loads((D/'reading-log.json').read_text())
assert len(selection['sheets'])==25 and all(s['read']for s in selection['sheets'])
for s in selection['sheets']:assert H((D/s['file']).read_bytes())==s['sha256']
for info in index['reports']:
 p=SRC/f'profiles-{info["slice"]}/attempt-01/actual/report.json';assert H(p.read_bytes())==info['sha256']
for r in rows:
 assert H((D/r['caseFile']).read_bytes())==r['caseSha256']
 for p in r['screenshots']:assert H((D/p['path']).read_bytes())==p['sha256']
# Both real questions in all eight profiles, checked against previous independent quantities.
tasks={'SIM-C4-L01-01':[F(6),F(4)],'SIM-C4-L01-02':[F(10),F(45,8)],'SIM-C4-L02-01':[F(10),F(18,5)],'SIM-C4-L02-02':[F(0),F(45,2)],'SIM-C4-L03-01':[F(9,2),F(9,5)]}
submissions=0
for r in rows:
 if not r['caseKey'].endswith('|setup'):continue
 case=json.loads((D/r['caseFile']).read_text());assert len(case['questions'])==2
 for q,expected in zip(case['questions'],tasks[r['id']],strict=True):
  assert F(q['input'])==expected and q['status'].startswith('Corretto. ')
  submissions+=1
facts=[]
for r in rows:
 if not r['profile']['fallback']or not r.get('model'):continue
 case=json.loads((D/r['caseFile']).read_text());svg=ET.fromstring(case['svg']);polygons=svg.findall('polygon');circles=svg.findall('circle');paths=svg.findall('path')
 if r['id']=='SIM-C4-L02-01'and r['model']['x']==8:
  polygon=polygons[-1];points=[[F(x)for x in p.split(',')]for p in polygon.attrib['points'].split()];tip=points[0];half=abs(points[1][1]-tip[1]);shaft=F(paths[-1].attrib['stroke-width'])/2
  width=r['screenshots'][0]['size'][0];wing=(half-shaft)*F(width,460)
  facts.append({'id':r['id'],'caseKey':r['caseKey'],'png':r['screenshots'][0],'exactPhysicalValue':'45/32 kN/C','headHalfWidthIntrinsic':str(half),'shaftHalfWidthIntrinsic':str(shaft),'wingBeyondShaftCSSPixels':str(wing),'wingBeyondShaftCSSPixelsApprox':float(wing),'observedRasterVerdict':'FAIL_DIRECTIONAL_HEAD_NOT_DISTINGUISHABLE_FROM_BAR','scope':'Actual full PNG read; numerical dimensions corroborate rather than substitute the raster judgment.'})
 if r['id']=='SIM-C4-L02-02'and r['model']['x']==-3:
  target=circles[1];cx=F(target.attrib['cx']);cy=F(target.attrib['cy']);radius=F(target.attrib['r']);tip=[F(v)for v in polygons[0].attrib['points'].split()[0].split(',')];d2=(tip[0]-cx)**2+(tip[1]-cy)**2;assert d2<radius**2
  facts.append({'id':r['id'],'caseKey':r['caseKey'],'png':r['screenshots'][0],'exactPhysicalValue':'90 kN/C','targetCircle':{'cx':str(cx),'cy':str(cy),'radius':str(radius)},'arrowTip':[str(x)for x in tip],'distanceSquared':str(d2),'radiusSquared':str(radius**2),'tipInsideSameColourCircle':True,'observedRasterVerdict':'FAIL_ARROW_TIP_MERGES_WITH_PURPLE_CHARGE','scope':'Partial visual fusion of the tip in 2D projection; not whole-arrow concealment and not a3Ddepth claim.'})
assert len(facts)==4
(D/'current-fallback-negative-facts.json').write_text(json.dumps(facts,indent=2,ensure_ascii=False)+'\n')
verdicts=[]
for id in index['scopedIds']:
 problems=[f for f in facts if f['id']==id]
 verdicts.append({'id':id,'recordsIntegrityAndScalarChecked':len([r for r in rows if r['id']==id]),'newPNGSourceFramesReadAsWholePanels':log['perIdWholePanels'][id],'rasterVerdict':'NEGATIVE_CURRENT_FALLBACK'if problems else'POSITIVE_OBSERVED_CANARIES_ONLY','unselectedFramesVisuallyCertified':False,'twoManualTasksExact':[str(x)for x in tasks[id]],'findings':[f['observedRasterVerdict']for f in problems],'activityCredit':0})
report={'schemaVersion':'1.0.0','role':'INDEPENDENT_RASTER_REVIEW','reviewer':'B','candidateAuthor':'Root','candidateCommit':'b9994b9116e87478905191d85cca8037d17ae4bd','runtimeSha256':index['runtime'],'reports':index['reports'],'recusal':{'authoredIdsExcluded':index['excludedAuthoredIds'],'reason':'B authored only the probe/polarity legend changes for these three separate IDs; no acceptance or verdict on them here.'},'disclosure':'Independent mathematics predates this candidate; current inputs and rasters are from four new112-case slices. No PNG/report or positive reused from the failed earlier epoch. B has no authorship of the five IDs here.','verifiedCurrentCases':280,'manualTaskSubmissionsChecked':submissions,'reading':log,'perId':verdicts,'currentNegativeCases':len(facts),'newChromeSessions':0,'sourceDirectoryWrites':0,'scientificApproval':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'independent-review.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps({'verifiedCases':280,'realQuestionSubmissions':submissions,'sourceFramesRead':122,'negativeFallbackCases':4,'verdicts':verdicts}))
