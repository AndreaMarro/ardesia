"""Original, dimensionless Poiseuille activity. No model or network involved."""
import math
from .models import StudyError

ACTIVITY_ID = 'poiseuille-v1'
DOMAIN = 'Fluido newtoniano incomprimibile, moto laminare stazionario e sviluppato; tubo cilindrico rigido. Modello idealizzato, non previsione clinica.'
HINTS = (
    'Individua prima quale grandezza rimane fissata: differenza di pressione oppure portata.',
    'Confronta le potenze del raggio: il rapporto compare alla quarta potenza.',
    'A pressione fissata Q/Q0 = (r/r0)^4; a portata fissata Δp/Δp0 = 1/(r/r0)^4.',
)


def evaluate_activity(activity_id, parameters, attempt=None):
    if activity_id != ACTIVITY_ID:
        raise StudyError('activity_not_supported',404)
    values = {}
    for key in ('radiusRatio','viscosity','length'):
        value = parameters.get(key,1)
        if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not 0 < value <= 100:
            raise StudyError('invalid_physical_domain')
        values[key] = value
    boundary = parameters.get('boundary','pressure')
    if boundary not in ('pressure','flow'):
        raise StudyError('invalid_boundary')
    ratio = values['radiusRatio'] ** 4
    if boundary == 'flow':
        ratio = 1 / ratio
    if not math.isfinite(ratio):
        raise StudyError('invalid_physical_domain')
    return {'activityId':ACTIVITY_ID,'version':1,'ratio':ratio,'fixedQuantity':boundary,
            'calculatedVariable':'Q/Q0' if boundary=='pressure' else 'Δp/Δp0',
            'domain':DOMAIN,'editorialStatus':'DRAFT','numericalCheck':'deterministic'}
