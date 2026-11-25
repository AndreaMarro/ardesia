# Independent implementation from frozen primary08e1; no candidate/authoring imports.
# Written after textual rereading220–222; derivations themselves were frozen before candidates.
MODELS={
'parallel-capacitors':r'''
def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if first<=0 or second<=0:raise ValueError('Positive finite capacitances required')
    return first+second

def inverse_component(total,known):
    total,known=map(_finite_exact,(total,known))
    if known<=0 or total<=known:raise ValueError('Equivalent must exceed known positive component')
    return total-known

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def opposite_voltage(first,voltage1,second,voltage2):
    first,voltage1,second,voltage2=map(_finite_exact,(first,voltage1,second,voltage2))
    if min(first,voltage1,second,voltage2)<=0:raise ValueError('Positive finite initial magnitudes and capacities required')
    return sp.cancel((first*voltage1-second*voltage2)/(first+second))

def constrained_second(total):
    total=_finite_exact(total)
    if total<=0:raise ValueError('Positive finite total required')
    return 3*total/5
''',
'series-capacitors':r'''
def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if first<=0 or second<=0:raise ValueError('Positive finite capacitances required')
    return sp.cancel(first*second/(first+second))

def inverse_component(total,known):
    total,known=map(_finite_exact,(total,known))
    if total<=0 or known<=total:raise ValueError('Equivalent must lie strictly between zero and known capacitance')
    return sp.cancel(total*known/(known-total))

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def topology_ratio(first,second):
    first,second=map(_finite_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Positive finite capacitances required')
    return sp.cancel((first+second)/result(first,second))

def constrained_second(total):
    total=_finite_exact(total)
    if total<=0:raise ValueError('Positive finite total required')
    return 2*total
''',
'series-capacitor-voltage':r'''
def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Positive finite capacitances required')
    return sp.cancel(12*second/(first+second))

def inverse_first(voltage,second):
    voltage,second=map(_finite_exact,(voltage,second))
    if not 0<voltage<12 or second<=0:raise ValueError('Voltage must lie strictly between zero and12; positive finite capacitance required')
    return sp.cancel(second*(12-voltage)/voltage)

def inverse_second(voltage,first):
    voltage,first=map(_finite_exact,(voltage,first))
    if not 0<voltage<12 or first<=0:raise ValueError('Voltage must lie strictly between zero and12; positive finite capacitance required')
    return sp.cancel(first*voltage/(12-voltage))

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def constrained_value(common):
    common=_finite_exact(common)
    if common<=0:raise ValueError('Positive finite common capacitance required')
    return result(common,common)
''',
'capacitor-charge-sharing':r'''
def result(initial,added):
    initial,added=map(_finite_exact,(initial,added))
    if min(initial,added)<=0:raise ValueError('Positive finite voltage and added capacitance required')
    return sp.cancel(2*initial/(2+added))

def inverse_first(final,added):
    final,added=map(_finite_exact,(final,added))
    if min(final,added)<=0:raise ValueError('Positive finite final voltage and capacitance required')
    return sp.cancel(final*(2+added)/2)

def inverse_second(final,initial):
    final,initial=map(_finite_exact,(final,initial))
    if not 0<final<initial:raise ValueError('Final voltage must lie strictly between zero and initial voltage')
    return sp.cancel(2*(initial/final-1))

def scaled(initial,added,k1,k2):
    initial,added,k1,k2=map(_finite_exact,(initial,added,k1,k2))
    if min(initial,added,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*initial,k2*added)/result(initial,added))

def constrained_second(final):
    final=_finite_exact(final)
    if not 0<final<6:raise ValueError('Constrained voltage must lie strictly between zero and6')
    return sp.cancel(2*final/(6-final))
''',
'capacitor-sharing-energy-loss':r'''
def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if not first>second>0:raise ValueError('Finite voltages must satisfy first>second>0')
    return (first-second)**2/4

def inverse_first(loss,second):
    loss,second=map(_finite_exact,(loss,second))
    if min(loss,second)<=0:raise ValueError('Positive finite loss and lower voltage required')
    return second+2*sp.sqrt(loss)

def inverse_second(loss,first):
    loss,first=map(_finite_exact,(loss,first))
    if first<=0 or not 0<loss<first**2/4:raise ValueError('Strict upper loss bound required for positive lower voltage')
    return first-2*sp.sqrt(loss)

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(k1,k2)<=0:raise ValueError('Positive finite scaling factors required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def constrained_second(loss):
    loss=_finite_exact(loss)
    if loss<=0:raise ValueError('Positive finite energy loss required')
    return 2*sp.sqrt(loss)
'''}
