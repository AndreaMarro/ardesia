"""Independent source-first thermal transport review; no authoring imports.
Frozen signatures identify the final text and full SVG read by a separate reviewer.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
import hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json'
CANDIDATE_REF='83f82bcae179315b955e3df20af94c3a7000f128'
PRIMARY_SHA256='c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c'
FAMILY='plane-conduction'
BATCH='plane-conduction-178'
ASSET_NAME='plane-conduction-progressive.svg'
REVIEWED_PACKAGE_SHA256='cc40b592023d0ec74990fcb51d27b761529599a80ae491032d078fb3748ff273'
REVIEWED_BINDINGS_SHA256='13d407b16a10eb12341198632b8d091b23909de4dc18be55180bd68eb4f31afc'
SOURCE_REFERENCE='Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.'
FALSE_PROOF='Raddoppiare lo spessore a k e ΔT fissi raddoppia la potenza condotta.'
SVG_MUTATION=(b'width="80"', b'width="81"')
EXPECTED_MAPPING={1: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 2: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 3: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 4: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 5: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 6: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 7: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 8: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 9: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 10: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 11: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 12: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 13: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 14: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 15: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 16: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05'])}
NUMERIC_UNITS={1: 'W', 5: 'W/(m·K)', 6: 'K', 14: 'W/(m·K)'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' W/(m·K)', 16: ' K'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'watt/meter/kelvin', 6: 'kelvin', 7: 'dimensionless', 8: 'watt', 9: 'watt/meter/kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'watt/meter/kelvin', 15: 'watt/meter/kelvin', 16: 'kelvin'}
MANUAL=['A/L=(1/100 m²)/(1/100 m)=1 m; G=2 W/K, P=G·10 K=20 W.', 'P è energia per tempo: W=J/s; [k][A][ΔT]/[L] lascia W.', 'Le interazioni microscopiche trasferiscono energia nel solido senza un moto macroscopico della parete; la convezione comprende moto di fluido.', 'G passa da 2 a 4 W/K; con 10 K le potenze sono 20 e 40 W.', 'k=PL/(AΔT)=20/(1·10)=2 W/(m·K); P/ΔT da solo è G in W/K.', 'ΔT=PL/(k A)=20/2=10 K, differenza senza aggiungere 273, 15.', 'P_A=20 W, P_B=40 W; B/A=2, positivo e adimensionale.', '40−20=+20 W, mentre 40/20=2 è un rapporto.', 'PL=k AΔT; k=PL/(AΔT), divisione lecita per AΔT>0.', 'Sostituzione k_B=a k_A e ΔT_B=b ΔT_A dà P_B/P_A=a b.', 'P_B=4·20=80 W, P_A=20 W; rapporto 4.', '(20+80)/2=50 W; potenza agli ingressi medi 3 e 15 è45 W, non la media.', 'Target 80 W; k_B=4 implica ΔT_B=20 K; rapporto con 10 K uguale 2.', 'q=60/(20 W)=3 W⁻¹; S240 decodifica 80 W; k=80/20=4 W/(m·K).', 'q=(161−41)/(80−20)=2 W⁻¹, b=1; P_C=(81−1)/2=40 W e k_C=4.', 'P=β(A/L)ΔT²; coefficiente 1/5 W/K², ΔT²=100 K². Solo +10 K mantiene k>0 e ΔT>0.']
DISTRACTORS=['Copiare 2 o 10 perde un fattore fisico; 40 raddoppia ancora. Joule richiederebbero una durata.', 'J è energia, W/K conduttanza, W/(m·K) conducibilità, K intervallo.', 'Moto di fluido è convezione; onde nel vuoto irraggiamento. Parete ferma non implica trasferimento nullo né flusso di materia.', '10 W inverte la dipendenza, 80 la rende quadratica, 20 ignora il cambiamento, zero ignora ΔT positivo.', '20 copia P, 10 copia ΔT; moltiplicare per ΔT sbaglia dimensione. Il metro di A/L va mantenuto.', '40 moltiplica per G, 2 copia k; convertire un intervallo non cambia lo zero.', '1/2 è il reciproco, 4 introduce un quadrato, 1 ignora la prova B, −2 viola moduli positivi.', '−20 inverte ordine, 40 copia proposta, zero accetta errore, 2 W dà unità a un rapporto.', 'A/L invertito cambia dimensioni; moltiplicare per ΔT introduce K² relativi alla forma corretta; reciproco e G non sono k.', 'Quozienti invertono dipendenze; somma darebbe 2 a fattori unità; quadrato introduce dipendenza assente.', '2 usa un solo raddoppio, 1/4 inverte rapporto, 8 aggiunge fattore, 1 ignora entrambi.', '45 usa ingressi medi, 100 non dimezza, 30 dimezza differenza, 25 dimezza di nuovo.', '4 ignora k raddoppiata; 1/2 inverte rapporto; 1 dà 40 W; 20 copia kelvin.', '240 W darebbe k₁2; k₂ prevede S120 e non 240; 20 copia ΔT.', '81/20 ignora b e predice S82; k₂ torna ad A, 8 predice 161, 40 copia watt.', '−10 rende k negativo; 100 copia quadrato; 5 dà 5 W e 20 dà 80 W.']
ASSUMPTIONS=['Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.', 'Lastra omogenea ferma, A=1/100 m², L=1/100 m, lati isolati e facce isoterme mantenute; conduzione monodimensionale stazionaria senza sorgenti interne. k e ΔT strettamente positivi, k uniforme e costante entro prova. P è modulo caldo-freddo; vincolo 16 fra preparazioni, non k locale dipendente dalla temperatura. Intervalli in K distinti da punti termometrici; display continuo adimensionale.']
PEDAGOGY=['Legge motivata dalle ipotesi prima del risultato, con unità conservate.', 'Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.', 'Legge o meccanismo fisico ricostruiti separatamente dalla chiave.', 'Confronto controllato fra prove mantenendo fissi i parametri dichiarati.', 'Inversa derivata prima della sostituzione, con dominio strettamente positivo.', 'Seconda inversa e verifica dimensionale del residuo o del denominatore.', 'Le due prove ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto mantenuto e distinto da un rapporto.', 'Inversa simbolica con geometria e divisioni lecite.', 'Scalature sostituite nel modello completo, senza cancellare pesi diversi.', 'Entrambi gli ingressi variati inclusi nel medesimo bilancio.', 'Media delle uscite distinta dalla risposta agli ingressi medi.', 'Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.', 'Display continuo tarato prima di invertire la relazione fisica.', 'Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.', 'Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.']
EXPECTED_IDS={'AR-u5-plane-conduction-16', 'AR-u5-plane-conduction-01', 'AR-u5-plane-conduction-04', 'AR-u5-plane-conduction-05', 'AR-u5-plane-conduction-02', 'AR-u5-plane-conduction-06', 'AR-u5-plane-conduction-10', 'AR-u5-plane-conduction-03', 'AR-u5-plane-conduction-08', 'AR-u5-plane-conduction-09', 'AR-u5-plane-conduction-14', 'AR-u5-plane-conduction-11', 'AR-u5-plane-conduction-15', 'AR-u5-plane-conduction-07', 'AR-u5-plane-conduction-12', 'AR-u5-plane-conduction-13'}
REVIEWED_CANDIDATES={'AR-u5-plane-conduction-01': '8710b10b86994c0ffc7bb6b55ec0ce7cd0f910f3d3f141c2eacda6062d3e27f9', 'AR-u5-plane-conduction-02': 'eb3843f9bbede3668c1aafbaecdef296e83e2e7e62ba224c719abe4b23204af1', 'AR-u5-plane-conduction-03': '0989c7557e51253d57b9e58095592bbce2a4bad4efc7ddc5743268cfc37a2a66', 'AR-u5-plane-conduction-04': '828b7c09bf4aa25e22a38c8d30e0e117759b4def1b2a79626dc075cef6097ad9', 'AR-u5-plane-conduction-05': 'f372b27b8e87a034d8abd31404e70f8c9f29d2d619bff976cf002ccf6ae55fe9', 'AR-u5-plane-conduction-06': '5efb800416115c9805d2780811fb137e2a9372e19204b58b70b803eafe0b6a8b', 'AR-u5-plane-conduction-07': '302cd8f9566d6b3d5cc7257cf444a6da15ce987aff6f030325dede4a9029ae1b', 'AR-u5-plane-conduction-08': 'e6efae253d289113d81ccb9197c4d0b16aa9671a6d77398e97622c9005739d1a', 'AR-u5-plane-conduction-09': 'fe6d355b54a0d64a97a7ca09079d8d891aa801ede8e2654bf3e48047e905263d', 'AR-u5-plane-conduction-10': 'dc4f5aba05cbfb044d5e4f15b70a70e628859e8442b724c77eccf78e29cdebef', 'AR-u5-plane-conduction-11': 'cc4437712a5778d7ed9e2eba33802034a2e19ed68b77a6196122db254300462f', 'AR-u5-plane-conduction-12': 'e001260e641139f102c1cc0e7c7c7a07d9000224f31b3e773dce75942dd867e6', 'AR-u5-plane-conduction-13': '75ce42c0fbaa929c2eb3441815c4acb28c9e6985148edc382a9b20305e3e01ca', 'AR-u5-plane-conduction-14': '1e5a9ceeccd71cf082e9c30418378c5f25616fc43a68d948c977e31d63f0d6e9', 'AR-u5-plane-conduction-15': 'c869028e2790331c6668b376dc4f6561292865f354d453b88f93878c420fe26a', 'AR-u5-plane-conduction-16': 'e762d813e37a90c1df2176d63b777ed9884eb64ca91c7b3b402018db5634b2d5'}
REQUIRED_RECTS={(130, 982, 80, 34), (130, 1058, 320, 34), (310, 125, 17, 170), (130, 1134, 200, 34)}
REQUIRED_PATHS={'M100 590L500 790'}
GEOMETRY_REVIEW='SVG completo XML e rendering asset-only letti: lastra 17 ×170 coerente con 1 ×10 cm; profilo lineare da(0 cm, 10 K) a(1 cm, 0 K), scale indipendenti 400 unità/cm e 20 unità/K. Barre 20/80/50 W lunghe 80/320/200 dal comune x130 (4 unità/W), etichette fuori dagli assi. Freccia di energia schematica, non moto di materia.'

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def parse_literal(raw):
    """Bounded exact decimal/fraction or single radical monomial; no eval."""
    if not isinstance(raw,str) or len(raw)>80:raise ValueError("Bounded exact literal required")
    raw=raw.strip().replace("−","-")
    number=r"[+-]?[0-9]+(?:[.,][0-9]+)?"
    match=re.fullmatch("("+number+")(?:/("+number+"))?",raw)
    if match:
        try:
            value=Fraction(match[1].replace(",","."))
            if match[2]:value/=Fraction(match[2].replace(",","."))
            result=sp.Rational(value)
        except (ValueError,ZeroDivisionError) as error:raise ValueError("Invalid rational literal") from error
    else:
        match=re.fullmatch(r"([+-]?[0-9]*)√([0-9]{1,4})(?:/([0-9]{1,8}))?",raw)
        if not match:raise ValueError("Outside independently reviewed exact literal grammar")
        coefficient,radicand,denominator=match.groups();coefficient={"":"1","+":"1","-":"-1"}.get(coefficient,coefficient)
        denominator=int(denominator or 1)
        if denominator==0:raise ValueError("Zero radical denominator")
        result=sp.Rational(coefficient)*sp.sqrt(int(radicand))/denominator
    if result.is_finite is not True or result.is_real is not True:raise ValueError("Finite real exact literal required")
    return result
def equivalent_literal(wanted):
    wanted=sp.Rational(wanted)
    return f"{2*wanted.p}/{2*wanted.q}"
def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    first,second=sp.Rational(first),sp.Rational(second)
    gain=sp.cancel(sp.Rational(reference_reading)/first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert first!=second and gain>0 and fit[q]>0
    physical=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert sp.simplify(sp.Rational(physical.magnitude)-gain)==0
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])
def parse_option(number,option):
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def alternative_identity(option):
    for suffix in (' W/(m·K)',' K/W',' W/K',' W',' K',' m',' °C',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def power(k,delta):
    k,delta=map(Fraction,(k,delta))
    if min(k,delta)<=0:raise ValueError('Positive conductivity and temperature difference required')
    area=SI.Quantity(Fraction(1,100),'meter**2');length=SI.Quantity(Fraction(1,100),'meter')
    result=(SI.Quantity(k,'watt/meter/kelvin')*area*SI.Quantity(delta,'kelvin')/length).to('watt')
    return Fraction(result.magnitude)
def inverse_k(p,delta):
    p,delta=map(Fraction,(p,delta))
    if min(p,delta)<=0:raise ValueError('Positive power and difference required')
    return p/delta
def inverse_delta(p,k):return inverse_k(p,k)
def scaled(k,delta,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return power(a*k,b*delta)/power(k,delta)
def constrained(p,beta):
    p,beta=map(Fraction,(p,beta))
    if min(p,beta)<=0:raise ValueError('Positive power and preparation coefficient required')
    return sp.sqrt(sp.Rational(p/beta))
@lru_cache(maxsize=1)
def oracle():
    p,k,a,l,d=sp.symbols('p k area length delta',positive=True)
    law=sp.Eq(p,k*a*d/l)
    assert sp.solve(law,k)==[l*p/(a*d)]
    assert sp.solve(law,d)==[l*p/(a*k)]
    assert SI.Quantity(10,'centimeter').to('meter').magnitude==Fraction(1,10)
    first=sp.Rational(power(2,10));second=sp.Rational(power(4,20))
    fit=calibrate(first,second,60,240,41,161,81,'watt')
    assert fit==(3,1,80,40)
    assert power(3,15)==45
    return [first,'W','Trasferimento microscopico nel materiale senza moto macroscopico della parete','Da 20 a 40 W',inverse_k(first,10),inverse_delta(first,2),scaled(2,10,1,2),40-first,'k = P L / (A ΔT)','κ₁ κ₂',second/first,(first+second)/2,inverse_delta(4*first,4)/10,inverse_k(fit[2],20),inverse_k(fit[3],10),constrained(20,Fraction(1,5))]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    if not REQUIRED_RECTS<=rects or not REQUIRED_PATHS<=paths:
        raise ValueError('Independent physical scale or temperature continuity changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u5-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C3" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent physical conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_Fourier_or_Newton_balance_inverse_ratio_mean_and_calibration",
            "Pint_exact_energy_temperature_power_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u5-transfer-178-182-primary-source-only.md","sha256":PRIMARY_SHA256}}
def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e or "exact answer or physical unit invalid" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U5-04","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "physical scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["independentReview"]="PASS_AI"
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed self-certified author provenance accepted")
    cases.append({"case":"author_self_certification_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
