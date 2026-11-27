"""Fresh rational models from the eight original activity statements; no authoring imports."""
from decimal import Decimal
from fractions import Fraction
import re

IDS = ('SIM-C4-L01-01', 'SIM-C4-L01-02', 'SIM-C4-L02-01', 'SIM-C4-L02-02',
       'SIM-C4-L02-03', 'SIM-C4-L03-01', 'SIM-C4-L03-02', 'SIM-C4-L03-03')
DOMAINS = ((0, 8, '1'), (1, 6, '.5'), (1, 8, '.5'), (-3, 3, '.5'),
           (0, 4, '.25'), (-2, 3, '.5'), (-4, 4, '.5'), (0, 8, '.5'))
TASK_INPUTS = (('6', '4'), ('3', '4'), ('3', '5'), ('1', '0'),
               ('3', '2'), ('2', '.5'), ('3', '0'), ('5', '4'))
TASK_RESULTS = (('6', '4'), ('10', '45/8'), ('10', '18/5'), ('0', '45/2'),
                ('9/2', '2'), ('9/2', '9/5'), ('-6', '0'), ('15', '12'))
UNITS = ('1', 'µN', 'kN/C', 'kN/C', 'mm', 'µJ', 'V', 'µJ')
PREDICTIONS = (2, 0, 0, 0, 2, 2, 0, 2)

def rational(value):
    if type(value) is int:
        if value.bit_length() > 4096:
            raise ValueError('Exact input exceeds bounded review budget')
        return Fraction(value)
    if type(value) is Fraction:
        if max(value.numerator.bit_length(), value.denominator.bit_length()) > 4096:
            raise ValueError('Exact input exceeds bounded review budget')
        return value
    if type(value) is Decimal and value.is_finite():
        info = value.as_tuple()
        if abs(info.exponent) > 1000 or len(info.digits) > 128:
            raise ValueError('Exact input exceeds bounded review budget')
        return Fraction(value)
    if type(value) is str:
        if len(value) > 128 or not re.fullmatch(r'[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]{1,2})?|[+-]?[0-9]+/[0-9]+', value):
            raise ValueError('A bounded rational literal is required')
        # Decimal/Fraction parsing preserves the input lexeme, never binary float.
        try:
            result = Fraction(value)
        except (ValueError, ZeroDivisionError, OverflowError):
            raise ValueError('A finite exact rational literal is required') from None
        return result
    raise ValueError('A finite exact real rational is required; binary floats are not accepted')

def value(ident, x, *, require_grid=False):
    if ident not in IDS:
        raise ValueError('Foreign activity ID')
    index = IDS.index(ident)
    x = rational(x)
    lower, upper, step = DOMAINS[index]
    if not rational(lower) <= x <= rational(upper):
        raise ValueError('Outside declared physical/control domain')
    if ident == IDS[0] and x.denominator != 1:
        raise ValueError('Electron count must be an integer')
    if require_grid and ((x - lower) / rational(step)).denominator != 1:
        raise ValueError('Not a declared control-grid value')
    if index == 0:
        return x
    if index in (1, 2):
        return 90 / x**2
    if index == 3:
        return Fraction(45, 2) * (1 - x)
    if index == 4:
        return x**2 / 2
    if index == 5:
        return Fraction(9, 10) * (1 + 2*x)
    if index == 6:
        return -2*x
    return 3*x

def exact_tasks():
    rows = []
    for index, ident in enumerate(IDS):
        tasks = []
        for x, expected in zip(TASK_INPUTS[index], TASK_RESULTS[index]):
            answer = value(ident, x, require_grid=True)
            if answer != rational(expected):
                raise AssertionError((ident, x, answer, expected))
            tasks.append({'input': x, 'independentExact': str(answer), 'unit': UNITS[index]})
        rows.append({'id': ident, 'tasks': tasks, 'predictionIndex': PREDICTIONS[index]})
    return rows
