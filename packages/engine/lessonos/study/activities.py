"""Original, dimensionless Poiseuille activity. No model or network involved."""
import math
from .models import StudyError

ACTIVITY_ID = 'poiseuille-v1'
DOMAIN = 'Fluido newtoniano incomprimibile, moto laminare stazionario e sviluppato; tubo cilindrico rigido. Modello idealizzato, non previsione clinica.'
HINTS = (
    'Individua prima quale grandezza rimane fissata: differenza di pressione oppure portata.',
    'Confronta le potenze del raggio: il rapporto compare alla quarta potenza.',
    'A pressione fissata Q/Q₀ = (r/r₀)^4 / [(η/η₀)(L/L₀)]; a portata fissata Δp/Δp₀ è il reciproco. Se viscosità e lunghezza restano costanti, i loro rapporti valgono uno.',
)


def evaluate_activity(activity_id, parameters, attempt=None):
    if activity_id in ('units-v1','hydrostatic-v1','buoyancy-v1'):
        return _evaluate_extension(activity_id,parameters)
    if activity_id != ACTIVITY_ID:
        raise StudyError('activity_not_supported',404)
    if not isinstance(parameters,dict):raise StudyError('invalid_parameters')
    values = {}
    for key in ('radiusRatio','viscosity','length'):
        value = parameters.get(key,1)
        if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not 0 < value <= 100:
            raise StudyError('invalid_physical_domain')
        values[key] = value
    boundary = parameters.get('boundary','pressure')
    if boundary not in ('pressure','flow'):
        raise StudyError('invalid_boundary')
    radius_power = values['radiusRatio'] ** 4
    resistance_factors = values['viscosity'] * values['length']
    if radius_power <= 0 or resistance_factors <= 0:
        raise StudyError('invalid_physical_domain')
    ratio = radius_power / resistance_factors
    if not math.isfinite(ratio) or ratio <= 0:
        raise StudyError('invalid_physical_domain')
    if boundary == 'flow':
        ratio = 1 / ratio
    if not math.isfinite(ratio):
        raise StudyError('invalid_physical_domain')
    return {'activityId':ACTIVITY_ID,'version':1,'ratio':ratio,'fixedQuantity':boundary,
            'calculatedVariable':'Q/Q0' if boundary=='pressure' else 'Δp/Δp0',
            'domain':DOMAIN,'editorialStatus':'DRAFT','numericalCheck':'deterministic'}


def _number(parameters,key,default,*,minimum=0,maximum=1e9,zero=False):
    value=parameters.get(key,default)
    if type(value) not in (int,float) or not math.isfinite(value) or value>maximum or (value<minimum if zero else value<=minimum):
        raise StudyError('invalid_physical_domain')
    return value


def _evaluate_extension(activity_id,p):
    if not isinstance(p,dict):raise StudyError('invalid_parameters')
    result={'activityId':activity_id,'version':1,'editorialStatus':'DRAFT','numericalCheck':'deterministic'}
    if activity_id=='units-v1':
        units={'m':1,'cm':.01,'mm':.001}
        source=p.get('fromUnit','m');target=p.get('toUnit','cm');dimension=p.get('dimension',2)
        if not isinstance(source,str) or not isinstance(target,str) or source not in units or target not in units or type(dimension) is not int or dimension not in (2,3):raise StudyError('invalid_parameters')
        value=_number(p,'value',1,zero=True)
        result|={'value':value*(units[source]/units[target])**dimension,'unit':target+('²' if dimension==2 else '³'),'calculatedVariable':'Valore convertito','fixedQuantity':'grandezza fisica','domain':'Area o volume geometrico: il fattore di conversione lineare va elevato al quadrato o al cubo.'}
    elif activity_id=='hydrostatic-v1':
        rho=_number(p,'density',1000,maximum=20000);depth=_number(p,'depth',1,maximum=1000,zero=True)
        g=_number(p,'g',9.81,maximum=30);surface=_number(p,'surfacePressure',101325,maximum=2e6,zero=True)
        reference=p.get('reference','gauge')
        if reference not in ('gauge','absolute'):raise StudyError('invalid_parameters')
        result|={'value':rho*g*depth+(surface if reference=='absolute' else 0),'unit':'Pa','calculatedVariable':'Pressione assoluta' if reference=='absolute' else 'Incremento rispetto alla superficie','fixedQuantity':'densità, g e pressione alla superficie','domain':'Liquido incomprimibile fermo, densità uniforme, profondità misurata sotto la superficie. Δp = ρgh; p = p_superficie + ρgh.'}
    else:
        rho=_number(p,'liquidDensity',1000,maximum=20000);obj=_number(p,'objectDensity',600,maximum=30000)
        volume=_number(p,'volume',.001,maximum=1000);g=_number(p,'g',9.81,maximum=30)
        regime='floating' if obj<rho else 'neutral' if obj==rho else 'sinking'
        result|={'value':rho*g*volume,'unit':'N','calculatedVariable':'Spinta massima a immersione completa','regime':regime,'immersedFraction':obj/rho if obj<=rho else None,'weightN':obj*g*volume,'fixedQuantity':'densità, volume e g','domain':'Corpo omogeneo rigido, liquido uniforme, equilibrio senza altri vincoli. F_A = ρ_liquido g V_immerso; a immersione completa V_immerso = V. Tensione superficiale e aria trascurate. Per densità uguali equilibrio indifferente quando completamente immerso.'}
    if not math.isfinite(result['value']):raise StudyError('invalid_physical_domain')
    return result
