"""Independent SI calculations for the 16 first-party fluid/thermo labs.

These functions do not store progress, trust browser results, or assign grades.
Core routes/resources remain the only authority for access and persistence.
"""
import math

from ..models import StudyError
from .fluid_catalog import FLUID_LAB_DEFINITIONS, FLUID_PARAMETER_SPECS

R = 8.31446261815324
SIGMA = 5.670374419e-8
CV = 1.5 * R
GAMMA = 5 / 3


def _measurement(key, label, unit, value):
    return {'key': key, 'label': label, 'unit': unit, 'value': value}


def _series(label, unit, x_unit, points):
    return {'label': label, 'unit': unit, 'xUnit': x_unit, 'points': points}


def _sample(function, lower, upper, count=41):
    points = []
    for index in range(count):
        x = lower + (upper - lower) * index / (count - 1)
        points.append([x, function(x)])
    return points


def _parameters(capability_id, parameters):
    specification = FLUID_PARAMETER_SPECS[capability_id]
    if not isinstance(parameters, dict) or set(parameters) != set(specification):
        raise StudyError('invalid_parameters')
    output = {}
    for key, (default, lower, upper) in specification.items():
        value = parameters[key]
        if (type(value) not in (int, float) or not lower <= value <= upper
                or not math.isfinite(value)):
            raise StudyError('invalid_physical_domain')
        if key in ('path', 'topology', 'boundary', 'surfaceMode') and value != int(value):
            raise StudyError('invalid_physical_domain')
        output[key] = float(value)
    return output


def default_fluid_parameters(capability_id):
    if capability_id not in FLUID_PARAMETER_SPECS:
        raise StudyError('unknown_activity')
    return {key: specification[0] for key, specification in FLUID_PARAMETER_SPECS[capability_id].items()}


def _thermal(p):
    first, second = p['mass1'] * p['specificHeat1'], p['mass2'] * p['specificHeat2']
    final = (first * p['temperature1K'] + second * p['temperature2K']) / (first + second)
    return first, second, final, first * (final - p['temperature1K']), second * (final - p['temperature2K'])


def _calculate(model_id, p):
    m, s, sample = _measurement, _series, _sample
    warnings = []
    if model_id == 'manometer':
        difference = p['density'] * p['gravity'] * p['heightDifference']
        primary = m('pressureDifference', 'Differenza di pressione p₁−p₂', 'Pa', difference)
        measurements = [primary, m('density', 'Densità del liquido', 'kg/m³', p['density']), m('heightDifference', 'Differenza di livello firmata', 'm', p['heightDifference'])]
        curves = [s('Differenza di pressione', 'Pa', 'm', sample(lambda h: p['density'] * p['gravity'] * h, -1, 1))]
    elif model_id == 'hydrostatic':
        gauge = p['density'] * p['gravity'] * p['depth']
        primary = m('absolutePressure', 'Pressione assoluta alla profondità scelta', 'Pa', p['surfacePressure'] + gauge)
        measurements = [primary, m('gaugePressure', 'Sovrapressione rispetto alla superficie', 'Pa', gauge)]
        curves = [s('Pressione assoluta', 'Pa', 'm', sample(lambda h: p['surfacePressure'] + p['density'] * p['gravity'] * h, 0, max(1, p['depth']))),
                  s('Sovrapressione', 'Pa', 'm', sample(lambda h: p['density'] * p['gravity'] * h, 0, max(1, p['depth'])))]
    elif model_id == 'pascal':
        pressure = p['inputForce'] / p['inputArea']
        primary = m('outputForce', 'Forza sul secondo pistone', 'N', pressure * p['outputArea'])
        measurements = [primary, m('pressure', 'Incremento di pressione', 'Pa', pressure),
                        m('forceRatio', 'Rapporto delle forze F₂/F₁ (rapporto delle aree)', '1', p['outputArea'] / p['inputArea']),
                        m('displacementRatio', 'Rapporto spostamenti Δx₂/Δx₁', '1', p['inputArea'] / p['outputArea'])]
        curves = [s('Forza di uscita a forza di ingresso fissata', 'N', 'm²', sample(lambda area: pressure * area, .001, min(1, max(.01, p['outputArea'] * 1.5))))]
    elif model_id == 'buoyancy':
        displaced = p['volume'] * p['submergedFraction']
        force, weight = p['fluidDensity'] * p['gravity'] * displaced, p['bodyDensity'] * p['gravity'] * p['volume']
        fraction = p['bodyDensity'] / p['fluidDensity']
        primary = m('buoyancy', 'Spinta di Archimede', 'N', force)
        measurements = [primary, m('weight', 'Peso del corpo', 'N', weight), m('netForce', 'Risultante verticale delle sole spinta e peso', 'N', force - weight),
                        m('displacedVolume', 'Volume di fluido spostato', 'm³', displaced), m('equilibriumFraction', 'Frazione immersa richiesta per equilibrio', '1', fraction)]
        curves = [s('Spinta di Archimede', 'N', '1', sample(lambda f: p['fluidDensity'] * p['gravity'] * p['volume'] * f, 0, 1)), s('Peso', 'N', '1', [[0, weight], [1, weight]])]
        if fraction > 1:
            warnings.append('La frazione di equilibrio supera 1: questo corpo non può galleggiare in equilibrio con le sole spinta e peso.')
        elif abs(force - weight) > 1e-9:
            warnings.append('Immersione imposta: le due forze non si equilibrano. Il corpo accelera o richiede un vincolo.')
    elif model_id == 'continuity':
        first, second = p['flowRate'] / p['area1'], p['flowRate'] / p['area2']
        primary = m('speed2', 'Velocità media nella seconda sezione', 'm/s', second)
        measurements = [primary, m('speed1', 'Velocità media nella prima sezione', 'm/s', first), m('flowRate', 'Portata in entrambe le sezioni', 'm³/s', p['flowRate']),
                        m('radius1', 'Raggio circolare equivalente prima sezione', 'm', math.sqrt(p['area1'] / math.pi)), m('radius2', 'Raggio circolare equivalente seconda sezione', 'm', math.sqrt(p['area2'] / math.pi))]
        curves = [s('Velocità media a portata fissata', 'm/s', 'm²', sample(lambda a: p['flowRate'] / a, .0001, .02))]
    elif model_id == 'venturi':
        flow = p['area1'] * p['speed1']
        speed = flow / p['area2']
        pressure = p['pressure1'] + p['density'] * (p['speed1'] ** 2 - speed ** 2) / 2 + p['density'] * p['gravity'] * (p['height1'] - p['height2'])
        if pressure <= 0 or pressure > 1e8 or speed > 100:
            raise StudyError('invalid_physical_domain')
        energy1 = p['pressure1'] + .5 * p['density'] * p['speed1'] ** 2 + p['density'] * p['gravity'] * p['height1']
        energy2 = pressure + .5 * p['density'] * speed ** 2 + p['density'] * p['gravity'] * p['height2']
        primary = m('pressure2', 'Pressione assoluta nella seconda sezione', 'Pa', pressure)
        measurements = [primary, m('speed2', 'Velocità nella seconda sezione', 'm/s', speed), m('flowRate', 'Portata volumetrica', 'm³/s', flow),
                        m('energyDensity1', 'Energia meccanica per unità di volume, sezione 1', 'Pa', energy1), m('energyDensity2', 'Energia meccanica per unità di volume, sezione 2', 'Pa', energy2)]
        curves = [s('Pressione statica', 'Pa', '1', [[1, p['pressure1']], [2, pressure]]),
                  s('Termine cinetico', 'Pa', '1', [[1, .5 * p['density'] * p['speed1'] ** 2], [2, .5 * p['density'] * speed ** 2]]),
                  s('Termine gravitazionale', 'Pa', '1', [[1, p['density'] * p['gravity'] * p['height1']], [2, p['density'] * p['gravity'] * p['height2']]])]
    elif model_id == 'poiseuille':
        resistance = 8 * p['viscosity'] * p['length'] / (math.pi * p['radius'] ** 4)
        flow = p['pressureDifference'] / resistance if p['boundary'] == 0 else p['flowRate']
        pressure = p['pressureDifference'] if p['boundary'] == 0 else flow * resistance
        mean = flow / (math.pi * p['radius'] ** 2)
        reynolds = p['density'] * mean * 2 * p['radius'] / p['viscosity']
        if reynolds > 2300:
            raise StudyError('invalid_physical_domain')
        primary = m('flowRate', 'Portata a Δp fissata', 'm³/s', flow) if p['boundary'] == 0 else m('pressureDifference', 'Differenza di pressione a Q fissata', 'Pa', pressure)
        measurements = [m('flowRate', 'Portata volumetrica', 'm³/s', flow), m('pressureDifference', 'Differenza di pressione', 'Pa', pressure),
                        m('resistance', 'Resistenza idraulica', 'Pa·s/m³', resistance), m('meanSpeed', 'Velocità media', 'm/s', mean), m('maxSpeed', 'Velocità sull’asse', 'm/s', 2 * mean), m('reynolds', 'Numero di Reynolds', '1', reynolds)]
        curves = [s('Profilo locale di velocità lungo il diametro', 'm/s', 'm', sample(lambda x: 2 * mean * (1 - (x / p['radius']) ** 2), -p['radius'], p['radius']))]
        warnings.append('Profilo analitico completamente sviluppato; nessun moto transitorio, turbolento o particellare è simulato.')
    elif model_id == 'hydraulic-network':
        parallel = p['topology'] == 1
        equivalent = p['resistance1'] * p['resistance2'] / (p['resistance1'] + p['resistance2']) if parallel else p['resistance1'] + p['resistance2']
        flow = p['pressureDifference'] / equivalent
        f1, f2 = (p['pressureDifference'] / p['resistance1'], p['pressureDifference'] / p['resistance2']) if parallel else (flow, flow)
        d1, d2 = p['resistance1'] * f1, p['resistance2'] * f2
        primary = m('flowRate', 'Portata totale', 'm³/s', flow)
        measurements = [primary, m('equivalentResistance', 'Resistenza equivalente', 'Pa·s/m³', equivalent), m('flow1', 'Portata nel primo resistore', 'm³/s', f1), m('flow2', 'Portata nel secondo resistore', 'm³/s', f2),
                        m('pressureDrop1', 'Caduta sul primo resistore', 'Pa', d1), m('pressureDrop2', 'Caduta sul secondo resistore', 'Pa', d2)]
        curves = [s('Cadute di pressione nei resistori', 'Pa', '1', [[1, d1], [2, d2]])]
    elif model_id == 'capillary':
        if p['surfaceMode'] != 0:
            interfaces = 2 if p['surfaceMode'] == 2 else 1
            pressure = interfaces * 2 * p['surfaceTension'] / p['radius']
            primary = m('pressureDifference', 'Sovrapressione interna rispetto all’esterno', 'Pa', pressure)
            measurements = [primary, m('rise', 'Nessuna risalita modellata in questa geometria', 'm', 0), m('curvature', 'Curvatura sferica 1/r', '1/m', 1 / p['radius']), m('interfaces', 'Numero di interfacce', '1', interfaces)]
            curves = [s('Sovrapressione al variare del raggio', 'Pa', 'm', sample(lambda radius: interfaces * 2 * p['surfaceTension'] / radius, .00005, .002))]
            warnings.append('Geometria sferica: angolo di contatto, densità e gravità non entrano in questo bilancio di Laplace. Nessuna risalita capillare è calcolata.')
        else:
            bond = p['density'] * p['gravity'] * p['radius'] ** 2 / p['surfaceTension']
            if bond > .25:
                raise StudyError('invalid_physical_domain')
            cosine = 0 if p['contactAngleDeg'] == 90 else math.cos(math.radians(p['contactAngleDeg']))
            curvature = cosine / p['radius']
            pressure = 2 * p['surfaceTension'] * curvature
            rise = pressure / (p['density'] * p['gravity'])
            primary = m('rise', 'Risalita capillare firmata', 'm', rise)
            measurements = [primary, m('pressureDifference', 'p_gas−p_liquido alla superficie', 'Pa', pressure), m('curvature', 'Curvatura sferica firmata 1/R', '1/m', curvature), m('contactAngleDeg', 'Angolo di contatto nel liquido', '°', p['contactAngleDeg']), m('bondNumber', 'Numero di Bond', '1', bond)]
            maximum_radius = min(.002, math.sqrt(.25 * p['surfaceTension'] / (p['density'] * p['gravity'])))
            curves = [s('Risalita al variare del raggio', 'm', 'm', sample(lambda radius: 2 * p['surfaceTension'] * cosine / (p['density'] * p['gravity'] * radius), .00005, maximum_radius))]
            warnings.append('Menisco sferico approssimato. La forma vicino al raccordo con il serbatoio e la dinamica non sono calcolate.')
    elif model_id == 'ideal-gas':
        pressure = p['moles'] * R * p['temperatureK'] / p['volume']
        if pressure > 1e8:
            raise StudyError('invalid_physical_domain')
        primary = m('pressure', 'Pressione assoluta', 'Pa', pressure)
        measurements = [primary, m('volume', 'Volume del gas', 'm³', p['volume']), m('temperatureK', 'Temperatura assoluta', 'K', p['temperatureK']), m('pv', 'Prodotto pV', 'J', pressure * p['volume']), m('nrt', 'Prodotto nRT', 'J', p['moles'] * R * p['temperatureK'])]
        minimum_volume = max(.00001, p['volume'] / 3, p['moles'] * R * p['temperatureK'] / 1e8 * (1 + 4 * math.ulp(1.0)))
        curves = [s('Isoterma a n e T fissati', 'Pa', 'm³', sample(lambda volume: p['moles'] * R * p['temperatureK'] / volume, minimum_volume, min(.01, p['volume'] * 3)))]
    elif model_id == 'calorimetry':
        c1, c2, final, q1, q2 = _thermal(p)
        primary = m('equilibriumTemperature', 'Temperatura di equilibrio', 'K', final)
        measurements = [primary, m('heat1', 'Calore ricevuto dal primo corpo', 'J', q1), m('heat2', 'Calore ricevuto dal secondo corpo', 'J', q2), m('energyBalance', 'Somma dei calori scambiati', 'J', q1 + q2), m('heatCapacity1', 'Capacità termica primo corpo', 'J/K', c1), m('heatCapacity2', 'Capacità termica secondo corpo', 'J/K', c2)]
        curves = [s('Temperatura iniziale', 'K', '1', [[1, p['temperature1K']], [2, p['temperature2K']]]), s('Temperatura finale', 'K', '1', [[1, final], [2, final]])]
    elif model_id == 'phase-change':
        ice_heat, fusion = p['mass'] * 2100 * -p['initialTemperatureC'], p['mass'] * 334000
        end = ice_heat + fusion + p['mass'] * 4186 * 100
        if p['heat'] > end:
            raise StudyError('invalid_physical_domain')
        q = p['heat']
        temperature = p['initialTemperatureC'] + q / (p['mass'] * 2100) if q < ice_heat else 0 if q <= ice_heat + fusion else (q - ice_heat - fusion) / (p['mass'] * 4186)
        fraction = max(0, min(1, (q - ice_heat) / fusion))
        primary = m('temperatureC', 'Temperatura del sistema', '°C', temperature)
        measurements = [primary, m('meltFraction', 'Frazione di massa fusa', '1', fraction), m('heatToMeltStart', 'Calore per raggiungere 0°C', 'J', ice_heat), m('fusionHeat', 'Calore per fondere tutta la massa', 'J', fusion), m('heatToMeltEnd', 'Calore totale per terminare la fusione', 'J', ice_heat + fusion)]
        maximum_heat = min(end, 3e6)
        points = [point for point in [[0, p['initialTemperatureC']], [ice_heat, 0], [ice_heat + fusion, 0], [end, 100]] if point[0] <= maximum_heat]
        if points[-1][0] < maximum_heat:
            last_temperature = p['initialTemperatureC'] + maximum_heat / (p['mass'] * 2100) if maximum_heat < ice_heat else 0 if maximum_heat <= ice_heat + fusion else (maximum_heat - ice_heat - fusion) / (p['mass'] * 4186)
            points.append([maximum_heat, last_temperature])
        curves = [s('Curva di riscaldamento', '°C', 'J', points)]
    elif model_id == 'heat-transfer':
        delta = p['hotTemperatureK'] - p['coldTemperatureK']
        conduction = p['conductivity'] * p['area'] * delta / p['thickness']
        convection = p['convectionCoefficient'] * p['area'] * delta
        radiation = p['emissivity'] * SIGMA * p['area'] * delta * (p['hotTemperatureK'] + p['coldTemperatureK']) * (p['hotTemperatureK'] ** 2 + p['coldTemperatureK'] ** 2)
        primary = m('conduction', 'Potenza per conduzione', 'W', conduction)
        measurements = [primary, m('convection', 'Potenza per convezione', 'W', convection), m('radiation', 'Potenza netta per irraggiamento', 'W', radiation)]
        curves = [s('Potenze in tre configurazioni distinte', 'W', '1', [[1, conduction], [2, convection], [3, radiation]])]
        warnings.append('Il flusso netto è negativo nella convenzione superficie→ambiente: le temperature scelte invertono il verso del trasferimento.' if delta < 0 else 'I tre valori si riferiscono a configurazioni diverse: non sono tre contributi da sommare senza un modello di accoppiamento.')
    elif model_id == 'process':
        free_expansion = p['path'] == 4
        if p['path'] == 2 and abs(p['volume2'] - p['volume1']) > 1e-12 * max(p['volume1'], p['volume2']):
            raise StudyError('invalid_physical_domain')
        if free_expansion and p['volume2'] <= p['volume1']:
            raise StudyError('invalid_physical_domain')
        first_pressure = p['moles'] * R * p['temperatureK'] / p['volume1']
        final_volume = p['volume1'] if p['path'] == 2 else p['volume2']
        final_temperature = (p['temperatureK'] if p['path'] == 0 or free_expansion else p['temperatureK'] * final_volume / p['volume1'] if p['path'] == 1 else p['temperature2K'] if p['path'] == 2 else p['temperatureK'] * (p['volume1'] / final_volume) ** (GAMMA - 1))
        final_pressure = p['moles'] * R * final_temperature / final_volume
        if not 50 <= final_temperature <= 2000 or max(first_pressure, final_pressure) > 1e8:
            raise StudyError('invalid_physical_domain')
        internal = p['moles'] * CV * (final_temperature - p['temperatureK'])
        work = p['moles'] * R * p['temperatureK'] * math.log(final_volume / p['volume1']) if p['path'] == 0 else first_pressure * (final_volume - p['volume1']) if p['path'] == 1 else 0 if p['path'] == 2 or free_expansion else -internal
        heat = 0 if p['path'] == 3 or free_expansion else internal + work
        entropy = 0 if p['path'] == 3 else p['moles'] * CV * math.log(final_temperature / p['temperatureK']) + p['moles'] * R * math.log(final_volume / p['volume1'])
        if free_expansion:
            curves = [s('Solo stato iniziale di equilibrio', 'Pa', 'm³', [[p['volume1'], first_pressure]]), s('Solo stato finale di equilibrio', 'Pa', 'm³', [[final_volume, final_pressure]])]
        elif p['path'] == 2:
            points = [[p['volume1'], first_pressure], [p['volume1'], final_pressure]]
            curves = [s('Cammino p–V', 'Pa', 'm³', points)]
        else:
            def pressure_at(volume):
                if p['path'] == 0:
                    return p['moles'] * R * p['temperatureK'] / volume
                return first_pressure if p['path'] == 1 else first_pressure * (p['volume1'] / volume) ** GAMMA
            points = sample(pressure_at, p['volume1'], final_volume, 61)
            curves = [s('Cammino p–V', 'Pa', 'm³', points)]
        primary = m('work', 'Lavoro compiuto dal gas', 'J', work)
        measurements = [primary, m('heat', 'Calore ricevuto dal gas', 'J', heat), m('internalEnergyChange', 'Variazione di energia interna', 'J', internal), m('finalTemperature', 'Temperatura finale', 'K', final_temperature), m('finalPressure', 'Pressione finale', 'Pa', final_pressure), m('finalVolume', 'Volume finale effettivo', 'm³', final_volume), m('entropyChange', 'Variazione di entropia del gas', 'J/K', entropy), m('totalEntropyChange', 'Variazione di entropia totale', 'J/K', entropy if free_expansion else 0)]
        warnings.append('Libera espansione isolata nel vuoto: nessun cammino di equilibrio intermedio è definito. I due punti non vanno collegati; nessuna area del grafico rappresenta il lavoro, che è zero. ΔS_gas=ΔS_totale>0.' if free_expansion else 'Cammino isocoro: il volume resta costante e la temperatura finale è quella impostata nei dati.' if p['path'] == 2 else 'La temperatura finale è determinata dal cammino. Il controllo della temperatura finale si usa solo nell’isocora.')
    elif model_id == 'carnot':
        hot, cold, heat = p['hotTemperatureK'], p['coldTemperatureK'], p['heatInput']
        if hot <= cold:
            raise StudyError('invalid_physical_domain')
        efficiency, rejected = 1 - cold / hot, heat * cold / hot
        nr = heat / (hot * math.log(2))
        va, vb = .001, .002
        expansion = (hot / cold) ** (1 / (GAMMA - 1))
        vc, vd = vb * expansion, va * expansion
        primary = m('efficiency', 'Rendimento reversibile massimo', '1', efficiency)
        measurements = [primary, m('work', 'Lavoro netto per ciclo', 'J', heat - rejected), m('heatInput', 'Calore assorbito dalla sorgente calda', 'J', heat), m('heatRejected', 'Calore ceduto alla sorgente fredda', 'J', rejected), m('hotReservoirEntropy', 'Entropia della sorgente calda', 'J/K', -heat / hot), m('coldReservoirEntropy', 'Entropia della sorgente fredda', 'J/K', rejected / cold)]
        curves = [s('Isoterma calda: espansione', 'Pa', 'm³', sample(lambda v: nr * hot / v, va, vb, 31)),
                  s('Adiabatica: espansione', 'Pa', 'm³', sample(lambda v: nr * hot / vb * (vb / v) ** GAMMA, vb, vc, 31)),
                  s('Isoterma fredda: compressione', 'Pa', 'm³', sample(lambda v: nr * cold / v, vc, vd, 31)),
                  s('Adiabatica: compressione', 'Pa', 'm³', sample(lambda v: nr * cold / vd * (vd / v) ** GAMMA, vd, va, 31))]
        warnings.append('Il grafico costruisce un ciclo monoatomico reversibile con V_B/V_A=2 e quantità di sostanza scelta da Q_h=nRT_h ln2. Il gas ritorna allo stato iniziale.')
    elif model_id == 'entropy':
        c1, c2, final, q1, q2 = _thermal(p)
        first, second = c1 * math.log(final / p['temperature1K']), c2 * math.log(final / p['temperature2K'])
        total = max(0, first + second)
        primary = m('entropyChange', 'Variazione di entropia totale', 'J/K', total)
        measurements = [primary, m('entropy1', 'Variazione di entropia primo corpo', 'J/K', first), m('entropy2', 'Variazione di entropia secondo corpo', 'J/K', second), m('equilibriumTemperature', 'Temperatura finale comune', 'K', final), m('heat1', 'Calore ricevuto primo corpo', 'J', q1), m('heat2', 'Calore ricevuto secondo corpo', 'J', q2)]
        def entropy_at(fraction):
            t1 = p['temperature1K'] + (final - p['temperature1K']) * fraction
            t2 = p['temperature2K'] + (final - p['temperature2K']) * fraction
            return max(0, c1 * math.log(t1 / p['temperature1K']) + c2 * math.log(t2 / p['temperature2K']))
        curves = [s('Entropia totale prodotta durante lo scambio', 'J/K', '1', sample(entropy_at, 0, 1))]
    else:
        raise StudyError('unknown_activity')
    numbers = [primary['value']] + [item['value'] for item in measurements]
    numbers.extend(number for curve in curves for point in curve['points'] for number in point)
    if not all(math.isfinite(number) for number in numbers):
        raise StudyError('invalid_physical_domain')
    return {'primary': primary, 'measurements': measurements, 'series': curves, 'warnings': warnings}


def evaluate_fluid_lab(capability_id, parameters):
    if not isinstance(capability_id, str) or capability_id not in FLUID_LAB_DEFINITIONS:
        raise StudyError('unknown_activity')
    definition = FLUID_LAB_DEFINITIONS[capability_id]
    values = _parameters(capability_id, parameters)
    data = _calculate(definition['id'], values)
    return {
        'activityId': capability_id, 'version': 1, 'dataVersion': 1, 'parameters': values,
        'value': data['primary']['value'], 'unit': data['primary']['unit'],
        'domain': ' '.join(definition['assumptions']), 'editorialStatus': 'DRAFT',
        'distribution': 'BUNDLED_FIRST_PARTY', 'numericalCheck': 'independent-analytical',
        'observables': data['measurements'],
        'plots': [{'id': 'fluid-' + str(index), 'label': curve['label'], 'unit': curve['unit'],
                   'xUnit': curve['xUnit'], 'x': [point[0] for point in curve['points']],
                   'series': [{'label': curve['label'], 'values': [point[1] for point in curve['points']]}]}
                  for index, curve in enumerate(data['series'])],
        'labResult': data,
    }
