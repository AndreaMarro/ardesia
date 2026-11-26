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
CANDIDATE_REF='cceb5d0b6a3ad3e917031691acb1a1a3e96da523'
PRIMARY_SHA256='c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c'
FAMILY='parallel-thermal-panels'
BATCH='parallel-thermal-panels-180'
ASSET_NAME='parallel-thermal-panels-progressive.svg'
REVIEWED_PACKAGE_SHA256='f6a368be9d5f85128ca0ac2579175b2072a59cfa7bebcbad021da4db9d12540d'
REVIEWED_BINDINGS_SHA256='98d66bd44fa70f702bb5a72186c7a4df9533034cc7acb71dfe69dfef7b118d30'
SOURCE_REFERENCE='Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.'
FALSE_PROOF='Raddoppiare entrambe le aree raddoppia due volte il totale e produce quattro volte la potenza.'
SVG_MUTATION=(b'width="100"', b'width="110"')
EXPECTED_MAPPING={1: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 2: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 3: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 4: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 5: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 6: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 7: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 8: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 9: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 10: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 11: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 12: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 13: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 14: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 15: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 16: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06'])}
NUMERIC_UNITS={1: 'W', 5: 'm²', 6: 'm²', 14: 'm²'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' m²', 16: ' m²'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'meter**2', 6: 'meter**2', 7: 'dimensionless', 8: 'watt', 9: 'meter**2', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'meter**2', 15: 'meter**2', 16: 'meter**2'}
MANUAL=['G₁=1 W/K e G₂=2 W/K; contributi 10 e 20 W sul medesimo salto 10 K, totale 30 W.', 'P è somma di potenze; (W/K)·K=W e non J o area.', 'P=P₁+P₂=ΔT G₁+ΔT G₂=ΔT(G₁+G₂), per collegamenti diretti agli stessi nodi.', 'A conduce 10+20=30 W. B cambia solo il primo contributo a 20 W: totale 40 W.', 'P₁=30−20=10 W; A₁=P₁ L/(k₁ ΔT)=1 m².', 'P₂=30−10=20 W; A₂=P₂ L/(k₂ ΔT)=1 m².', 'A conduce 30 W; B con area seconda doppia conduce 10+40=50 W: rapporto 5/3.', 'Proposta 60 meno valore corretto 30 dà +30 W, mentre due è un rapporto puro.', 'G₁=P/ΔT−G₂>0; A₁=L G₁/k₁. Unità m² e residuo positivo necessari.', 'G_B=a G₁+b G₂; rapporto (a G₁+b G₂)/(G₁+G₂). Fattore comune a dà a.', 'Con aree entrambe doppie il totale è 20+40=60 W; rapporto con 30 W uguale 2.', '(30+60)/2=45 W. Anche aree medie 3/2 e 3/2 m² danno 15+30=45 W per linearità, non per regola universale.', 'Target 60 W meno primo ramo 20 dà secondo 40 W; servono 2 m², rapporto 2.', 'q=90/(30 W)=3 W⁻¹. S180 decodifica 60 W; ramo noto 40 W, residuo 20 W e A₁=2 m².', 'q=(121−61)/(60−30)=2 W⁻¹, b=1. S81 dà 40 W, ramo noto 20 W e A₁=2 m².', 'A₁=A₂ dà P=(30 W/m²) A₂. Misura 30 W impone unica area positiva 1 m².']
DISTRACTORS=['10 e 20 W tengono un solo ramo; la serie ha potenza comune e salti ripartiti, modello diverso.', 'J energia, m² area, W/K conduttanza, W/(m·K) conducibilità.', 'Dividere ΔT per G non dà W; sottrarre inverte un ramo; prodotto aggiunge fattore G e dividere per ΔT dà W/K².', '60 raddoppia anche il ramo fisso, 15 inverte la dipendenza, 30 ignora il cambio, 20 perde un ramo.', '3 m² attribuisce tutto al primo; 2 m² dà totale 40 W. Non si sottrae area da potenza.', '3/2 usa tutto P nel secondo; 2 usa k₁ e predice totale 50 W; zero perde il contributo necessario.', '2 raddoppia tutto; 3/5 è reciproco; 1/2 inverte la dipendenza e 1 ignora incremento.', '−30 inverte ordine; 60 copia proposta; zero accetta errore; 2 è rapporto.', 'Più aggiunge ramo noto; PL/(k₁ΔT) perde il secondo; scambio k₁/L altera dimensione; solo G₂ ignora P.', 'Prodotto sbaglia somma di rami; reciproco inverte; soli fattori senza pesi non ricostruiscono il totale.', '4 moltiplica raddoppi invece di distribuirli; 1/2 inverte; 3 confonde coefficienti con rapporto; 1 ignora entrambi.', '90 non dimezza; 15 dimezza differenza; 30 e 60 copiano un solo dato. Coincidenza agli ingressi medi è verificata separatamente.', '1/2 inverte; 4 m² nel secondo darebbe 100 W totali; 1 dà 40 W; 60 copia watt.', '180 usato come watt dà residuo 140 e area 14 m²; 1 m² prevede S150, non 180.', '41/20 m² omette b e predice S82; 1 torna ad A; 4 predice S121; 40 copia watt.', '2 e 3 m² danno 60 e 90 W; 30 copia potenza. Misura totale fissa la scala comune, rapporto da solo no.']
ASSUMPTIONS=['Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.', 'Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.']
PEDAGOGY=['Legge motivata dalle ipotesi prima del risultato, con unità conservate.', 'Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.', 'Legge o meccanismo fisico ricostruiti separatamente dalla chiave.', 'Confronto controllato fra prove mantenendo fissi i parametri dichiarati.', 'Inversa derivata prima della sostituzione, con dominio strettamente positivo.', 'Seconda inversa e verifica dimensionale del residuo o del denominatore.', 'Le due prove ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto mantenuto e distinto da un rapporto.', 'Inversa simbolica con geometria e divisioni lecite.', 'Scalature sostituite nel modello completo, senza cancellare pesi diversi.', 'Entrambi gli ingressi variati inclusi nel medesimo bilancio.', 'Media delle uscite distinta dalla risposta agli ingressi medi.', 'Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.', 'Display continuo tarato prima di invertire la relazione fisica.', 'Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.', 'Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.']
EXPECTED_IDS={'AR-u5-parallel-thermal-panels-05', 'AR-u5-parallel-thermal-panels-11', 'AR-u5-parallel-thermal-panels-07', 'AR-u5-parallel-thermal-panels-04', 'AR-u5-parallel-thermal-panels-03', 'AR-u5-parallel-thermal-panels-02', 'AR-u5-parallel-thermal-panels-08', 'AR-u5-parallel-thermal-panels-09', 'AR-u5-parallel-thermal-panels-16', 'AR-u5-parallel-thermal-panels-14', 'AR-u5-parallel-thermal-panels-13', 'AR-u5-parallel-thermal-panels-10', 'AR-u5-parallel-thermal-panels-15', 'AR-u5-parallel-thermal-panels-01', 'AR-u5-parallel-thermal-panels-12', 'AR-u5-parallel-thermal-panels-06'}
REVIEWED_CANDIDATES={'AR-u5-parallel-thermal-panels-01': 'a71d8c072e8e89db77338a3ea76a137610fbaf98adabeabef62ef9da334dafac', 'AR-u5-parallel-thermal-panels-02': '6e2acceb6e117752621dd33449a2d2eecabc129a3e3b6a219a7795f64d24773b', 'AR-u5-parallel-thermal-panels-03': 'ec036a94fdcf7217a1d0846a1eed495d4efcfc341210738a3d3ae5999ef26f9b', 'AR-u5-parallel-thermal-panels-04': '4f5374b43250c84d3ffb61ce19f0a4d68351d00ef85b185daaec1280c267a316', 'AR-u5-parallel-thermal-panels-05': '048c94e6bef385f532e3d70da0b01a7a2810f2fd6ee0b48234a00cd1dda1310f', 'AR-u5-parallel-thermal-panels-06': '38e69d30d34b6f891f5471da7b2dd644786112369c7c87cc72a323069db57da6', 'AR-u5-parallel-thermal-panels-07': '182a8713f11b9ebfc975a825421d6591f40e432b7b6558a41b87bf9058263927', 'AR-u5-parallel-thermal-panels-08': 'f19900a22d935d91cc5d733de33dcf565e3a40d6134c728b951a11fa4bcd4704', 'AR-u5-parallel-thermal-panels-09': '8e1d9956c2af4022304ccc75124e9cf302eb4e0d9822fba555fccd24edfa4dbe', 'AR-u5-parallel-thermal-panels-10': '34eaccf656a0f23e727295b9699f7eb18b9dccc772d1510f38918be90266f577', 'AR-u5-parallel-thermal-panels-11': '6c37d9d0117698651768fc0fe2f80788f5418c9c23d584bb0567dabdc8d668c5', 'AR-u5-parallel-thermal-panels-12': '11c274fd88f237e16200b4fab4ea06a1f8e847e927d48c92e93662d14d384c75', 'AR-u5-parallel-thermal-panels-13': '47602d2916435776037fb4f5b129237dbe90230028cf48dbf1f39c8d9d5063a7', 'AR-u5-parallel-thermal-panels-14': 'fc76ede3a99608000c601decfee7b79bf8e1e77007bc8a577916f32c4a514803', 'AR-u5-parallel-thermal-panels-15': 'cc459a0a49627461ab453f18517debbba8e7f7a4835b0e52ea071b3b241ac831', 'AR-u5-parallel-thermal-panels-16': '2d99ce6bc1c5595a051a4a621959e688fee2fd4dd6f1795285f38b28cfd6566a'}
REQUIRED_RECTS={(130, 994, 150, 34), (130, 1070, 300, 34), (130, 1146, 225, 34), (130, 752, 100, 34), (230, 752, 200, 34), (130, 600, 100, 34), (130, 676, 200, 34)}
REQUIRED_PATHS={'M440 205H500', 'M440 355H500'}
GEOMETRY_REVIEW='Due collegamenti schematici fra medesimi nodi, non scala delle aree; due punte del verso energetico distinte. Barre dei contributi 10 e 20 W lunghe 100 e 200; totale affiancato 300, scala comune 10 unità/W. Ultimo pannello 30/60/45 W lungo 150/300/225 da x130 (5 unità/W). XML e rendering integrale asset-only letti; nessuna sovrapposizione di testi e assi rilevata.'

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
    for suffix in (' W/(m·K)',' m²',' K/W',' W/K',' W',' K',' m',' °C',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def power(a1,a2):
    a1,a2=map(Fraction,(a1,a2))
    if min(a1,a2)<=0:raise ValueError('Positive areas required in both independent branches')
    l=SI.Quantity(1,'meter');d=SI.Quantity(10,'kelvin')
    g1=SI.Quantity(1,'watt/meter/kelvin')*SI.Quantity(a1,'meter**2')/l
    g2=SI.Quantity(2,'watt/meter/kelvin')*SI.Quantity(a2,'meter**2')/l
    return Fraction(((g1+g2)*d).to('watt').magnitude)
def inverse_a1(p,a2):
    p,a2=map(Fraction,(p,a2))
    if min(p,a2)<=0 or p<=20*a2:raise ValueError('Known branch must leave strictly positive residual power')
    return (p-20*a2)/10
def inverse_a2(p,a1):
    p,a1=map(Fraction,(p,a1))
    if min(p,a1)<=0 or p<=10*a1:raise ValueError('Known branch must leave strictly positive residual power')
    return (p-10*a1)/20
def scaled(a1,a2,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive area preparation factors required')
    return power(a*a1,b*a2)/power(a1,a2)
def constrained(p):
    p=Fraction(p)
    if p<=0:raise ValueError('Positive total power required')
    return p/30
@lru_cache(maxsize=1)
def oracle():
    p,g1,g2,d=sp.symbols('p g1 g2 delta',positive=True)
    law=sp.Eq(p,d*g1+d*g2)
    assert sp.solve(law,g1)==[-g2+p/d]
    first=sp.Rational(power(1,1));second=sp.Rational(power(2,2))
    fit=calibrate(first,second,90,180,61,121,81,'watt')
    assert fit==(3,1,60,40)
    assert power(Fraction(3,2),Fraction(3,2))==45
    return [first,'W','P = ΔT (G₁ + G₂)','Da 30 a 40 W',inverse_a1(first,1),inverse_a2(first,1),scaled(1,1,1,2),60-first,'A₁ = L (P/ΔT − G₂) / k₁','(κ₁ G₁ + κ₂ G₂) / (G₁ + G₂)',second/first,(first+second)/2,inverse_a2(2*first,2),inverse_a1(fit[2],2),inverse_a1(fit[3],1),constrained(30)]

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
