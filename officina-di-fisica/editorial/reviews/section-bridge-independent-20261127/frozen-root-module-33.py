"""Exact dimensionless coefficients for the independently reviewed C5 wave laws.

Arguments denote the consistently dimensioned quantities stated by callers;
Pint crosschecks are kept separately in the immutable source-only model.
"""
import sympy as sp

def exact(value):
    if isinstance(value,(float,bool)):raise ValueError('finite exact real input required')
    try:value=sp.sympify(value,strict=True)
    except(TypeError,ValueError,sp.SympifyError)as error:raise ValueError('invalid exact input')from error
    if value.atoms(sp.Float)or value.free_symbols or value.is_number is not True or value.is_real is not True or value.is_finite is not True:raise ValueError('finite exact real input required')
    return value

def positive(value):
    value=exact(value)
    if value.is_positive is not True:raise ValueError('strict positive domain required')
    return value

def wave_speed(frequency,wavelength):return positive(frequency)*positive(wavelength)
def wavelength(speed,frequency):return positive(speed)/positive(frequency)
def wavenumber(length):return 2*sp.pi/positive(length)
def spatial_phase(distance,length):return sp.Abs(exact(distance))*wavenumber(length)
def harmonic_period_ratio(old_stiffness,new_stiffness):return sp.sqrt(positive(old_stiffness)/positive(new_stiffness))
def spherical_ratio(power_ratio,radius_ratio):return positive(power_ratio)/positive(radius_ratio)**2

def projected_power(intensity,area,cosine):
    intensity,area,cosine=positive(intensity),positive(area),exact(cosine)
    if cosine<0 or cosine>1:raise ValueError('projection cosine must lie in [0,1]')
    return intensity*area*cosine

def duty_power(peak,active,total):
    peak,active,total=positive(peak),positive(active),positive(total)
    if active>total:raise ValueError('active interval cannot exceed whole period')
    return peak*active/total

def echo_speed(distance,total_time):return 2*positive(distance)/positive(total_time)
def level_gain(intensity_ratio):return 10*sp.log(positive(intensity_ratio))/sp.log(10)

def check_independent_laws(values):
    assert harmonic_period_ratio(1,sp.Rational(1,4))==values['C5-Q009']
    assert spatial_phase(sp.Rational(12,100),sp.Rational(48,100))==values['C5-Q014']
    assert wavenumber(sp.Rational(5,2))==values['C5-Q017']
    assert spherical_ratio(2,2)==values['C5-Q032']
    assert duty_power(4,2,10)==values['C5-Q037']
    assert projected_power(5,4,sp.Rational(1,2))==values['C5-Q039']
    assert sp.simplify(level_gain(sp.Rational(1,100))-values['C5-Q043'])==0
    assert echo_speed(51,sp.Rational(3,10))==values['C5-Q045']
    assert wavelength(1480,1000)==values['C5-Q048']
    assert sp.simplify(level_gain(3)-values['C5-Q050'])==0
