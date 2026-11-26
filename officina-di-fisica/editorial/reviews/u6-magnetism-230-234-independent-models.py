"""Independent source-prompt models, frozen before opening any A230–234 candidate.
No authoring imports or key tables. Numbers are values in the source's declared units.
All physical SI laws and dimensional coefficients are derived in primary51395.
This artifact alone does not review or accept a candidate.
"""
MODELS={}
MODELS['force-current-wire']=r'''
def result(current, length):
    """I in A, L in cm, B=1 T; output F in mN from B I (L/100)."""
    current=_finite_exact(current,positive=True);length=_finite_exact(length,positive=True)
    return sp.simplify(10*current*length)
def inverse_first(force, length):
    force=_finite_exact(force,positive=True);length=_finite_exact(length,positive=True)
    return sp.simplify(force/(10*length))
def inverse_second(force, current):
    force=_finite_exact(force,positive=True);current=_finite_exact(current,positive=True)
    return sp.simplify(force/(10*current))
def scaled(current, length, k1, k2):
    current=_finite_exact(current,positive=True);length=_finite_exact(length,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1*k2)
def constrained_length(force):
    """I/(1 A)=(2/3)L/(1 cm), hence F/(1 mN)=(20/3)l²."""
    force=_finite_exact(force,positive=True)
    return sp.sqrt(3*force/20)
'''
MODELS['magnetic-circle-radius']=r'''
def result(speed, field):
    """v in m/s, B in T; m/|q|=1 kg/C, perpendicular classical motion."""
    speed=_finite_exact(speed,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(speed/field)
def inverse_first(radius, field):
    radius=_finite_exact(radius,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(radius*field)
def inverse_second(radius, speed):
    radius=_finite_exact(radius,positive=True);speed=_finite_exact(speed,positive=True)
    return sp.simplify(speed/radius)
def scaled(speed, field, k1, k2):
    speed=_finite_exact(speed,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def constrained_speed(field):
    """A relation between preparations, not acceleration within one orbit."""
    field=_finite_exact(field,positive=True)
    return 2*field
'''
MODELS['accelerated-magnetic-radius']=r'''
def result(voltage, field):
    """U in V, B in T, |q|/m=1 C/kg; separate acceleration then orbit."""
    voltage=_finite_exact(voltage,positive=True);field=_finite_exact(field,positive=True)
    return sp.sqrt(2*voltage)/field
def inverse_first(radius, field):
    radius=_finite_exact(radius,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(radius**2*field**2/2)
def inverse_second(radius, voltage):
    radius=_finite_exact(radius,positive=True);voltage=_finite_exact(voltage,positive=True)
    return sp.sqrt(2*voltage)/radius
def scaled(voltage, field, k1, k2):
    voltage=_finite_exact(voltage,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.sqrt(k1)/k2
def constrained_field(radius):
    """Source16 is U=(2 V/T)B, so r/(m)=2/sqrt(B/(T))."""
    radius=_finite_exact(radius,positive=True)
    return sp.simplify(4/radius**2)
'''
MODELS['magnetic-orbit-period']=r'''
def result(mass, field):
    """m in mg, B in T, |q|=1 microC; output tau=T/(2pi) in s."""
    mass=_finite_exact(mass,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(mass/field)
def inverse_first(tau, field):
    tau=_finite_exact(tau,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(tau*field)
def inverse_second(tau, mass):
    tau=_finite_exact(tau,positive=True);mass=_finite_exact(mass,positive=True)
    return sp.simplify(mass/tau)
def scaled(mass, field, k1, k2):
    mass=_finite_exact(mass,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def full_period(tau):
    tau=_finite_exact(tau,positive=True)
    return 2*sp.pi*tau
def constrained_mass(field):
    field=_finite_exact(field,positive=True)
    return field/2
'''
MODELS['magnetic-flux']=r'''
def result(field, area):
    """B in T, A in m²; fixed concordant normal, theta=0, output Wb."""
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(field*area)
def inverse_first(flux, area):
    flux=_finite_exact(flux,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(flux/area)
def inverse_second(flux, field):
    flux=_finite_exact(flux,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(flux/field)
def scaled(field, area, k1, k2):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1*k2)
def constrained_area(flux):
    """B/(1 T)=(2/3)A/(1 m²), flux/(1 Wb)=(2/3)a²."""
    flux=_finite_exact(flux,positive=True)
    return sp.sqrt(3*flux/2)
'''
