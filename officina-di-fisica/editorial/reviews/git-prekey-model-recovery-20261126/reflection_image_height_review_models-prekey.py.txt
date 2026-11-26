"""Independent U7-03 models derived from prompt-only primary d5f076f2.

No candidate, authoring or opposite-primary imports. Degree readings are
unwrapped directions with a common zero; image heights are values in cm.
"""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d'
SOURCE_SHA256='6db63e941006bc0ceed36d502c46b1d48d814a82c12874e6121e37c3d25a904e'
def finite_exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric objects required before cast')
    values=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in values):raise ValueError('Finite real exact data required')
    return values

def positive(*values):
    values=finite_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Positive finite exact data required')
    return values

def calibrate(xa,xb,da,db):
    xa,xb=positive(xa,xb);da,db=finite_exact(da,db)
    if xa==xb:raise ValueError('Distinct physical reference outputs required')
    gain=(db-da)/(xb-xa)
    if gain<=0:raise ValueError('Positive calibration gain required')
    return gain,da-gain*xa

def mirror_direction(phi,alpha):
    phi,alpha=positive(phi,alpha)
    if not alpha<phi<90:raise ValueError('Require 0<alpha<phi<90 degrees')
    return 2*phi-alpha

def mirror_plane(beta,alpha):
    beta,alpha=positive(beta,alpha);phi=(beta+alpha)/2
    if mirror_direction(phi,alpha)!=beta:raise ValueError('Inverse direction inconsistent')
    return phi

def mirror_incident(beta,phi):
    beta,phi=positive(beta,phi);alpha=2*phi-beta
    if mirror_direction(phi,alpha)!=beta:raise ValueError('Inverse incidence inconsistent')
    return alpha

def height_modulus(ho,p):
    ho,p=positive(ho,p)
    if p<=2:raise ValueError('Require real object beyond fixed focus2cm')
    return 2*ho/(p-2)

def object_height(height,p):
    height,p=positive(height,p)
    if p<=2:raise ValueError('Require real object beyond fixed focus2cm')
    return height*(p-2)/2

def object_distance(height,ho):
    height,ho=positive(height,ho)
    return 2+2*ho/height

def image_distance(p):
    p,=positive(p)
    if p<=2:raise ValueError('Require p>2cm for real image')
    return 2*p/(p-2)

def primary_only_derivations():
    phi,alpha=sp.symbols('phi alpha',real=True)
    vector=sp.Matrix([sp.cos(alpha),sp.sin(alpha)])
    reflection=sp.Matrix([[sp.cos(2*phi),sp.sin(2*phi)],[sp.sin(2*phi),-sp.cos(2*phi)]])
    outvector=reflection*vector
    assert all(sp.trigsimp(a-b)==0 for a,b in zip(outvector,[sp.cos(2*phi-alpha),sp.sin(2*phi-alpha)]))
    assert reflection.det().simplify()==-1
    assert (reflection.T*reflection-sp.eye(2)).applyfunc(sp.trigsimp)==sp.zeros(2)
    x,y,h,p,k1,k2=sp.symbols('x y h p k1 k2',positive=True)
    assert sp.solve(sp.Eq(y,2*x-h),x)[0]==(y+h)/2
    assert sp.solve(sp.Eq(y,2*h/(p-2)),h)[0]==y*(p-2)/2
    assert sp.solve(sp.Eq(y,2*h/(p-2)),p)[0]==2+2*h/y
    assert sp.cancel((2*k1*h/(k2*p-2))/(2*h/(p-2))-k1*(p-2)/(k2*p-2))==0
    a,b=mirror_direction(45,30),mirror_direction(60,15);g,o=calibrate(a,b,121,211)
    out={261:{1:a,2:'angle in degrees or radians,not a sine',3:'Angles from the same normal are equal',4:(a,mirror_direction(60,30)),5:mirror_plane(60,30),6:mirror_incident(60,45),7:mirror_direction(45,15)/a,8:120-a,9:(sp.Symbol('beta')+alpha)/2,10:(2*k1*phi-k2*alpha)/(2*phi-alpha),11:b/a,12:(a+b)/2,13:mirror_incident(sp.Rational(7,4)*a,60)/30,14:mirror_plane(315/sp.Integer(3),15),15:mirror_plane((181-o)/g,30),16:sp.Integer(60)/2}}
    a,b=height_modulus(1,4),height_modulus(2,3);g,o=calibrate(a,b,3,9)
    out[262]={1:a,2:'length in centimeters',3:2*h/(p-2),4:(a,height_modulus(2,4)),5:object_height(1,4),6:object_distance(1,1),7:height_modulus(1,6)/a,8:2-a,9:y*(p-2)/2,10:k1*(p-2)/(k2*p-2),11:b/a,12:(a+b)/2,13:object_distance(4*a,2)/4,14:object_height(12/sp.Integer(3),3),15:object_height((5-o)/g,4),16:sp.Integer(4)}
    expected={261:[60,45,30,sp.Rational(5,4),60,sp.Rational(7,4),sp.Rational(165,2),sp.Rational(1,2),60,60,30],262:[1,1,4,sp.Rational(1,2),1,4,sp.Rational(5,2),sp.Rational(3,4),2,2,4]}
    for n in out:assert [out[n][i]for i in[1,5,6,7,8,11,12,13,14,15,16]]==expected[n],n
    assert mirror_direction(sp.Rational(105,2),sp.Rational(45,2))==out[261][12]
    assert out[262][12]-height_modulus(sp.Rational(3,2),sp.Rational(7,2))==sp.Rational(1,2)
    assert height_modulus(1,4)==1 and image_distance(4)==4
    assert sp.solve(sp.Eq(p/(2*(p-2)),1),p)==[4]
    # At the prescribed example, unit propagation vectors mirror about45deg.
    incident=sp.Matrix([sp.sqrt(3)/2,sp.Rational(1,2)])
    assert sp.Matrix([[0,1],[1,0]])*incident==sp.Matrix([sp.Rational(1,2),sp.sqrt(3)/2])
    # Physical dimensions: f*h/(p-f) is a height; all numerical helpers use cm.
    Q=SI.Quantity
    assert(Q(2,'centimeter')*Q(1,'centimeter')/Q(2,'centimeter')).to('centimeter').magnitude==1
    assert(Q(60,'degree')/Q(30,'degree')).to('').magnitude==2
    return out
