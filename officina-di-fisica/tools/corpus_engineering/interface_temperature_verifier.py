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
CANDIDATE_REF='9df91921f903cdd4f9d313944277a6f75ca0133a'
PRIMARY_SHA256='c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c'
FAMILY='interface-temperature'
BATCH='interface-temperature-181'
ASSET_NAME='interface-temperature-progressive.svg'
REVIEWED_PACKAGE_SHA256='1433714eb3056141af0ef442aad02815b65f6cbbf918dd7fa5b17cbf4726fa73'
REVIEWED_BINDINGS_SHA256='14c82204e2c217f31c05c60fb3c6e6910d762239f09b901d2e7b398ca61e9631'
SOURCE_REFERENCE='Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.'
FALSE_PROOF='Resistenze entrambe raddoppiate raddoppiano la lettura Celsius di contatto perché raddoppia la caduta fredda.'
SVG_MUTATION=(b'width="250"', b'width="260"')
EXPECTED_MAPPING={1: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 2: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 3: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 4: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 5: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 6: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 7: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 8: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 9: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 10: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 11: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 12: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 13: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 14: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 15: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 16: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06'])}
NUMERIC_UNITS={1: '°C', 5: 'K/W', 6: 'K/W', 14: 'K/W'}
OPTION_SUFFIX={7: '', 8: ' K', 11: '', 12: ' °C', 13: '', 15: ' K/W'}
UNITS={1: 'kelvin', 2: 'kelvin', 3: 'kelvin', 4: 'kelvin', 5: 'kelvin/watt', 6: 'kelvin/watt', 7: 'dimensionless', 8: 'kelvin', 9: 'kelvin/watt', 10: 'dimensionless', 11: 'dimensionless', 12: 'kelvin', 13: 'dimensionless', 14: 'kelvin/watt', 15: 'kelvin/watt', 16: 'dimensionless'}
MANUAL=['P=100/(1+1)=50 W; Θ=P R_c=50 K e T_i=50 °C, ossia 323, 15 K.', 'Si richiede un punto Celsius, unità °C. Differenze in K hanno lo stesso incremento numerico, non lo stesso zero.', 'Θ=P R_c e P=ΔT/(R_h+R_c), quindi Θ=ΔT R_c/(R_h+R_c), strettamente tra 0 e 100 K.', 'B ha totale 4 K/W, P=25 W; con R_c=1 la caduta fredda è25 K e T_i25 °C.', 'A Θ=50 K e R_c=1 danno P=50 W; residuo caldo 50 K implica R_h=1 K/W.', 'Dal tratto caldo: P=(100−50)/1=50 W. R_c=50/50=1 K/W.', 'B con R_c=3 e R_h=1 ha P=25 W, lettura 75 °C; rapporto Celsius 75/50=3/2, non rapporto 348, 15/323, 15.', '100−50=+50 K di scarto tra punti Celsius; il rapporto 2 non è una differenza.', 'Θ(R_h+R_c)=ΔT R_c; R_h=R_c(ΔT−Θ)/Θ, positivo solo per 0<Θ<ΔT.', 'Rapporto θ_B/θ_A=b(R_h+R_c)/(a R_h+b R_c); fattori comuni si cancellano lasciando 1.', 'B con R_h=2, R_c=3 ha P=20 W e Θ=60 K, lettura 60 °C; rapporto 60/50=6/5.', 'Media(50+60)/2=55 °C. Alle resistenze medie 3/2 e 2 si trova 400/7 °C, diverso.', 'Target 60 °C; R_h B2 sostiene 40 K, P=20 W; R_c B60/20=3 K/W e rapporto 3.', 'q=150/50=3 sulla lettura numerica Celsius; S180→60 °C, P=60/3=20 W; R_h B40/20=2 K/W.', 'q=(121−101)/(60−50)=2, b=1; S51→25 °C; P=25 W, residuo caldo 75 K e R_h=3 K/W.', 'R_h=R_c=r>0 dà Θ=100 r/(2 r)=50 K per ogni r. Esempi r1 e 2 danno P=50 e 25 W, stessa lettura: infinite coppie positive.']
DISTRACTORS=['100 o 0 coincidono con un estremo e annullano una caduta positiva; 323, 15 è numero kelvin del medesimo punto.', 'K/W resistenza, W/K conduttanza, W potenza, J energia non sono punti termometrici.', 'R_h al numeratore è caduta calda; rapporto inverso supera salto; ΔT/R è watt e prodotto resistenze altera dimensione.', '75 copia caduta calda; 100 e 150 non stanno fra le facce; 50 ignora cambio.', '2 attribuisce tutto salto al tratto caldo; zero rende interfaccia uguale al caldo.', 'Sottrarre Celsius da resistenza è eterogeneo; resistenza negativa è fuori dominio passivo.', '3 segue solo R_c senza P; 2/3 è reciproco; 1/2 inverte verso; 1 ignora ripartizione.', '−50 inverte ordine; 100 copia proposta; zero accetta; 2 è rapporto puro.', 'Reciproco scambia ripartizione; R_cΔT/Θ è totale, non R_h; dividere per R_c dà potenza; più è bilancio errato.', 'Reciproco scambia prove; prodotto e somma non danno 1 per fattore comune arbitrario; quoziente solo non pesa resistenze.', '3/2 è R_c B/R_h B, non rapporto delle letture; 5/6 inverte; 2 e 1 non ricostruiscono ripartizione.', '400/7 usa ingressi medi; 110 non dimezza; 5 dimezza differenza; 50 ignora B. Media punti non è miscela fisica.', '3/2 è rapporto fra resistenze B e non rispetto ad A; 1/3 inverte; 2 segue R_h; 6/5 copia bersaglio lettura.', '180 come Celsius supera faccia calda e forza resistenza negativa; serve prima decodifica del display.', '149/51 ignora b e predice S52; 1 torna ad A; 2 dà 100/3 °C; 25 copia lettura come resistenza.', 'r1 e r50 sono esempi, non unicità; zero annulla denominatore e viola dominio. P non è noto e la scala non è identificata.']
ASSUMPTIONS=['Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.', 'Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.']
PEDAGOGY=['Legge motivata dalle ipotesi prima del risultato, con unità conservate.', 'Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.', 'Legge o meccanismo fisico ricostruiti separatamente dalla chiave.', 'Confronto controllato fra prove mantenendo fissi i parametri dichiarati.', 'Inversa derivata prima della sostituzione, con dominio strettamente positivo.', 'Seconda inversa e verifica dimensionale del residuo o del denominatore.', 'Le due prove ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto mantenuto e distinto da un rapporto.', 'Inversa simbolica con geometria e divisioni lecite.', 'Scalature sostituite nel modello completo, senza cancellare pesi diversi.', 'Entrambi gli ingressi variati inclusi nel medesimo bilancio.', 'Media delle uscite distinta dalla risposta agli ingressi medi.', 'Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.', 'Display continuo tarato prima di invertire la relazione fisica.', 'Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.', 'Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.']
EXPECTED_IDS={'AR-u5-interface-temperature-13', 'AR-u5-interface-temperature-04', 'AR-u5-interface-temperature-08', 'AR-u5-interface-temperature-01', 'AR-u5-interface-temperature-16', 'AR-u5-interface-temperature-11', 'AR-u5-interface-temperature-14', 'AR-u5-interface-temperature-15', 'AR-u5-interface-temperature-12', 'AR-u5-interface-temperature-02', 'AR-u5-interface-temperature-06', 'AR-u5-interface-temperature-10', 'AR-u5-interface-temperature-09', 'AR-u5-interface-temperature-03', 'AR-u5-interface-temperature-07', 'AR-u5-interface-temperature-05'}
REVIEWED_CANDIDATES={'AR-u5-interface-temperature-01': 'c6f76548fe2406998213b0889fad4db5a3dc6114294cd6f480e4c94d9796c21a', 'AR-u5-interface-temperature-02': 'c638865d857dc4f10bc807b5a65c0f9afb8c449464813189756aa52eb53d6c51', 'AR-u5-interface-temperature-03': 'dde48274b27bbbb4511238c648080ee07aacb40560bb0f3d8b7ebf269d92048d', 'AR-u5-interface-temperature-04': 'a041144253ba6758dceceaa17c3e041b3a52131eb9e18cf45359ec7cc38cd7d7', 'AR-u5-interface-temperature-05': 'bf706e79b97b8ffa2bc241104cb376212d906e1c942981742364e7381b7b3fab', 'AR-u5-interface-temperature-06': 'ac5edc1c38788e03d0c23e2d0fd28a6bc7d3c6393838235659aa48fe8dbc6e45', 'AR-u5-interface-temperature-07': '3778ac9bc15333b6e416a7d288877df3b96aa3e4e17b1aeddbecade571b5d8e0', 'AR-u5-interface-temperature-08': 'c15da13cfb690e79f70236cbe1193e74571d39349584336e487bf43f82ff1111', 'AR-u5-interface-temperature-09': '91f271d676c55135030e016531699738e6bfe088362d73f3eda32f942d2762d6', 'AR-u5-interface-temperature-10': 'e7b00c62db9dc26cee9209e8cd8d1140f832ed35f7f12113ac768b2b99d14d8d', 'AR-u5-interface-temperature-11': '17e3ac1e15d8f333089b3241ba874bca93b52b1fc63d360798f4c86e7ca02f25', 'AR-u5-interface-temperature-12': '8d118324b54c78ff36e5389dd25592d1068d3b268a956c29315783b1bcbcb1df', 'AR-u5-interface-temperature-13': '0f5f1e11cc55aac718223ae6bcb8f64e112277b4eabb2f80c928790ee1246c1f', 'AR-u5-interface-temperature-14': 'bff7373cdb98f6ec8248b9ab0a40e801ed7aaccc488a080ba089aa7788598703', 'AR-u5-interface-temperature-15': '21a4d0f897682474368c6a60cb94be045b48a159201e3a47d1b5389559c084a1', 'AR-u5-interface-temperature-16': '5e2ec5c06b0f379d9e924ff7df4ebc8f6037feae2ccd4db4c50f32968ee0ee28'}
REQUIRED_RECTS={(130, 1070, 300, 34), (130, 994, 250, 34), (130, 1146, 275, 34)}
REQUIRED_PATHS={'M100 575L300 675L500 775'}
GEOMETRY_REVIEW='Rete superiore schematica, contatto senza resistenza aggiuntiva. Profilo sull’ascissa resistenza cumulativa, non spessore: punti(0, 100 °C), (1 K/W, 50 °C), (2 K/W, 0 °C), segmenti da x100, 300, 500 e y575, 675, 775. Scale indipendenti 200 unità/(K/W) e 2 unità/grado. Barre Celsius 50/60/55 lunghe 250/300/275 da medesimo zero convenzionale 0 °C, non assoluto. XML completo e rendering asset-only letti.'

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
    for suffix in (' W/(m²·K)',' W/(m·K)',' m²',' K/W',' W/K',' W',' K',' m',' °C',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def reading(hot,cold):
    hot,cold=map(Fraction,(hot,cold))
    if min(hot,cold)<=0:raise ValueError('Positive passive resistances required')
    p=SI.Quantity(100,'kelvin')/(SI.Quantity(hot,'kelvin/watt')+SI.Quantity(cold,'kelvin/watt'))
    delta=(p*SI.Quantity(cold,'kelvin/watt')).to('kelvin')
    return Fraction(delta.magnitude)
def inverse_hot(theta,cold):
    theta,cold=map(Fraction,(theta,cold))
    if not 0<theta<100 or cold<=0:raise ValueError('Strictly internal temperature reading and positive known resistance required')
    return cold*(100-theta)/theta
def inverse_cold(theta,hot):
    theta,hot=map(Fraction,(theta,hot))
    if not 0<theta<100 or hot<=0:raise ValueError('Strictly internal temperature reading and positive known resistance required')
    return hot*theta/(100-theta)
def scaled(hot,cold,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive resistance preparation factors required')
    return reading(a*hot,b*cold)/reading(hot,cold)
def common_resistance_reading(resistance):
    resistance=Fraction(resistance)
    if resistance<=0:raise ValueError('Positive common resistance required')
    return reading(resistance,resistance)
@lru_cache(maxsize=1)
def oracle():
    p,h,c,d,theta=sp.symbols('p h c delta theta',positive=True)
    power=sp.solve(sp.Eq(d,p*(h+c)),p)[0]
    assert sp.simplify(power*c-d*c/(h+c))==0
    law=sp.Eq(theta,d*c/(h+c))
    assert sp.simplify(sp.solve(law,h)[0]-c*(d-theta)/theta)==0
    assert sp.simplify(sp.solve(law,c)[0]-h*theta/(d-theta))==0
    first=sp.Rational(reading(1,1));second=sp.Rational(reading(2,3))
    fit=calibrate(first,second,150,180,101,121,51,'dimensionless')
    assert fit==(3,1,60,25)
    assert reading(Fraction(3,2),2)==Fraction(400,7)
    assert common_resistance_reading(1)==common_resistance_reading(2)==50
    return [first,'°C','Θ = ΔT R_c / (R_h + R_c)','Da 50 a 25 °C',inverse_hot(first,1),inverse_cold(first,1),scaled(1,1,1,3),100-first,'R_h = R_c (ΔT − Θ) / Θ','κ₂ (R_h + R_c) / (κ₁ R_h + κ₂ R_c)',second/first,(first+second)/2,inverse_cold(sp.Rational(6,5)*first,2),inverse_hot(fit[2],3),inverse_hot(fit[3],1),'Infinite: ogni R_h=R_c>0']

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
