from pathlib import Path
import json,hashlib,math,shutil
from PIL import Image,ImageDraw
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/native-vector-six-cb9-independent-renewal-20261127';O=A/'output/playwright/native-vector-six-cb9-independent-renewal-20261127';sha=lambda b:hashlib.sha256(b).hexdigest()
def inverse(m):
 a=[[m[c*4+r]for c in range(4)]+[float(r==c)for c in range(4)]for r in range(4)]
 for i in range(4):
  pivot=max(range(i,4),key=lambda r:abs(a[r][i]));a[i],a[pivot]=a[pivot],a[i];z=a[i][i];assert z;a[i]=[v/z for v in a[i]]
  for j in range(4):
   if j!=i:z=a[j][i];a[j]=[v-z*u for v,u in zip(a[j],a[i])]
 return[a[r][c+4]for c in range(4)for r in range(4)]
def mv(m,p):return[sum(m[c*4+r]*p[c]for c in range(4))for r in range(4)]
def project(v,c):
 q=mv(c['sourceDerivedCamera']['projectionMatrix'],mv(inverse(c['sourceDerivedCamera']['matrixWorld']),list(v)+[1]));return((1+q[0]/q[3])*c['canvas']['width']/2,(1-q[1]/q[3])*c['canvas']['height']/2)
def hull(ps):
 ps=sorted(set(ps));cross=lambda a,b,c:(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);lo=[];hi=[]
 for p in ps:
  while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in reversed(ps):
  while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return lo[:-1]+hi[:-1]
def separation(poly,b):
 corners=[(b['x']+dx*b['w']/2,b['y']+dy*b['h']/2)for dx,dy in[(-1,-1),(1,-1),(1,1),(-1,1)]];axes=[(1,0),(0,1)]
 for p,q in zip(poly,poly[1:]+poly[:1]):
  v=(-(q[1]-p[1]),q[0]-p[0]);l=math.hypot(*v)
  if l:axes.append((v[0]/l,v[1]/l))
 gaps=[]
 for axis in axes:
  a=[p[0]*axis[0]+p[1]*axis[1]for p in poly];c=[p[0]*axis[0]+p[1]*axis[1]for p in corners];gaps.append(max(min(a)-max(c),min(c)-max(a)))
 return max(gaps)
r=json.loads((O/'report.json').read_bytes());receipt=json.loads((O/'terminal-receipt.json').read_bytes());assert receipt['observedExitCode']==0 and receipt['error']is None;assert len(r['cases'])==264;assert all(c['technicalOk']for c in r['cases']);cases=[];parts=[];fallback=[];ids=set()
for item in r['cases']:
 raw=(O/item['file']).read_bytes();assert sha(raw)==item['sha256'];c=json.loads(raw);ids.add(c['id']);assert c['runtimeSha256']=='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
 for s in c['screenshots']:assert sha((O/s['file']).read_bytes())==s['sha256']
 if c.get('interaction',{}).get('kind')!='grid':continue
 assert c['legendLayout']['visible'];assert c['legendLayout']['scrollWidth']<=c['legendLayout']['width']+1;assert 'Nella tavola 2D'in c['legend']and 'letture numeriche'in c['legend'];assert 'usa la vista Alto'not in c['legend'];assert not any(e['kind']=='label'and e['text']=='y'for e in c['elements']);assert len([e for e in c['elements']if e['kind']=='line'])>=2
 for view in ['orbit','side','top']:assert next(e for e in c['viewControls']if e['view']==view)['disabled']==c['profile']['fallback']
 assert not next(e for e in c['viewControls']if e['view']=='diagram')['disabled']
 if c['profile']['fallback']:fallback.append({'caseKey':c['caseKey'],'legend':c['legend'],'viewControls':c['viewControls'],'actualControls':c['actualDOMControls']})
 else:
  assert c['spec']['height']==6
  for glyph in c['nativeGlyphs']:
   assert len(glyph['parts'])==2
   for i,p in enumerate(glyph['parts']):
    assert p['primitive']=='closed32radialCylinderGeometry';assert len(p['vertices'])>= (64 if i==0 else 33);projected=[project(v,c)for v in p['vertices']];poly=hull(projected);assert len(poly)>=3;assert all(0<=x<=c['canvas']['width']and 0<=y<=c['canvas']['height']for x,y in projected)
    clear=[{'text':label['text'],'gapPixels':separation(poly,label['box'])}for label in c['labels']if label.get('box')];assert all(x['gapPixels']>0 for x in clear),[c['caseKey'],clear]
    parts.append({'caseKey':c['caseKey'],'elementIndex':glyph['elementIndex'],'part':'shaft'if i==0 else'cone','uniqueVertices':len(p['vertices']),'hullPoints':len(poly),'minimumWorldY':min(v[1]for v in p['vertices']),'labelSeparation':clear,'frameMarginPixels':min(min(x,c['canvas']['width']-x,y,c['canvas']['height']-y)for x,y in projected)})
 cases.append(c)
assert len(ids)==6 and len(cases)==200 and len(fallback)==50
out={'schemaVersion':'1.0.0','actualUIExit':0,'actualCases':264,'observedGridStates':len(cases),'nativeParts':len(parts),'fallbackStates':len(fallback),'completeSourceIds':sorted(ids),'minimumFullBodyFrameMarginPixels':min(x['frameMarginPixels']for x in parts),'minimumFullBodyLabelGapPixels':min(l['gapPixels']for x in parts for l in x['labelSeparation']),'scope':'Independent inverse-matrix projection and convex-hull/SAT comparison of both complete32-facet shaft/cone parts acquired by source replay. Observed GPU PNGs are complementary; vertices are not a GPU buffer readback. Collinear/edge-on vectors are not claimed separately distinguishable.','parts':parts,'fallback':fallback,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(D/'actual-independent-ui-geometry.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
# All200 complete apparatus images remain verbatim. Contact sheets retain each
# entire canvas, without clipping glyphs. They do not prove full-page pixels.
P=D/'contact-sheets';P.mkdir(exist_ok=True);entries=[]
for identity in sorted({(c['id'],c['variant'],c['profile']['width'])for c in cases}):
 group=[c for c in cases if(c['id'],c['variant'],c['profile']['width'])==identity];cols=4;w=320;h=220;sheet=Image.new('RGB',(cols*w,math.ceil(len(group)/cols)*h),'white');draw=ImageDraw.Draw(sheet)
 for n,c in enumerate(sorted(group,key=lambda c:(c['profile']['view'],c['interaction']['index']))):
  image=Image.open(O/c['screenshots'][0]['file']).convert('RGB');image.thumbnail((w,h-28));left=(n%cols)*w+(w-image.width)//2;top=(n//cols)*h+27;sheet.paste(image,(left,top));draw.text(((n%cols)*w+4,(n//cols)*h+3),c['profile']['view']+'; x='+str(c['interaction']['x']),fill='black')
 name='-'.join(map(str,identity))+'.png';sheet.save(P/name);entries.append({'file':name,'caseKeys':[c['caseKey']for c in group],'imageScope':'Entire apparatus canvases, uniformly reduced only, not full page/HTML pixels','sha256':sha((P/name).read_bytes())})
(P/'index.json').write_text(json.dumps(entries,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items()if k not in['parts','fallback']}));print('contactSheets',len(entries))
