"""Independent models from A primary1884, before opening B225–229 option keys.

All80 original prompts were manually derived and frozen before B authorship.
All80 final candidate prompts were subsequently read through an id+prompt-only
allowlist while disk was below the2GiB guard. No options, keys, worked blocks,
B authoring or B's primary have been opened at this preparation stage.
This file is a model preparation, not a candidate approval. Actual execution
must be documented separately and not inferred from its existence.
"""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'
SOURCE_SHA256='179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf'
C_KM_PER_S=sp.Rational(299792458,1000)

def real_exact(*values):
    if any(type(v)is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):raise ValueError('Exact numeric objects, not text or binary float, required')
    values=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in values):raise ValueError('Finite real exact numeric values required')
    return values

def positive(*values):
    values=real_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Positive physical quantity required')
    return values

def enlargement(value):
    value,=real_exact(value)
    if value<1:raise ValueError('Relative dielectric constant or separation factor at least one required')
    return value

def calibrate(xa,xb,da,db):
    xa,xb=positive(xa,xb);da,db=real_exact(da,db)
    if xa==xb:raise ValueError('Distinct calibration outputs required')
    gain=(db-da)/(xb-xa);offset=da-gain*xa
    if gain<=0:raise ValueError('Positive calibration gain required')
    return gain,offset

#225: fixed free charge on each isolated electrode, not just total neutrality.
def isolated_voltage(initial_voltage,kappa):
    initial_voltage,=positive(initial_voltage);kappa=enlargement(kappa)
    return initial_voltage/kappa

def initial_voltage(final_voltage,kappa):
    final_voltage,=positive(final_voltage);kappa=enlargement(kappa)
    return final_voltage*kappa

def dielectric_ratio(initial_voltage,final_voltage):
    initial_voltage,final_voltage=positive(initial_voltage,final_voltage)
    return enlargement(initial_voltage/final_voltage)

#226: initial capacitance in microfarad, fixed source2V; charge in microcoulomb.
def connected_charge(initial_capacitance,kappa):
    initial_capacitance,=positive(initial_capacitance);kappa=enlargement(kappa)
    return 2*initial_capacitance*kappa

def initial_capacitance(charge,kappa):
    charge,=positive(charge);kappa=enlargement(kappa)
    return charge/(2*kappa)

def connected_dielectric_ratio(charge,capacitance):
    charge,capacitance=positive(charge,capacitance)
    return enlargement(charge/(2*capacitance))

#227: plane-regime condition is an independent geometric assumption for both states.
def isolated_energy(initial_energy,separation):
    initial_energy,=positive(initial_energy);separation=enlargement(separation)
    return initial_energy*separation

def initial_energy(final_energy,separation):
    final_energy,=positive(final_energy);separation=enlargement(separation)
    return final_energy/separation

def energy_separation(final_energy,start_energy):
    final_energy,start_energy=positive(final_energy,start_energy)
    return enlargement(final_energy/start_energy)

#228: Vsource fixed within each trial; Q0 may change between coherent preparations.
def separated_charge(initial_charge,separation):
    initial_charge,=positive(initial_charge);separation=enlargement(separation)
    return initial_charge/separation

def initial_charge(final_charge,separation):
    final_charge,=positive(final_charge);separation=enlargement(separation)
    return final_charge*separation

def charge_separation(start_charge,final_charge):
    start_charge,final_charge=positive(start_charge,final_charge)
    return enlargement(start_charge/final_charge)

#229: positive speed in km/s, B in mT,q=+1microcoulomb,F in micronewton.
#The explicit subluminal guard is necessary, not a numerical certificate of
#nonrelativistic regime; read records additionally assume that regime. No
#acceleration, radius or relativistic dynamics is predicted by this helper.
def physical_speed(value):
    value,=positive(value)
    if value>=C_KM_PER_S:raise ValueError('A massive particle must have subluminal speed')
    return value

def magnetic_force(speed,field):
    speed=physical_speed(speed);field,=positive(field)
    return speed*field

def speed_from_force(force,field):
    force,field=positive(force,field)
    return physical_speed(force/field)

def field_from_force(force,speed):
    force,=positive(force);speed=physical_speed(speed)
    return force/speed


def primary_only_derivations():
    v0,k,k1,k2,u0,s,q0,c0=sp.symbols('v0 k k1 k2 u0 s q0 c0',positive=True)
    assert sp.cancel((k1*v0/(k2*k))/(v0/k))==k1/k2
    a,b=isolated_voltage(12,2),isolated_voltage(9,3);g,o=calibrate(a,b,13,7)
    out225={1:a,2:'voltage dimension, alternatives unopened',3:'Free charge on each electrode fixed; V and field energy need not be',4:(a,isolated_voltage(1,2)),5:initial_voltage(6,2),6:dielectric_ratio(12,6),7:isolated_voltage(12,1)/a,8:12-a,9:k*sp.Symbol('V',positive=True),10:k1/k2,11:b/a,12:(a+b)/2,13:dielectric_ratio(9,a/2)/2,14:initial_voltage(9/sp.Integer(3),3),15:initial_voltage((5-o)/g,4),16:'Infinite admissible pairs V0=(6V)k,k>=1'}
    assert [out225[i]for i in[1,5,6,7,8,11,12,13,14,15]]==[6,12,2,2,6,sp.Rational(1,2),sp.Rational(9,2),sp.Rational(3,2),9,8]
    assert sp.Rational(9,2)-isolated_voltage(sp.Rational(21,2),sp.Rational(5,2))==sp.Rational(3,10)
    a,b=connected_charge(2,2),connected_charge(1,3);g,o=calibrate(a,b,17,13)
    out226={1:a,2:'charge dimension, alternatives unopened',3:'Ideal source fixesV; for k>1 capacitance and free electrode charge increase',4:(a,connected_charge(4,2)),5:initial_capacitance(8,2),6:connected_dielectric_ratio(8,2),7:connected_charge(2,1)/a,8:16-a,9:sp.Symbol('Q',positive=True)/(k*sp.Symbol('Vg',positive=True)),10:k1*k2,11:b/a,12:(a+b)/2,13:connected_dielectric_ratio(sp.Rational(3,4)*a,1)/2,14:initial_capacitance(18/sp.Integer(3),3),15:initial_capacitance((33-o)/g,2),16:sp.Integer(2)}
    assert [out226[i]for i in[1,5,6,7,8,11,12,13,14,15,16]]==[8,2,2,sp.Rational(1,2),8,sp.Rational(3,4),7,sp.Rational(3,2),1,4,2]
    assert connected_charge(sp.Rational(3,2),sp.Rational(5,2))-7==sp.Rational(1,2)
    a,b=isolated_energy(2,2),isolated_energy(3,3);g,o=calibrate(a,b,9,19)
    out227={1:a,2:'energy dimension, alternatives unopened',3:u0*s,4:(a,isolated_energy(4,2)),5:initial_energy(4,2),6:energy_separation(4,2),7:isolated_energy(2,1)/a,8:8-a,9:sp.Symbol('U',positive=True)/s,10:k1*k2,11:b/a,12:(a+b)/2,13:energy_separation(sp.Rational(9,4)*a,3)/2,14:initial_energy(27/sp.Integer(3),3),15:initial_energy((17-o)/g,2),16:sp.Integer(2)}
    assert [out227[i]for i in[1,5,6,7,8,11,12,13,14,15,16]]==[4,2,2,sp.Rational(1,2),4,sp.Rational(9,4),sp.Rational(13,2),sp.Rational(3,2),3,4,2]
    assert sp.Rational(13,2)-isolated_energy(sp.Rational(5,2),sp.Rational(5,2))==sp.Rational(1,4)
    a,b=separated_charge(12,2),separated_charge(9,3);g,o=calibrate(a,b,13,7)
    out228={1:a,2:'charge dimension, alternatives unopened',3:q0/s,4:(a,separated_charge(1,2)),5:initial_charge(6,2),6:charge_separation(12,6),7:separated_charge(12,1)/a,8:12-a,9:sp.Symbol('Q',positive=True)*s,10:k1/k2,11:b/a,12:(a+b)/2,13:charge_separation(9,a/2)/2,14:initial_charge(9/sp.Integer(3),3),15:initial_charge((5-o)/g,4),16:'Infinite admissible pairsQ0=(6microcoulomb)s,s>=1 in plane regime'}
    assert [out228[i]for i in[1,5,6,7,8,11,12,13,14,15]]==[6,12,2,2,6,sp.Rational(1,2),sp.Rational(9,2),sp.Rational(3,2),9,8]
    vx,vy,vz,bx,by,bz,charge=sp.symbols('vx vy vz bx by bz charge',real=True)
    velocity=sp.Matrix([vx,vy,vz]);field=sp.Matrix([bx,by,bz]);force=charge*velocity.cross(field);assert sp.expand(force.dot(velocity))==0
    assert sp.Matrix([1,0,0]).cross(sp.Matrix([0,0,-1]))==sp.Matrix([0,1,0])
    a,b=magnetic_force(2,3),magnetic_force(1,4);g,o=calibrate(a,b,13,9)
    out229={1:a,2:'force dimension, alternatives unopened',3:'F dotv=0,K andspeed constant; velocityvector not generally constant, helix possible',4:(a,magnetic_force(1,3)),5:speed_from_force(6,3),6:field_from_force(6,2),7:magnetic_force(2,1)/a,8:12-a,9:sp.Symbol('F',positive=True)/(sp.Symbol('q',positive=True)*sp.Symbol('B',positive=True)),10:k1*k2,11:b/a,12:(a+b)/2,13:field_from_force(sp.Rational(2,3)*a,1)/3,14:speed_from_force(12/sp.Integer(3),4),15:speed_from_force((41-o)/g,5),16:sp.Integer(3)}
    assert [out229[i]for i in[1,5,6,7,8,11,12,13,14,15,16]]==[6,2,3,sp.Rational(1,3),6,sp.Rational(2,3),5,sp.Rational(4,3),1,4,3]
    assert magnetic_force(sp.Rational(3,2),sp.Rational(7,2))-5==sp.Rational(1,4)
    z=sp.symbols('z',positive=True);assert sp.cancel((6*z)/z)==6
    assert sp.solve(sp.Eq(2*z*z,8),z)==[2]
    assert sp.solve(sp.Eq(z*z,4),z)==[2]
    assert sp.solve(sp.Eq(sp.Rational(2,3)*z*z,6),z)==[3]
    Q=SI.Quantity
    assert(Q(12,'volt')/2).to('volt').magnitude==6
    assert(Q(2,'microfarad')*2*Q(2,'volt')).to('microcoulomb').magnitude==8
    assert(Q(2,'microjoule')*2).to('microjoule').magnitude==4
    assert(Q(12,'microcoulomb')/2).to('microcoulomb').magnitude==6
    assert(Q(1,'microcoulomb')*Q(2,'kilometer/second')*Q(3,'millitesla')).to('micronewton').magnitude==6
    return {225:out225,226:out226,227:out227,228:out228,229:out229}
