"""Test-only reconstruction of the frozen1a arrow geometry. No acceptance gate."""
import math

def add(a,b):return [a[i]+b[i]for i in range(3)]
def mul(a,k):return [x*k for x in a]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def arrow_geometry(element):
 a=element['a'];b=element['b'];d=[b[i]-a[i]for i in range(3)];length=math.sqrt(dot(d,d))
 if not math.isfinite(length)or length<.012:raise ValueError('Native arrow omitted or nonfinite; never manufacture a glyph')
 u=mul(d,1/length);head=min(.24,length*.32);joint=add(b,mul(u,-head))
 # The same minimal rotation as Three Quaternion.setFromUnitVectors(+y,u).
 if 1+u[1]<2.220446049250313e-16:q=[0,0,1,0]
 else:
  q=[u[2],0,-u[0],1+u[1]];norm=math.sqrt(sum(x*x for x in q));q=[x/norm for x in q]
 def rotate(p):
  xyz=q[:3];t=mul(cross(xyz,p),2)
  return add(p,add(mul(t,q[3]),cross(xyz,t)))
 def ring(center,r):return [add(center,rotate([r*math.sin(2*math.pi*i/32),0,r*math.cos(2*math.pi*i/32)]))for i in range(32)]
 return {'tail':a,'tip':b,'delta':d,'length':length,'axis':u,'joint':joint,'headLength':head,
 'shaftRadius':.028,'coneBaseRadius':.028*2.9,'nativeRadialSegments':32,
 'tailCapRim':ring(a,.028),'shaftJointRim':ring(joint,.028),'coneBaseRim':ring(joint,.028*2.9),
 'shaftSolid':'closed cylinder tail..joint;32radial facets and both caps',
 'coneSolid':'closed cone joint..tip;32rim-to-tip triangles plus base cap',
 'continuousEnvelope':'all azimuths around axis; conservative outer surface, intersection alone does NOT prove native faceted-mesh occlusion',
 'material':{'opacity':1,'transparent':False,'depthTest':True,'depthWrite':True,'side':'DoubleSide'},
 'visibilityJudgment':'NOT_RUN; complete geometry is not a camera/overlay proof'}

def point_strictly_inside_box(point,center,size):
 return all(abs(point[i]-center[i])<size[i]/2 for i in range(3))
