"""Bounded Maclaurin exp model. Numeric checks never approve written reasoning."""
from fractions import Fraction
import math
from .models import StudyError


def evaluate_exp_taylor(parameters):
    if not isinstance(parameters, dict) or set(parameters) != {'x', 'degree'}:
        raise StudyError('invalid_parameters')
    x, degree = parameters['x'], parameters['degree']
    # Compare integers before conversion: huge JSON integers must not overflow.
    if type(x) not in (int, float) or not -1 <= x <= 1 or type(degree) is not int or not 0 <= degree <= 12:
        raise StudyError('invalid_parameters')
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
    return {'activityId': 'taylor-exp-v1', 'version': 1, 'value': value, 'unit': '1',
            'degree': degree, 'terms': degree + 1, 'remainderBound': upper, 'center': 0,
            'boundMethod': 'lagrange_M1_M3_plus_rounding_v1',
            'calculatedVariable': 'Polinomio di Maclaurin di exp',
            'domain': 'Exp reale, centro 0, -1 ≤ x ≤ 1, grado intero 0–12. Bound conservativo di Lagrange, incluso arrotondamento del polinomio; nessuna verifica automatica della dimostrazione.',
            'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic', 'scientificApproval': 'NOT_RUN'}
