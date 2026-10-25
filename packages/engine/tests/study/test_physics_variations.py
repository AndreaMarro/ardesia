import pytest
from lessonos.study.activities import evaluate_activity


@pytest.mark.parametrize('boundary,parameters,want', [
    ('pressure', {'radiusRatio':2,'length':2}, 8),
    ('flow', {'radiusRatio':2,'length':2}, 0.125),
    ('pressure', {'radiusRatio':1,'viscosity':2}, 0.5),
    ('flow', {'radiusRatio':1,'viscosity':2}, 2),
])
def test_poiseuille_varies_length_and_viscosity_with_the_declared_constraint(boundary, parameters, want):
    result=evaluate_activity('poiseuille-v1', {**parameters,'boundary':boundary})
    assert result['ratio']==pytest.approx(want)


@pytest.mark.parametrize('parameters', [
    {'viscosity': 1e-300, 'length': 1e-300},
    {'radiusRatio': 1e-300},
    {'radiusRatio': 1e-300, 'boundary': 'flow'},
])
def test_unrepresentable_ratios_fail_validation_instead_of_division_by_zero(parameters):
    from lessonos.study.models import StudyError
    with pytest.raises(StudyError, match='invalid_physical_domain'):
        evaluate_activity('poiseuille-v1', parameters)


@pytest.mark.parametrize('activity,parameters', [
    ('poiseuille-v1', {'radiusRatio':10**1000}),
    ('poiseuille-v1', {'viscosity':10**1000}),
    ('units-v1', {'value':10**1000}),
    ('hydrostatic-v1', {'density':10**1000}),
    ('buoyancy-v1', {'volume':10**1000}),
])
def test_huge_integer_is_rejected_before_float_conversion(activity,parameters):
    from lessonos.study.models import StudyError
    from lessonos.study.activities import evaluate_activity
    with pytest.raises(StudyError) as error:
        evaluate_activity(activity,parameters)
    assert error.value.status==422
