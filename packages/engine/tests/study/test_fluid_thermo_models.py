"""Independent numerical checks; Core route/access tests belong to its consumer."""
import math

import pytest

from lessonos.study.models import StudyError
from lessonos.study.science_library.fluid_catalog import FLUID_LAB_DEFINITIONS
from lessonos.study.science_library.fluid_models import default_fluid_parameters, evaluate_fluid_lab


def run(model, **patch):
    identity = model + '-lab-v1'
    return evaluate_fluid_lab(identity, {**default_fluid_parameters(identity), **patch})


@pytest.mark.parametrize('identity', list(FLUID_LAB_DEFINITIONS))
def test_fluid_models_use_the_existing_authoritative_activity_dispatch(identity):
    from lessonos.study.activities import evaluate_activity
    parameters = default_fluid_parameters(identity)
    assert evaluate_activity(identity, parameters) == evaluate_fluid_lab(identity, parameters)


def measure(result, key):
    return next(item['value'] for item in result['observables'] if item['key'] == key)


@pytest.mark.parametrize('identity', list(FLUID_LAB_DEFINITIONS))
def test_each_fluid_lab_has_two_valid_distinct_deterministic_presets(identity):
    presets = FLUID_LAB_DEFINITIONS[identity]['presets']
    assert len(presets) >= 2
    assert presets[0]['parameters'] != presets[1]['parameters']
    for preset in presets:
        result = evaluate_fluid_lab(identity, preset['parameters'])
        assert result == evaluate_fluid_lab(identity, dict(preset['parameters']))
        assert math.isfinite(result['value'])
        assert result['editorialStatus'] == 'DRAFT'
        assert result['distribution'] == 'BUNDLED_FIRST_PARTY'
        assert result['plots'] and result['observables']


def test_fluid_lab_rejects_missing_unknown_and_non_numeric_parameters():
    identity = 'hydrostatic-lab-v1'
    good = default_fluid_parameters(identity)
    for bad in (True, False, '2', None, [], {}, float('nan'), float('inf'), -1):
        with pytest.raises(StudyError):
            evaluate_fluid_lab(identity, {**good, 'depth': bad})
    with pytest.raises(StudyError):
        evaluate_fluid_lab(identity, {**good, 'unknown': 1})
    with pytest.raises(StudyError):
        evaluate_fluid_lab(identity, {key: value for key, value in good.items() if key != 'depth'})
    for model, field in [('process', 'path'), ('hydraulic-network', 'topology'), ('poiseuille', 'boundary'), ('capillary', 'surfaceMode')]:
        with pytest.raises(StudyError):
            run(model, **{field: .5})


def test_pressure_goldens_and_pascal_work_conservation():
    assert run('manometer', density=1000, gravity=10, heightDifference=-.2)['value'] == -2000
    assert run('hydrostatic', density=1000, gravity=10, depth=2, surfacePressure=100000)['value'] == 120000
    assert run('hydrostatic', depth=0)['value'] == 101325
    pascal = run('pascal', inputForce=100, inputArea=.01, outputArea=.05)
    assert pascal['value'] == 500
    assert pascal['value'] * measure(pascal, 'displacementRatio') == pytest.approx(100)
    assert all(.001 <= area <= 1 for area, force in run('pascal', outputArea=1)['labResult']['series'][0]['points'])


def test_archimedes_and_continuity_not_free_energy():
    floating = run('buoyancy', fluidDensity=1000, bodyDensity=600, volume=.001, submergedFraction=.6, gravity=10)
    assert floating['value'] == pytest.approx(6)
    assert measure(floating, 'netForce') == pytest.approx(0, abs=1e-12)
    sinking = run('buoyancy', bodyDensity=1500, submergedFraction=1)
    assert measure(sinking, 'netForce') < 0
    flow = run('continuity', flowRate=.001, area1=.002, area2=.0005)
    assert flow['value'] == 2
    assert measure(flow, 'speed1') == .5


def test_bernoulli_height_and_poiseuille_boundary_modes():
    venturi = run('venturi', density=1000, gravity=10, area1=.002, area2=.001, speed1=1, pressure1=150000, height1=0, height2=2)
    assert venturi['value'] == 128500
    assert measure(venturi, 'energyDensity1') == pytest.approx(measure(venturi, 'energyDensity2'))
    standard = run('poiseuille')
    assert standard['value'] == pytest.approx(7.853981633974483e-8, rel=1e-12)
    assert run('poiseuille', radius=.002)['value'] == pytest.approx(16 * standard['value'])
    fixed_flow = run('poiseuille', radius=.001, boundary=1)
    larger = run('poiseuille', radius=.002, boundary=1)
    assert fixed_flow['unit'] == 'Pa'
    assert larger['value'] == pytest.approx(fixed_flow['value'] / 16)
    assert measure(larger, 'flowRate') == measure(fixed_flow, 'flowRate')
    with pytest.raises(StudyError):
        run('poiseuille', radius=.005, pressureDifference=1000, viscosity=.0005)
    assert all(abs(position) <= .001 * (1 + 1e-12) and -1e-12 <= speed <= measure(standard, 'maxSpeed') * (1 + 1e-12)
               for position, speed in standard['labResult']['series'][0]['points'])


def test_hydraulic_network_topology_and_laplace_interfacial_count():
    first = run('hydraulic-network', resistance1=1e7, resistance2=1e7, pressureDifference=1000, topology=0)
    second = run('hydraulic-network', resistance1=1e7, resistance2=1e7, pressureDifference=1000, topology=1)
    assert measure(first, 'equivalentResistance') == 2e7
    assert measure(second, 'equivalentResistance') == 5e6
    assert measure(first, 'pressureDrop1') + measure(first, 'pressureDrop2') == 1000
    assert measure(second, 'flow1') + measure(second, 'flow2') == pytest.approx(second['value'])
    assert run('capillary', contactAngleDeg=90)['value'] == 0
    drop = run('capillary', surfaceMode=1, radius=.001, surfaceTension=.072)
    bubble = run('capillary', surfaceMode=2, radius=.001, surfaceTension=.072)
    assert drop['value'] == pytest.approx(144)
    assert bubble['value'] == pytest.approx(288)
    assert bubble['unit'] == 'Pa'
    assert measure(drop, 'rise') == 0
    assert measure(bubble, 'rise') == 0
    assert run('capillary', surfaceMode=1, radius=.001, surfaceTension=.072, contactAngleDeg=120)['value'] == drop['value']
    bounded = run('capillary', density=1000, gravity=10, surfaceTension=.072, radius=.001)
    assert all(.00005 <= radius <= .002 and 1000 * 10 * radius ** 2 / .072 <= .25 + 1e-12
               for radius, height in bounded['labResult']['series'][0]['points'])


def test_gas_calorimetry_and_latent_heat_goldens():
    gas = run('ideal-gas', moles=1, temperatureK=300, volume=.01)
    assert gas['value'] == pytest.approx(249433.8785445972)
    assert measure(gas, 'pv') == pytest.approx(measure(gas, 'nrt'))
    high_pressure = run('ideal-gas', moles=1, temperatureK=1500, volume=.000125)
    for volume, pressure in high_pressure['labResult']['series'][0]['points']:
        assert .00001 <= volume <= .01
        assert pressure <= 1e8
        run('ideal-gas', moles=1, temperatureK=1500, volume=volume)
    calorimetry = run('calorimetry', mass1=.2, mass2=.4, temperature1K=350, temperature2K=290)
    assert calorimetry['value'] == pytest.approx(310)
    assert measure(calorimetry, 'heat1') + measure(calorimetry, 'heat2') == pytest.approx(0, abs=1e-8)
    fusion = run('phase-change', mass=1, initialTemperatureC=-20, heat=209000)
    assert fusion['value'] == 0
    assert measure(fusion, 'meltFraction') == .5
    assert run('phase-change', mass=1, initialTemperatureC=-20, heat=417860)['value'] == pytest.approx(10)
    with pytest.raises(StudyError):
        run('phase-change', mass=.1, initialTemperatureC=0, heat=1e6)
    large = run('phase-change', mass=5, initialTemperatureC=-50, heat=0)
    assert all(heat <= 3e6 and temperature <= 100 for heat, temperature in large['labResult']['series'][0]['points'])


def test_transfer_direction_and_first_law_for_four_reversible_paths():
    equal = run('heat-transfer', hotTemperatureK=300, coldTemperatureK=300)
    assert all(item['value'] == 0 for item in equal['observables'])
    forward = run('heat-transfer', hotTemperatureK=400, coldTemperatureK=300)
    reverse = run('heat-transfer', hotTemperatureK=300, coldTemperatureK=400)
    for key in ('conduction', 'convection', 'radiation'):
        assert measure(reverse, key) == pytest.approx(-measure(forward, key))
    for path in (0, 1, 2, 3):
        data = run('process', path=path, volume2=.001 if path == 2 else .002)
        assert measure(data, 'heat') - measure(data, 'work') == pytest.approx(measure(data, 'internalEnergyChange'), abs=1e-10)
        assert measure(data, 'totalEntropyChange') == 0
        assert all(.00001 <= volume <= .1 and 0 < pressure <= 1e8
                   for curve in data['labResult']['series'] for volume, pressure in curve['points'])
    assert measure(run('process', path=0), 'internalEnergyChange') == 0
    assert run('process', path=2, volume2=.001)['value'] == 0
    with pytest.raises(StudyError):
        run('process', path=2, volume2=.002)
    assert measure(run('process', path=3), 'heat') == 0
    assert measure(run('process', path=3), 'entropyChange') == pytest.approx(0, abs=1e-12)


def test_isolated_free_expansion_has_no_equilibrium_path_or_work_area():
    free = run('process', path=4, moles=.1, temperatureK=300, volume1=.001, volume2=.002)
    assert free['value'] == 0
    assert measure(free, 'heat') == 0
    assert measure(free, 'internalEnergyChange') == 0
    assert measure(free, 'finalTemperature') == 300
    assert measure(free, 'finalPressure') == pytest.approx(124716.9392722986)
    assert measure(free, 'entropyChange') == pytest.approx(.576314632164398, abs=1e-12)
    assert measure(free, 'totalEntropyChange') == measure(free, 'entropyChange')
    assert len(free['labResult']['series']) == 2
    assert all(len(curve['points']) == 1 for curve in free['labResult']['series'])
    assert all(len(plot['x']) == 1 for plot in free['plots'])
    assert 'non vanno collegati' in ' '.join(free['labResult']['warnings'])
    reversible = run('process', path=0, moles=.1, temperatureK=300, volume1=.001, volume2=.002)
    assert measure(reversible, 'finalPressure') == measure(free, 'finalPressure')
    assert reversible['value'] > 0
    assert measure(reversible, 'totalEntropyChange') == 0
    for final_volume in (.001, .0005):
        with pytest.raises(StudyError):
            run('process', path=4, volume2=final_volume)
    # Independent 1B golden, n=1 mol and volume ratio 2.
    one_mole = run('process', path=4, moles=1, temperatureK=300, volume1=.001, volume2=.002)
    assert measure(one_mole, 'finalPressure') == pytest.approx(one_mole['labResult']['series'][0]['points'][0][1] / 2)
    assert measure(one_mole, 'finalTemperature') == 300
    assert all(measure(one_mole, key) == 0 for key in ('heat', 'work', 'internalEnergyChange'))
    assert measure(one_mole, 'entropyChange') == pytest.approx(5.763146321644, abs=1e-12)
    assert measure(one_mole, 'totalEntropyChange') == measure(one_mole, 'entropyChange')
    assert len(one_mole['labResult']['series']) == 2
    assert all(len(curve['points']) == 1 for curve in one_mole['labResult']['series'])


def test_carnot_and_finite_body_entropy_balances():
    carnot = run('carnot', hotTemperatureK=600, coldTemperatureK=300, heatInput=1000)
    assert carnot['value'] == .5
    assert measure(carnot, 'work') == 500
    assert measure(carnot, 'heatRejected') == 500
    assert measure(carnot, 'coldReservoirEntropy') + measure(carnot, 'hotReservoirEntropy') == pytest.approx(0, abs=1e-12)
    entropy = run('entropy', mass1=1, mass2=1, specificHeat1=1000, specificHeat2=1000, temperature1K=400, temperature2K=200)
    assert entropy['value'] == pytest.approx(117.78303565638346)
    assert measure(entropy, 'entropy1') < 0 < measure(entropy, 'entropy2')
    assert measure(entropy, 'heat1') + measure(entropy, 'heat2') == 0
    assert run('entropy', temperature1K=300, temperature2K=300)['value'] == 0
    with pytest.raises(StudyError):
        run('carnot', hotTemperatureK=300, coldTemperatureK=300)
