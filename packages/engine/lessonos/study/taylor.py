"""Bounded Maclaurin exp model. Numeric checks never approve written reasoning."""
from fractions import Fraction
import math
from .models import StudyError


def _polynomial_and_bound(x, degree):
    """One numerical authority for both the selected point and plot samples."""
    argument = Fraction(x)
    term = total = Fraction(1)
    for index in range(1, degree + 1):
        term = term * argument / index
        total += term
    value = float(total)
    # On the segment from zero to x: exp(t)<=1 for x<=0, exp(t)<3 otherwise.
    # e=2+sum(k>=2)1/k! < 2+sum(k>=2)1/2**(k-1)=3.
    analytic = (1 if x <= 0 else 3) * abs(argument) ** (degree + 1) / math.factorial(degree + 1)
    bound = analytic + abs(Fraction(value) - total)
    # Include polynomial rounding; round a positive bound upwards even below
    # the smallest subnormal. This is not an exp()-difference used as a proof.
    upper = math.nextafter(float(bound), math.inf) if bound else 0.0
    return value, upper


def _sample(x, degree):
    value, upper = _polynomial_and_bound(x, degree)
    reference = math.exp(x)
    return {'x': x, 'value': value, 'remainderBound': upper,
            'referenceValue': reference, 'absoluteError': abs(reference - value)}


def evaluate_exp_taylor(parameters):
    if not isinstance(parameters, dict) or set(parameters) != {'x', 'degree'}:
        raise StudyError('invalid_parameters')
    x, degree = parameters['x'], parameters['degree']
    # Compare integers before conversion: huge JSON integers must not overflow.
    if type(x) not in (int, float) or not -1 <= x <= 1 or type(degree) is not int or not 0 <= degree <= 12:
        raise StudyError('invalid_parameters')
    selected = _sample(x, degree)
    # Fixed, bounded projection; no expression parser, new solver, or extra API.
    # exp() is a numerical reference only. The independent Lagrange bound above
    # is not inferred from this floating-point difference.
    samples = [_sample(index / 20, degree) for index in range(-20, 21)]
    value, upper = selected['value'], selected['remainderBound']
    return {'activityId': 'taylor-exp-v1', 'version': 1, 'value': value, 'unit': '1',
            'x': x, 'referenceValue': selected['referenceValue'], 'absoluteError': selected['absoluteError'],
            'degree': degree, 'terms': degree + 1, 'remainderBound': upper, 'center': 0,
            'plot': {'schemaVersion': 1, 'domain': [-1, 1], 'samples': samples},
            'boundMethod': 'lagrange_M1_M3_plus_rounding_v1',
            'calculatedVariable': 'Polinomio di Maclaurin di exp',
            'domain': 'Exp reale, centro 0, -1 ≤ x ≤ 1, grado intero 0–12. Bound conservativo di Lagrange, incluso arrotondamento del polinomio; nessuna verifica automatica della dimostrazione.',
            'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic', 'scientificApproval': 'NOT_RUN'}
