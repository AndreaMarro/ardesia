"""One local definition per capability, referenced by multiple course views.

This does not make a Core resource global or grant cross-edition access.
"""
from .models import evaluate, _PARAMETER_SPECS
from .resources import implementation_sha256
from .fluid_catalog import get_fluid_catalog, FLUID_LAB_DEFINITIONS

_PARAMETERS = {
    'mass1': ('Massa del corpo1', 'kg'), 'mass2': ('Massa del corpo2', 'kg'),
    'velocity1': ('Velocità iniziale del corpo1', 'm/s'),
    'velocity2': ('Velocità iniziale del corpo2', 'm/s'),
    'restitution': ('Coefficiente di restituzione', '1'),
    'density': ('Densità del fluido', 'kg/m³'),
    'area1': ('Area della prima sezione', 'm²'), 'area2': ('Area della seconda sezione', 'm²'),
    'speed1': ('Velocità nella prima sezione', 'm/s'),
    'pressure1': ('Pressione assoluta nella prima sezione', 'Pa'),
    'height1': ('Quota della prima sezione', 'm'), 'height2': ('Quota della seconda sezione', 'm'),
    'g': ('Accelerazione di gravità', 'm/s²'),
    'charge': ('Carica sorgente', 'C'), 'position': ('Posizione della sonda sull’asse x', 'm'),
    'testCharge': ('Carica di prova', 'C'),
    'focalLength': ('Distanza focale con segno', 'm'),
    'objectDistance': ('Distanza dell’oggetto reale', 'm'),
    'objectHeight': ('Altezza dell’oggetto', 'm'),
}
_CONTENT = {
    'collision-1d-v1': {
        'title': 'Urto e bilancio di energia',
        'primaryOutput': {'label': 'Velocità finale del corpo1', 'unit': 'm/s'},
        'explanation': [
            'La quantità di moto totale prima e dopo coincide se la risultante degli impulsi esterni è trascurabile.',
            'Il coefficiente e confronta velocità relativa di separazione e di avvicinamento. Per e=1 l’urto è elastico; per e=0 i due corpi hanno la stessa velocità finale.',
            'L’energia cinetica trasformata non è energia totale scomparsa. Il modello non descrive deformazioni o temperatura durante l’urto.',
        ],
        'transfer': {'mass1': 1, 'mass2': 1, 'velocity1': 2, 'velocity2': -1, 'restitution': 1},
    },
    'bernoulli-v1': {
        'title': 'Continuità e Bernoulli',
        'primaryOutput': {'label': 'Pressione assoluta nella seconda sezione', 'unit': 'Pa'},
        'explanation': [
            'La portata volumetrica è la stessa nelle due sezioni di un tubo senza accumulo: Q=A₁v₁=A₂v₂.',
            'Lungo la stessa linea di corrente ideale, pressione, termine cinetico e termine gravitazionale si scambiano mantenendo costante p+ρv²/2+ρgh.',
            'Una sezione più stretta non implica da sola una conclusione sulla pressione se cambiano anche quota, pompe o dissipazioni. Qui questi ultimi due effetti sono esclusi.',
        ],
        'transfer': {'density': 1000, 'area1': .01, 'area2': .01, 'speed1': 3,
                     'pressure1': 150000, 'height1': 0, 'height2': 2, 'g': 9.81},
    },
    'point-charge-v1': {
        'title': 'Campo, potenziale e carica di prova',
        'primaryOutput': {'label': 'Componente x del campo elettrico', 'unit': 'N/C'},
        'explanation': [
            'Il campo è una proprietà della sorgente e del punto: Eₓ=kq·segno(x)/|x|². Il potenziale, con zero all’infinito, è V=kq/|x|.',
            'Spostarsi sul lato opposto cambia il segno della componente del campo, non il segno del potenziale di quella sorgente.',
            'Forza ed energia potenziale dipendono anche dalla carica di prova: Fₓ=qₚEₓ e U=qₚV. Il campo non coincide con la forza.',
        ],
        'transfer': {'charge': -2e-9, 'position': -.6, 'testCharge': 2e-9},
    },
    'thin-lens-v1': {
        'title': 'Lente sottile e immagine con segno',
        'primaryOutput': {'label': 'Posizione firmata dell’immagine', 'unit': 'm'},
        'explanation': [
            'La convenzione qui usa u positivo per l’oggetto reale a sinistra e v positivo per l’immagine reale a destra. La distanza focale è negativa per una lente divergente.',
            'L’equazione 1/f=1/u+1/v determina la posizione; m=−v/u determina orientamento e rapporto delle altezze.',
            'I prolungamenti tratteggiati verso un’immagine virtuale non sono raggi che viaggiano all’indietro. Vicino al piano focale il confronto è escluso dal dominio numerico dichiarato.',
        ],
        'transfer': {'focalLength': .1, 'objectDistance': .05, 'objectHeight': .001},
    },
}
_COURSES = [
    ('strumenti-meccanica', 'Strumenti e meccanica', ['collision-1d-v1', 'bernoulli-v1']),
    ('fluidi-termodinamica', 'Fluidi e termodinamica', ['bernoulli-v1']),
    ('elettricita-magnetismo', 'Elettricità e magnetismo', ['point-charge-v1']),
    ('onde-ottica-radiazioni', 'Onde, ottica e radiazioni', ['thin-lens-v1']),
]


def get_catalog():
    capabilities = []
    for activity_id, specification in _PARAMETER_SPECS.items():
        content = _CONTENT[activity_id]
        default = evaluate(activity_id, {})
        capabilities.append({
            'id': activity_id, 'version': 1, 'implementationSha256': implementation_sha256(),
            'title': content['title'], 'primaryOutput': dict(content['primaryOutput']),
            'explanation': list(content['explanation']), 'transfer': dict(content['transfer']),
            'domain': default['domain'], 'distribution': 'BUNDLED_FIRST_PARTY',
            'editorialStatus': 'DRAFT', 'parameters': [
                {'key': key, 'label': _PARAMETERS[key][0], 'unit': _PARAMETERS[key][1],
                 'default': bounds[0], 'minimum': bounds[1], 'maximum': bounds[2]}
                for key, bounds in specification.items()],
        })
    capabilities.extend(get_fluid_catalog(implementation_sha256()))
    return {'schemaVersion': 1,
            'referenceScope': 'capability-definition; Core resource access remains edition-scoped',
            'capabilities': capabilities,
            'courses': [{'id': key, 'title': title, 'capabilityIds': list(ids) +
                         (list(FLUID_LAB_DEFINITIONS) if key == 'fluidi-termodinamica' else [])}
                        for key, title, ids in _COURSES]}
