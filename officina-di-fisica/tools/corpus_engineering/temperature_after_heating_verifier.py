"""Independent source-first calorimetry review, never importing authoring.
Frozen payloads and figures are limited to final editions read separately.
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
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-03.json"
CANDIDATE_REF="955436596da3ed30259421fc62e7f4073a4783f6"
PRIMARY_SHA256="9419530459f9ec798423a08160d73cf87506dba711d718c1fab983961a77340a"

FAMILY='temperature-after-heating'
BATCH='temperature-after-heating-169'
ASSET_NAME='temperature-after-heating-progressive.svg'
REVIEWED_PACKAGE_SHA256='d2ab63e450dc181d56d5d7d563ae41924b51d105485e474e66eea92d0dc4c856'
REVIEWED_BINDINGS_SHA256='420d1a6108578189ba7dceba6e9efbc3d1a0f86b40ef84dcca7f0c2719a11e02'
SOURCE_REFERENCE='Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.'
FALSE_PROOF='Raddoppiare P raddoppia sempre la lettura Celsius finale, perché lo zero iniziale non contribuisce al bilancio.'
SVG_MUTATION=(b'width="50"', b'width="60"')
EXPECTED_MAPPING={1: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 2: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 3: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 4: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 5: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 6: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 7: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 8: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 9: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 10: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 11: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 12: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 13: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 14: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 15: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 16: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06'])}
NUMERIC_UNITS={1: '°C', 5: 'W', 6: 's', 14: 'W'}
OPTION_SUFFIX={7: '', 8: ' K', 11: '', 12: ' °C', 13: '', 15: ' W', 16: ' s'}
UNITS={1: 'kelvin', 2: 'kelvin', 3: 'kelvin', 4: 'kelvin', 5: 'watt', 6: 'second', 7: 'dimensionless', 8: 'kelvin', 9: 'watt', 10: 'dimensionless', 11: 'dimensionless', 12: 'kelvin', 13: 'dimensionless', 14: 'watt', 15: 'watt', 16: 'second'}
MANUAL=['Pt=5·10=50 J; ΔT=50/10=5 K; lettura finale 20+5=25 °C, equivalente a 298,15 K.', 'La grandezza è un punto termometrico sulla scala Celsius; un intervallo di 1 K equivale a un grado di differenza, senza uguagliare gli zeri delle scale.', 'Il primo principio dà CΔT=Pt; dunque ΔT=Pt/C e la lettura numerica è θ_f=20+ΔT/(1 K).', 'P da 5 a 10 W a durata 10 s dà aumenti 5 e 10 K, quindi finali 25 e 30 °C.', 'ΔT=25−20=5 K; P=CΔT/t=10·5/10=5 W.', 'Q=CΔT=50 J; t=Q/P=50/5=10 s.', 'Le letture A e B sono 25 e 30 °C: rapporto Celsius 6/5; il rapporto assoluto è 303,15/298,15.', 'Proposta meno corretta: 50−25=+25 K di scarto.', 'Isolo P=CΔT/t, con ΔT=(θ_f−20) K, θ_f>20 e t>0; J diviso s dà W.', 'Posto d=ΔT_A/(1 K), il rapporto delle letture è (20+κ₁κ₂d)/(20+d). L’offset 20 resta in entrambe.', 'B riceve 10·20=200 J, aumenta di 20 K e arriva a 40 °C; 40/25=8/5.', 'Media=(25+40)/2=65/2 °C. Il modello a P=15/2 W e t=15 s dà 125/4 °C, diverso.', 'B deve arrivare a (8/5)25=40 °C, richiede 200 J e a 10 W dura 20 s; t_B/t_A=2.', 'Sulla lettura Celsius q=75/25=3; S=120 dà θ=40 e ΔT=20 K; P=200 J/(20 s)=10 W.', 'q=(81−51)/(40−25)=2, b=1. S=61 dà θ=30, ΔT=10 K; P=100 J/(10 s)=10 W.', 'Il vincolo fra preparazioni P=αt, α=1/2 W/s, dà αt²=50 J e t²=100 s². Ramo positivo t=10 s, P=5 W; non si integra P variabile.']
DISTRACTORS=['5 è solo l’aumento; 50 copia Q, 20 ignora Q e 70 somma il numero di joule alla lettura.', 'J indica energia, W potenza, J/K capacità e K⁻¹ temperatura inversa; fra le opzioni solo °C misura la lettura.', 'CPt non ha unità di aumento termico; P/(Ct) ha K/s². Omettere 20 perde lo stato iniziale; il meno contraddice Q positivo.', '50 raddoppia la lettura anziché l’aumento; 10 è solo l’aumento B, 25 ignora P nuova e 15 descrive un raffreddamento.', '25 W usa 25 come aumento; 50 W copia i joule senza dividere per t; 1/2 W divide una seconda volta per C.', '50 s tratta 25 come intervallo; 2 s usa C/P senza l’aumento, mentre −10 s viola il dominio.', '2 segue aumenti o durate; 5/6 è il reciproco, 1/2 nega la crescita e 1 la ignora. Il rapporto assoluto differisce da 6/5.', '−25 K inverte l’ordine, 50 K copia la proposta, zero la accetta; 2 è un rapporto puro.', 'CΔTt ha J·s, t/(CΔT) ha W⁻¹. Cθ_f/t non usa l’intervallo; C/(ΔTt) ha J/(K²·s).', 'κ₁κ₂ omette il 20 iniziale; il reciproco scambia prove, κ₁/κ₂ rende inverso il tempo e la somma dei fattori non descrive Pt.', '4 è il rapporto degli aumenti; 5/8 è il reciproco, 2 usa un solo cambiamento e 1 ignora entrambi.', '125/4 °C usa gli ingressi medi; 65 somma, 15/2 copia P media e 30 usa B con durata ancora 10 s.', '1/2 è il reciproco; 8/5 segue la lettura, 4 l’energia e 20 è il tempo finale invece del rapporto.', '20 W usa la lettura 40 come aumento; 6 W usa 120 come joule; 5 W darebbe 30 °C e S=90.', '21/2 W omette b; 30 W usa 30 come aumento; 5 W torna ad A, 20 W produce 40 °C e S=81.', '−10 s è il ramo escluso; 100 copia t², 50 copia Q e 5 s darebbe 12,5 J e 21,25 °C.']
ASSUMPTIONS=['Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.', 'Sistema chiuso, capacità complessiva costante 10 J/K, stato iniziale 20 °C, potenza termica netta positiva costante entro prova e tempo positivo. Nessuna fase o lavoro apprezzabile. Letture numeriche Celsius distinte da aumenti in K e punti assoluti; display continuo sulla lettura. Il vincolo 16 confronta preparazioni, non una potenza istantanea crescente.']
PEDAGOGY=['Ricostruzione del bilancio prima della sostituzione, con risultato e unità della grandezza richiesta.', 'Dimensione della grandezza distinta dalle altre quantità del problema e dalla scala dell’unità.', 'Caso speciale o legge motivati con le ipotesi pertinenti, senza usare la chiave come prova.', 'Confronto controllato con distinzione fra ingresso modificato e risposta complessiva.', 'Inversa svolta dal bilancio e verificata nel dominio positivo.', 'Seconda inversa con unità e condizioni di esistenza esplicite.', 'Entrambe le letture ricostruite prima del rapporto e letture Celsius distinte da kelvin.', 'Ordine dello scarto esplicito; differenza distinta da rapporto e da punto termometrico.', 'Inversa simbolica con controllo delle unità e della divisione lecita.', 'Sostituzione dei fattori nel modello completo prima di cancellare termini.', 'Entrambi gli ingressi modificati usati nel medesimo bilancio prima del rapporto.', 'Media delle uscite distinta dal modello agli ingressi medi e da un contatto fisico nuovo.', 'Bersaglio ricostruito prima dell’inversa; valore dell’ingresso distinto dal suo rapporto.', 'Taratura del display continuo separata dall’inversa fisica e dall’offset termometrico.', 'Guadagno e offset strumentali ricavati da due riferimenti prima di ricostruire la grandezza.', 'Vincolo sostituito prima di decidere unicità e rami ammessi; preparazioni distinte dal tempo interno del processo.']
EXPECTED_IDS={'AR-u5-temperature-after-heating-09', 'AR-u5-temperature-after-heating-05', 'AR-u5-temperature-after-heating-02', 'AR-u5-temperature-after-heating-11', 'AR-u5-temperature-after-heating-12', 'AR-u5-temperature-after-heating-01', 'AR-u5-temperature-after-heating-08', 'AR-u5-temperature-after-heating-16', 'AR-u5-temperature-after-heating-13', 'AR-u5-temperature-after-heating-14', 'AR-u5-temperature-after-heating-15', 'AR-u5-temperature-after-heating-06', 'AR-u5-temperature-after-heating-07', 'AR-u5-temperature-after-heating-10', 'AR-u5-temperature-after-heating-04', 'AR-u5-temperature-after-heating-03'}
REVIEWED_CANDIDATES={'AR-u5-temperature-after-heating-01': '221478c367fb89f60a7ef3ee6f13acee525bc46cbc9cd9ad5aa4b102ed4ea9e1', 'AR-u5-temperature-after-heating-02': '2b1b6d0551e51132054c00b6053f13de2c20b03a9ff224a94e01ce0f7fb7fedb', 'AR-u5-temperature-after-heating-03': '4c9ef65f828c2bc5a3b182557663d4a89cdf254fb02ea9619a701d9763ffe406', 'AR-u5-temperature-after-heating-04': '92fe161a02b3994a9b13b2eff2f1d6c918a402b4daa4ee46f5db8021ae20fdc9', 'AR-u5-temperature-after-heating-05': 'e20ba4ee897033ac24c6900396a42a1ef06b403576c1837972c68eee2578d55b', 'AR-u5-temperature-after-heating-06': '2294d46502cd979b5f84ce24df23a085ffb57d83b0514c051aa2c439c02469e2', 'AR-u5-temperature-after-heating-07': 'f507d344e888fb11d558ade71cc1e44a662abac87013fccc431ef7ae750ecb2e', 'AR-u5-temperature-after-heating-08': '09f50e90900380297ba0efda5ff11243285361f563e2a8a5a5bab9e8f4d4a605', 'AR-u5-temperature-after-heating-09': '418194a54329707939f172022f50f5ecc666c5d8da4a72d37865a259239fbd7f', 'AR-u5-temperature-after-heating-10': 'c327b90995169fce9a315f8cf7d392fb7c61139657a16f9bde8116c6379cfb03', 'AR-u5-temperature-after-heating-11': '276a9f2b53a0140778e274d938a87b5e027fb2742415a81ec4c82e5a7e3cb044', 'AR-u5-temperature-after-heating-12': 'ac72371bf93c765eaf2e35972ba48aa3bf4c163aed4cf633aa1e2a4ed5356d0f', 'AR-u5-temperature-after-heating-13': '41524ed09bc9eb2582ad947fe096e8b267eea26231268a7b0b137c1dc4525a4e', 'AR-u5-temperature-after-heating-14': '08b1204415146a7d3977ba79eea4b6542e496d7f975af54818c75ec45b57c4af', 'AR-u5-temperature-after-heating-15': 'b9867b43d9136827f88092875133f2bd83bdba4fb29a673a1f3a4f616c7ef1af', 'AR-u5-temperature-after-heating-16': '397b2817d3e2c1ee3989413d1c313d9ce8c8793d6e59c93762ad28d433635f62'}
REQUIRED_RECTS={(140, 1015, 200, 40), (140, 505, 200, 45), (140, 600, 200, 45), (340, 600, 100, 45), (340, 505, 50, 45), (140, 1095, 320, 40), (140, 1175, 260, 40)}
GEOMETRY_REVIEW='Schema iniziale senza scala energetica. Nel secondo pannello i segmenti grigi di 200 unità intrinseche rappresentano la lettura iniziale 20; i segmenti colorati di 50 e 100 rappresentano aumenti di 5 e 10 K. I totali di 250 e 300 danno letture 25 e 30, rapporto 6/5. Nel terzo, lunghezze 200, 320 e 260 rappresentano 25, 40 e 32,5 °C dalla stessa origine. Coordinate intrinseche SVG, senza pretesa di pixel CSS. XML e immagine completa finali letti, con gli zeri fuori dalle aste.'

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
    # Mixed-dimensional distractors and a verbal distractor in task16 are intentional.
    # This helper only identifies numeric literals; all prose is reviewed manually and frozen.
    for suffix in (" J/K"," J/g"," °C"," K"," W"," g"," J"," s",""):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def heated_reading(power,duration):
    power,duration=map(Fraction,(power,duration))
    if min(power,duration)<=0:raise ValueError("Positive net power and duration required")
    heat=(SI.Quantity(power,"watt")*SI.Quantity(duration,"second")).to("joule")
    rise=(heat/SI.Quantity(10,"joule/kelvin")).to("kelvin")
    return Fraction(20)+Fraction(rise.magnitude)

def power_from_reading(reading,duration):
    reading,duration=map(Fraction,(reading,duration))
    if reading<=20 or duration<=0:raise ValueError("Positive rise and duration required")
    return 10*(reading-20)/duration

def duration_from_reading(reading,power):
    reading,power=map(Fraction,(reading,power))
    if reading<=20 or power<=0:raise ValueError("Positive rise and power required")
    return 10*(reading-20)/power

def heated_scaled(power,duration,a,b):
    power,duration,a,b=map(Fraction,(power,duration,a,b))
    if min(a,b)<=0:raise ValueError("Positive preparation factors required")
    return heated_reading(a*power,b*duration)/heated_reading(power,duration)

def constrained_duration(reading,alpha):
    reading,alpha=map(Fraction,(reading,alpha))
    if reading<=20 or alpha<=0:raise ValueError("Positive rise and cross-preparation coefficient required")
    return sp.sqrt(sp.Rational(10*(reading-20)/alpha))

@lru_cache(maxsize=1)
def oracle():
    p,t,c,r,delta,a,b=sp.symbols("p t c r delta a b",positive=True)
    first_law=sp.Eq(c*delta,p*t)
    assert sp.solve(first_law,delta)==[p*t/c]
    assert sp.solve(first_law,p)==[c*delta/t]
    assert sp.solve(first_law,t)==[c*delta/p]
    assert sp.expand((sp.Rational(5863,20)+p*t/10)-(sp.Rational(5863,20)))==p*t/10
    first=sp.Rational(heated_reading(5,10));second=sp.Rational(heated_reading(10,20))
    fit=calibrate(first,second,75,120,51,81,61,"dimensionless")
    assert fit==(3,1,40,30)
    assert heated_reading(Fraction(15,2),15)==sp.Rational(125,4)
    assert constrained_duration(25,Fraction(1,2))==10
    return [first,"°C","ΔT = P t / C; θ_f = 20 + ΔT/(1 K)","Da 25 a 30 °C",
      power_from_reading(first,10),duration_from_reading(first,5),sp.Rational(heated_reading(5,20))/first,50-first,
      "P = C ΔT / t","(20 + κ₁ κ₂ d) / (20 + d)",second/first,(first+second)/2,
      duration_from_reading(sp.Rational(8,5)*first,10)/10,power_from_reading(fit[2],20),power_from_reading(fit[3],10),constrained_duration(25,Fraction(1,2))]

REQUIRED_ZERO_LABELS={(116, 1260), (116, 710)}

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not REQUIRED_RECTS<=rects:raise ValueError("Independent physical scale or conserved energy geometry changed")
    zeros={(Fraction(e.get("x")),Fraction(e.get("y"))) for e in root.iter() if e.tag.endswith("text") and e.text=="0"}
    if zeros!=REQUIRED_ZERO_LABELS:raise ValueError("Reviewed zero labels no longer separated from axes")
    text=" ".join(e.text or "" for e in root.iter())
    if "px/" in text or " px " in text:raise ValueError("Intrinsic SVG coordinates presented as visible physical units")
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
            if value!=wanted:errors.append("Independent thermodynamic conceptual key mismatch")
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_cycle_first_law_reversible_entropy_ratio_mean_power_inverse_and_calibration",
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u5-calorimetry-169-172-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U5-03","U2-01")
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
