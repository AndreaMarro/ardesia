from pathlib import Path
import subprocess,json,hashlib,time,math,xml.etree.ElementTree as ET,re
D=Path(__file__).resolve().parent
start=time.monotonic()
with(D/'actual-independent-red.txt').open('w')as out:
    test=subprocess.run(['python3','-B',str(D/'test_canary.py')],stdout=out,stderr=subprocess.STDOUT)
receipt={'observedExitCode':test.returncode,'durationSeconds':time.monotonic()-start,
         'testModuleSha256':hashlib.sha256((D/'test_canary.py').read_bytes()).hexdigest(),
         'rawSha256':hashlib.sha256((D/'actual-independent-red.txt').read_bytes()).hexdigest(),
         'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(D/'actual-test-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n')
rows=[]
for entry in json.loads((D/'actual-browser/report.json').read_text())['cases']:
    c=json.loads((D/'actual-browser'/entry['file']).read_text())
    if 'model'not in c:continue
    row={'caseKey':entry['caseKey'],'profile':c['profile'],'input':c['sourceReplayedX'],
         'field':c['model']['y'],'unit':'kN/C','legend':c['legend'],'screenshots':c['screenshots']}
    if c['profile']['fallback']:
        children=list(ET.fromstring(c['svg']));heads=[]
        for i,p in enumerate(children[:-1]):
            if p.tag.rsplit('}',1)[-1]!='path'or p.get('stroke')!='#147979':continue
            poly=children[i+1]
            if poly.tag.rsplit('}',1)[-1]!='polygon':continue
            a,b,x,y=map(float,re.findall(r'-?\d+(?:\.\d+)?',p.get('d')));length=math.hypot(x-a,y-b)
            pts=[tuple(map(float,q.split(',')))for q in poly.get('points').split()]
            half=max(abs((px-x)*(y-b)-(py-y)*(x-a))/length for px,py in pts)
            heads.append({'axisIntrinsic':length,'headHalfWidthIntrinsic':half,'shaftHalfWidthIntrinsic':float(p.get('stroke-width'))/2,
                          'headFullyWithinShaftStroke':half<=float(p.get('stroke-width'))/2,'sourcePath':p.attrib,'sourcePolygon':poly.attrib})
        row['fallbackHeads']=heads
    else:
        ball=next(e for e in c['elements']if e['kind']=='ball'and e.get('r')==.09)
        heads=[]
        for g in c.get('nativeGlyphs',[]):
            points=g['parts'][1]['vertices'];dist=[math.dist(p,ball['p'])for p in points]
            heads.append({'vertices':len(points),'verticesInsideAnalyticProbeSphere':sum(d<ball['r']for d in dist),
                          'minRadius':min(dist),'maxRadius':max(dist),'probeRadius':ball['r'],
                          'scope':'Source-derived analytic sphere intersection, not actual faceted-mesh occlusion certification; raster read separately.'})
        row['nativeHeadAnalyticIntersection']=heads
    rows.append(row)
(D/'actual-head-and-legend-census.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt))
# Preserve the real negative as the process outcome.
raise SystemExit(test.returncode)
