"""Independent U7-01 laws from primary6ead, frozen before any B candidate.

Exact scaled quantities; no candidate/authoring imports. No approval of unread
editions. Approximated prescribed h and c are exact data of the stated model.
"""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'
SOURCE_SHA256='609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233'
def finite_exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric objects required before cast')
    values=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in values):raise ValueError('Finite real exact data required')
    return values

def positive(*values):
    values=finite_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Positive finite real data required')
    return values

def count(value):
    value,=positive(value)
    if value.is_integer is not True:raise ValueError('Photon number is a positive integer')
    return value

def calibrate(xa,xb,da,db):
    xa,xb=positive(xa,xb);da,db=finite_exact(da,db)
    if xa==xb:raise ValueError('Distinct reference physical outputs required')
    g=(db-da)/(xb-xa)
    if g<=0:raise ValueError('Positive calibration gain required')
    return g,da-g*xa

def packet_energy(n,wavelength_nm):
    n=count(n);wavelength_nm,=positive(wavelength_nm)
    return 1980*n/wavelength_nm # coefficient in 10^-19J

def photon_count(energy,wavelength_nm):
    energy,wavelength_nm=positive(energy,wavelength_nm)
    return count(energy*wavelength_nm/1980)

def wavelength(energy,n):
    energy,=positive(energy);n=count(n)
    return 1980*n/energy

def beer(incident,depth_cm):
    incident,depth_cm=positive(incident,depth_cm)
    return incident*2**(-depth_cm)

def incident_from_transmitted(transmitted,depth_cm):
    transmitted,depth_cm=positive(transmitted,depth_cm)
    return transmitted*2**depth_cm

def beer_depth(incident,transmitted):
    incident,transmitted=positive(incident,transmitted)
    if transmitted>=incident:raise ValueError('Strict attenuation at positive depth required')
    return sp.log(incident/transmitted,2)

def optical_depth(mu_per_cm,depth_cm):
    mu_per_cm,depth_cm=positive(mu_per_cm,depth_cm)
    return mu_per_cm*depth_cm

def mu_from_depth(tau,depth_cm):
    tau,depth_cm=positive(tau,depth_cm)
    return tau/depth_cm

def thickness(tau,mu):
    tau,mu=positive(tau,mu)
    return tau/mu

def transparent_index(eps_r,mu_r):
    eps_r,mu_r=positive(eps_r,mu_r)
    return sp.sqrt(eps_r*mu_r)

def two_layers(x1,x2):
    x1,x2=positive(x1,x2)
    return 2**(-x1-2*x2)

def first_layer(transmission,x2):
    transmission,x2=positive(transmission,x2)
    if transmission>=2**(-2*x2):raise ValueError('Positive first-layer residual required')
    return -sp.log(transmission,2)-2*x2

def second_layer(transmission,x1):
    transmission,x1=positive(transmission,x1)
    if transmission>=2**(-x1):raise ValueError('Positive second-layer residual required')
    return (-sp.log(transmission,2)-x1)/2

def attenuation_a(intensity,depth_cm,incident=64):
    intensity,depth_cm,incident=positive(intensity,depth_cm,incident)
    if intensity>=incident:raise ValueError('Positive attenuation coefficient requires 0<I<I0')
    return sp.log(incident/intensity,2)/depth_cm

def intensity_from_a(a,depth_cm,incident=64):
    a,depth_cm,incident=positive(a,depth_cm,incident)
    return incident*2**(-a*depth_cm)

def depth_from_a(a,intensity,incident=64):
    a,intensity,incident=positive(a,intensity,incident)
    if intensity>=incident:raise ValueError('Strict attenuation required')
    return sp.log(incident/intensity,2)/a

def background_coefficient(s1,s2,s3,step_cm=1):
    s1,s2,s3,step_cm=positive(s1,s2,s3,step_cm)
    if not s1>s2>s3 or not 0<(s2-s3)/(s1-s2)<1:raise ValueError('Decreasing exponential plus constant background required')
    return -sp.log((s2-s3)/(s1-s2),2)/step_cm

def primary_only_derivations():
    n=sp.Symbol('N',integer=True,positive=True);x,y,m,i,e,a,k1,k2=sp.symbols('x y mu I E a k1 k2',positive=True)
    laws=[1980*n/x,i*2**(-x),m*x,2**(-x-2*y),sp.log(64/i,2)/x]
    assert sp.solve(sp.Eq(e,laws[0]),x)[0]==1980*n/e
    assert sp.solve(sp.Eq(e,laws[1]),i)[0]==2**x*e
    assert sp.solve(sp.Eq(e,laws[2]),m)[0]==e/x
    assert sp.solve(sp.Eq(e,laws[3]),x)[0].equals(-sp.log(e,2)-2*y)
    assert sp.solve(sp.Eq(a,laws[4]),i)[0].equals(64*2**(-a*x))
    assert sp.cancel((1980*k1*n/(k2*x))/(1980*n/x))==k1/k2
    assert sp.simplify((k1*i*2**(-k2*x))/(i*2**(-x))-k1*2**(-(k2-1)*x))==0
    assert sp.cancel(((k1*m)*(k2*x))/(m*x))==k1*k2
    out={}
    a0,b=packet_energy(1,660),packet_energy(2,330);g,o=calibrate(a0,b,7,25)
    out[245]={1:a0,2:'energy dimension',3:laws[0],4:(a0,packet_energy(2,660)),5:photon_count(3,660),6:wavelength(3,1),7:packet_energy(1,330)/a0,8:6-a0,9:e*x/1980,10:k1/k2,11:b/a0,12:(a0+b)/2,13:wavelength(4*a0,2)/660,14:photon_count(36/ sp.Integer(3),330),15:photon_count((13-o)/g,660),16:'Infinite discrete pairs N>=1; wavelength660N nm'}
    a0,b=beer(64,1),beer(32,2);g,o=calibrate(a0,b,65,17)
    out[246]={1:a0,2:'intensity dimension',3:'Transmitted photon number flux falls, remaining photons keep hnu',4:(a0,beer(32,1)),5:incident_from_transmitted(32,1),6:beer_depth(64,32),7:beer(64,2)/a0,8:64-a0,9:e*2**x,10:k1*2**(-(k2-1)*x),11:b/a0,12:(a0+b)/2,13:beer_depth(32,a0/4),14:incident_from_transmitted(24/sp.Integer(3),2),15:incident_from_transmitted((33-o)/g,1),16:sp.log(48/sp.Integer(6),2)}
    a0,b=optical_depth(1,2),optical_depth(2,3);g,o=calibrate(a0,b,5,13)
    out[247]={1:a0,2:'dimensionless optical depth',3:transparent_index(9,1),4:(a0,optical_depth(3,2)),5:mu_from_depth(2,2),6:thickness(2,1),7:optical_depth(1,1)/a0,8:4-a0,9:e/x,10:k1*k2,11:b/a0,12:(a0+b)/2,13:thickness(3*a0,2)/2,14:mu_from_depth(18/sp.Integer(3),3),15:mu_from_depth((9-o)/g,1),16:sp.sqrt(2*2)}
    a0,b=two_layers(1,1),two_layers(2,2);g,o=calibrate(a0,b,sp.Rational(5,4),sp.Rational(33,32))
    out[248]={1:a0,2:'dimensionless transmittance',3:laws[3],4:(a0,two_layers(2,1)),5:first_layer(sp.Rational(1,8),1),6:second_layer(sp.Rational(1,8),1),7:two_layers(1,2)/a0,8:sp.Rational(1,4)-a0,9:-sp.log(e,2)-2*y,10:2**(-(k1-1)*x-2*(k2-1)*y),11:b/a0,12:(a0+b)/2,13:second_layer(a0/8,2),14:first_layer(sp.Rational(3,64)/3,2),15:first_layer((sp.Rational(9,8)-o)/g,1),16:sp.Integer(1)}
    a0,b=attenuation_a(4,1),attenuation_a(16,2);g,o=calibrate(a0,b,9,3)
    out[249]={1:a0,2:'inverse length',3:laws[4],4:(a0,attenuation_a(16,1)),5:intensity_from_a(4,1),6:depth_from_a(4,4),7:attenuation_a(4,2)/a0,8:8-a0,9:64*2**(-a*x),10:(sp.log(64/i,2)-sp.log(k1,2))/(k2*sp.log(64/i,2)),11:b/a0,12:(a0+b)/2,13:depth_from_a(a0/4,16),14:intensity_from_a(3/sp.Integer(3),2),15:intensity_from_a((5-o)/g,1),16:background_coefficient(24,16,12)}
    expected={245:[3,1,660,2,3,4,sp.Rational(15,2),sp.Rational(1,2),2,2],246:[32,64,1,sp.Rational(1,2),32,sp.Rational(1,4),20,2,32,32],247:[2,1,2,sp.Rational(1,2),2,3,4,sp.Rational(3,2),2,4],248:[sp.Rational(1,8),1,1,sp.Rational(1,4),sp.Rational(1,8),sp.Rational(1,8),sp.Rational(9,128),2,2,2],249:[4,4,1,sp.Rational(1,2),4,sp.Rational(1,4),sp.Rational(5,2),2,16,16]}
    for f in out:assert [out[f][j]for j in [1,5,6,7,8,11,12,13,14,15]]==expected[f],f
    assert out[245][12]==sp.Rational(15,2) and 1980*sp.Rational(3,2)/495==6 # formal only, half integer N inadmissible
    assert sp.simplify(beer(48,sp.Rational(3,2)))==12*sp.sqrt(2)
    assert optical_depth(sp.Rational(3,2),sp.Rational(5,2))==sp.Rational(15,4)
    assert sp.simplify(two_layers(sp.Rational(3,2),sp.Rational(3,2)))==sp.sqrt(2)/32
    assert attenuation_a(10,sp.Rational(3,2)).equals(sp.Rational(2,3)*sp.log(sp.Rational(32,5),2))
    Q=SI.Quantity
    assert(Q(Fraction(66,10**35),'joule*second')*Q(3*10**8,'meter/second')/Q(660,'nanometer')).to('joule').magnitude==Fraction(3,10**19)
    assert(Q(1,'1/centimeter')*Q(2,'centimeter')).to('').magnitude==2
    assert(Q(4,'1/centimeter')/Q(1,'1/centimeter')).to('').magnitude==4
    # One exponential with additive background: ratio of differences, not raw readings.
    assert [32*sp.Rational(1,2)**j+8 for j in [1,2,3]]==[24,16,12]
    assert sp.Rational(24,16)!=sp.Rational(1,2)
    return out
