"""Independent full shaft/cone projected hull and label separation checks."""
from pathlib import Path
import json
import math
import sys


def project(v,c):
    m=c['sourceDerivedCamera']['matrixWorld'];p=c['sourceDerivedCamera']['projectionMatrix'];d=[v[i]-m[12+i]for i in range(3)]
    q=[sum(d[j]*m[4*i+j]for j in range(3))for i in range(3)]+[1];clip=[sum(p[4*j+i]*q[j]for j in range(4))for i in range(4)]
    return((1+clip[0]/clip[3])*c['canvas']['width']/2,(1-clip[1]/clip[3])*c['canvas']['height']/2)


def hull(points):
    points=sorted(set(points))
    def cross(a,b,c):return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    low=[];high=[]
    for p in points:
        while len(low)>=2 and cross(low[-2],low[-1],p)<=0:low.pop()
        low.append(p)
    for p in reversed(points):
        while len(high)>=2 and cross(high[-2],high[-1],p)<=0:high.pop()
        high.append(p)
    return low[:-1]+high[:-1]


def separation(poly,box):
    rect=[(box['x']+sx*box['w']/2,box['y']+sy*box['h']/2)for sx,sy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    axes=[(1,0),(0,1)]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        axis=(-(b[1]-a[1]),b[0]-a[0]);norm=math.hypot(*axis)
        if norm:axes.append(tuple(x/norm for x in axis))
    gap=-math.inf
    for axis in axes:
        a=[sum(p[i]*axis[i]for i in range(2))for p in poly];b=[sum(p[i]*axis[i]for i in range(2))for p in rect]
        gap=max(gap,min(b)-max(a),min(a)-max(b))
    return gap


def analyze(root):
    root=Path(root);report=json.loads((root/'report.json').read_bytes());results=[]
    for item in report['cases']:
        c=json.loads((root/item['file']).read_bytes())
        if c.get('interaction',{}).get('kind')!='grid':continue
        angle=c['interaction']['x'];refracted=math.asin(math.sin(math.radians(angle))/1.5)
        assert math.isclose(c['model']['y'],math.degrees(refracted),abs_tol=1e-12)
        arrows=[e for e in c['elements']if e['kind']=='arrow'];assert len(arrows)==2
        lengths=[math.dist(a['a'],a['b'])for a in arrows];assert all(math.isclose(n,1,abs_tol=1e-14)for n in lengths)
        assert arrows[0]['b']==arrows[1]['a']==[0,1.27,0]
        for e in c['elements']:
            assert not(e['kind']=='label'and e['text']=='Normale')
        entry={'caseKey':c['caseKey'],'angle':angle,'rayLengths':lengths,'thetaRefractedDegrees':c['model']['y'],'fullNativeParts':[],'fallback':c['profile']['fallback']}
        if not c['profile']['fallback']:
            assert len(c['nativeGlyphs'])==2
            minimum_y=math.inf
            for glyph in c['nativeGlyphs']:
                for part_index,part in enumerate(glyph['parts']):
                    assert part['primitive']=='closed32radialCylinderGeometry'
                    points=[project(v,c)for v in part['vertices']];poly=hull(points);minimum_y=min(minimum_y,min(v[1]for v in part['vertices']))
                    assert all(0<=p[0]<=c['canvas']['width']and 0<=p[1]<=c['canvas']['height']for p in points)
                    labels=[{'text':l['text'],'separatingAxisGapPixels':separation(poly,l['box'])}for l in c['labels']if l.get('box')]
                    assert all(l['separatingAxisGapPixels']>0 for l in labels),labels
                    entry['fullNativeParts'].append({'elementIndex':glyph['elementIndex'],'part':'shaft'if part_index==0 else'cone','actualUniqueFacetVertices':len(part['vertices']),'projectedHullVertices':len(poly),'labels':labels})
            # The sole scene body is explicitly transparent. The opaque tabletop
            # reaches y=0 and its four feet y=.006; all tested camera rays have
            # nonnegative y toward the camera, so cannot hit those below bodies.
            boxes=[e for e in c['elements']if e['kind']=='box'];assert len(boxes)==1 and boxes[0]['alpha']==.27
            assert minimum_y>.006;assert c['sourceDerivedCamera']['matrixWorld'][9]>=0
            entry['minimumFullGlyphWorldY']=minimum_y;entry['opaqueTableAndFeetMaxY']=.006
            entry['opaqueMeshClearanceArgument']='Whole convex shaft/cone geometry lies above every opaque physical mesh, and all tested camera rays toward the viewer have nonnegative y. Transparent medium alpha.27 remains intentional.'
        results.append(entry)
    assert len(results)==16
    return{'scope':'Sixteen actual states; full native32facet projected convex hulls clear remaining opaque label, viewports and opaque table/feet. Not arbitrary camera or full139 acceptance.','cases':results,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}

if __name__=='__main__':
    result=analyze(sys.argv[1]);Path(sys.argv[2]).write_text(json.dumps(result,indent=2)+'\n');print('actual states',len(result['cases']),'native parts',sum(len(c['fullNativeParts'])for c in result['cases']))
