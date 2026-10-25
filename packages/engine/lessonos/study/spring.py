"""Original static spring model, in SI; no dependency on a donor implementation."""
import math

from .models import StudyError

MAX_EXTENSION = .5
DOMAIN = (
    'Molla ideale lineare in equilibrio statico, forza applicata lungo il suo asse. '
    'Si considera solo la trazione: F ≥ 0, k > 0, x = F/k; energia elastica U = kx²/2. '
    'Massa della molla, attrito, oscillazioni e deformazioni permanenti sono trascurati. '
    'Intervallo ammesso nella demo: 0 ≤ x ≤ 0,5 m; non è il limite elastico misurato di una molla reale.'
)


def evaluate_static_spring(parameters):
    if not isinstance(parameters, dict):
        raise StudyError('invalid_parameters')
    values = {}
    for key, default in (('force', 4), ('stiffness', 20)):
        value = parameters.get(key, default)
        # Bound before finite/float conversion so huge integers are rejected safely.
        if type(value) not in (int, float) or not 0 <= value <= 10000 or not math.isfinite(value) or (key == 'stiffness' and value == 0):
            raise StudyError('invalid_physical_domain')
        values[key] = value
    extension = values['force'] / values['stiffness']
    if not math.isfinite(extension) or not 0 <= extension <= MAX_EXTENSION:
        raise StudyError('invalid_physical_domain')
    energy = .5 * values['stiffness'] * extension * extension
    return {
        'activityId': 'hooke-v1', 'version': 1,
        'value': extension, 'unit': 'm', 'elasticEnergyJ': energy,
        'calculatedVariable': 'Allungamento rispetto alla lunghezza a riposo',
        'fixedQuantity': 'forza applicata e rigidità della molla',
        'maxExtension': MAX_EXTENSION, 'domain': DOMAIN,
        'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic',
    }
