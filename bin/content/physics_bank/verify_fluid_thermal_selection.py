#!/usr/bin/env python3
"""Build-time independent checks for a curated view of the existing U3/U5 bank.

No generator import and no use of its formula/residual as oracle. PHYSICS was
written from the physical balances and declared units after reading each context.
Model samples supply inputs only. SymPy reads bundled answer expressions at build
time; it is neither a runtime grader nor a parser of learner text.
"""
from functools import lru_cache
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import sympy as sp

ROOT=Path(__file__).resolve().parents[3]
CONTENT=ROOT/'packages/engine/lessonos/study/content'
BANK=CONTENT/'physics-semestre-2026-bank'
# x,z are in each record's declared units. Constants below include explicit SI conversions.
PHYSICS={
'U3-pressure-area':lambda force,area:force/area,
'U3-density':lambda mass,litres:mass/litres,
'U3-stevino-gauge':lambda density_kg_l,depth:(density_kg_l*1000)*10*depth/1000,
'U3-stevino-absolute':lambda surface_kpa,depth:surface_kpa+1000*10*depth/1000,
'U3-layered-liquids':lambda water_m,oil_m:(1000*10*water_m+800*10*oil_m)/1000,
'U3-communicating-columns':lambda density1,density2:density1*10/density2,
'U3-differential-manometer':lambda p1_kpa,dh_cm:p1_kpa-1000*10*(dh_cm/100)/1000,
'U3-vertical-wall-force':lambda width,height:1000*10*width*height*height/2/1000,
'U3-hydraulic-force':lambda inlet_force,outlet_area:inlet_force*outlet_area/1,
'U3-hydraulic-stroke':lambda inlet_area,outlet_stroke:20*outlet_stroke/inlet_area,
'U3-archimedes-force':lambda density_kg_l,volume_l:density_kg_l*volume_l*10,
'U3-floating-fraction':lambda body_density,fluid_density:body_density/fluid_density,
'U3-apparent-weight':lambda mass,volume_l:mass*10-volume_l*1*10,
'U3-maximum-payload':lambda body_density,volume_l:volume_l*1-volume_l*body_density,
'U3-loaded-raft-depth':lambda load,area_dm2:(load+2)/(1*area_dm2),
'U3-two-liquid-floating':lambda body_density,bottom_density:(body_density-0.5)/(bottom_density-0.5),
'U3-hydrostatic-weighing':lambda air_weight,immersed_weight:air_weight/(air_weight-immersed_weight),
'U3-volume-flow':lambda area_cm2,mean_cm_s:area_cm2*mean_cm_s,
'U3-mass-flow':lambda density_kg_l,flow_l_s:density_kg_l*flow_l_s,
'U3-constriction-velocity':lambda inlet_area,outlet_area:inlet_area*2/outlet_area,
'U3-identical-branches':lambda count,area:24/count/area,
'U3-junction-balance':lambda inflow,branch1:inflow-branch1,
'U3-mixing-mass-balance':lambda q1,q2:(q1*1+q2*3)/(q1+q2),
'U3-hydraulic-power':lambda dp_kpa,q_l_s:(dp_kpa*1000)*(q_l_s/1000),
'U3-bernoulli-horizontal':lambda v1,v2:100+(1000/2)*(v1*v1-v2*v2)/1000,
'U3-bernoulli-height-speed':lambda rise,v:(1000*10*rise+1000*v*v/2)/1000,
'U3-venturi-area-ratio':lambda ratio,v1:1000*((ratio*v1)**2-v1**2)/2/1000,
'U3-torricelli-speed':lambda gravity,depth:math.sqrt(2*gravity*depth),
'U3-torricelli-flow':lambda area_mm2,head:(area_mm2*1e-6)*math.sqrt(2*10*head)*1e6,
'U3-horizontal-jet-range':lambda depth,height:math.sqrt(2*10*depth)*math.sqrt(2*height/10),
'U3-reservoir-emptying':lambda area_ratio,head:area_ratio*math.sqrt(2*head/10),
'U3-transport-time':lambda volume,flow:volume/flow,
'U3-poiseuille-flow':lambda radius_cm,eta_mpas:math.pi*(radius_cm/100)**4*0.08/(8*(eta_mpas/1000)*1)*1e6,
'U3-hydraulic-series':lambda r1,r2:r1+r2,
'U3-hydraulic-parallel':lambda r1,r2:1/(1/r1+1/r2),
'U3-parallel-flow-divider':lambda r1,r2:10*(1/r1)/(1/r1+1/r2),
'U3-viscous-dissipation':lambda r,q:(r*q*1000)*(q/1000),
'U3-parabolic-profile':lambda max_speed,radial_fraction:max_speed*(1-radial_fraction**2),
'U3-couette-force':lambda eta,speed:eta*speed/0.001*0.01,
'U3-pressure-gradient-fixed-speed':lambda eta_mpas,radius_mm:8*(eta_mpas/1000)*0.01/(radius_mm/1000)**2,
'U3-network-stages':lambda stages,channels:stages*(2/channels),
'U3-accelerating-liquid-column':lambda length,acceleration:(1000*1e-4*length)*acceleration,
'U3-soap-film-force':lambda gamma_mnm,length_cm:2*gamma_mnm*(length_cm/100),
'U3-surface-work':lambda gamma_mnm,total_area_cm2:(gamma_mnm*1e-3)*(total_area_cm2*1e-4)*1e6,
'U3-laplace-droplet':lambda gamma_mnm,radius_mm:2*(gamma_mnm/1000)/(radius_mm/1000),
'U3-alveolar-surfactant-balance':lambda large_gamma,radius_ratio:large_gamma*radius_ratio,
'U3-two-droplet-pressure':lambda radius1_mm,radius2_mm:2*0.01*(1/(radius1_mm/1000)-1/(radius2_mm/1000)),
'U3-capillary-rise':lambda gamma_mnm,radius_mm:2*(gamma_mnm/1000)/(1000*10*(radius_mm/1000))*1000,
'U3-drop-detachment':lambda radius_mm,gamma_mnm:2*math.pi*(radius_mm/1000)*(gamma_mnm/1000)/(1000*10)*1e9,
'U3-droplet-fragmentation':lambda radius_mm,count:0.01*count*4*math.pi*((radius_mm/1000)/(count**(1/3)))**2*1e6,
'U5-temperature-difference':lambda hot_c,cold_c:(hot_c+273.15)-(cold_c+273.15),
'U5-ideal-gas-pressure':lambda kelvin,litres:kelvin/(litres/1000)/1000,
'U5-gas-density':lambda kpa,kelvin:(kpa*1000)*0.032/(8*kelvin),
'U5-isothermal-chambers':lambda pressure1,pressure2:(pressure1+pressure2)/2,
'U5-isothermal-work':lambda doubling_work,ratio:doubling_work*math.log(ratio)/math.log(2),
'U5-isochoric-heat':lambda capacity,deltat:capacity*deltat,
'U5-isobaric-monatomic-heat':lambda nr,deltat:1.5*nr*deltat+nr*deltat,
'U5-isobaric-work':lambda kpa,litres:(kpa*1000)*(litres/1000),
'U5-first-law-expansion':lambda heat,work_by:heat-work_by,
'U5-compression-heating':lambda heat,work_on:heat-(-work_on),
'U5-cyclic-work':lambda hot_heat,cold_heat:hot_heat-cold_heat,
'U5-engine-efficiency':lambda hot_heat,cold_heat:(hot_heat-cold_heat)/hot_heat,
'U5-engine-average-power':lambda hot_heat,period:(hot_heat*0.25)/period,
'U5-carnot-efficiency':lambda hot_k,cold_k:(hot_k-cold_k)/hot_k,
'U5-refrigerator-cop':lambda cold_heat,work_on:cold_heat/work_on,
'U5-reversible-refrigerator':lambda hot_k,cold_k:cold_k/(hot_k-cold_k),
'U5-carnot-work-temperature-gap':lambda hot_k,cold_k:1*hot_k-1*cold_k,
'U5-adiabatic-monatomic':lambda initial_k,compression_ratio:initial_k*compression_ratio**(2/3),
'U5-free-expansion-pressure':lambda initial_kpa,vacuum_l:initial_kpa*1/(1+vacuum_l),
'U5-sensible-heat':lambda mass_g,deltat:mass_g*2*deltat,
'U5-heating-with-losses':lambda power,loss:120/(power-loss),
'U5-temperature-after-heating':lambda power,time:20+power*time/10,
'U5-two-body-calorimetry':lambda cap1,cap2:20+(80-20)*cap1/(cap1+cap2),
'U5-calorimeter-capacity':lambda hot_mass,cold_mass:20+60*hot_mass/(hot_mass+cold_mass+2),
'U5-latent-heat':lambda mass,latent:mass*latent,
'U5-subzero-ice-melting':lambda mass,subzero_interval:mass*2*subzero_interval+mass*300,
'U5-steam-condensation-cooling':lambda mass,cooling_interval:mass*2400+mass*4*cooling_interval,
'U5-ice-final-temperature':lambda heat,mass:(heat-mass*300)/(mass*4),
'U5-warm-water-and-ice':lambda water_mass,ice_mass:(water_mass*4*50-ice_mass*300)/(4*(water_mass+ice_mass)),
'U5-freezing-time':lambda mass,power:(mass*4*20+mass*300)/power,
'U5-plane-conduction':lambda conductivity,deltat:conductivity*0.01*deltat/0.01,
'U5-composite-wall-series':lambda length1,length2:60/(length1/(1*1)+length2/(2*1)),
'U5-parallel-thermal-panels':lambda area1,area2:1*area1*10/1+2*area2*10/1,
'U5-interface-temperature':lambda hot_resistance,cold_resistance:100-(100/(hot_resistance+cold_resistance))*hot_resistance,
'U5-convective-loss':lambda h,surface_c:h*1*(surface_c-20),
'U5-emitted-blackbody-power':lambda theta,area_cm2:6e-8*(area_cm2*1e-4)*(theta*100)**4*1000,
'U5-net-blackbody-exchange':lambda theta_surface,theta_environment:6e-8*((theta_surface*100)**4-(theta_environment*100)**4),
'U5-parallel-heat-losses':lambda deltat,h:5*deltat+h*1*deltat,
'U5-reversible-isothermal-entropy':lambda heat,kelvin:heat/kelvin,
'U5-entropy-hot-cold':lambda cold_k,hot_k:-600/hot_k+600/cold_k,
'U5-ideal-expansion-entropy':lambda doubling_entropy,ratio:doubling_entropy*math.log(ratio)/math.log(2),
'U5-statistical-entropy':lambda omega_final,omega_initial:math.log(omega_final/omega_initial)/math.log(2),
}

# Individually reviewed conceptual keys of original bundled items. Each follows
# the declared physical hypothesis; these are AI review records, never a human signature.
CONCEPT_KEYS={
'u3-pressure-area-03':'La pressione si dimezza e la forza totale resta uguale.',
'u3-stevino-gauge-03':'Le pressioni sono uguali.',
'u3-stevino-absolute-03':'Diventa uguale a p_s, la pressione del gas soprastante.',
'u3-vertical-wall-force-03':'Perché la pressione varia con la profondità e il valore sul fondo è il massimo.',
'u3-hydraulic-force-03':'L’uscita percorre un decimo della corsa d’ingresso.',
'u3-archimedes-force-03':'Resta uguale se volume e densità del liquido non cambiano.',
'u3-floating-fraction-03':'La frazione di volume immerso.',
'u3-volume-flow-03':'No: serve la velocità media, che per quel profilo vale v_max/2.',
'u3-venturi-area-ratio-03':'Il calo di pressione si converte in aumento di energia cinetica del flusso.',
'u3-horizontal-jet-range-06':'Le gittate sono uguali, ma dal foro A il getto esce più velocemente.',
'u3-poiseuille-flow-03':'Il fluido deve essere newtoniano e il moto laminare sviluppato in un tubo cilindrico rigido.',
'u3-poiseuille-flow-08':'1/4',
'u3-hydraulic-series-06':'4 kPa',
'u3-hydraulic-parallel-06':'La portata nel primo ramo resta uguale; la portata totale diminuisce.',
'u3-parabolic-profile-03':'Velocità massima sull’asse e zero alla parete.',
'u3-couette-force-03':'Il fluido può continuare a deformarsi nel tempo, mentre il solido può raggiungere una deformazione statica finita.',
'u3-pressure-gradient-fixed-speed-03':'La sua densità non varia apprezzabilmente nelle condizioni considerate, ma può avere viscosità non nulla.',
'u3-laplace-droplet-03':'Maggiore, perché la curvatura è maggiore.',
'u5-temperature-difference-03':'La sua temperatura aumenta di 20 K, ma non raddoppia in scala assoluta.',
'u5-ideal-gas-pressure-03':'No: il calore dipende anche dal percorso e dal lavoro scambiato.',
'u5-isothermal-chambers-06':'1/2',
'u5-isothermal-work-16':'24 J',
'u5-isochoric-heat-03':'Il lavoro è nullo, ma energia interna e pressione possono aumentare.',
'u5-isobaric-monatomic-heat-03':'6 J',
'u5-isobaric-work-03':'Il lavoro di ritorno è opposto al lavoro di andata; la somma è zero.',
'u5-first-law-expansion-03':'Il calore è energia trasferita a causa di una differenza di temperatura.',
'u5-engine-efficiency-03':'È vietata dal secondo principio nella forma di Kelvin-Planck.',
'u5-carnot-efficiency-03':'Hanno lo stesso rendimento perché dipende solo dalle temperature delle sorgenti.',
'u5-free-expansion-pressure-03':'Temperatura finale uguale e entropia maggiore.',
'u5-sensible-heat-03':'Sistema chiuso, ma non necessariamente isolato.',
'u5-two-body-calorimetry-03':'Il campione di massa 2m ha capacità termica doppia, mentre il calore specifico resta uguale.',
'u5-calorimeter-capacity-03':'B e C sono in equilibrio termico fra loro se messi in contatto nelle stesse condizioni.',
'u5-latent-heat-03':'Il calore fornito cambia la frazione liquida mentre la temperatura resta costante.',
'u5-plane-conduction-03':'Nella conduzione l’energia passa senza un flusso macroscopico di materia attraverso la parete.',
'u5-net-blackbody-exchange-03':'Entrambi emettono e assorbono, ma la potenza netta scambiata è zero.',
'u5-reversible-isothermal-entropy-03':'No: l’entropia del sistema aumenta, compensata dalla diminuzione dell’ambiente.',
'u5-entropy-hot-cold-03':'Perché ogni joule trasferito produce una variazione di entropia maggiore alla temperatura più bassa.',
'u5-ideal-expansion-entropy-03':'È uguale nei due percorsi perché l’entropia è una funzione di stato.',
'u5-ideal-expansion-entropy-16':'8 J/K',
'u5-statistical-entropy-03':'L’entropia aumenta di k_B ln2.',
}

def content_sha(question):
    body={k:v for k,v in question.items() if k not in {'status','reviewer'}}
    return hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()

@lru_cache(maxsize=1)
def data():
    models={m['id']:m for m in json.loads((ROOT/'packs/semestre-filtro-2026-27/data/models_fluids_thermal.json').read_text())}
    questions={q['id']:q for p in sorted((BANK/'questions').glob('U[35]-*.json')) for q in json.loads(p.read_text())}
    return questions,models

def load_case(qid):
    questions,models=data();q=questions[qid]
    return q,models[q['familyId']]

def value(expr,**values):
    symbols={name:sp.Symbol(name,positive=True) for name in ('x','z','y','alpha','beta')}
    parsed=sp.sympify(expr,locals={**symbols,'pi':sp.pi,'log':sp.log,'sqrt':sp.sqrt},rational=True)
    if parsed.free_symbols-set(symbols.values()):raise ValueError('unknown symbol in bundled answer')
    return float(parsed.subs({symbols[k]:v for k,v in values.items()}))

def check_question(q,model):
    errors=[];task=q['descriptors']['reasoningTask'];answer=q['answer']
    options=q['options']
    if q['format']=='multiple_choice':
        if len(options)!=5 or len({o['text'] for o in options})!=5:errors.append('options not unique')
        correct=next((o for o in options if o['id']==answer.get('correctOptionId')),None)
        if correct is None:errors.append('correct option missing');return errors
        displays={answer['text']}
        suffix=' '+answer['unit']
        if answer['unit'] and answer['text'].endswith(suffix):
            displays.add(answer['text'][:-len(suffix)])
        if correct['text'] not in displays:errors.append('displayed correct option differs from answer display')
    if q['id'] in CONCEPT_KEYS:
        expected=CONCEPT_KEYS[q['id']]
        if answer['text']!=expected or correct['text']!=expected:errors.append('individually reviewed conceptual key mismatch')
        return errors
    physics=PHYSICS[model['id']]
    if task=='direct_evaluation':
        check=next(c for c in q['verification']['automaticChecks'] if c['kind']=='substitution')
        x=value(check['values']['x']);z=value(check['values']['z'])
        statement=q['prompt'].split('Sono assegnati ',1)[-1].split('Quanto vale ',1)[0]
        for symbol_key in ('x','z'):
            variable=model[symbol_key]
            shown=check['values'][symbol_key].replace('**','^').replace('*','·').replace('pi','π').replace('log(','ln(')
            suffix='' if variable['unit'] in ('1','','adimensionale') else ' '+variable['unit']
            expected_label=variable['symbol']+' = '+shown+suffix
            if re.search(re.escape(expected_label)+r'(?![\w/^·]|[.,]\d)',statement) is None:
                errors.append('displayed input differs from independent oracle input')
        expected=physics(x,z)
        if not math.isclose(value(answer['exact']),expected,rel_tol=1e-10,abs_tol=1e-10):errors.append('physical direct oracle mismatch')
        if answer['unit']!=model['y']['unit']:errors.append('direct unit mismatch')
    elif task=='symbolic_inverse_first':
        if answer['unit']!=model['x']['unit']:errors.append('inverse unit mismatch')
        probes=[(value(x),value(z)) for x,z in model['samples'][:8]]
        for x,z in probes:
            y=physics(x,z)
            if not math.isclose(value(answer['exact'],y=y,z=z),x,rel_tol=1e-9,abs_tol=1e-9):errors.append('physical inverse oracle mismatch');break
        plausible=[]
        for option in options:
            good=True
            for x,z in probes:
                try:matches=math.isclose(value(option['exact'],y=physics(x,z),z=z),x,rel_tol=1e-9,abs_tol=1e-9)
                except (ValueError,TypeError,ZeroDivisionError,OverflowError):matches=False
                good &= matches
            if good:plausible.append(option['id'])
        if plausible!=[answer['correctOptionId']]:errors.append('physical option uniqueness mismatch')
    else:errors.append('task has no independent oracle')
    return errors

def verify_selection(pack=None):
    if pack is None:pack=json.loads((CONTENT/'sf-fluidi-termodinamica-v1.json').read_text())
    qs,models=data();errors=[];records=[]
    for ref in pack['curatedPractice']['questionRefs']:
        q=qs[ref['id']];case_errors=check_question(q,models[q['familyId']])
        if content_sha(q)!=ref['sha256']:case_errors.append('content hash mismatch')
        if case_errors:errors.extend(f"{q['id']}: {e}" for e in case_errors)
        records.append({'id':q['id'],'contentSha256':ref['sha256'],'status':'FAIL' if case_errors else 'VALIDATED_TECHNICALLY','method':'individually_reviewed_concept' if q['id'] in CONCEPT_KEYS else 'independent_physical_balance_and_unit_oracle','errors':case_errors})
    pack_bytes=(json.dumps(pack,ensure_ascii=False,indent=2)+'\n').encode()
    return {'schemaVersion':1,'ok':not errors,'coursePackSha256':hashlib.sha256(pack_bytes).hexdigest(),'selectedCount':len(records),'validatedCount':sum(r['status']=='VALIDATED_TECHNICALLY' for r in records),'errors':errors,'humanReview':'NOT_RUN','acceptedCount':0,'records':records,'limits':['Numeric probes are independent physical checks, not exhaustive proofs over every parameter.','Conceptual keys reviewed by AI; no human signature or learner calibration.','No laboratory or deployed-consumer acceptance is implied.']}

if __name__=='__main__':
    report=verify_selection()
    if '--write' in sys.argv:
        (ROOT/'docs/ops/closure1-20261028/selection-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='records'},ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['ok'] else 1)
