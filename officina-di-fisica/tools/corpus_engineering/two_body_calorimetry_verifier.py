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

FAMILY='two-body-calorimetry'
BATCH='two-body-calorimetry-170'
ASSET_NAME='two-body-calorimetry-progressive.svg'
REVIEWED_PACKAGE_SHA256='fad1d36128732ecf1188f24b8125b5281a4e360fa136d5e02d7c5da4a910edf4'
REVIEWED_BINDINGS_SHA256='068959c16c2df090f6be1b0d8e757001365191026f1e046cc86f54abb29bffe2'
SOURCE_REFERENCE='Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.'
FALSE_PROOF='Capacità termiche uguali implicano uguali energie interne assolute a qualunque temperatura.'
SVG_MUTATION=(b'width="360"', b'width="350"')
EXPECTED_MAPPING={1: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 2: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 3: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 4: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 5: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 6: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 7: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 8: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 9: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 10: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 11: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 12: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 13: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 14: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 15: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 16: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06'])}
NUMERIC_UNITS={1: '°C', 5: 'J/K', 6: 'J/K', 12: '°C', 14: 'J/K'}
OPTION_SUFFIX={7: '', 8: ' K', 11: '', 13: '', 15: ' J/K'}
UNITS={1: 'kelvin', 2: 'kelvin', 3: 'joule/kelvin', 4: 'kelvin', 5: 'joule/kelvin', 6: 'joule/kelvin', 7: 'dimensionless', 8: 'kelvin', 9: 'joule/kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'kelvin', 13: 'dimensionless', 14: 'joule/kelvin', 15: 'joule/kelvin', 16: 'joule/kelvin'}
MANUAL=['C₁(80−θ)=C₂(θ−20). Con capacità uguali θ=50 °C; 30 J passano dal caldo al freddo e la somma dei calori è zero.', 'La lettura è in °C; capacità in J/K e calore in J sono grandezze distinte.', 'Per la stessa sostanza nelle stesse condizioni C=mc; con massa 2m e c invariata si ha C_B=2C_A.', 'C₁=3 e C₂=1 J/K danno θ=(240+20)/4=65 °C, contro 50 iniziali.', 'C₁=C₂(θ−20)/(80−θ)=1·30/30=1 J/K, con finale strettamente interna.', 'C₂=C₁(80−θ)/(θ−20)=1·30/30=1 J/K.', 'B ha θ=(80+3·20)/4=35 °C; rapporto delle letture 35/50=7/10.', 'Proposta 100 °C meno 50 °C corretti dà +50 K, e supera il massimo iniziale 80 °C.', 'L’inversa C₁=C₂(θ−20)/(80−θ) conserva J/K perché il rapporto riguarda due intervalli termici positivi.', 'Con N=80C₁+20C₂ e D=C₁+C₂, il rapporto fra le medie complete è N_BD/(D_BN); scala comune delle capacità lascia invariata la finale.', 'B: θ=(160+60)/5=44 °C; 44/50=22/25.', 'Media=(50+44)/2=47 °C. Le capacità medie 3/2 e 2 J/K darebbero 320/7 °C.', 'B deve arrivare a 44 °C; C₂,B=2(80−44)/(44−20)=3 J/K e il rapporto con 1 J/K è 3.', 'q=150/50=3; S=132 dà θ=44. Con C₂=3 J/K, C₁=3·24/36=2 J/K.', 'q=(101−89)/(50−44)=2, b=1. S=131 dà θ=65 e C₁=1·45/15=3 J/K.', 'C₁=C₂=C>0 lascia θ=(80+20)/2=50 °C per ogni C: infinite coppie. La finale non determina l’energia scambiata senza scala di capacità.']
DISTRACTORS=['100 somma le letture, 30 è il salto; 20 o 80 richiederebbero una capacità nulla nel modello positivo.', 'J/K indica capacità, J energia, W potenza e kg massa; °C è l’unità della lettura.', 'C=mc raddoppia con la massa, mentre c resta uguale. Metà, quadrupla o indipendenza dalla massa contraddicono la legge.', '150 supera 80; 35 scambia i ruoli, 50 ignora la nuova C₁ e 75 dà 15 J ceduti contro 55 J richiesti.', '2 J/K darebbe 60 J ceduti contro 30 ricevuti; 30 J è energia e la capacità negativa è esclusa.', '2 J/K freddi richiederebbero 60 J contro 30 disponibili; 50 copia il termometro e −1 confonde verso del calore e capacità.', '10/7 è il reciproco; 3 e 1/3 seguono solo C₂; 1 ignora la modifica della media pesata.', '−50 inverte l’ordine, 100 copia la proposta, zero la accetta e 2 è un rapporto invece dello scarto.', 'Il reciproco scambia gli intervalli; le somme non sono salti. Dividere per C₂ perde J/K e sommare θ a C₂ non è un bilancio.', 'N_B/N omette la capacità totale, D_B/D il numeratore pesato. Prodotto o quoziente dei fattori non danno la media generale.', '25/22 è il reciproco; 2/3 e 3/2 seguono le sole capacità B; 44 copia la finale senza dividerla per 50.', '94 è la somma, 320/7 usa capacità medie e 6 la differenza. La media delle finali non è una nuova miscela.', '1/3 è il reciproco; 22/25 copia la lettura, 2 segue C₁ e 44 è una temperatura, non un rapporto fra capacità.', '3 J/K copia C₂; 132 grezzo violerebbe il dominio 20..80 e 1/2 J/K non ricostruisce 44 °C.', '91/29 J/K omette l’offset e usa 65,5 °C; 1 o 2 J/K danno 50 o 60 °C e S=101 o 121; 65 copia la lettura.', 'Una coppia richiede un’ulteriore scala energetica; due non deriva da una quadratica; ogni C positivo fornisce una coppia, non solo 1 e 1.']
ASSUMPTIONS=['Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.', 'Due corpi isolati con capacità complessive positive costanti, iniziali 80 e 20 °C; recipiente, lavoro e fasi trascurati. Finale interna a 20..80 °C. Rapporti e display sulle letture numeriche Celsius dichiarate. Caso 03 separato: medesima sostanza, condizioni e c costante, con masse m e 2m.']
PEDAGOGY=['Ricostruzione del bilancio prima della sostituzione, con risultato e unità della grandezza richiesta.', 'Dimensione della grandezza distinta dalle altre quantità del problema e dalla scala dell’unità.', 'Caso speciale o legge motivati con le ipotesi pertinenti, senza usare la chiave come prova.', 'Confronto controllato con distinzione fra ingresso modificato e risposta complessiva.', 'Inversa svolta dal bilancio e verificata nel dominio positivo.', 'Seconda inversa con unità e condizioni di esistenza esplicite.', 'Entrambe le letture ricostruite prima del rapporto e letture Celsius distinte da kelvin.', 'Ordine dello scarto esplicito; differenza distinta da rapporto e da punto termometrico.', 'Inversa simbolica con controllo delle unità e della divisione lecita.', 'Sostituzione dei fattori nel modello completo prima di cancellare termini.', 'Entrambi gli ingressi modificati usati nel medesimo bilancio prima del rapporto.', 'Media delle uscite distinta dal modello agli ingressi medi e da un contatto fisico nuovo.', 'Bersaglio ricostruito prima dell’inversa; valore dell’ingresso distinto dal suo rapporto.', 'Taratura del display continuo separata dall’inversa fisica e dall’offset termometrico.', 'Guadagno e offset strumentali ricavati da due riferimenti prima di ricostruire la grandezza.', 'Vincolo sostituito prima di decidere unicità e rami ammessi; preparazioni distinte dal tempo interno del processo.']
EXPECTED_IDS={'AR-u5-two-body-calorimetry-10', 'AR-u5-two-body-calorimetry-11', 'AR-u5-two-body-calorimetry-12', 'AR-u5-two-body-calorimetry-05', 'AR-u5-two-body-calorimetry-03', 'AR-u5-two-body-calorimetry-07', 'AR-u5-two-body-calorimetry-01', 'AR-u5-two-body-calorimetry-08', 'AR-u5-two-body-calorimetry-14', 'AR-u5-two-body-calorimetry-15', 'AR-u5-two-body-calorimetry-16', 'AR-u5-two-body-calorimetry-04', 'AR-u5-two-body-calorimetry-02', 'AR-u5-two-body-calorimetry-13', 'AR-u5-two-body-calorimetry-06', 'AR-u5-two-body-calorimetry-09'}
REVIEWED_CANDIDATES={'AR-u5-two-body-calorimetry-01': '08b6fa4c5e7bc89e66e9cfd4e499ced585e4f42651cd59b7e0ded292ac1e2c07', 'AR-u5-two-body-calorimetry-02': '311f976d4066043c9220252a056dba8d5d8c3594dc403a53a42ff9b7b145142c', 'AR-u5-two-body-calorimetry-03': '6b0ec8f006c50b8e599261462dcb3730e451397035faca2c6d7d5d64641bf960', 'AR-u5-two-body-calorimetry-04': '59c5f75b3739db414c78c3920cfe02c3f6a8f8dc8c82f2ddcaea63e299764ea4', 'AR-u5-two-body-calorimetry-05': 'd081d36ee39ae79aac0380c4a014cc18e587442810ad6047323ddf7379c6b7c9', 'AR-u5-two-body-calorimetry-06': '30be66c5c98694dd22518be3bb954d10e25e97e6bd69b59ff7406d9927206f19', 'AR-u5-two-body-calorimetry-07': '395ed29b012d319a702dcb80cf7b12de95c02607b75d8af79964ad28ebd21968', 'AR-u5-two-body-calorimetry-08': 'cda525c42c4d262cf13c73c09d20ebe5d812c79dcf79e372c7973ee6464f6ec9', 'AR-u5-two-body-calorimetry-09': '30b2a0caa1d9744a510e5a54cf50e4402705e15fa68fa145d8cccec27f6a7dc7', 'AR-u5-two-body-calorimetry-10': 'e1e0117a2a729045dbb797564f98261d6c2e7d934ad8fd2d750d0db4faab4a48', 'AR-u5-two-body-calorimetry-11': '0f87394fca7fd10bb8962acfc36cfad6487dea9626739ce3849b700e91ea814c', 'AR-u5-two-body-calorimetry-12': '1fd0585d53b4a6f4b8d657b8c070c97f25e32178ee2659e080b6761a8527f00f', 'AR-u5-two-body-calorimetry-13': '471bda3c01818405af5139dc4a51e2d93e91bae0b17ea385f82a7a3fb8d7bab1', 'AR-u5-two-body-calorimetry-14': '016255be3f8b5d12eb8531f8e735785151ffa352bf74c9db7c11f59b107716ca', 'AR-u5-two-body-calorimetry-15': 'd930932bf85bf97437722971052120b6e06c51b25914b1ac4c64c5eccbe78509', 'AR-u5-two-body-calorimetry-16': 'e16c095739b52ef2938118744bf2a680995463840e5ef2acdcffa18fb2d26993'}
REQUIRED_RECTS={(140, 1015, 300, 40), (140, 1095, 264, 40), (100, 560, 360, 45), (100, 655, 360, 45), (140, 1175, 282, 40)}
GEOMETRY_REVIEW='Primo pannello schematico: freccia di 30 J dal caldo al freddo e salti −30 e +30 K. Nel secondo, barre dalla medesima origine x100 e lunghezze 360 rappresentano 72 J ceduti e ricevuti, con capacità 2 e 3 J/K e salti 36 e 24 K. Nel terzo, origine x140 e lunghezze 300, 264 e 282 rappresentano 50, 44 e 47 °C. Coordinate intrinseche, non temperature assolute né pixel CSS. XML e rendering completo finali controllati, con origine zero esterna all’asta.'

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

def equilibrium(hot_capacity,cold_capacity):
    hot_capacity,cold_capacity=map(Fraction,(hot_capacity,cold_capacity))
    if min(hot_capacity,cold_capacity)<=0:raise ValueError("Positive total heat capacities required")
    # Celsius points are affine; weighted sum with normalized weights is valid.
    value=(80*hot_capacity+20*cold_capacity)/(hot_capacity+cold_capacity)
    assert 20<value<80
    heat_hot=(SI.Quantity(hot_capacity,"joule/kelvin")*SI.Quantity(80-value,"kelvin")).to("joule")
    heat_cold=(SI.Quantity(cold_capacity,"joule/kelvin")*SI.Quantity(value-20,"kelvin")).to("joule")
    assert heat_hot==heat_cold
    return value

def hot_from_reading(reading,cold_capacity):
    reading,cold_capacity=map(Fraction,(reading,cold_capacity))
    if not 20<reading<80 or cold_capacity<=0:raise ValueError("Interior equilibrium and positive known capacity required")
    return cold_capacity*(reading-20)/(80-reading)

def cold_from_reading(reading,hot_capacity):
    reading,hot_capacity=map(Fraction,(reading,hot_capacity))
    if not 20<reading<80 or hot_capacity<=0:raise ValueError("Interior equilibrium and positive known capacity required")
    return hot_capacity*(80-reading)/(reading-20)

def equilibrium_scaled(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if min(a,b)<=0:raise ValueError("Positive preparation factors required")
    return equilibrium(a*hot,b*cold)/equilibrium(hot,cold)

def equal_capacity_reading(capacity):
    capacity=Fraction(capacity)
    if capacity<=0:raise ValueError("Positive equal capacities required")
    return equilibrium(capacity,capacity)

@lru_cache(maxsize=1)
def oracle():
    ch,cc,x=sp.symbols("ch cc x",positive=True)
    law=sp.Eq(ch*(80-x),cc*(x-20))
    solved=sp.solve(law,x)[0]
    assert sp.simplify(solved-(80*ch+20*cc)/(ch+cc))==0
    assert sp.simplify(sp.solve(law,ch)[0]-cc*(x-20)/(80-x))==0
    assert sp.simplify(solved.subs({ch:2*ch,cc:2*cc},simultaneous=True)-solved)==0
    first=sp.Rational(equilibrium(1,1));second=sp.Rational(equilibrium(2,3))
    fit=calibrate(first,second,150,132,101,89,131,"dimensionless")
    assert fit==(3,1,44,65)
    assert equilibrium(Fraction(3,2),2)==sp.Rational(320,7)
    return [first,"°C","La seconda è il doppio della prima","Da 50 a 65 °C",
      hot_from_reading(50,1),cold_from_reading(50,1),sp.Rational(equilibrium(1,3))/first,100-first,
      "C₁ = C₂ (θ_f − 20) / (80 − θ_f)","N_B D / (D_B N)",second/first,(first+second)/2,
      cold_from_reading(sp.Rational(22,25)*first,2),hot_from_reading(fit[2],3),hot_from_reading(fit[3],1),"Infinite coppie"]

REQUIRED_ZERO_LABELS={(116, 1270), (96, 750)}

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
