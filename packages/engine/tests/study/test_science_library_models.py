"""Independent SI examples for the first S01 family batch."""
import importlib
import json

import pytest

from lessonos.study.models import StudyError


def evaluate(capability, parameters):
    return importlib.import_module('lessonos.study.science_library').evaluate(capability, parameters)


def test_elastic_collision_conserves_momentum_and_energy():
    r = evaluate('collision-1d-v1', {'mass1': 2, 'mass2': 1, 'velocity1': 3, 'velocity2': 0})
    assert r['velocity1AfterMS'] == 1
    assert r['velocity2AfterMS'] == 4
    assert r['momentumBeforeKgMS'] == r['momentumAfterKgMS'] == 6
    assert r['energyBeforeJ'] == r['energyAfterJ'] == 9
    assert r['energyLossJ'] == 0


def test_restitution_loss_and_common_velocity_are_distinct_from_elastic_case():
    p = {'mass1': 2, 'mass2': 1, 'velocity1': 3, 'velocity2': 0}
    partial = evaluate('collision-1d-v1', {**p, 'restitution': .5})
    assert partial['velocity1AfterMS'] == 1.5
    assert partial['velocity2AfterMS'] == 3
    assert partial['energyAfterJ'] == 6.75
    assert partial['energyLossJ'] == 2.25
    plastic = evaluate('collision-1d-v1', {**p, 'restitution': 0})
    assert plastic['velocity1AfterMS'] == plastic['velocity2AfterMS'] == 2
    assert plastic['energyLossJ'] == 3


def test_galilean_shift_preserves_relative_speed_and_dissipated_energy():
    p = {'mass1': 2, 'mass2': 1, 'velocity1': 3, 'velocity2': 0, 'restitution': .5}
    a = evaluate('collision-1d-v1', p)
    b = evaluate('collision-1d-v1', {**p, 'velocity1': 8, 'velocity2': 5})
    assert b['velocity1AfterMS'] == a['velocity1AfterMS'] + 5
    assert b['velocity2AfterMS'] == a['velocity2AfterMS'] + 5
    assert b['energyLossJ'] == a['energyLossJ']
    negative = evaluate('collision-1d-v1', {'mass1': 1, 'mass2': 1, 'velocity1': -1, 'velocity2': -3})
    assert negative['velocity1AfterMS'] == -3
    assert negative['velocity2AfterMS'] == -1


def test_bernoulli_links_continuity_pressure_and_energy_density():
    p = {'density': 1000, 'area1': .01, 'area2': .005, 'speed1': 2, 'pressure1': 120000, 'height1': 0, 'height2': 0, 'g': 9.81}
    r = evaluate('bernoulli-v1', p)
    assert r['speed2MS'] == 4
    assert r['flowM3S'] == .02
    assert r['pressure2Pa'] == 114000
    assert r['energyDensity1Pa'] == r['energyDensity2Pa'] == 122000
    raised = evaluate('bernoulli-v1', {**p, 'height2': 1})
    assert raised['pressure2Pa'] == 104190
    translated = evaluate('bernoulli-v1', {**p, 'height1': 5, 'height2': 5})
    assert translated['pressure2Pa'] == r['pressure2Pa']


def test_point_charge_signs_inverse_powers_and_force_are_not_confused():
    r = evaluate('point-charge-v1', {'charge': 1e-9, 'position': .3, 'testCharge': 2e-9})
    # k=9e9 is an explicit educational approximation, not an exact SI constant.
    assert r['coulombConstant'] == 9e9
    assert r['electricFieldXNC'] == pytest.approx(100)
    assert r['potentialV'] == 30
    assert r['forceXN'] == pytest.approx(2e-7)
    assert r['potentialEnergyJ'] == pytest.approx(6e-8)
    left = evaluate('point-charge-v1', {'charge': 1e-9, 'position': -.3, 'testCharge': -2e-9})
    assert left['electricFieldXNC'] == pytest.approx(-100)
    assert left['potentialV'] == 30
    assert left['forceXN'] == pytest.approx(2e-7)
    far = evaluate('point-charge-v1', {'charge': 1e-9, 'position': .6})
    assert far['electricFieldXNC'] == pytest.approx(25)
    assert far['potentialV'] == 15


@pytest.mark.parametrize('f,u,h,image,magnification,kind', [
    (.1, .3, .005, .15, -.5, 'real'),
    (-.1, .3, .005, -.075, .25, 'virtual'),
    (.1, .05, .001, -.1, 2, 'virtual'),
])
def test_lens_distinguishes_signed_image_position_and_orientation(f, u, h, image, magnification, kind):
    r = evaluate('thin-lens-v1', {'focalLength': f, 'objectDistance': u, 'objectHeight': h})
    assert r['imageDistanceM'] == pytest.approx(image)
    assert r['magnification'] == pytest.approx(magnification)
    assert r['imageHeightM'] == pytest.approx(h * magnification)
    assert r['imageKind'] == kind


@pytest.mark.parametrize('capability', ['collision-1d-v1', 'bernoulli-v1', 'point-charge-v1', 'thin-lens-v1'])
def test_complete_parameters_replay_without_mutating_input_or_nonfinite_json(capability):
    p = {}
    r = evaluate(capability, p)
    assert p == {}
    assert r['activityId'] == capability
    assert r['version'] == r['dataVersion'] == 1
    assert r['editorialStatus'] == 'DRAFT'
    assert r['distribution'] == 'BUNDLED_FIRST_PARTY'
    assert r['domain'] and r['observables']
    assert evaluate(capability, json.loads(json.dumps(r['parameters']))) == r
    assert json.loads(json.dumps(r, allow_nan=False)) == r


@pytest.mark.parametrize('capability,p', [
    ('collision-1d-v1', {'mass1': 0}), ('collision-1d-v1', {'mass2': -1}),
    ('collision-1d-v1', {'restitution': 1.1}), ('collision-1d-v1', {'restitution': -.1}),
    ('collision-1d-v1', {'velocity1': 0, 'velocity2': 1}),
    ('bernoulli-v1', {'area2': 0}), ('bernoulli-v1', {'density': -1}),
    ('bernoulli-v1', {'pressure1': 1, 'area2': .001}),
    ('point-charge-v1', {'position': 0}), ('point-charge-v1', {'position': 1e-10}),
    ('thin-lens-v1', {'focalLength': 0}), ('thin-lens-v1', {'focalLength': .1, 'objectDistance': .1}),
    ('thin-lens-v1', {'focalLength': .1, 'objectDistance': .100000000001}),
    ('thin-lens-v1', {'objectDistance': -1}), ('thin-lens-v1', {'objectHeight': 1}),
    ('collision-1d-v1', {'mass1': True}), ('bernoulli-v1', {'density': float('nan')}),
    ('point-charge-v1', {'charge': float('inf')}), ('thin-lens-v1', {'focalLength': 10**1000}),
    ('collision-1d-v1', {'restituion': .5}), ('bernoulli-v1', None),
])
def test_invalid_singular_and_unsupported_inputs_are_explicit(capability, p):
    with pytest.raises(StudyError) as error:
        evaluate(capability, p)
    assert error.value.status == 422


def test_unknown_capability_is_not_silently_replaced():
    with pytest.raises(StudyError) as error:
        evaluate('unknown-v999', {})
    assert error.value.status == 404
