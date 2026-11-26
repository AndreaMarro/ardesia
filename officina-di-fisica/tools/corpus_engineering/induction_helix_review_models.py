"""Independent U6-05 models from A source-only primary c0d2, before B keys.

No authoring module or B candidate is imported. These functions describe
prescribed ideal models, not a scientific approval of an unread edition.
"""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'
SOURCE_SHA256='383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe'
C_M_PER_S=sp.Integer(299792458)

def finite_exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric objects required before conversion; no binary float or text')
    values=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in values):raise ValueError('Finite real exact quantities required')
    return values

def positive(*values):
    values=finite_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Positive physical moduli required')
    return values

def turns(value):
    value,=positive(value)
    if value.is_integer is not True:raise ValueError('Positive integer number of turns required')
    return value

def speed(value):
    value,=positive(value)
    if value>=C_M_PER_S:raise ValueError('Necessary subluminal speed bound')
    return value

def calibrate(xa,xb,da,db):
    xa,xb=positive(xa,xb);da,db=finite_exact(da,db)
    if xa==xb:raise ValueError('Distinct physical reference outputs required')
    gain=(db-da)/(xb-xa);offset=da-gain*xa
    if gain<=0:raise ValueError('Positive finite calibration gain required')
    return gain,offset

def average_emf(dflux_milliweber,dtime_millisecond,nturns=10):
    dflux_milliweber,dtime_millisecond=positive(dflux_milliweber,dtime_millisecond);nturns=turns(nturns)
    return nturns*dflux_milliweber/dtime_millisecond

def flux_from_emf(emf_volt,dtime_millisecond,nturns=10):
    emf_volt,dtime_millisecond=positive(emf_volt,dtime_millisecond);nturns=turns(nturns)
    return emf_volt*dtime_millisecond/nturns

def time_from_emf(emf_volt,dflux_milliweber,nturns=10):
    emf_volt,dflux_milliweber=positive(emf_volt,dflux_milliweber);nturns=turns(nturns)
    return nturns*dflux_milliweber/emf_volt

def rod_emf(field_tesla,velocity_m_per_s,length_m=Fraction(1,2)):
    field_tesla,length_m=positive(field_tesla,length_m);velocity_m_per_s=speed(velocity_m_per_s)
    return field_tesla*length_m*velocity_m_per_s

def field_from_rod(emf_volt,velocity_m_per_s,length_m=Fraction(1,2)):
    emf_volt,length_m=positive(emf_volt,length_m);velocity_m_per_s=speed(velocity_m_per_s)
    return emf_volt/(length_m*velocity_m_per_s)

def speed_from_rod(emf_volt,field_tesla,length_m=Fraction(1,2)):
    emf_volt,field_tesla,length_m=positive(emf_volt,field_tesla,length_m)
    return speed(emf_volt/(field_tesla*length_m))

def rod_current(velocity_m_per_s,resistance_ohm,bl_tesla_m=2):
    velocity_m_per_s=speed(velocity_m_per_s);resistance_ohm,bl_tesla_m=positive(resistance_ohm,bl_tesla_m)
    return bl_tesla_m*velocity_m_per_s/resistance_ohm

def speed_from_current(current_ampere,resistance_ohm,bl_tesla_m=2):
    current_ampere,resistance_ohm,bl_tesla_m=positive(current_ampere,resistance_ohm,bl_tesla_m)
    return speed(current_ampere*resistance_ohm/bl_tesla_m)

def resistance_from_current(current_ampere,velocity_m_per_s,bl_tesla_m=2):
    current_ampere,bl_tesla_m=positive(current_ampere,bl_tesla_m);velocity_m_per_s=speed(velocity_m_per_s)
    return bl_tesla_m*velocity_m_per_s/current_ampere

def transferred_charge(dflux_milliweber,resistance_ohm):
    dflux_milliweber,resistance_ohm=positive(dflux_milliweber,resistance_ohm)
    return dflux_milliweber/resistance_ohm

def flux_from_charge(charge_millicoulomb,resistance_ohm):
    charge_millicoulomb,resistance_ohm=positive(charge_millicoulomb,resistance_ohm)
    return charge_millicoulomb*resistance_ohm

def resistance_from_charge(charge_millicoulomb,dflux_milliweber):
    charge_millicoulomb,dflux_milliweber=positive(charge_millicoulomb,dflux_milliweber)
    return dflux_milliweber/charge_millicoulomb

def reduced_pitch(parallel_speed_m_per_s,field_tesla,alpha_c_per_kg=1):
    parallel_speed_m_per_s=speed(parallel_speed_m_per_s);field_tesla,alpha_c_per_kg=positive(field_tesla,alpha_c_per_kg)
    return parallel_speed_m_per_s/(alpha_c_per_kg*field_tesla)

def parallel_speed_from_pitch(reduced_pitch_m,field_tesla,alpha_c_per_kg=1):
    reduced_pitch_m,field_tesla,alpha_c_per_kg=positive(reduced_pitch_m,field_tesla,alpha_c_per_kg)
    return speed(alpha_c_per_kg*field_tesla*reduced_pitch_m)

def field_from_pitch(reduced_pitch_m,parallel_speed_m_per_s,alpha_c_per_kg=1):
    reduced_pitch_m,alpha_c_per_kg=positive(reduced_pitch_m,alpha_c_per_kg);parallel_speed_m_per_s=speed(parallel_speed_m_per_s)
    return parallel_speed_m_per_s/(alpha_c_per_kg*reduced_pitch_m)

def helix_period(field_tesla,alpha_c_per_kg=1):
    field_tesla,alpha_c_per_kg=positive(field_tesla,alpha_c_per_kg)
    return 2*sp.pi/(alpha_c_per_kg*field_tesla)

def primary_only_derivations():
    f,t,b,v,r,k1,k2,alpha,h=sp.symbols('f t B v R k1 k2 alpha h',positive=True)
    n=sp.symbols('N',integer=True,positive=True)
    # Direct laws, inverse equations and scaling derived symbolically, not from choices.
    laws=[n*f/t,b*v/2,2*v/r,f/r,v/(alpha*b)]
    assert sp.solve(sp.Eq(sp.Symbol('E'),laws[0]),f)[0]==sp.Symbol('E')*t/n
    assert sp.solve(sp.Eq(sp.Symbol('E'),laws[1]),b)[0]==2*sp.Symbol('E')/v
    assert sp.solve(sp.Eq(sp.Symbol('I'),laws[2]),v)[0]==sp.Symbol('I')*r/2
    assert sp.solve(sp.Eq(sp.Symbol('Q'),laws[3]),f)[0]==sp.Symbol('Q')*r
    assert sp.solve(sp.Eq(h,laws[4]),v)[0]==alpha*b*h
    assert sp.cancel((n*(k1*f)/(k2*t))/(n*f/t))==k1/k2
    assert sp.cancel(((k1*b)*(k2*v)/2)/(b*v/2))==k1*k2
    assert sp.cancel(((2*k1*v)/(k2*r))/(2*v/r))==k1/k2
    assert sp.cancel(((k1*f)/(k2*r))/(f/r))==k1/k2
    assert sp.cancel(((k1*v)/(alpha*k2*b))/(v/(alpha*b)))==k1/k2
    result={}
    a,z=average_emf(6,2),average_emf(12,3);g,o=calibrate(a,z,61,81)
    result[235]={1:a,2:'voltage dimension; no options opened',3:'Flux toward observer increasing: induced field away, clockwise current viewed by observer',4:(a,average_emf(1,2)),5:flux_from_emf(30,2),6:time_from_emf(30,6),7:average_emf(6,1)/a,8:60-a,9:sp.Symbol('E')*t/n,10:k1/k2,11:z/a,12:(a+z)/2,13:time_from_emf(sp.Rational(4,3)*a,12)/2,14:flux_from_emf(sp.Rational(120,3),3),15:flux_from_emf((41-o)/g,5),16:'Infinite positive pairs, dflux=(3mWb/ms)dtime; redundant30V'}
    a,z=rod_emf(2,3),rod_emf(1,4);g,o=calibrate(a,z,7,5)
    result[236]={1:a,2:'voltage dimension; no options opened',3:b*v/2,4:(a,rod_emf(1,3)),5:field_from_rod(3,3),6:speed_from_rod(3,2),7:rod_emf(2,1)/a,8:6-a,9:sp.Symbol('E')/(sp.Symbol('L',positive=True)*v),10:k1*k2,11:z/a,12:(a+z)/2,13:speed_from_rod(sp.Rational(2,3)*a,1)/3,14:field_from_rod(sp.Rational(6,3),4),15:field_from_rod((21-o)/g,5),16:sp.Integer(3)}
    a,z=rod_current(2,1),rod_current(1,2);g,o=calibrate(a,z,9,3)
    result[237]={1:a,2:'current dimension; no options opened',3:2*v/r,4:(a,rod_current(3,1)),5:speed_from_current(4,1),6:resistance_from_current(4,2),7:rod_current(2,2)/a,8:8-a,9:sp.Symbol('I')*r/sp.Symbol('BL',positive=True),10:k1/k2,11:z/a,12:(a+z)/2,13:resistance_from_current(a/4,1),14:speed_from_current(1,2),15:speed_from_current((13-o)/g,1),16:'Infinite positive pairs, v=[2(m/s)/ohm]R; redundant4A'}
    a,z=transferred_charge(6,2),transferred_charge(12,3);g,o=calibrate(a,z,7,9)
    result[238]={1:a,2:'charge dimension; no options opened',3:f/r,4:(a,transferred_charge(1,2)),5:flux_from_charge(3,2),6:resistance_from_charge(3,6),7:transferred_charge(6,1)/a,8:6-a,9:sp.Symbol('Q')*r,10:k1/k2,11:z/a,12:(a+z)/2,13:resistance_from_charge(sp.Rational(4,3)*a,12)/2,14:flux_from_charge(4,3),15:flux_from_charge((5-o)/g,5),16:'Infinite positive pairs,dflux=[3mWb/ohm]R; redundant3mC'}
    a,z=reduced_pitch(2,1),reduced_pitch(1,2);g,o=calibrate(a,z,5,2)
    result[239]={1:a,2:'length dimension; no options opened',3:'Nonzero parallel and perpendicular speeds: circular perpendicular projection plus uniform axial motion, cylindrical helix',4:(a,reduced_pitch(3,1)),5:parallel_speed_from_pitch(2,1),6:field_from_pitch(2,2),7:reduced_pitch(2,2)/a,8:4-a,9:alpha*b*h,10:k1/k2,11:z/a,12:(a+z)/2,13:field_from_pitch(a/4,1),14:parallel_speed_from_pitch(sp.Rational(1,2),2),15:parallel_speed_from_pitch((7-o)/g,1),16:'Infinite admissible pairs,v_parallel=[2(m/s)/T]B, reducedpitch2m'}
    numeric={235:[30,6,2,2,30,sp.Rational(4,3),35,sp.Rational(3,2),12,10],236:[3,2,3,sp.Rational(1,3),3,sp.Rational(2,3),sp.Rational(5,2),sp.Rational(4,3),1,4],237:[4,2,1,sp.Rational(1,2),4,sp.Rational(1,4),sp.Rational(5,2),2,1,3],238:[3,6,2,2,3,sp.Rational(4,3),sp.Rational(7,2),sp.Rational(3,2),12,10],239:[2,2,1,sp.Rational(1,2),2,sp.Rational(1,4),sp.Rational(5,4),2,1,3]}
    for family in result:assert [result[family][j]for j in[1,5,6,7,8,11,12,13,14,15]]==numeric[family]
    assert sp.Rational(35)-average_emf(9,sp.Rational(5,2))==-1
    assert sp.Rational(5,2)-rod_emf(sp.Rational(3,2),sp.Rational(7,2))==-sp.Rational(1,8)
    assert sp.Rational(5,2)-rod_current(sp.Rational(3,2),sp.Rational(3,2))==sp.Rational(1,2)
    assert sp.Rational(7,2)-transferred_charge(9,sp.Rational(5,2))==-sp.Rational(1,10)
    assert sp.Rational(5,4)-reduced_pitch(sp.Rational(3,2),sp.Rational(3,2))==sp.Rational(1,4)
    Q=SI.Quantity
    assert(Q(10)*Q(6,'milliweber')/Q(2,'millisecond')).to('volt').magnitude==30
    assert(Q(2,'tesla')*Q(Fraction(1,2),'meter')*Q(3,'meter/second')).to('volt').magnitude==3
    assert(Q(2,'tesla*meter')*Q(2,'meter/second')/Q(1,'ohm')).to('ampere').magnitude==4
    assert(Q(6,'milliweber')/Q(2,'ohm')).to('millicoulomb').magnitude==3
    assert(Q(2,'meter/second')/(Q(1,'coulomb/kilogram')*Q(1,'tesla'))).to('meter').magnitude==2
    t0=sp.symbols('t0',real=True);vec=sp.Matrix([sp.cos(t0),sp.sin(t0),sp.Integer(2)]);B=sp.Matrix([0,0,1]);assert sp.simplify(vec.cross(B).dot(vec))==0
    # Explicit nonmonotone counterexample:0→1→0 Wb over2s has0 average EMF,
    # but positive average of the absolute EMF; monotonicity matters for total charge.
    assert (sp.Integer(1)-1)/2==0 and (abs(sp.Integer(1))+abs(sp.Integer(-1)))/2==1
    return result
