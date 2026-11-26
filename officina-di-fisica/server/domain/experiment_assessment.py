"""Pedagogical sampling selects inputs; installed models retain all physical authority."""
import math
from .errors import require
from .science import number


def validate_assessment_selection(record):
    if 'assessmentSelection' not in record:
        return
    require(record.get('kind') == 'experiment', 'La selezione delle verifiche richiede una simulazione.')
    selection = record['assessmentSelection']
    require(isinstance(selection, dict) and set(selection) == {'schemaVersion', 'points'}
            and selection['schemaVersion'] == '1.0.0', 'Versione della selezione delle verifiche non valida.')
    points = selection['points']
    require(isinstance(points, list) and len(points) == 2 and all(number(x) for x in points)
            and points[0] != points[1], 'Scegli due misure distinte e finite.')
    control = record.get('control')
    require(isinstance(control, dict) and all(number(control.get(k)) for k in ('min', 'max', 'step'))
            and control['step'] > 0 and control['max'] > control['min'], 'Griglia delle misure non valida.')
    for value in points:
        offset = (value - control['min']) / control['step']
        require(control['min'] <= value <= control['max'] and math.isfinite(offset)
                and math.isclose(offset, round(offset), rel_tol=0, abs_tol=1e-9),
                'La verifica deve usare un valore della griglia installata.')
