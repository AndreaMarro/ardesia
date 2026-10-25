"""Original SI goldens: 12 V over 4+8 ohm; parallel branches at 3 A and 1.5 A."""
import importlib
import json

import pytest

from lessonos.study.models import StudyError


def evaluate(parameters):
    return importlib.import_module('lessonos.study.electrical').evaluate_dc_circuit(parameters)


@pytest.mark.parametrize('topology,req,current,power,branch_currents,branch_voltages,branch_powers', [
    ('series', 12, 1, 12, [1, 1], [4, 8], [4, 8]),
    ('parallel', 8/3, 4.5, 54, [3, 1.5], [12, 12], [36, 18]),
])
def test_network_goldens_and_branch_energy_balance(topology, req, current, power, branch_currents, branch_voltages, branch_powers):
    result = evaluate({'voltage': 12, 'resistance1': 4, 'resistance2': 8, 'topology': topology})
    assert result['equivalentResistanceOhm'] == pytest.approx(req)
    assert result['currentA'] == pytest.approx(current)
    assert result['value'] == result['currentA']
    assert result['unit'] == 'A'
    assert result['totalPowerW'] == pytest.approx(power)
    assert [b['currentA'] for b in result['branches']] == pytest.approx(branch_currents)
    assert [b['voltageV'] for b in result['branches']] == pytest.approx(branch_voltages)
    assert [b['powerW'] for b in result['branches']] == pytest.approx(branch_powers)
    assert sum(b['powerW'] for b in result['branches']) == pytest.approx(power)
    assert result['ivSamples'][-1]['currentA'] == pytest.approx(current)
    assert result['ivSamples'][-1]['totalPowerW'] == pytest.approx(power)
    assert result['editorialStatus'] == 'DRAFT'
    assert result['activityId'] == 'dc-resistance-v1'


def test_doubling_voltage_at_fixed_resistance_doubles_current_and_quadruples_power():
    low = evaluate({'voltage': 6, 'resistance1': 4, 'resistance2': 8})
    high = evaluate({'voltage': 12, 'resistance1': 4, 'resistance2': 8})
    assert low['currentA'] == pytest.approx(.5)
    assert high['currentA'] == pytest.approx(1)
    assert low['totalPowerW'] == pytest.approx(3)
    assert high['totalPowerW'] == pytest.approx(12)


@pytest.mark.parametrize('voltage,current,power', [(0, 0, 0), (-12, -1, 12)])
def test_zero_and_reversed_polarity_are_finite_and_passive(voltage, current, power):
    result = evaluate({'voltage': voltage, 'resistance1': 4, 'resistance2': 8})
    assert result['currentA'] == pytest.approx(current)
    assert result['totalPowerW'] == pytest.approx(power)
    assert all(b['powerW'] >= 0 for b in result['branches'])


def test_serialized_parameters_replay_without_mutation_or_hidden_clock():
    parameters = {'voltage': 12, 'resistance1': 4, 'resistance2': 8, 'topology': 'parallel'}
    before = json.dumps(parameters, sort_keys=True)
    first = evaluate(parameters)
    assert json.dumps(parameters, sort_keys=True) == before
    assert evaluate(json.loads(before)) == first
    assert json.loads(json.dumps(first, allow_nan=False)) == first


@pytest.mark.parametrize('parameters', [
    None, [], 'circuit', {'topology': []}, {'topology': 'bridge'},
    {'resistance1': 0}, {'resistance2': -1}, {'resistance1': 1e-300},
    {'voltage': float('nan')}, {'voltage': float('inf')}, {'voltage': True},
    {'resistance2': '8'}, {'resistance1': 10**1000}, {'voltage': 10**1000},
    {'voltage': 1001}, {'resistance1': 1e9+1}, {'resistence1': 4},
])
def test_invalid_or_misspelled_inputs_fail_with_controlled_study_error(parameters):
    with pytest.raises(StudyError) as error:
        evaluate(parameters)
    assert error.value.status == 422
