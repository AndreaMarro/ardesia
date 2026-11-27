"""Exact recorded-decimal silhouette/rectangle intersection, not GPU depth readback.

Vertex counts alone do not quantify the covered projected cone surface.
"""
from fractions import Fraction as Q
import json


def exact(value):
    if type(value) is int or isinstance(value, Q):
        return Q(value)
    raise ValueError('An exact integer or recorded-decimal Fraction is required')


def load_exact(raw):
    def forbidden(value):
        raise ValueError('Nonfinite JSON constant: '+value)
    return json.loads(raw, parse_float=Q, parse_int=Q, parse_constant=forbidden)


def project(point, case):
    m=list(map(exact,case['sourceDerivedCamera']['matrixWorld']))
    q=list(map(exact,case['sourceDerivedCamera']['projectionMatrix']))
    if len(m)!=16 or len(q)!=16 or q[15]!=1 or any(q[i]!=0 for i in (3,7,11)):
        raise ValueError('Recorded orthographic projection required')
    width,height=(exact(case['canvas'][k])for k in ('width','height'))
    if min(width,height)<=0:raise ValueError('Positive canvas required')
    v=[exact(point[i])-m[12+i]for i in range(3)]
    return ((1+q[0]*sum(m[i]*v[i]for i in range(3)))*width/2,
            (1-q[5]*sum(m[4+i]*v[i]for i in range(3)))*height/2)


def hull(points):
    points=sorted(set(tuple(map(exact,p))for p in points))
    if len(points)<3:return points
    cross=lambda o,a,b:(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[];up=[]
    for p in points:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
        lo.append(p)
    for p in reversed(points):
        while len(up)>=2 and cross(up[-2],up[-1],p)<=0:up.pop()
        up.append(p)
    return lo[:-1]+up[:-1]


def clip(poly, box):
    box={k:exact(box[k])for k in ('x','y','w','h')}
    if min(box['w'],box['h'])<=0:raise ValueError('Positive rectangle required')
    poly=[tuple(map(exact,p))for p in poly]
    for axis,bound,sign in [(0,box['x']-box['w']/2,1),(0,box['x']+box['w']/2,-1),
                            (1,box['y']-box['h']/2,1),(1,box['y']+box['h']/2,-1)]:
        if not poly:break
        previous=poly[-1];inside=lambda p:sign*(p[axis]-bound)>=0;out=[]
        for p in poly:
            if inside(p)!=inside(previous):
                t=(bound-previous[axis])/(p[axis]-previous[axis])
                out.append(tuple(previous[i]+t*(p[i]-previous[i])for i in range(2)))
            if inside(p):out.append(p)
            previous=p
        poly=out
    return poly


def area(poly):
    return abs(sum((a[0]*b[1]-b[0]*a[1]for a,b in zip(poly,poly[1:]+poly[:1])),Q(0)))/2 if poly else Q(0)


def part_coverage(case, element_index, part_index, label_text):
    if case['profile']['fallback']:raise ValueError('Native projected parts only')
    glyph=next(g for g in case['nativeGlyphs']if g['elementIndex']==element_index)
    label=next(l for l in case['labels']if l['text']==label_text)
    points=[project(p,case)for p in glyph['parts'][part_index]['vertices']]
    poly=hull(points);total=area(poly)
    if total<=0:raise ValueError('A nonzero projected silhouette is required')
    covered=area(clip(poly,label['box']))
    return covered/total


def middle_control_cone_inside_probe(control):
    """Source-predicted containment in intrinsic scene units, not a new UI case.

    The source maps v2=x/4 and renders a .8*v2 arrow from x=.44;
    its maximum cone radius .028*2.9 is less than the metal radius .088.
    """
    x=exact(control)
    if x<=0 or x>5:raise ValueError('Positive legal Pitot control required')
    length=Q(4,5)*x/4
    tip=Q(11,25)+length
    joint=tip-min(Q(6,25),length*Q(8,25))
    return {'jointX':joint,'tipX':tip,'coneMaximumRadius':Q(203,2500),
            'metalRadius':Q(11,125),
            'insideOpaqueMetalCylinder':Q(51,50)<=joint<=tip<=Q(7,5) and Q(203,2500)<Q(11,125)}
