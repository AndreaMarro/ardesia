from pathlib import Path
import json,math,hashlib
D=Path(__file__).resolve().parent;rows=json.loads((D/'eight-selected.json').read_text());out=[]
def project(p,c):
 M=c['sourceDerivedCamera']['matrixWorld'];P=c['sourceDerivedCamera']['projectionMatrix'];d=[p[i]-M[12+i]for i in range(3)]
 cam=[sum(M[4*j+i]*d[i]for i in range(3))for j in range(3)]+[1]
 clip=[sum(P[4*j+i]*cam[j]for j in range(4))for i in range(4)]
 return((clip[0]/clip[3]+1)*c['canvas']['width']/2,(1-clip[1]/clip[3])*c['canvas']['height']/2)
for r in rows:
 c=json.loads((D/r['file']).read_text());assert hashlib.sha256((D/r['file']).read_bytes()).hexdigest()==r['sha256']
 label=next(a for a in c['labels']if a['text']=='Sonda');b=label['box'];L,R,T,B=b['x']-b['w']/2,b['x']+b['w']/2,b['y']-b['h']/2,b['y']+b['h']/2
 glyph=max(c['nativeGlyphs'],key=lambda a:a['tipPixels']['y']);head=next(p for p in glyph['parts']if p['topRadius']==0)
 pts=[project(v,c)for v in head['vertices']];assert len(pts)==34
 tip=project(glyph['tip'],c);assert abs(tip[0]-glyph['tipPixels']['x'])<1e-9 and abs(tip[1]-glyph['tipPixels']['y'])<1e-9
 margins=[min(x-L,R-x,y-T,B-y)for x,y in pts];inside=sum(m>=0 for m in margins);bbox={'minX':min(x for x,y in pts),'maxX':max(x for x,y in pts),'minY':min(y for x,y in pts),'maxY':max(y for x,y in pts)}
 out.append({'caseKey':r['caseKey'],'actualModel':c['model'],'actualRequestedTime':c.get('requestedTime'),'labelRect':{'left':L,'right':R,'top':T,'bottom':B},'headVertices':len(pts),'headVerticesInsideSondaOpaqueRect':inside,'projectedHeadBBox':bbox,'minimumVertexInset':min(margins),'wholeProjectedHeadInsideOpaqueRect':inside==len(pts),'tipInsideOpaqueRect':L<=tip[0]<=R and T<=tip[1]<=B,'screenshot':c['screenshots'][0],'interpretation':'Projection of actual source32radial cone34vertices through recorded orthographic camera, crosschecked against actual tipPixels; actual PNG opened independently. Not a new complete campaign or GPU-state proof.'})
assert sum(x['wholeProjectedHeadInsideOpaqueRect']for x in out)==7
assert next(x for x in out if'L03-02|published|1280|'in x['caseKey']and x['caseKey'].endswith('grid|4'))['headVerticesInsideSondaOpaqueRect']<34
(D/'actual-head-projection.json').write_text(json.dumps({'cases':out,'headTopology':'34unique vertices of closed32radial cone, not34facets','sourceBrowserExitCode':1,'wholeProjectedHeadsCovered':7,'partialHeadCovered':1,'newBrowser':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN'},indent=2)+'\n');print(json.dumps([(x['caseKey'],x['headVerticesInsideSondaOpaqueRect'],x['minimumVertexInset'])for x in out]))
