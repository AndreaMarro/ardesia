"""Independent SI examples and domain boundaries for the public spring model."""
import pytest

from lessonos.study.activities import evaluate_activity
from lessonos.study.models import StudyError


@pytest.mark.parametrize('force,stiffness,extension,energy', [
    (0, 20, 0, 0),
    (4, 20, .2, .4),
    (4, 40, .1, .2),
    (6, 80, .075, .225),
    (10, 20, .5, 2.5),
])
def test_static_spring_matches_independent_force_balance_and_work_examples(force, stiffness, extension, energy):
    # Golden values were evaluated in SI independently of the implementation.
    result = evaluate_activity('hooke-v1', {'force': force, 'stiffness': stiffness})
    assert result['value'] == pytest.approx(extension, abs=1e-14)
    assert result['elasticEnergyJ'] == pytest.approx(energy, abs=1e-14)
    assert result['unit'] == 'm'
    assert result['activityId'] == 'hooke-v1'
    assert result['version'] == 1
    assert result['numericalCheck'] == 'deterministic'
    assert result['editorialStatus'] == 'DRAFT'
    assert result['maxExtension'] == .5
    assert 'equilibrio' in result['domain']


@pytest.mark.parametrize('parameters', [
    {'force': -1}, {'force': True}, {'force': '4'}, {'force': float('nan')},
    {'force': float('inf')}, {'force': 10**1000}, {'stiffness': 0},
    {'stiffness': -20}, {'stiffness': False}, {'stiffness': float('inf')},
    {'stiffness': 10**1000}, {'stiffness': 1e-300},
    {'force': 10.0001, 'stiffness': 20},
])
def test_invalid_or_outside_demo_elastic_interval_is_rejected(parameters):
    with pytest.raises(StudyError) as error:
        evaluate_activity('hooke-v1', parameters)
    assert error.value.status == 422


@pytest.mark.parametrize('parameters', [None, [], 'spring'])
def test_spring_requires_an_object(parameters):
    with pytest.raises(StudyError, match='invalid_parameters'):
        evaluate_activity('hooke-v1', parameters)
