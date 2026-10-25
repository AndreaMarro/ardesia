"""Independent constant-acceleration/vector examples, not numerical integration."""
import importlib
import json

import pytest

from lessonos.study.models import StudyError


def evaluate(parameters):
    return importlib.import_module('lessonos.study.kinematics').evaluate_kinematics(parameters)


def test_constant_velocity_links_signed_positions_velocity_and_displacement():
    result = evaluate({'positionX': -2, 'positionY': 1, 'velocityX': 3, 'velocityY': -4, 'time': 2})
    assert result['positionXM'] == pytest.approx(4)
    assert result['positionYM'] == pytest.approx(-7)
    assert result['velocityXMS'] == 3
    assert result['velocityYMS'] == -4
    assert result['speedMS'] == 5
    assert result['displacementM'] == 10
    assert result['value'] == result['positionXM']
    assert result['unit'] == 'm'
    assert result['samples'][-1]['positionXM'] == pytest.approx(10)
    assert result['samples'][-1]['positionYM'] == pytest.approx(-15)


def test_projectile_vertex_and_return_keep_velocity_distinct_from_acceleration():
    result = evaluate({'velocityX': 3, 'velocityY': 4, 'accelerationY': -2, 'time': 2, 'duration': 4})
    assert result['positionXM'] == 6
    assert result['positionYM'] == 4
    assert result['velocityYMS'] == 0
    assert result['velocityXMS'] == 3
    assert result['accelerationYMS2'] == -2
    assert result['samples'][-1]['positionYM'] == 0
    assert result['samples'][-1]['velocityYMS'] == -4
    assert result['speedMS'] == 3
    assert result['activityId'] == 'kinematics-v1'
    assert result['editorialStatus'] == 'DRAFT'


def test_reversal_changes_sign_and_displacement_is_not_distance_travelled():
    result = evaluate({'velocityX': 6, 'accelerationX': -2, 'time': 4})
    # It reaches x=9 at t=3, then returns to x=8. Distance is 10 m, displacement 8 m.
    assert result['positionXM'] == 8
    assert result['velocityXMS'] == -2
    assert result['displacementM'] == 8
    assert result['speedMS'] == 2


def test_origin_translation_preserves_velocity_and_displacement_and_replays_json():
    p = {'velocityX': 3, 'velocityY': 4, 'accelerationY': -2, 'time': 2}
    first = evaluate(p)
    shifted = evaluate({**p, 'positionX': 100, 'positionY': -100})
    assert shifted['positionXM'] == 106
    assert shifted['positionYM'] == -96
    assert shifted['speedMS'] == first['speedMS']
    assert shifted['displacementM'] == first['displacementM']
    assert evaluate(json.loads(json.dumps(first['parameters']))) == first
    assert json.loads(json.dumps(first, allow_nan=False)) == first
    assert p == {'velocityX': 3, 'velocityY': 4, 'accelerationY': -2, 'time': 2}


@pytest.mark.parametrize('parameters', [
    None, [], {'velocityX': True}, {'accelerationY': float('nan')},
    {'positionX': float('inf')}, {'time': -1}, {'time': 5, 'duration': 4},
    {'duration': 0}, {'duration': 1001}, {'velocityY': 10**1000},
    {'accelerationX': -1e6-1}, {'duration': 1e-300}, {'velcityX': 2},
])
def test_invalid_or_unbounded_trajectories_are_rejected(parameters):
    with pytest.raises(StudyError) as error:
        evaluate(parameters)
    assert error.value.status == 422
