"""Original analytical two-resistor teaching model; not a general circuit solver.

SI inputs: voltage [V], resistance1/2 [ohm], topology [series|parallel].
The Studio CircuitSolver remains the solver for arbitrary component networks.
"""
import math

from .models import StudyError

DOMAIN = (
    'Due resistori ohmici ideali in serie o in parallelo, generatore ideale di tensione '
    'continua e fili senza resistenza. Regime stazionario: nessun condensatore, '
    'induttore, riscaldamento o limite di potenza reale simulato. '
    'La corrente convenzionale segue il segno della tensione; la potenza dissipata '
    'è non negativa. Intervallo numerico: |V| ≤ 1000 V, 10⁻⁶ ≤ R ≤ 10⁹ Ω.'
)


def evaluate_dc_circuit(parameters):
    """Return serializable branch measurements and I-V/power samples in SI.

    Unknown keys are rejected so a misspelled physical control cannot silently
    fall back to a default. Bounds are checked before math.isfinite, including
    for arbitrary-size JSON integers. No input is mutated and no clock is read.
    """
    if not isinstance(parameters, dict) or set(parameters) - {
        'voltage', 'resistance1', 'resistance2', 'topology',
    }:
        raise StudyError('invalid_parameters')
    topology = parameters.get('topology', 'series')
    if not isinstance(topology, str) or topology not in ('series', 'parallel'):
        raise StudyError('invalid_parameters')
    values = {}
    for key, default, low, high in (
        ('voltage', 12, -1000, 1000),
        ('resistance1', 4, 1e-6, 1e9),
        ('resistance2', 8, 1e-6, 1e9),
    ):
        value = parameters.get(key, default)
        if type(value) not in (int, float) or not low <= value <= high or not math.isfinite(value):
            raise StudyError('invalid_physical_domain')
        values[key] = value
    voltage = values['voltage']
    r1, r2 = values['resistance1'], values['resistance2']
    equivalent = r1 + r2 if topology == 'series' else r1 * r2 / (r1 + r2)
    current = voltage / equivalent
    branches = []
    for index, resistance in enumerate((r1, r2), 1):
        branch_current = current if topology == 'series' else voltage / resistance
        branch_voltage = branch_current * resistance if topology == 'series' else voltage
        branches.append({
            'id': f'R{index}', 'resistanceOhm': resistance,
            'currentA': branch_current, 'voltageV': branch_voltage,
            'powerW': branch_voltage * branch_current,
        })
    return {
        'activityId': 'dc-resistance-v1', 'version': 1,
        'parameters': {**values, 'topology': topology},
        'value': current, 'unit': 'A', 'currentA': current,
        'equivalentResistanceOhm': equivalent, 'totalPowerW': voltage * current,
        'branches': branches,
        'ivSamples': [
            {'voltageV': voltage * index / 8,
             'currentA': voltage * index / 8 / equivalent,
             'totalPowerW': (voltage * index / 8) ** 2 / equivalent}
            for index in range(9)
        ],
        'calculatedVariable': 'Corrente totale fornita dal generatore',
        'fixedQuantity': 'tensione del generatore, resistenze e collegamento',
        'domain': DOMAIN, 'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic',
    }
