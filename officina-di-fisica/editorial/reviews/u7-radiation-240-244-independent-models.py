"""Independent numerical models derived from prompt-only primary 8771a65b.
Frozen before opening any A240–244 candidate/key/options/SVG. No imports or keys.
Execution supplies SymPy sp and strict finite real exact guard _finite_exact.
"""
MODELS={}
MODELS['wavelength-in-medium']=r'''
def _index(value):
    value=_finite_exact(value,positive=True)
    if sp.simplify(value-1).is_nonnegative is not True:raise ValueError('Phase index at least one required by the assigned model')
    return value
def result(vacuum_wavelength,index):
    vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True);index=_index(index)
    return sp.simplify(vacuum_wavelength/index)
def inverse_first(wavelength,index):
    wavelength=_finite_exact(wavelength,positive=True);index=_index(index)
    return sp.simplify(wavelength*index)
def inverse_second(wavelength,vacuum_wavelength):
    wavelength=_finite_exact(wavelength,positive=True);vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True)
    return _index(sp.simplify(vacuum_wavelength/wavelength))
def scaled(vacuum_wavelength,index,k1,k2):
    vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True);index=_index(index)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_index(k2*index)
    return sp.simplify(k1/k2)
def constrained_vacuum_wavelength(index):
    return 300*_index(index)
'''
MODELS['photon-packet-frequency']=r'''
def _count(value):
    value=_finite_exact(value,positive=True)
    if value.is_integer is not True:raise ValueError('A positive integer photon count is required')
    return value
def result(count,frequency):
    count=_count(count);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(sp.Rational(33,5)*count*frequency)
def inverse_first(energy,frequency):
    energy=_finite_exact(energy,positive=True);frequency=_finite_exact(frequency,positive=True)
    return _count(sp.simplify(5*energy/(33*frequency)))
def inverse_second(energy,count):
    energy=_finite_exact(energy,positive=True);count=_count(count)
    return sp.simplify(5*energy/(33*count))
def scaled(count,frequency,k1,k2):
    count=_count(count);frequency=_finite_exact(frequency,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_count(k1*count)
    return sp.simplify(k1*k2)
def constrained_frequency(energy):
    energy=_finite_exact(energy,positive=True);frequency=sp.sqrt(energy/33);_count(5*frequency)
    return frequency
'''
MODELS['photon-rate-power']=r'''
def result(power,frequency):
    power=_finite_exact(power,positive=True);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(50*power/(33*frequency))
def inverse_first(rate,frequency):
    rate=_finite_exact(rate,positive=True);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(33*rate*frequency/50)
def inverse_second(rate,power):
    rate=_finite_exact(rate,positive=True);power=_finite_exact(power,positive=True)
    return sp.simplify(50*power/(33*rate))
def scaled(power,frequency,k1,k2):
    power=_finite_exact(power,positive=True);frequency=_finite_exact(frequency,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def constrained_power(frequency):
    return 33*_finite_exact(frequency,positive=True)
'''
MODELS['em-wave-field-power']=r'''
def result(field,area):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(field**2*area/7500000)
def inverse_first(power,area):
    power=_finite_exact(power,positive=True);area=_finite_exact(area,positive=True)
    return sp.sqrt(7500000*power/area)
def inverse_second(power,field):
    power=_finite_exact(power,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(7500000*power/field**2)
def scaled(field,area,k1,k2):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1**2*k2)
def constrained_area(power):
    power=_finite_exact(power,positive=True)
    return sp.real_root(sp.Rational(10000000,3)*power,3)
'''
MODELS['absorbed-radiant-power']=r'''
def _transmittance(value):
    value=_finite_exact(value,positive=True)
    if sp.simplify(1-value).is_positive is not True:raise ValueError('Strict transmittance domain zero < T < one required')
    return value
def result(incident,transmittance):
    incident=_finite_exact(incident,positive=True);transmittance=_transmittance(transmittance)
    return sp.simplify(incident*(1-transmittance))
def inverse_first(absorbed,transmittance):
    absorbed=_finite_exact(absorbed,positive=True);transmittance=_transmittance(transmittance)
    return sp.simplify(absorbed/(1-transmittance))
def inverse_second(absorbed,incident):
    absorbed=_finite_exact(absorbed,positive=True);incident=_finite_exact(incident,positive=True)
    return _transmittance(sp.simplify(1-absorbed/incident))
def scaled(incident,transmittance,k1,k2):
    incident=_finite_exact(incident,positive=True);transmittance=_transmittance(transmittance)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_transmittance(k2*transmittance)
    return sp.simplify(k1*(1-k2*transmittance)/(1-transmittance))
def constrained_transmittances(absorbed):
    absorbed=_finite_exact(absorbed,positive=True);discriminant=sp.simplify(1-absorbed/4)
    if discriminant.is_nonnegative is not True:raise ValueError('Assigned constrained absorbed power cannot exceed four watts')
    if discriminant==0:return (sp.Rational(1,2),)
    return tuple(_transmittance(x) for x in ((1-sp.sqrt(discriminant))/2,(1+sp.sqrt(discriminant))/2))
'''
