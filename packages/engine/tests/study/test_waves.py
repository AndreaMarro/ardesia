"""Quarter-period/quarter-wavelength oracles, independent of the sampling loop."""
import importlib
import json
import math

import pytest

from lessonos.study.models import StudyError


def evaluate(parameters):
    return importlib.import_module('lessonos.study.waves').evaluate_harmonic_wave(parameters)


def test_wavelength_period_and_quarter_cycle_have_independent_si_values():
    result = evaluate({'speed': 4, 'frequency': 2, 'amplitude': .1, 'time': 0, 'phase': 0})
    assert result['value'] == pytest.approx(2)
    assert result['wavelengthM'] == pytest.approx(2)
    assert result['periodS'] == pytest.approx(.5)
    assert result['unit'] == 'm'
    assert result['activityId'] == 'harmonic-wave-v1'
    assert result['editorialStatus'] == 'DRAFT'
    # 65 points over 2 wavelengths: index 8 is lambda/4, index 24 is 3lambda/4.
    assert result['spatialSamples'][8] == pytest.approx({'xM': .5, 'displacementM': .1})
    assert result['spatialSamples'][24] == pytest.approx({'xM': 1.5, 'displacementM': -.1})
    # At x=0 a right-moving sine wave initially moves downward.
    assert result['temporalSamples'][8] == pytest.approx({'timeS': .125, 'displacementM': -.1})
    assert result['probeDisplacementM'] == pytest.approx(0, abs=1e-14)


def test_time_advances_profile_rightward_and_probe_downward_without_wall_clock():
    result = evaluate({'speed': 4, 'frequency': 2, 'amplitude': .1, 'time': .125})
    assert result['probeDisplacementM'] == pytest.approx(-.1)
    assert result['spatialSamples'][0]['displacementM'] == pytest.approx(-.1)
    assert result['spatialSamples'][8]['displacementM'] == pytest.approx(0, abs=1e-14)
    assert result['spatialSamples'][16]['displacementM'] == pytest.approx(.1)


def test_frequency_changes_spacing_and_period_but_not_speed_or_amplitude():
    first = evaluate({'speed': 340, 'frequency': 170, 'amplitude': .02})
    second = evaluate({'speed': 340, 'frequency': 340, 'amplitude': .02})
    assert first['wavelengthM'] == pytest.approx(2)
    assert second['wavelengthM'] == pytest.approx(1)
    assert first['periodS'] == pytest.approx(1/170)
    assert second['periodS'] == pytest.approx(1/340)
    assert max(p['displacementM'] for p in first['spatialSamples']) == pytest.approx(.02)
    assert max(p['displacementM'] for p in second['spatialSamples']) == pytest.approx(.02)


def test_phase_and_zero_amplitude_do_not_create_nan_or_change_wavelength():
    shifted = evaluate({'speed': 4, 'frequency': 2, 'amplitude': .1, 'phase': math.pi/2})
    assert shifted['spatialSamples'][0]['displacementM'] == pytest.approx(.1)
    flat = evaluate({'amplitude': 0})
    assert all(p['displacementM'] == 0 for p in flat['spatialSamples'])
    assert all(p['displacementM'] == 0 for p in flat['temporalSamples'])


def test_periodic_replay_and_json_roundtrip_preserve_exact_resource_parameters():
    parameters = {'speed': 4, 'frequency': 2, 'amplitude': .1, 'time': .125, 'phase': 0}
    serialized = json.dumps(parameters)
    first = evaluate(parameters)
    assert evaluate(json.loads(serialized)) == first
    assert json.dumps(parameters) == serialized
    assert json.loads(json.dumps(first, allow_nan=False)) == first
    later = evaluate({**parameters, 'time': .625})
    assert [p['displacementM'] for p in later['spatialSamples']] == pytest.approx(
        [p['displacementM'] for p in first['spatialSamples']], abs=1e-14)


@pytest.mark.parametrize('parameters', [
    None, [], 'wave', {'speed': 0}, {'frequency': 0}, {'frequency': -2},
    {'speed': True}, {'frequency': '2'}, {'amplitude': -1}, {'amplitude': float('nan')},
    {'phase': float('inf')}, {'time': -1}, {'frequency': 10**1000}, {'speed': 10**1000},
    {'frequency': 1e12, 'time': 1}, {'frequncy': 2}, {'phase': 100},
])
def test_singular_nonfinite_unknown_and_unresolvable_time_inputs_are_rejected(parameters):
    with pytest.raises(StudyError) as error:
        evaluate(parameters)
    assert error.value.status == 422
