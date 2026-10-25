"""Bounded original ideal-gas equilibrium model in SI, not a physiological model."""
import math
from .models import StudyError
GAS_CONSTANT=8.31446261815324
DOMAIN=('Gas ideale in equilibrio, temperatura assoluta in kelvin e pressione assoluta. '
        'pV=nRT; n costante durante i confronti. Modello diluito, nessuna transizione di fase, '
        'calore/lavoro o gas reale dedotti dalla sola equazione di stato. '
        'Intervalli demo:1≤T≤2000K,1≤p≤10⁸Pa,10⁻⁶≤n≤10mol.')


def evaluate_ideal_gas(p):
    if not isinstance(p,dict) or set(p)-{'moles','temperatureK','pressurePa'}:
        raise StudyError('invalid_parameters')
    values={}
    for key,default,lo,hi in [('moles',1,1e-6,10),('temperatureK',300,1,2000),('pressurePa',100000,1,1e8)]:
        v=p.get(key,default)
        if type(v) not in (int,float) or not lo<=v<=hi or not math.isfinite(v):
            raise StudyError('invalid_physical_domain')
        values[key]=v
    volume=values['moles']*GAS_CONSTANT*values['temperatureK']/values['pressurePa']
    return {'activityId':'ideal-gas-v1','version':1,'parameters':values,'value':volume,'unit':'m³',
            'volumeM3':volume,'volumeL':volume*1000,'calculatedVariable':'Volume del gas ideale',
            'fixedQuantity':'quantità di sostanza, temperatura e pressione selezionate',
            'domain':DOMAIN,'editorialStatus':'DRAFT','numericalCheck':'deterministic',
            'pvSamples':[{'pressurePa':v,'volumeM3':values['moles']*GAS_CONSTANT*values['temperatureK']/v}
                         for v in (50000,100000,150000,200000)]}
