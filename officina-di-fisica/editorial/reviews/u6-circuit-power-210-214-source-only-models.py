"""Models derived only from B frozen primary5a11 and original U6-03 prompts.
No candidate A, answer option, author module or distinct primary is imported.
Not yet a verifier, signature or PASS; do not expose derivation values to author A.
"""
MODELS={
'identical-parallel-resistors':r'''
def _count(value):
    value=_rational_exact(value)
    if value<=0 or value.denominator!=1:raise ValueError('Positive integer count required')
    return value.numerator
def result(branch,count):
    branch=_rational_exact(branch);count=_count(count)
    if branch<=0:raise ValueError('Positive passive branch resistance required')
    return Fraction((SI.Quantity(branch,'ohm')/count).to('ohm').magnitude)
def inverse_branch(total,count):
    total=_rational_exact(total);count=_count(count)
    if total<=0:raise ValueError('Positive equivalent resistance required')
    return total*count
def inverse_count(total,branch):
    total,branch=map(_rational_exact,(total,branch))
    if min(total,branch)<=0:raise ValueError('Positive equivalent and branch resistance required')
    return _count(branch/total)
def scaled(branch,count,a,b):
    branch,a,b=map(_rational_exact,(branch,a,b));count=_count(count)
    if min(branch,a,b)<=0:raise ValueError('Positive passive preparation factors required')
    final_count=_count(b*count)
    return result(a*branch,final_count)/result(branch,count)
def constrained_value(count):
    count=_count(count)
    return result(4*count,count)
''',
'voltage-divider':r'''
def result(upper,lower):
    upper,lower=map(_rational_exact,(upper,lower))
    if min(upper,lower)<=0:raise ValueError('Positive passive resistances and unloaded node required')
    return Fraction((SI.Quantity(12,'volt')*lower/(upper+lower)).to('volt').magnitude)
def inverse_upper(total,lower):
    total,lower=map(_rational_exact,(total,lower))
    if not 0<total<12 or lower<=0:raise ValueError('Voltage strictly between zero and source,positive known resistor required')
    return lower*(12-total)/total
def inverse_lower(total,upper):
    total,upper=map(_rational_exact,(total,upper))
    if not 0<total<12 or upper<=0:raise ValueError('Voltage strictly between zero and source,positive known resistor required')
    return total*upper/(12-total)
def scaled(upper,lower,a,b):
    upper,lower,a,b=map(_rational_exact,(upper,lower,a,b))
    if min(upper,lower,a,b)<=0:raise ValueError('Positive preparation factors and resistors required')
    return result(a*upper,b*lower)/result(upper,lower)
def constrained_value(resistance):
    resistance=_rational_exact(resistance)
    if resistance<=0:raise ValueError('Positive common resistance required')
    return result(resistance,resistance)
''',
'current-divider':r'''
def result(first,second):
    first,second=map(_rational_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Two positive parallel resistances required')
    return Fraction((SI.Quantity(12,'milliampere')*second/(first+second)).to('milliampere').magnitude)
def inverse_first(current,second):
    current,second=map(_rational_exact,(current,second))
    if not 0<current<12 or second<=0:raise ValueError('Branch current strictly between zero and total,positive known resistance required')
    return second*(12-current)/current
def inverse_second(current,first):
    current,first=map(_rational_exact,(current,first))
    if not 0<current<12 or first<=0:raise ValueError('Branch current strictly between zero and total,positive known resistance required')
    return current*first/(12-current)
def scaled(first,second,a,b):
    first,second,a,b=map(_rational_exact,(first,second,a,b))
    if min(first,second,a,b)<=0:raise ValueError('Positive preparation factors and resistances required')
    return result(a*first,b*second)/result(first,second)
def constrained_value(resistance):
    resistance=_rational_exact(resistance)
    if resistance<=0:raise ValueError('Positive common resistance required')
    return result(resistance,resistance)
''',
'joule-power':r'''
def result(current,resistance):
    current,resistance=map(_rational_exact,(current,resistance))
    if min(current,resistance)<=0:raise ValueError('Positive constant current and passive ohmic resistance required')
    return Fraction((SI.Quantity(current,'ampere')**2*SI.Quantity(resistance,'ohm')).to('watt').magnitude)
def inverse_current(power,resistance):
    power,resistance=map(_finite_exact,(power,resistance))
    if power.is_positive is not True or resistance.is_positive is not True:raise ValueError('Positive power and resistance required')
    return sp.sqrt(power/resistance)
def inverse_resistance(power,current):
    power,current=map(_rational_exact,(power,current))
    if min(power,current)<=0:raise ValueError('Positive power and nonzero positive current required')
    return power/current**2
def scaled(current,resistance,a,b):
    current,resistance,a,b=map(_rational_exact,(current,resistance,a,b))
    if min(current,resistance,a,b)<=0:raise ValueError('Positive factors and passive state required')
    return result(a*current,b*resistance)/result(current,resistance)
def parallel_load_current_ratio(first_power,second_power,voltage):
    first_power,second_power,voltage=map(_rational_exact,(first_power,second_power,voltage))
    if min(first_power,second_power,voltage)<=0:raise ValueError('Positive load powers and common nonzero voltage required')
    first=(SI.Quantity(first_power,'watt')/SI.Quantity(voltage,'volt')).to('ampere')
    second=(SI.Quantity(second_power,'watt')/SI.Quantity(voltage,'volt')).to('ampere')
    return Fraction((first/second).to('dimensionless').magnitude)
def constrained_resistance(power):
    power=_finite_exact(power)
    if power.is_positive is not True:raise ValueError('Positive power required')
    return sp.real_root(9*power/4,3)
''',
'joule-energy-voltage-time':r'''
def result(voltage,duration):
    voltage,duration=map(_rational_exact,(voltage,duration))
    if min(voltage,duration)<=0:raise ValueError('Positive maintained voltage and duration required')
    return Fraction((SI.Quantity(voltage,'volt')**2*SI.Quantity(duration,'second')/SI.Quantity(2,'ohm')).to('joule').magnitude)
def inverse_voltage(energy,duration):
    energy,duration=map(_finite_exact,(energy,duration))
    if energy.is_positive is not True or duration.is_positive is not True:raise ValueError('Positive energy and duration required')
    return sp.sqrt(2*energy/duration)
def inverse_duration(energy,voltage):
    energy,voltage=map(_rational_exact,(energy,voltage))
    if min(energy,voltage)<=0:raise ValueError('Positive energy and maintained voltage required')
    return 2*energy/voltage**2
def scaled(voltage,duration,a,b):
    voltage,duration,a,b=map(_rational_exact,(voltage,duration,a,b))
    if min(voltage,duration,a,b)<=0:raise ValueError('Positive factors and states required')
    return result(a*voltage,b*duration)/result(voltage,duration)
def constrained_duration(energy):
    energy=_finite_exact(energy)
    if energy.is_positive is not True:raise ValueError('Positive energy required')
    return sp.real_root(9*energy/2,3)
'''}
