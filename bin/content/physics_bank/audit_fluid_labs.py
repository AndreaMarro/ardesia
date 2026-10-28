"""Independent 1B numerical checks against exact 1C Git blobs; no UI certification."""
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import subprocess
import sys
import types

REPO = Path(__file__).resolve().parents[3]
REF = sys.argv[1]
HEAD = subprocess.check_output(['git', 'rev-parse', REF], cwd=REPO, text=True).strip()
BASE = 'packages/engine/lessonos/study/science_library/'

def blob(path):
    return subprocess.check_output(['git', 'show', HEAD + ':' + path], cwd=REPO)

class StudyError(Exception):
    pass

root = types.ModuleType('audit_science'); root.__path__ = []
errors = types.ModuleType('audit_science.models'); errors.StudyError = StudyError
package = types.ModuleType('audit_science.labs'); package.__path__ = []
package._FLUID_CATALOG_BYTES = blob(BASE + 'fluid_catalog.json')
sys.modules.update({'audit_science': root, 'audit_science.models': errors,
                    'audit_science.labs': package})
for name in ('fluid_catalog', 'fluid_models'):
    module = types.ModuleType('audit_science.labs.' + name)
    module.__package__ = 'audit_science.labs'
    sys.modules[module.__name__] = module
    exec(compile(blob(BASE + name + '.py'), HEAD + ':' + BASE + name + '.py', 'exec'), module.__dict__)
model = sys.modules['audit_science.labs.fluid_models']
results = []

def evaluate(lab, **changes):
    capability = lab + '-lab-v1'
    params = model.default_fluid_parameters(capability)
    params.update(changes)
    return model.evaluate_fluid_lab(capability, params)

def value(result, key):
    return next(x['value'] for x in result['observables'] if x['key'] == key)

def check(name, actual, expected, tolerance=1e-9):
    if not math.isclose(actual, expected, rel_tol=tolerance, abs_tol=tolerance):
        raise AssertionError((name, actual, expected))
    results.append({'case': name, 'result': 'PASS', 'actual': actual, 'expected': expected,
                    'relativeAndAbsoluteTolerance': tolerance})

def reject(name, lab, **changes):
    try:
        evaluate(lab, **changes)
    except StudyError:
        results.append({'case': name, 'result': 'PASS', 'expected': 'invalid_physical_domain'})
    else:
        raise AssertionError(name + ': invalid domain accepted')

check('manometer signed head', evaluate('manometer', heightDifference=-.2)['value'], -1962)
check('hydrostatic absolute pressure', evaluate('hydrostatic')['value'], 120945)
check('Pascal force ratio', evaluate('pascal')['value'], 500)
check('Pascal displacement inverse area', value(evaluate('pascal'), 'displacementRatio'), .2)
check('Archimedes equilibrium', value(evaluate('buoyancy'), 'netForce'), 0)
check('continuity second speed', evaluate('continuity')['value'], 1)
check('Bernoulli horizontal contraction', evaluate('venturi')['value'], 148500)
check('Bernoulli elevation term', evaluate('venturi', height2=1)['value'], 138690)
base = evaluate('poiseuille')
wide = evaluate('poiseuille', radius=.002)
check('Poiseuille radius doubling at fixed pressure', wide['value'] / base['value'], 16)
fixed = evaluate('poiseuille', boundary=1)
fixed_wide = evaluate('poiseuille', boundary=1, radius=.002)
check('Poiseuille radius doubling at fixed flow', fixed_wide['value'] / fixed['value'], 1/16)
check('Poiseuille axial and mean speed', value(base, 'maxSpeed') / value(base, 'meanSpeed'), 2)
reject('Poiseuille turbulent condition rejected', 'poiseuille', boundary=1, flowRate=.00001)
check('hydraulic series resistance', value(evaluate('hydraulic-network'), 'equivalentResistance'), 3e7)
parallel = evaluate('hydraulic-network', topology=1)
check('hydraulic parallel total flow', parallel['value'], .00015)
check('hydraulic parallel flow conservation', parallel['value'], value(parallel, 'flow1') + value(parallel, 'flow2'))
check('Jurin neutral contact angle', evaluate('capillary', contactAngleDeg=90)['value'], 0)
check('Jurin nonwetting sign', evaluate('capillary', contactAngleDeg=120)['value'], -.072 / (1000 * 9.81 * .0005))
check('Laplace one interface', evaluate('capillary', surfaceMode=1)['value'], 288)
check('Laplace two interfaces', evaluate('capillary', surfaceMode=2)['value'], 576)
cap = evaluate('capillary')
for plot in cap['plots']:
    max_bond = max(1000 * 9.81 * radius**2 / .072 for radius in plot['x'])
    if max_bond > .25 + 1e-12:
        raise AssertionError(('capillary curve outside domain', max_bond))
    results.append({'case': 'capillary curve entirely inside Bond domain', 'result': 'PASS', 'maximumBond': max_bond})
gas = evaluate('ideal-gas')
check('ideal gas pressure', gas['value'], 99773.55141783888)
check('ideal gas inverse volume', evaluate('ideal-gas', volume=.0005)['value'] / gas['value'], .5)
cal = evaluate('calorimetry')
check('calorimetry equilibrium', cal['value'], 323.15)
check('calorimetry energy balance', value(cal, 'heat1') + value(cal, 'heat2'), 0)
check('phase change fusion plateau', evaluate('phase-change')['value'], 0)
check('phase change melt fraction', value(evaluate('phase-change'), 'meltFraction'), 158000 / 334000)
heat = evaluate('heat-transfer')
check('steady conduction', heat['value'], 480)
check('convection', value(heat, 'convection'), 600)
check('net radiation', value(heat, 'radiation'), .8 * 5.670374419e-8 * (350**4 - 290**4))
check('heat flow reversal', evaluate('heat-transfer', hotTemperatureK=290, coldTemperatureK=350)['value'], -480)
process = evaluate('process')
check('reversible isothermal work', process['value'], .1 * 8.31446261815324 * 300 * math.log(2))
check('isothermal internal energy', value(process, 'internalEnergyChange'), 0)
isochora = evaluate('process', path=2, volume2=.001)
check('isochoric work', isochora['value'], 0)
check('isochoric heating', value(isochora, 'heat'), .1 * 1.5 * 8.31446261815324 * 150)
reject('inconsistent isochoric final volume rejected', 'process', path=2, volume2=.002)
adiabatic = evaluate('process', path=3)
check('reversible adiabatic heat', value(adiabatic, 'heat'), 0)
check('reversible adiabatic first law', adiabatic['value'] + value(adiabatic, 'internalEnergyChange'), 0)
check('reversible adiabatic entropy', value(adiabatic, 'entropyChange'), 0)
free = evaluate('process', path=4, moles=1)
check('free expansion work', free['value'], 0)
check('free expansion heat', value(free, 'heat'), 0)
check('free expansion internal energy', value(free, 'internalEnergyChange'), 0)
check('free expansion final temperature', value(free, 'finalTemperature'), 300)
check('free expansion entropy', value(free, 'entropyChange'), 8.31446261815324 * math.log(2))
check('free expansion total entropy', value(free, 'totalEntropyChange'), 8.31446261815324 * math.log(2))
reject('free compression excluded', 'process', path=4, volume2=.0005)
if len(free['plots']) != 2:
    raise AssertionError('Free expansion must have exactly two separate endpoint series')
for plot in free['plots']:
    if len(plot['x']) != 1:
        raise AssertionError('Free expansion drawn as a connected equilibrium path')
results.append({'case': 'free expansion has two unconnected equilibrium endpoints', 'result': 'PASS', 'plots': len(free['plots'])})
carnot = evaluate('carnot')
check('Carnot efficiency', carnot['value'], .5)
check('Carnot work', value(carnot, 'work'), 500)
check('Carnot reservoirs entropy balance', value(carnot, 'hotReservoirEntropy') + value(carnot, 'coldReservoirEntropy'), 0)
cycle_work = 0
for plot in carnot['plots']:
    x, y = plot['x'], plot['series'][0]['values']
    cycle_work += sum((x[i+1]-x[i]) * (y[i+1]+y[i]) / 2 for i in range(len(x)-1))
check('Carnot numerical closed-cycle area', cycle_work, 500, .002)
reject('Carnot equal reservoirs rejected', 'carnot', hotTemperatureK=300)
entropy = evaluate('entropy')
check('finite bodies common temperature', value(entropy, 'equilibriumTemperature'), 320)
check('finite bodies entropy production', entropy['value'], 4186 * math.log(320**2 / (360*280)))
check('equal temperature entropy production', evaluate('entropy', temperature1K=320, temperature2K=320)['value'], 0)

paths = [BASE + f for f in ('fluid_catalog.json', 'fluid_catalog.py', 'fluid_models.py')]
paths += ['apps/studio/plugins/fluid-thermo/' + f for f in ('definitions.ts', 'models.ts')]
report = {'schemaVersion': 1, 'owner': 'CHAT 1B', 'implementationHead': HEAD,
          'scope': 'Independent numerical and domain checks of exact Python model blobs; TypeScript source inspection separately. Browser NOT_RUN by 1B. StudyError was stubbed for module isolation; no numerical code was changed.',
          'sourceBlobShas': {p: subprocess.check_output(['git', 'rev-parse', HEAD+':'+p], cwd=REPO, text=True).strip() for p in paths},
          'sourceSha256': {p: hashlib.sha256(blob(p)).hexdigest() for p in paths},
          'result': 'PASS', 'caseCount': len(results), 'cases': results,
          'humanReview': 'NOT_RUN', 'acceptedObjectives': 0}
print(json.dumps(report, ensure_ascii=False, indent=2))
