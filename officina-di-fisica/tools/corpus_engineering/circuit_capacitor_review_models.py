"""Primary-only model preparation. No candidate imports, signatures or approval.

Written from A's frozen primary 4c49ff1... before opening any B215–219
candidate, options or generator. Numerical arguments below are exact values
in explicitly named units. Execution remains NOT_RUN until the shared lock
and space guard permit a real independent run.
"""
from fractions import Fraction
import sympy as sp
import pint

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'
SOURCE_SHA256='0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077'
SI=pint.UnitRegistry(non_int_type=Fraction)

def real_exact(*values):
    if any(type(v) is bool or not isinstance(v,(int,Fraction,sp.Expr))for v in values):
        raise ValueError('Exact numeric objects only; no raw text or binary float')
    result=tuple(map(sp.sympify,values))
    if any(v.is_number is not True or v.is_real is not True or v.is_finite is not True or v.has(sp.Float)for v in result):
        raise ValueError('Finite real exact values required')
    return result

def positive(*values):
    values=real_exact(*values)
    if any(v<=0 for v in values):raise ValueError('Strictly positive physical parameters required')
    return values

def calibrate(x_a,x_b,d_a,d_b):
    x_a,x_b,d_a,d_b=real_exact(x_a,x_b,d_a,d_b)
    if x_a<=0 or x_b<=0 or x_a==x_b:raise ValueError('Distinct positive outputs required')
    gain=sp.cancel((d_b-d_a)/(x_b-x_a));offset=sp.cancel(d_a-gain*x_a)
    if gain<=0:raise ValueError('Positive finite gain required')
    return gain,offset

# 215: operating series current, useful power specifically in the load.
def load_fraction(load,cable,current=1):
    load,cable,current=positive(load,cable,current)
    useful=current**2*load;loss=current**2*cable
    return sp.cancel(useful/(useful+loss))

def inverse_load(eta,cable):
    eta,cable=positive(eta,cable)
    if eta>=1:raise ValueError('Positive finite series elements require 0<eta<1')
    return eta*cable/(1-eta)

def inverse_cable(eta,load):
    eta,load=positive(eta,load)
    if eta>=1:raise ValueError('Positive finite series elements require 0<eta<1')
    return load*(1-eta)/eta

# 216: mass in mg, current in A, latent heat 200 J/g, fixed R=2 ohm.
def fuse_time(mass_mg,current_a):
    mass_mg,current_a=positive(mass_mg,current_a)
    latent_j=mass_mg*sp.Rational(1,1000)*200
    power_w=current_a**2*2
    return latent_j/power_w

def fuse_mass(time_s,current_a):
    time_s,current_a=positive(time_s,current_a)
    return 10*time_s*current_a**2

def fuse_current(time_s,mass_mg):
    time_s,mass_mg=positive(time_s,mass_mg)
    return sp.sqrt(mass_mg/(10*time_s))

# 217: ideal plane model; separate geometric thin-gap assumption is essential.
def plane_capacitance(area_cm2,gap_mm):
    area_cm2,gap_mm=positive(area_cm2,gap_mm)
    # 10 pF/m * (A*10^-4 m²)/(d*10^-3 m), output pF.
    return sp.Rational(10)*area_cm2*sp.Rational(1,10**4)/(gap_mm*sp.Rational(1,1000))

def plane_area(capacitance_pf,gap_mm):
    capacitance_pf,gap_mm=positive(capacitance_pf,gap_mm)
    return capacitance_pf*gap_mm

def plane_gap(capacitance_pf,area_cm2):
    capacitance_pf,area_cm2=positive(capacitance_pf,area_cm2)
    return area_cm2/capacitance_pf

def uniform_field(left_v,right_v,separation_m):
    left_v,right_v=real_exact(left_v,right_v);separation_m,=positive(separation_m)
    return (left_v-right_v)/separation_m # +x is left to right.

# 218: C in microfarad, positive voltage magnitude V, output microcoulomb.
def plate_charge(capacitance_uf,voltage_v):
    capacitance_uf,voltage_v=positive(capacitance_uf,voltage_v)
    return capacitance_uf*voltage_v

def charge_capacitance(charge_uc,voltage_v):
    charge_uc,voltage_v=positive(charge_uc,voltage_v)
    return charge_uc/voltage_v

def charge_voltage(charge_uc,capacitance_uf):
    charge_uc,capacitance_uf=positive(charge_uc,capacitance_uf)
    return charge_uc/capacitance_uf

# 219: energy in microjoule; sign of voltage is fixed by source domain V>0.
def capacitor_energy(capacitance_uf,voltage_v):
    capacitance_uf,voltage_v=positive(capacitance_uf,voltage_v)
    return capacitance_uf*voltage_v**2/2

def energy_capacitance(energy_uj,voltage_v):
    energy_uj,voltage_v=positive(energy_uj,voltage_v)
    return 2*energy_uj/voltage_v**2

def energy_voltage(energy_uj,capacitance_uf):
    energy_uj,capacitance_uf=positive(energy_uj,capacitance_uf)
    return sp.sqrt(2*energy_uj/capacitance_uf)


def primary_only_derivations():
    """No candidate key inspection; values independently derived from source prompts."""
    x,y,k1,k2=sp.symbols('x y k1 k2',positive=True)
    i=sp.symbols('i',real=True,nonzero=True)
    eta=(i*i*x)/(i*i*x+i*i*y)
    assert sp.cancel(eta-x/(x+y))==0
    e=sp.symbols('eta',positive=True)
    assert sp.cancel(sp.solve(sp.Eq(e,x/(x+y)),x)[0]-e*y/(1-e))==0
    source_215={1:load_fraction(3,1),2:'dimensionless power fraction; alternatives unopened',3:sp.cancel(eta),4:(load_fraction(3,1),load_fraction(4,1)),5:inverse_load(sp.Rational(3,4),1),6:inverse_cable(sp.Rational(3,4),3),7:load_fraction(3,2)/load_fraction(3,1),8:sp.Rational(3,2)-load_fraction(3,1),9:e*y/(1-e),10:k1*(x+y)/(k1*x+k2*y),11:load_fraction(2,2)/load_fraction(3,1),12:(load_fraction(3,1)+load_fraction(2,2))/2,13:inverse_cable(sp.Rational(1,2),2),14:inverse_load(sp.Rational(3,2)/3,2),15:inverse_load((sp.Rational(13,5)-1)/2,1),16:'infinite positive pairs (3a,a); no absolute scale'}
    assert [source_215[j]for j in [1,5,6,7,8,11,12,13,14,15]]==[sp.Rational(3,4),3,1,sp.Rational(4,5),sp.Rational(3,4),sp.Rational(2,3),sp.Rational(5,8),2,2,4]
    a,b=fuse_time(10,1),fuse_time(80,2);g,o=calibrate(a,b,3,5)
    source_216={1:a,2:'time; J/W=s; alternatives unopened',3:x/(10*y*y),4:(a,fuse_time(20,1)),5:fuse_mass(1,1),6:fuse_current(1,10),7:fuse_time(10,2)/a,8:2-a,9:10*x*y*y,10:k1/k2**2,11:b/a,12:(a+b)/2,13:fuse_current(2,80),14:fuse_mass(6/ sp.Integer(3),2),15:fuse_mass((sp.Rational(6,5)-o)/g,1),16:sp.Integer(1)}
    assert (a,b,g,o,source_216[15])==(1,2,2,1,1)
    assert fuse_time(45,sp.Rational(3,2))==2
    a,b=plane_capacitance(100,1),plane_capacitance(400,2);g,o=calibrate(a,b,201,401)
    source_217={1:a,2:'capacitance F; alternatives unopened',3:'E=0 in material of conductor in electrostatic equilibrium; not automatically a charged cavity',4:(a,plane_capacitance(1,1)),5:plane_area(100,1),6:plane_gap(100,100),7:plane_capacitance(100,2)/a,8:(uniform_field(40,0,sp.Rational(1,50)),'left to right'),9:x*y,10:k1/k2,11:b/a,12:(a+b)/2,13:plane_gap(200,400),14:plane_area(600/sp.Integer(3),2),15:plane_area((3-o)/g,1),16:'infinite positive proportional area/gap pairs within plane regime'}
    assert (a,b,g,o,source_217[15])==(100,200,2,1,1)
    assert plane_capacitance(250,sp.Rational(3,2))==sp.Rational(500,3)
    a,b=plate_charge(2,3),plate_charge(1,5);g,o=calibrate(a,b,13,11)
    source_218={1:a,2:'charge in C, microcoulomb here; alternatives unopened',3:x*y,4:(a,plate_charge(1,3)),5:charge_capacitance(6,3),6:charge_voltage(6,2),7:plate_charge(2,1)/a,8:12-a,9:x/y,10:k1*k2,11:b/a,12:(a+b)/2,13:charge_voltage(5,1)/3,14:charge_capacitance(15/sp.Integer(3),5),15:charge_capacitance((17-o)/g,2),16:sp.Integer(3)}
    assert (a,b,g,o,source_218[15])==(6,5,2,1,4)
    C,q=sp.symbols('C q',positive=True);stored=sp.integrate(q/C,(q,0,q));assert stored==q*q/(2*C)
    a,b=capacitor_energy(2,2),capacitor_energy(4,3);g,o=calibrate(a,b,9,37)
    source_219={1:a,2:'energy in J, microjoule here; alternatives unopened',3:'polarization: relative displacement of bound charges and/or dipole alignment, not universal free conduction',4:(a,capacitor_energy(1,2)),5:energy_capacitance(4,2),6:energy_voltage(4,2),7:capacitor_energy(2,4)/a,8:8-a,9:2*x/y**2,10:k1*k2*k2,11:b/a,12:(a+b)/2,13:energy_voltage(18,4)/2,14:energy_capacitance(54/sp.Integer(3),3),15:energy_capacitance((2-o)/g,1),16:sp.Integer(2)}
    assert (a,b,g,o,source_219[15])==(4,18,2,1,1)
    z=sp.symbols('z',positive=True)
    assert sp.cancel((3*z)/(3*z+z))==sp.Rational(3,4)
    assert sp.solve(sp.Eq((10*z)/(10*z*z),1),z)==[1]
    assert sp.cancel((100*z)/z)==100
    assert sp.solve(sp.Eq(sp.Rational(2,3)*z*z,6),z)==[3]
    assert sp.solve(sp.Eq(z**3/2,4),z)==[2]
    assert load_fraction(2,1)-(load_fraction(1,1)+load_fraction(3,1))/2==sp.Rational(1,24)
    Q=SI.Quantity
    assert (Q(Fraction(10),'milligram')*Q(Fraction(200),'joule/gram')/Q(Fraction(2),'watt')).to('second').magnitude==1
    assert (Q(Fraction(10),'picofarad/meter')*Q(Fraction(100),'centimeter**2')/Q(Fraction(1),'millimeter')).to('picofarad').magnitude==100
    assert (Q(Fraction(2),'microfarad')*Q(Fraction(3),'volt')).to('microcoulomb').magnitude==6
    assert (Q(Fraction(2),'microfarad')*Q(Fraction(2),'volt')**2/2).to('microjoule').magnitude==4
    return {215:source_215,216:source_216,217:source_217,218:source_218,219:source_219}
