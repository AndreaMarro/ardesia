from pathlib import Path
import json,math,hashlib,shutil
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');B=A/'editorial/reviews/work-axis-label-independent-7173-20261126';O=A/'output/playwright/work-axis-independent-7173-20261126'
def inverse(m):
 a=[[m[c*4+r]for c in range(4)]+[float(r==c)for c in range(4)]for r in range(4)]
 for i in range(4):
  pivot=max(range(i,4),key=lambda r:abs(a[r][i]));a[i],a[pivot]=a[pivot],a[i];d=a[i][i];assert d!=0;a[i]=[x/d for x in a[i]]
  for r in range(4):
   if r!=i:
    d=a[r][i];a[r]=[x-d*y for x,y in zip(a[r],a[i])]
 return [a[r][c+4]for c in range(4)for r in range(4)]
def mv(m,p):return [sum(m[c*4+r]*p[c]for c in range(4))for r in range(4)]
def project(p,cam,w,h):
 q=mv(cam['projectionMatrix'],mv(inverse(cam['matrixWorld']),list(p)+[1]));return [(q[0]/q[3]+1)*w/2,(1-q[1]/q[3])*h/2]
report=json.loads((O/'report.json').read_bytes());assert len(report['cases'])==40;assert all(x['technicalOk']for x in report['cases']);evidence=[]
for ref in report['cases']:
 raw=(O/ref['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==ref['sha256'];r=json.loads(raw)
 assert r['runtimeSha256']=='95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d'
 if 'nativeGlyphs'not in r:continue
 assert len(r['nativeGlyphs'])==2
 for g in r['nativeGlyphs']:
  assert len(g['parts'])==2;assert all(len(p['vertices'])>=64 for p in g['parts'])
  vs=[v for p in g['parts']for v in p['vertices']];ps=[project(v,r['sourceDerivedCamera'],r['canvas']['width'],r['canvas']['height'])for v in vs]
  box={'minX':min(p[0]for p in ps),'maxX':max(p[0]for p in ps),'minY':min(p[1]for p in ps),'maxY':max(p[1]for p in ps)}
  assert all(abs(box[k]-g['vertexViewportBounds'][k])<1e-9 for k in box)
  assert 0<box['minX']<box['maxX']<r['canvas']['width'];assert 0<box['minY']<box['maxY']<r['canvas']['height'];assert min(v[1]for v in vs)>0
  clear=[]
  for l in r['labels']:
   assert l['text']=='x';b=l['box'];x0=b['x']-b['w']/2;x1=b['x']+b['w']/2;y0=b['y']-b['h']/2;y1=b['y']+b['h']/2
   dx=max(x0-box['maxX'],box['minX']-x1,0);dy=max(y0-box['maxY'],box['minY']-y1,0);gap=math.hypot(dx,dy);assert gap>1
   clear.append({'text':l['text'],'conservativeWholeBodyAabbGapPixels':gap})
  evidence.append({'caseKey':r['caseKey'],'elementIndex':g['elementIndex'],'worldVertexCount':len(vs),'minimumWorldY':min(v[1]for v in vs),'viewportBounds':box,'labelClearances':clear,'scope':'Bounds of both complete closed32-facet parts from canonical source replay, independently projected. No claim of private GPU readback or zero self-overlap between the two arrows. Large label separation plus actual PNG review corroborates absence of the y-overlay.'})
assert len(evidence)==48
supp=O/'fallback-control-supplement';rr=json.loads((supp/'report.json').read_bytes());assert len(rr['cases'])==4 and all(c['technicalOk']for c in rr['cases']);findings=[]
for ref in rr['cases']:
 r=json.loads((supp/ref['file']).read_bytes())
 if 'actualViewControls'not in r:continue
 top=next(x for x in r['actualViewControls']if x['view']=='top');assert top['disabled'] is True and top['hidden'] is False;assert 'usa la vista Alto'in r['legend'];assert r['actualRenderer']=='Tavola di misura'
 findings.append({'caseKey':r['caseKey'],'width':r['profile']['width'],'legend':r['legend'],'controls':r['actualViewControls'],'help':r['actualHelp'],'screenshots':r['screenshots'],'finding':'Legend recommends unavailable disabled Alto control in actual WebGL-disabled fallback.'})
assert len(findings)==2
out={'schemaVersion':'1.0.0','candidateRef':'b38d8b8dd1dd3d69f558bbe8753d759084aa527f','deliveryRef':'7173a92ce980f102f0904175c90c0f7a150b2931','runtimeSha256':report['runtimeFingerprint']['sha256'],'canonical40ActualExitCode':0,'supplement4ActualExitCode':0,'independentFullBodyChecks':evidence,'actualFallbackFindings':findings,'verdict':'NOT_APPROVED_FALLBACK_INSTRUCTION_FINDING_OPEN','nativeTargetOverlayConclusion':'The removed y sprite no longer covers the target shafts/cones in the observed profiles. Original coincident or end-on projections remain and are explicitly not treated as two separately readable complete vectors.','scopeLimit':'40 canonical cases plus4 control observations of one source/published v1 ID; not approval of all vector IDs or of any proposed future common fix. No target DRAFT exists.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(B/'independent-analysis.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');shutil.copy2(__file__,B/'analyze-independent.py');shutil.copy2('/private/tmp/cric-work-axis-independent-a-ui-app/independent-geometry-a.mjs',B/'independent-geometry-a.mjs')
print(json.dumps({'canonicalCases':40,'supplementCases':4,'fullGlyphBodies':48,'minimumLabelClearancePixels':min(x['conservativeWholeBodyAabbGapPixels']for e in evidence for x in e['labelClearances']),'minimumGeometryY':min(e['minimumWorldY']for e in evidence),'fallbackFindings':2,'verdict':out['verdict']}))
