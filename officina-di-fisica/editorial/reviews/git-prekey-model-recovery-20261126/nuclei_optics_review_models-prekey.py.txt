"""Independent U7-02 models from prompt-only primary5b685, before B keys.

No authoring/candidate imports. Exact bookkeeping, energy differences,
Snell boundaries and paraxial conjugate points with explicit physical domains.
"""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'
SOURCE_SHA256='43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7'
def finite_exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric objects required before cast')
    values=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in values):raise ValueError('Finite real exact data required')
    return values

def positive(*values):
    values=finite_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Positive finite data required')
    return values

def count(value):
    value,=positive(value)
    if value.is_integer is not True:raise ValueError('Positive integer count required')
    return value

def calibrate(xa,xb,da,db):
    xa,xb=positive(xa,xb);da,db=finite_exact(da,db)
    if xa==xb:raise ValueError('Distinct physical reference outputs required')
    g=(db-da)/(xb-xa)
    if g<=0:raise ValueError('Positive calibration gain required')
    return g,da-g*xa

def beta_final(z0,n):
    z0=count(z0);n=count(n)
    return z0+n

def beta_initial(zf,n):
    zf=count(zf);n=count(n)
    if zf<=n:raise ValueError('Initial atomic number positive required')
    return count(zf-n)

def beta_events(zf,z0):
    zf=count(zf);z0=count(z0)
    return count(zf-z0)

def gamma_energy(ei,ef):
    ei,ef=positive(ei,ef)
    if ei<=ef:raise ValueError('Strictly descending positive levels required')
    return ei-ef

def gamma_initial(eg,ef):
    eg,ef=positive(eg,ef)
    return eg+ef

def gamma_final(eg,ei):
    eg,ei=positive(eg,ei)
    if eg>=ei:raise ValueError('Positive final reference level required')
    return ei-eg

def sine(value):
    value,=positive(value)
    if value>1:raise ValueError('Sine must be at most one; grazing endpoint is a limit')
    return value

def air_index(value):
    value,=positive(value)
    if value<1:raise ValueError('Index at least air-index1 required for this family')
    return value

def refracted_sine(si,n):
    si=sine(si);n=air_index(n)
    return si/n

def incident_sine(sr,n):
    sr=sine(sr);n=air_index(n)
    return sine(n*sr)

def index_from_sines(si,sr):
    si=sine(si);sr=sine(sr)
    return air_index(si/sr)

def parallel_plate_output(si,n):
    si=sine(si);n=air_index(n)
    return sine(n*refracted_sine(si,n))

def critical_sine(ne,ni):
    ne,ni=positive(ne,ni)
    if ne>=ni:raise ValueError('Strictly greater starting index required')
    return ne/ni

def external_index(sc,ni):
    sc=sine(sc);ni,=positive(ni)
    if sc>=1:raise ValueError('Critical sine strictly below one required')
    return ni*sc

def internal_index(sc,ne):
    sc=sine(sc);ne,=positive(ne)
    if sc>=1:raise ValueError('Critical sine strictly below one required')
    return ne/sc

def real_image(f,p):
    f,p=positive(f,p)
    if p<=f:raise ValueError('Real object outside focus required')
    return f*p/(p-f)

def focal_length(p,q):
    p,q=positive(p,q)
    return p*q/(p+q)

def object_distance(f,q):
    f,q=positive(f,q)
    if q<=f:raise ValueError('Real image beyond focus required')
    return q*f/(q-f)

def signed_image(f,p):
    f,p=positive(f,p)
    if f==p:raise ValueError('Image at infinity has no finite conjugate distance')
    return f*p/(p-f)

def primary_only_derivations():
    z,n,ei,ef,eg,si,sr,ne,ni,f,p,q,k1,k2=sp.symbols('Z n Ei Ef Eg si sr ne ni f p q k1 k2',positive=True)
    laws=[z+n,ei-ef,si/n,ne/ni,f*p/(p-f)]
    assert sp.solve(sp.Eq(sp.Symbol('Zf'),laws[0]),z)[0]==sp.Symbol('Zf')-n
    assert sp.solve(sp.Eq(eg,laws[1]),ei)[0]==eg+ef
    assert sp.solve(sp.Eq(sr,laws[2]),si)[0]==n*sr
    assert sp.solve(sp.Eq(sr,laws[3]),ne)[0]==ni*sr
    assert sp.solve(sp.Eq(q,laws[4]),f)[0]==p*q/(p+q)
    assert sp.solve(sp.Eq(q,laws[4]),p)[0]==q*f/(q-f)
    assert sp.cancel(((k1*f)*(k2*p)/(k2*p-k1*f))/(f*p/(p-f))-k1*k2*(p-f)/(k2*p-k1*f))==0
    out={}
    a,b=beta_final(20,1),beta_final(24,2);g,o=calibrate(a,b,43,53)
    out[255]={1:a,2:'dimensionless proton count',3:'Neutron to proton with electron and electron antineutrino; A unchanged,Z+1',4:(a,beta_final(24,1)),5:beta_initial(21,1),6:beta_events(21,20),7:beta_final(20,2)/a,8:42-a,9:sp.Symbol('Zf')-n,10:(k1*z+k2*n)/(z+n),11:b/a,12:(a+b)/2,13:beta_events(sp.Rational(26,21)*a,24),14:beta_initial(78/sp.Integer(3),2),15:beta_initial((51-o)/g,1),16:sp.Integer(21)/21}
    a,b=gamma_energy(100,20),gamma_energy(2,1);g,o=calibrate(a,b,161,3)
    out[256]={1:a,2:'energy dimension keV',3:'Simple gamma de-excitation preserves A and Z',4:(a,gamma_energy(120,20)),5:gamma_initial(80,20),6:gamma_final(80,100),7:gamma_energy(100,40)/a,8:160-a,9:eg+ef,10:(k1*ei-k2*ef)/(ei-ef),11:b/a,12:(a+b)/2,13:gamma_final(a/80,2)/20,14:gamma_initial(3/sp.Integer(3),1),15:gamma_initial((201-o)/g,20),16:sp.Integer(80)/4}
    a,b=refracted_sine(sp.Rational(1,2),2),refracted_sine(sp.Rational(3,4),sp.Rational(3,2));g,o=calibrate(a,b,sp.Rational(3,2),2)
    out[257]={1:a,2:'dimensionless sine',3:si/n,4:(a,refracted_sine(sp.Rational(3,4),2)),5:incident_sine(sp.Rational(1,4),2),6:parallel_plate_output(sp.Rational(3,5),sp.Rational(3,2)),7:refracted_sine(sp.Rational(1,2),sp.Rational(3,2))/a,8:sp.Rational(1,2)-a,9:n*sr,10:k1/k2,11:b/a,12:(a+b)/2,13:index_from_sines(sp.Rational(3,4),2*a)/2,14:incident_sine(sp.Rational(3,2)/3,sp.Rational(3,2)),15:incident_sine((sp.Rational(7,4)-o)/g,2),16:'Infinite continuous pairs n1..4,si=n/4; grazing endpoint only as limit'}
    a,b=critical_sine(1,2),critical_sine(2,3);g,o=calibrate(a,b,2,sp.Rational(7,3))
    out[258]={1:a,2:'dimensionless sine',3:'Starting index greater than exit; actual TIR additionally incident angle strictly beyond critical',4:(a,critical_sine(sp.Rational(3,2),2)),5:external_index(sp.Rational(1,2),2),6:internal_index(sp.Rational(1,2),1),7:critical_sine(1,3)/a,8:1-a,9:ni*sr,10:k1/k2,11:b/a,12:(a+b)/2,13:internal_index(sp.Rational(4,3)*a,2)/2,14:external_index(sp.Rational(2,3),3),15:external_index((sp.Rational(5,2)-o)/g,2),16:'Infinite positive pairs ne=ni/2 with ni>ne>0'}
    a,b=real_image(1,4),real_image(2,6);g,o=calibrate(a,b,sp.Rational(11,3),7)
    out[259]={1:a,2:'length dimension cm',3:'For0<p<f: q<0 and magnification -q/p>1, virtual upright enlarged image on object side',4:(a,real_image(2,4)),5:focal_length(4,sp.Rational(4,3)),6:object_distance(1,sp.Rational(4,3)),7:real_image(1,6)/a,8:sp.Rational(8,3)-a,9:p*q/(p+q),10:k1*k2*(p-f)/(k2*p-k1*f),11:b/a,12:(a+b)/2,13:object_distance(2,sp.Rational(9,4)*a)/4,14:focal_length(6,9/sp.Integer(3)),15:focal_length(4,(9-o)/g),16:sp.Rational(4,3)*3}
    expected={255:[21,20,1,sp.Rational(22,21),21,sp.Rational(26,21),sp.Rational(47,2),2,24,24],256:[80,100,20,sp.Rational(3,4),80,sp.Rational(1,80),sp.Rational(81,2),sp.Rational(1,20),2,120],257:[sp.Rational(1,4),sp.Rational(1,2),sp.Rational(3,5),sp.Rational(4,3),sp.Rational(1,4),2,sp.Rational(3,8),sp.Rational(3,4),sp.Rational(3,4),sp.Rational(3,4)],258:[sp.Rational(1,2),1,2,sp.Rational(2,3),sp.Rational(1,2),sp.Rational(4,3),sp.Rational(7,12),sp.Rational(3,2),2,sp.Rational(3,2)],259:[sp.Rational(4,3),1,4,sp.Rational(9,10),sp.Rational(4,3),sp.Rational(9,4),sp.Rational(13,6),sp.Rational(3,2),2,2]}
    for family in out:assert [out[family][j]for j in[1,5,6,7,8,11,12,13,14,15]]==expected[family],family
    assert out[255][12]==sp.Rational(47,2) # average need not be one nucleus,mean n3/2 inadmissible
    assert gamma_energy(51,sp.Rational(21,2))==sp.Rational(81,2) # affine coincidence
    assert out[257][12]-refracted_sine(sp.Rational(5,8),sp.Rational(7,4))==sp.Rational(1,56)
    assert out[258][12]-critical_sine(sp.Rational(3,2),sp.Rational(5,2))==-sp.Rational(1,60)
    assert out[259][12]-real_image(sp.Rational(3,2),5)==sp.Rational(1,42)
    assert refracted_sine(sp.Rational(3,5),sp.Rational(3,2))==sp.Rational(2,5)<critical_sine(1,sp.Rational(3,2))
    assert signed_image(2,1)==-2 and -signed_image(2,1)/1==2
    for index in[1,2,3,4]:assert refracted_sine(sp.Rational(index,4),index)==sp.Rational(1,4)
    for index in[sp.Rational(1,2),1,2,3]:assert critical_sine(index,2*index)==sp.Rational(1,2)
    assert sp.simplify(((p/4)*p)/(p-p/4))==p/3
    Q=SI.Quantity
    assert(Q(80,'kiloelectron_volt')).to('electron_volt').magnitude==80000
    assert(Q(1,'centimeter')*Q(4,'centimeter')/(Q(4,'centimeter')-Q(1,'centimeter'))).to('centimeter').magnitude==Fraction(4,3)
    assert(Q(1)*Q(Fraction(1,2))/Q(2)).to('').magnitude==Fraction(1,4)
    # Nuclear charge of emitted beta electron balances the extra proton.
    assert (20+1)-1==20
    return out
