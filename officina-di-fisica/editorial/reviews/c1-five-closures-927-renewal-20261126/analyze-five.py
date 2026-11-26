"""Independent bounded whole-glyph geometry, opaque physical mesh and label checks."""
from pathlib import Path
import json,math,sys,importlib.util
src=Path(__file__).with_name('hull-geometry.py')
spec=importlib.util.spec_from_file_location('hull_review',src);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
def sub(a,b):return [x-y for x,y in zip(a,b)]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def norm(a):return math.sqrt(dot(a,a))
def ray_sphere(o,d,p,r):
 q=sub(o,p);b=dot(q,d);disc=b*b-dot(q,q)+r*r
 if disc<0:return False
 near=-b-math.sqrt(disc);far=-b+math.sqrt(disc)
 return far>1e-7 and (near>1e-7 or dot(q,q)<r*r-1e-10)
def ray_box(o,d,p,size):
 lo=0;hi=math.inf
 for i in range(3):
  a=p[i]-size[i]/2;b=p[i]+size[i]/2
  if abs(d[i])<1e-12:
   if not a<=o[i]<=b:return False
  else:
   t=sorted([(a-o[i])/d[i],(b-o[i])/d[i]]);lo=max(lo,t[0]);hi=min(hi,t[1])
   if hi<lo:return False
 return hi>1e-7 and hi>=lo
# Finite closed cylinder: analytic side quadratic and both end disks.
def ray_cylinder(o,d,a,b,r):
 axis=sub(b,a);length=norm(axis)
 if length<1e-12:return ray_sphere(o,d,a,r)
 u=[x/length for x in axis];q=sub(o,a);du=dot(d,u);qu=dot(q,u)
 dp=[d[i]-du*u[i]for i in range(3)];qp=[q[i]-qu*u[i]for i in range(3)]
 A=dot(dp,dp);B=2*dot(dp,qp);C=dot(qp,qp)-r*r
 if A>1e-20:
  disc=B*B-4*A*C
  if disc>=0:
   for t in [(-B-math.sqrt(disc))/(2*A),(-B+math.sqrt(disc))/(2*A)]:
    if t>1e-7 and 0<=qu+t*du<=length:return True
 if abs(du)>1e-12:
  for height in [0,length]:
   t=(height-qu)/du
   if t>1e-7 and dot([qp[i]+t*dp[i]for i in range(3)],[qp[i]+t*dp[i]for i in range(3)])<=r*r:return True
 return False
def analyze(root):
 root=Path(root);report=json.loads((root/'report.json').read_bytes());results=[];issues=[]
 for item in report['cases']:
  c=json.loads((root/item['file']).read_bytes())
  if not c.get('technicalOk')or 'interaction'not in c:continue
  entry={'caseKey':c['caseKey'],'fallback':c['profile']['fallback'],'fullNativeParts':[]}
  if not entry['fallback']:
   camera=c['sourceDerivedCamera'];m=camera['matrixWorld'];d=[m[i]for i in [8,9,10]];n=norm(d);d=[x/n for x in d]
   physical=[e for e in c['elements']if e['kind']in('ball','box','rod')and e.get('alpha',1)>=1]
   for g in c['nativeGlyphs']:
    for index,part in enumerate(g['parts']):
     projected=[h.project(v,c)for v in part['vertices']];poly=h.hull(projected)
     labels=[{'text':l['text'],'gapPixels':h.separation(poly,l['box'])}for l in c['labels']if l.get('box')]
     bounds={'minX':min(p[0]for p in projected),'maxX':max(p[0]for p in projected),'minY':min(p[1]for p in projected),'maxY':max(p[1]for p in projected)}
     hits=[]
     for j,e in enumerate(physical):
      hit=[]
      for k,v in enumerate(part['vertices']):
       test=ray_sphere(v,d,e['p'],e['r'])if e['kind']=='ball'else ray_box(v,d,e['p'],e['size'])if e['kind']=='box'else ray_cylinder(v,d,e['a'],e['b'],max(e['r'],e.get('r2',e['r'])))
       if test:hit.append(k)
      if hit:hits.append({'physicalIndex':j,'kind':e['kind'],'sampleVertexIndices':hit,'primitive':e})
     p={'elementIndex':g['elementIndex'],'part':'shaft'if index==0 else'cone','closed32facetUniqueVertices':len(part['vertices']),'viewportBounds':bounds,'labelProjectedHullGaps':labels,'opaquePhysicalMeshRayHits':hits}
     entry['fullNativeParts'].append(p)
     if hits or any(l['gapPixels']<=0 for l in labels)or bounds['minX']<0 or bounds['maxX']>c['canvas']['width']or bounds['minY']<0 or bounds['maxY']>c['canvas']['height']:issues.append({'caseKey':c['caseKey'],**p})
  results.append(entry)
 return{'scope':'Actual source-replayed native closed32facet vertices and convex projected label hull; analytic sphere/box/finite cylinder rays at all unique facet vertices. Cylinder radius uses conservative max of end radii. Physical inter-vector coincidence/end-on projection and thin path lines are separate interpretation, not auto-failure. No arbitrary camera or all-surface GPU proof.','cases':results,'observationsRequiringReview':issues,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':
 r=analyze(sys.argv[1]);Path(sys.argv[2]).write_text(json.dumps(r,indent=2)+'\n');print('states',len(r['cases']),'geometry observations',len(r['observationsRequiringReview']))
