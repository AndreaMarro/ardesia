"""Generated metadata for one first-party plugin, projected into the existing catalog.

The JSON is emitted from definitions.ts at build time. No JavaScript executes in
the Core server. Scientific numerical results are independently computed in
fluid_models.py, never accepted from a renderer.
"""
import json
from . import _FLUID_CATALOG_BYTES

_CATALOG = json.loads(_FLUID_CATALOG_BYTES.decode('utf8'))
FLUID_LAB_DEFINITIONS = {item['capabilityId']: item for item in _CATALOG['definitions']}
FLUID_PARAMETER_SPECS = {
    key: {p['key']: (p['default'], p['min'], p['max']) for p in definition['parameters']}
    for key, definition in FLUID_LAB_DEFINITIONS.items()
}


def get_fluid_catalog(implementation_sha256):
    """Capabilities to append to the existing scientific catalog, not a registry."""
    return [{
        'id': capability_id, 'version': 1, 'implementationSha256': implementation_sha256,
        'title': definition['title'], 'primaryOutput': _primary(definition['id']),
        'domain': ' '.join(definition['assumptions']),
        'explanation': [definition['objective'], definition['prediction'], definition['formula']],
        'transfer': dict(definition['presets'][1]['parameters']),
        'distribution': 'BUNDLED_FIRST_PARTY', 'editorialStatus': 'DRAFT',
        'fluidLab': {'modelId': definition['id'], 'pluginId': 'io.ardesia.fluid-thermo',
                     'pluginVersion': '1.0.0', 'modelVersion': 1},
        'parameters': [{'key': p['key'], 'label': p['label'], 'unit': p['unit'],
                        'default': p['default'], 'minimum': p['min'], 'maximum': p['max']}
                       for p in definition['parameters']],
    } for capability_id, definition in FLUID_LAB_DEFINITIONS.items()]


def _primary(model_id):
    label, unit = {
        'manometer': ('Differenza di pressione p₁−p₂', 'Pa'),
        'hydrostatic': ('Pressione assoluta alla profondità scelta', 'Pa'),
        'pascal': ('Forza sul secondo pistone', 'N'),
        'buoyancy': ('Spinta di Archimede', 'N'),
        'continuity': ('Velocità media nella seconda sezione', 'm/s'),
        'venturi': ('Pressione assoluta nella seconda sezione', 'Pa'),
        'poiseuille': ('Portata a Δp fissata; con Q fissata il risultato è Δp in Pa', 'm³/s'),
        'hydraulic-network': ('Portata totale', 'm³/s'),
        'capillary': ('Risalita capillare; nei modi goccia/bolla il risultato è Δp in Pa', 'm'),
        'ideal-gas': ('Pressione assoluta', 'Pa'),
        'calorimetry': ('Temperatura di equilibrio', 'K'),
        'phase-change': ('Temperatura del sistema', '°C'),
        'heat-transfer': ('Potenza per conduzione', 'W'),
        'process': ('Lavoro compiuto dal gas', 'J'),
        'carnot': ('Rendimento reversibile massimo', '1'),
        'entropy': ('Variazione di entropia totale', 'J/K'),
    }[model_id]
    return {'label': label, 'unit': unit}
