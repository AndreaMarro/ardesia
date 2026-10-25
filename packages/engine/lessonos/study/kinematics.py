"""Original SI constant-acceleration motion in two dimensions, closed form."""
import math

from .models import StudyError

DOMAIN = (
    'Punto materiale in un sistema di riferimento cartesiano inerziale, '
    'accelerazione costante nel tempo e nello spazio. Posizioni in m, velocità '
    'in m/s, accelerazioni in m/s², tempo in s. Nessun urto, contatto col suolo '
    'o resistenza dell’aria: una quota negativa è una coordinata, non un urto simulato. '
    'La velocità è un vettore; il suo modulo è la rapidità. Lo spostamento riportato '
    'è il modulo della differenza di posizione, non la distanza percorsa. '
    'Il tempo è esplicito e non dipende dall’orologio; campioni analitici, non passi '
    'di un integratore. Durata ≤ 1000 s; ogni componente iniziale ≤ 10⁶ in valore assoluto.'
)


def evaluate_kinematics(parameters):
    if not isinstance(parameters, dict) or set(parameters) - {
        'positionX', 'positionY', 'velocityX', 'velocityY',
        'accelerationX', 'accelerationY', 'time', 'duration',
    }:
        raise StudyError('invalid_parameters')
    values = {}
    for key, default, low, high in (
        ('positionX', 0, -1e6, 1e6), ('positionY', 0, -1e6, 1e6),
        ('velocityX', 2, -1e6, 1e6), ('velocityY', 0, -1e6, 1e6),
        ('accelerationX', 0, -1e6, 1e6), ('accelerationY', 0, -1e6, 1e6),
        ('time', 2, 0, 1000), ('duration', 4, .01, 1000),
    ):
        value = parameters.get(key, default)
        if type(value) not in (int, float) or not low <= value <= high or not math.isfinite(value):
            raise StudyError('invalid_physical_domain')
        values[key] = value
    if values['time'] > values['duration']:
        raise StudyError('invalid_physical_domain')

    def at(time):
        return {
            'timeS': time,
            'positionXM': values['positionX'] + values['velocityX'] * time + .5 * values['accelerationX'] * time * time,
            'positionYM': values['positionY'] + values['velocityY'] * time + .5 * values['accelerationY'] * time * time,
            'velocityXMS': values['velocityX'] + values['accelerationX'] * time,
            'velocityYMS': values['velocityY'] + values['accelerationY'] * time,
            'accelerationXMS2': values['accelerationX'],
            'accelerationYMS2': values['accelerationY'],
        }

    current = at(values['time'])
    return {
        'activityId': 'kinematics-v1', 'version': 1, 'parameters': values,
        **current, 'value': current['positionXM'], 'unit': 'm',
        'speedMS': math.hypot(current['velocityXMS'], current['velocityYMS']),
        'displacementM': math.hypot(current['positionXM'] - values['positionX'], current['positionYM'] - values['positionY']),
        'samples': [at(values['duration'] * index / 64) for index in range(65)],
        'calculatedVariable': 'Coordinata x del punto materiale',
        'fixedQuantity': 'posizione e velocità iniziali, accelerazione costante',
        'domain': DOMAIN, 'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic',
    }
