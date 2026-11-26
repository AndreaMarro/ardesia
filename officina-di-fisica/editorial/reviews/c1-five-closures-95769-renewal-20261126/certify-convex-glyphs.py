"""Exact separating-plane certificates for complete convex source glyph meshes.

A plane separates every32facet mesh vertex from an opaque convex superset,
and its normal has nonnegative dot with the orthographic viewer ray. Thus the
entire convex mesh and every ray from every face stay outside that body. All
predicates use exact Fractions of the actual observed binary64 values. This
certifies the source geometry, not arbitrary camera/rasterization properties.
"""
from fractions import Fraction as F
from pathlib import Path
import json,math,sys

def rat(x):return F.from_float(x)if isinstance(x,float)else F(x)
def vec(x):return tuple(map(rat,x))
def add(a,b):return tuple(x+y for x,y in zip(a,b))
def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def neg(a):return tuple(-x for x in a)
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def cross(a,b):return(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def project_perp(a,d):return cross(d,cross(a,d))
def center(e):return vec(e['p'])if'p'in e else tuple((a+b)/2 for a,b in zip(vec(e['a']),vec(e['b'])))
def certificate(vertices,ray,e,tail):
    ps=[vec(v)for v in vertices];cp=center(e);dif=sub(vec(tail),cp);average=tuple(sum(v[i]for v in ps)/len(ps)for i in range(3));middle=sub(average,cp)
    units=[(F(1),F(0),F(0)),(F(0),F(1),F(0)),(F(0),F(0),F(1))]
    axes=[*units,dif,middle,project_perp(dif,ray),project_perp(middle,ray)]
    if e['kind']=='rod':
        a=sub(vec(e['b']),vec(e['a']));axes +=[a,cross(a,ray),project_perp(a,ray)]
    candidates=[]
    for u in axes:
        if not dot(u,u):continue
        for n in [u,neg(u)]:
            if dot(n,ray)<0:continue
            nf=tuple(map(float,n));length=math.sqrt(sum(x*x for x in nf));projected=[sum(nf[i]*(float(p[i])-float(cp[i]))for i in range(3))for p in ps];m=min(projected)
            if e['kind']=='ball':support=e['r']*length
            elif e['kind']=='box':support=sum(abs(nf[i])*e['size'][i]/2 for i in range(3))
            else:
                axis=sub(vec(e['b']),vec(e['a']));af=tuple(map(float,axis));axis2=sum(x*x for x in af);support=abs(sum(nf[i]*af[i]for i in range(3)))/2+max(e['r'],e.get('r2',e['r']))*math.sqrt(max(0,length*length-sum(nf[i]*af[i]for i in range(3))**2/axis2))
            if m-support<=1e-12*length:continue
            minP=min(dot(n,sub(p,cp))for p in ps);n2=dot(n,n)
            if e['kind']=='ball':valid=minP>0 and minP*minP>rat(e['r'])**2*n2
            elif e['kind']=='box':valid=minP>sum(abs(n[i])*rat(e['size'][i])/2 for i in range(3))
            else:
                axis=sub(vec(e['b']),vec(e['a']));axis2=dot(axis,axis);free=minP-abs(dot(n,axis))/2;valid=free>0 and free*free>rat(max(e['r'],e.get('r2',e['r'])))**2*(n2-dot(n,axis)**2/axis2)
            if valid:return{'exactPlaneNormal':[str(x)for x in n],'exactViewerRayDot':str(dot(n,ray)),'minimumSourceClearanceWorldUnits':(m-support)/length,'bodyKind':e['kind'],'wholeConvexMeshAndAllForwardRaysSeparated':True}
    return None

def analyze(root):
    root=Path(root);r=json.loads((root/'report.json').read_bytes());proof=[];unresolved=[]
    for entry in r['cases']:
        c=json.loads((root/entry['file']).read_bytes())
        if c.get('interaction')is None or c['profile']['fallback']:continue
        ray=vec([c['sourceDerivedCamera']['matrixWorld'][i]for i in [8,9,10]])
        physical=[(i,e)for i,e in enumerate(c['elements'])if e['kind']in('ball','box','rod')and e.get('alpha',1)>=1]
        for g in c['nativeGlyphs']:
            for partIndex,part in enumerate(g['parts']):
                points=part['vertices'];certs=[]
                for index,e in physical:
                    cert=certificate(points,ray,e,g['tail'])
                    if cert:certs.append({'opaqueElementIndex':index,**cert})
                    else:unresolved.append({'caseKey':c['caseKey'],'elementIndex':g['elementIndex'],'partIndex':partIndex,'opaqueElementIndex':index,'opaqueBody':e})
                minimumY=min(v[1]for v in points);base=min(vec(v)[1]for v in points)>rat(.006)and ray[1]>=0
                if not base:unresolved.append({'caseKey':c['caseKey'],'elementIndex':g['elementIndex'],'partIndex':partIndex,'reason':'Opaque table/feet separation missing'})
                proof.append({'caseKey':c['caseKey'],'elementIndex':g['elementIndex'],'partIndex':partIndex,'certificates':certs,'opaqueTableAndFeetMaxY':.006,'minimumGlyphY':minimumY,'tableAndFeetWholeMeshSeparated':base})
    return{'predicate':'Exact rational separating-plane proof for full convex32facet shaft/cone source geometry and forward orthographic camera-ray extrusion; no vertex-only sampling inference','parts':proof,'unresolved':unresolved,'scope':'Observed native source geometry for fiveIDs; remaining thin guide/path lines, deliberate inter-vector overlap and rasterization are not claimed mesh-occlusion-free. No arbitrary camera guarantee.','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':
    result=analyze(sys.argv[1]);Path(sys.argv[2]).write_text(json.dumps(result,separators=(',',':'))+'\n');print('parts',len(result['parts']),'unresolved',len(result['unresolved']))
