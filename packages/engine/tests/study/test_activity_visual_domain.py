"""Finite ratios must also produce finite, representable transport metadata."""
import pytest
from lessonos.study.activities import evaluate_activity
from lessonos.study.models import StudyError


def test_finite_flow_with_overflowing_mean_speed_is_rejected_at_the_core_boundary():
    with pytest.raises(StudyError, match='invalid_physical_domain'):
        evaluate_activity('poiseuille-v1', {'radiusRatio': .0001, 'viscosity': 5e-324,
                                          'length': 1, 'boundary': 'pressure'})


@pytest.mark.parametrize('parameters,expected', [
    ({'radiusRatio': 2, 'boundary': 'pressure'}, {'flowRatio': 16, 'pressureRatio': 1, 'meanSpeedRatio': 4}),
    ({'radiusRatio': 2, 'boundary': 'flow'}, {'flowRatio': 1, 'pressureRatio': 1/16, 'meanSpeedRatio': 1/4}),
    ({'radiusRatio': 1, 'viscosity': 2, 'length': 2, 'boundary': 'flow'}, {'flowRatio': 1, 'pressureRatio': 4, 'meanSpeedRatio': 1}),
])
def test_visual_transport_uses_the_same_constraint_as_the_core_result(parameters, expected):
    assert evaluate_activity('poiseuille-v1', parameters)['visual'] == expected
