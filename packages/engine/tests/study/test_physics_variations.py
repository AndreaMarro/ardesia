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
