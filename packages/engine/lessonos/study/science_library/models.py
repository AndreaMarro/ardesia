"""Bounded analytical models in SI, separate from rendering and wall clocks."""
import math

from ..models import StudyError


def _parameters(value, specification):
    if not isinstance(value, dict) or set(value) - set(specification):
        raise StudyError('invalid_parameters')
    result = {}
    for key, (default, lower, upper) in specification.items():
        n = value.get(key, default)
        # Bounds precede float conversion: gigantic integers fail without overflow.
        if type(n) not in (int, float) or not lower <= n <= upper or not math.isfinite(n):
            raise StudyError('invalid_physical_domain')
        result[key] = float(n)
    return result


def _result(activity, parameters, domain, value, unit, observables, **data):
    return {'activityId': activity, 'version': 1, 'dataVersion': 1,
            'parameters': parameters, 'value': value, 'unit': unit,
            'domain': domain, 'editorialStatus': 'DRAFT',
            'distribution': 'BUNDLED_FIRST_PARTY', 'numericalCheck': 'analytical',
            'observables': [{'key': key, 'label': label, 'value': data[key], 'unit': u}
                            for key, label, u in observables], **data}


def _collision(p):
    p = _parameters(p, {'mass1': (2, 1e-6, 1e6), 'mass2': (1, 1e-6, 1e6),
                        'velocity1': (3, -1e4, 1e4), 'velocity2': (0, -1e4, 1e4),
                        'restitution': (1, 0, 1)})
    m1, m2, u1, u2, e = (p[k] for k in ('mass1', 'mass2', 'velocity1', 'velocity2', 'restitution'))
    if u1 <= u2:
        raise StudyError('bodies_not_approaching')
    momentum = m1 * u1 + m2 * u2
    relative = e * (u1 - u2)
    v1 = (momentum - m2 * relative) / (m1 + m2)
    v2 = (momentum + m1 * relative) / (m1 + m2)
    before = .5 * m1 * u1 ** 2 + .5 * m2 * u2 ** 2
    after = .5 * m1 * v1 ** 2 + .5 * m2 * v2 ** 2
    # Reduced-mass loss avoids subtracting two almost equal frame-dependent energies.
    loss = .5 * (m1 / (m1 + m2)) * m2 * (1 - e * e) * (u1 - u2) ** 2
    return _result('collision-1d-v1', p,
        'Urto istantaneo unidimensionale fra due corpi isolati: corpo1 a sinistra di corpo2, '
        'in avvicinamento u1>u2. Masse positive; coefficiente di restituzione 0≤e≤1. '
        'Quantità di moto conservata; energia cinetica conservata solo per e=1. '
        'Nessun attrito, forza esterna, rotazione, penetrazione o andamento temporale dell’urto.',
        v1, 'm/s', [('velocity1AfterMS', 'Velocità finale corpo1', 'm/s'),
                   ('velocity2AfterMS', 'Velocità finale corpo2', 'm/s'),
                   ('energyBeforeJ', 'Energia cinetica prima', 'J'),
                   ('energyAfterJ', 'Energia cinetica dopo', 'J'),
                   ('energyLossJ', 'Energia cinetica trasformata', 'J')],
        velocity1AfterMS=v1, velocity2AfterMS=v2,
        momentumBeforeKgMS=momentum, momentumAfterKgMS=m1*v1+m2*v2,
        energyBeforeJ=before, energyAfterJ=after, energyLossJ=loss,
        plots=[{'id': 'velocity', 'label': 'Velocità prima e dopo', 'unit': 'm/s',
                'categories': ['Corpo1', 'Corpo2'],
                'series': [{'label': 'Prima', 'values': [u1, u2]}, {'label': 'Dopo', 'values': [v1, v2]}]},
               {'id': 'energy', 'label': 'Bilancio di energia cinetica', 'unit': 'J',
                'categories': ['Prima', 'Dopo', 'Trasformata'],
                'series': [{'label': 'Energia', 'values': [before, after, loss]}]}])


def _bernoulli(p):
    p = _parameters(p, {'density': (1000, .1, 20000), 'area1': (.01, 1e-6, 10),
                        'area2': (.005, 1e-6, 10), 'speed1': (2, .001, 100),
                        'pressure1': (120000, 1, 1e8), 'height1': (0, -100, 100),
                        'height2': (0, -100, 100), 'g': (9.81, .01, 30)})
    rho, a1, a2, speed, pressure, h1, h2, g = (
        p[k] for k in ('density', 'area1', 'area2', 'speed1', 'pressure1', 'height1', 'height2', 'g'))
    flow = a1 * speed
    speed2 = flow / a2
    pressure2 = pressure + .5 * rho * (speed ** 2 - speed2 ** 2) + rho * g * (h1 - h2)
    if speed2 > 100 or pressure2 <= 0 or pressure2 > 1e8:
        raise StudyError('invalid_physical_domain')
    energy1 = pressure + .5 * rho * speed ** 2 + rho * g * h1
    energy2 = pressure2 + .5 * rho * speed2 ** 2 + rho * g * h2
    return _result('bernoulli-v1', p,
        'Fluido ideale incomprimibile, regime stazionario lungo la stessa linea di corrente, '
        'senza pompe, turbine o dissipazioni. Q=A·v e p+ρv²/2+ρgh costante. '
        'Pressioni assolute positive; entrambe le velocità ≤100m/s. '
        'Una pressione positiva non esclude la cavitazione: tensione di vapore, '
        'viscosità, profilo delle velocità e comprimibilità non sono verificati da questo modello.',
        pressure2, 'Pa', [('speed2MS', 'Velocità nella seconda sezione', 'm/s'),
                         ('flowM3S', 'Portata volumetrica', 'm³/s'),
                         ('pressure2Pa', 'Pressione assoluta nella seconda sezione', 'Pa')],
        speed2MS=speed2, flowM3S=flow, pressure2Pa=pressure2,
        energyDensity1Pa=energy1, energyDensity2Pa=energy2,
        plots=[{'id': 'speed', 'label': 'Velocità nelle due sezioni', 'unit': 'm/s',
                'categories': ['Sezione1', 'Sezione2'],
                'series': [{'label': 'Velocità', 'values': [speed, speed2]}]},
               {'id': 'energy', 'label': 'Termini del bilancio per unità di volume', 'unit': 'Pa',
                'categories': ['Sezione1', 'Sezione2'],
                'series': [{'label': 'Pressione', 'values': [pressure, pressure2]},
                           {'label': 'Cinetico', 'values': [.5*rho*speed**2, .5*rho*speed2**2]},
                           {'label': 'Gravitazionale', 'values': [rho*g*h1, rho*g*h2]}]}])


def _point_charge(p):
    p = _parameters(p, {'charge': (1e-9, -1e-5, 1e-5),
                        'position': (.3, -1000, 1000), 'testCharge': (2e-9, -1e-5, 1e-5)})
    q, x, probe = (p[k] for k in ('charge', 'position', 'testCharge'))
    r = abs(x)
    if r < .01:
        raise StudyError('singular_or_excluded_position')
    k = 9e9
    field = math.copysign(1, x) * k * q / r ** 2
    potential = k * q / r
    distances = sorted({min(1000, max(.01, r*factor)) for factor in (.5, 1, 2)})
    positions = sorted(math.copysign(d, x) for d in distances)
    return _result('point-charge-v1', p,
        'Carica puntiforme fissata all’origine nel vuoto; sonda sull’asse x con |x|≥0,01m. '
        'k≈9·10⁹N·m²/C² è un’approssimazione didattica dichiarata, non una costante SI esatta. '
        'Campo con segno lungo x, potenziale nullo all’infinito. Carica di prova ideale: '
        'nessuna perturbazione della sorgente, materiali, moto o campo magnetico.',
        field, 'N/C', [('electricFieldXNC', 'Componente x del campo elettrico', 'N/C'),
                       ('potentialV', 'Potenziale rispetto all’infinito', 'V'),
                       ('forceXN', 'Forza sulla carica di prova', 'N'),
                       ('potentialEnergyJ', 'Energia potenziale della carica di prova', 'J')],
        coulombConstant=k, electricFieldXNC=field, potentialV=potential,
        forceXN=probe*field, potentialEnergyJ=probe*potential,
        plots=[{'id': 'field', 'label': 'Campo lungo il lato selezionato', 'xUnit': 'm', 'unit': 'N/C',
                'x': positions, 'series': [{'label': 'Eₓ', 'values': [math.copysign(1, z)*k*q/z**2 for z in positions]}]},
               {'id': 'potential', 'label': 'Potenziale lungo il lato selezionato', 'xUnit': 'm', 'unit': 'V',
                'x': positions, 'series': [{'label': 'V', 'values': [k*q/abs(z) for z in positions]}]}])


def _thin_lens(p):
    p = _parameters(p, {'focalLength': (.1, -10, 10), 'objectDistance': (.3, .01, 100),
                        'objectHeight': (.005, 1e-6, .1)})
    f, u, h = (p[k] for k in ('focalLength', 'objectDistance', 'objectHeight'))
    if abs(f) < .01 or h > .1 * min(u, abs(f)):
        raise StudyError('outside_paraxial_domain')
    if abs(u-f) <= 1e-4 * max(u, abs(f)):
        raise StudyError('near_focal_plane')
    image = f*u/(u-f)
    magnification = -image/u
    image_height = h*magnification
    end = image if image > 0 else 1.5*abs(f)
    segments = [
        {'label': 'Raggio parallelo incidente', 'style': 'solid', 'points': [[-u,h],[0,h]]},
        {'label': 'Raggio parallelo rifratto', 'style': 'solid', 'points': [[0,h],[end,h*(1-end/f)]]},
        {'label': 'Raggio per il centro ottico', 'style': 'solid', 'points': [[-u,h],[0,0],[end,-h*end/u]]},
    ]
    if image < 0:
        segments += [
            {'label': 'Prolungamento virtuale parallelo', 'style': 'dashed', 'points': [[0,h],[image,image_height]]},
            {'label': 'Prolungamento virtuale centrale', 'style': 'dashed', 'points': [[0,0],[image,image_height]]},
        ]
    return _result('thin-lens-v1', p,
        'Lente sottile ideale in aria, approssimazione paraassiale; oggetto reale a sinistra. '
        '1/f=1/u+1/v, u>0; f positivo convergente, negativo divergente; v positivo immagine '
        'reale a destra, negativo virtuale a sinistra. m=−v/u. Altezza ≤0,1·min(u,|f|). '
        'Esclusa la fascia |u−f|≤10⁻⁴max(u,|f|), numericamente mal condizionata vicino al fuoco. '
        'Nessuna aberrazione, diffrazione o misura sperimentale della lente.',
        image, 'm', [('imageDistanceM', 'Posizione firmata dell’immagine', 'm'),
                     ('magnification', 'Ingrandimento trasversale con segno', '1'),
                     ('imageHeightM', 'Altezza firmata dell’immagine', 'm')],
        imageDistanceM=image, magnification=magnification, imageHeightM=image_height,
        imageKind='real' if image>0 else 'virtual', raySegments=segments,
        plots=[{'id': 'height', 'label': 'Altezze con segno', 'unit': 'm',
                'categories': ['Oggetto', 'Immagine'],
                'series': [{'label': 'Altezza', 'values': [h, image_height]}]}])


_HANDLERS = {'collision-1d-v1': _collision, 'bernoulli-v1': _bernoulli,
             'point-charge-v1': _point_charge, 'thin-lens-v1': _thin_lens}


def evaluate(capability_id, parameters):
    if not isinstance(capability_id, str) or capability_id not in _HANDLERS:
        raise StudyError('activity_not_supported', 404)
    return _HANDLERS[capability_id](parameters)
