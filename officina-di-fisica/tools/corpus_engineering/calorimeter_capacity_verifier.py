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

FAMILY='calorimeter-capacity'
BATCH='calorimeter-capacity-171'
ASSET_NAME='calorimeter-capacity-progressive.svg'
REVIEWED_PACKAGE_SHA256='41f823ed4f83d7c64f059d73059eb62c2034aa8c15520c08faecb155123cad06'
REVIEWED_BINDINGS_SHA256='3a714cec89e58696328657db04d05e9b76764713d98447b494f8c2a7aadd79fc'
SOURCE_REFERENCE='Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.'
FALSE_PROOF='Raddoppiare entrambe le masse lascia sempre invariata la finale anche quando la capacità del recipiente resta fissa.'
SVG_MUTATION=(b'width="400"', b'width="380"')
EXPECTED_MAPPING={1: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 2: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 3: ('C3-L01', []), 4: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 5: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 6: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 7: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 8: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 9: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 10: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 11: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 12: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 13: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 14: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 15: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06']), 16: ('C3-L03', ['C3-L01', 'C3-L03', 'C3-L06'])}
NUMERIC_UNITS={1: '°C', 5: 'g', 6: 'g', 14: 'g'}
OPTION_SUFFIX={7: '', 8: ' K', 11: '', 12: ' °C', 13: '', 15: ' g', 16: ' g'}
UNITS={1: 'kelvin', 2: 'kelvin', 3: 'kelvin', 4: 'kelvin', 5: 'gram', 6: 'gram', 7: 'dimensionless', 8: 'kelvin', 9: 'gram', 10: 'dimensionless', 11: 'dimensionless', 12: 'kelvin', 13: 'dimensionless', 14: 'gram', 15: 'gram', 16: 'gram'}
MANUAL=['C_r/c=2 g è la massa equivalente. Con m_h=m_c=2 g: θ=[160+20·4]/6=40 °C. Il caldo cede 80 J, freddo e recipiente 40 J ciascuno.', 'Il termometro dà °C; J/K e J/(g·K) misurano rispettivamente capacità totale e calore specifico.', 'Principio zero: T_B=T_A e T_C=T_A implicano T_B=T_C. Non ne seguono uguale energia interna, massa o capacità. Il termometro è stabile e non perturbante.', 'Con m_h=4 g e m_c=2 g, caldo e lato freddo hanno entrambi 4 J/K: finale 50 °C, contro 40 in A.', 'm_h=(m_c+2 g)(θ−20)/(80−θ)=4·20/40=2 g.', 'm_c=m_h(80−θ)/(θ−20)−2 g=2·40/20−2=2 g. L’inversa deve restituire massa strettamente positiva.', 'B con m_h=2 e m_c=4 g dà θ=(160+120)/8=35 °C; 35/40=7/8.', 'Proposta meno corretta: 80−40=+40 K; alla proposta il caldo non cederebbe energia, pur dovendo scaldare gli altri due contributi.', 'Raccolgo c e uso m₀=C_r/c: m_h=(m_c+m₀)(θ−20)/(80−θ). Le due masse equivalenti hanno entrambe unità g.', 'La lettura è N/D e quella nuova N_B/D_B, con m₀ fisso: rapporto N_BD/(D_BN). Un fattore comune sulle sole porzioni non si cancella in generale.', 'B con 4 g e 4 g dà θ=(320+120)/10=44 °C; 44/40=11/10.', 'Media=(40+44)/2=42 °C. Le masse medie 3 g e 3 g darebbero (240+100)/8=85/2 °C.', 'B deve arrivare a 44 °C. La massa fredda vale 4·36/24−2=4 g; rapporto con 2 g iniziali uguale a 2.', 'q=120/40=3; S=132 dà θ=44. Con m_c=4 g, m_h=6·24/36=4 g.', 'q=(89−81)/(44−40)=2, b=1; S=101 dà θ=50 e m_h=(2+2)·30/30=4 g.', 'Con m_h=m_c=m, θ=(100m+40)/(2m+2). Imporre 40 dà m=2 g, unica positiva. Controprove finali: m=1 g dà 35 °C e m=4 g dà 44 °C.']
DISTRACTORS=['50 trascura il recipiente; 20 o 80 perdono un contributo positivo; 60 richiederebbe 160 J freddi contro 40 J ceduti.', 'J/K è capacità, J/(g·K) calore specifico, g massa e J energia; °C misura la lettura.', 'Uguale temperatura non implica uguale energia interna, massa o calore specifico; il flusso netto obbligatorio contraddice l’equilibrio.', '80 raddoppia la lettura, 20 la dimezza, 40 ignora la nuova massa; 60 richiede un peso caldo maggiore. Il recipiente non raddoppia.', '1 g omette il recipiente; 4 g copia la massa equivalente fredda senza il rapporto degli intervalli; massa negativa esclusa.', '4 g include il recipiente nella sostanza; 6 g aggiunge m₀ anziché sottrarla e zero non riproduce 40 °C.', '8/7 è il reciproco; 2 e 1/2 seguono il solo freddo, mentre 1 ignora la maggiore capacità inizialmente fredda.', '−40 inverte l’ordine, 80 copia la proposta, zero la accetta; 2 è il rapporto, non la differenza.', 'Omettere m₀ elimina una capacità reale; il reciproco scambia salti e −m₀ attribuisce un contributo negativo al recipiente.', 'Prodotto o quoziente dei fattori ignorano il recipiente fisso; N_B/N omette D_B e D_B/D omette N_B.', '1 varrebbe se anche il recipiente raddoppiasse; 2 raddoppia la lettura, 10/11 è il reciproco e 44 copia θ_B.', '85/2 usa le masse medie, 84 è la somma, 4 la differenza e 50 trascura il recipiente. Non avviene un nuovo contatto fisico.', '1/2 inverte il rapporto; 11/10 segue le letture; 3 include il recipiente usando 6/2 e 4 non divide la massa B per A.', '6 g copia la massa equivalente fredda; 8/3 g omette il recipiente; 132 non è né temperatura né massa.', '244/59 g omette l’offset e usa 50,5 °C; 2 g omette il recipiente, 6 g non bilancia salti uguali e 50 copia θ.', 'La capacità fissa dà una sola massa di 2 g. 4 g producono 44 °C, 1 g produce 35 °C (fix distinto riletto) e −2 g viola il dominio.']
ASSUMPTIONS=['Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.', 'Sistema isolato, c=1 J/(g·K), masse positive, recipiente fisso C_r=2 J/K a 20 °C come il freddo, caldo a 80 °C; nessuna fase o lavoro. m₀=2 g è massa equivalente termica. L’inversa fredda deve restituire m_c>0 oltre alla finale interna. Caso 03: principio zero con termometro stabile e non perturbante, skill C3-L01.']
PEDAGOGY=['Ricostruzione del bilancio prima della sostituzione, con risultato e unità della grandezza richiesta.', 'Dimensione della grandezza distinta dalle altre quantità del problema e dalla scala dell’unità.', 'Caso speciale o legge motivati con le ipotesi pertinenti, senza usare la chiave come prova.', 'Confronto controllato con distinzione fra ingresso modificato e risposta complessiva.', 'Inversa svolta dal bilancio e verificata nel dominio positivo.', 'Seconda inversa con unità e condizioni di esistenza esplicite.', 'Entrambe le letture ricostruite prima del rapporto e letture Celsius distinte da kelvin.', 'Ordine dello scarto esplicito; differenza distinta da rapporto e da punto termometrico.', 'Inversa simbolica con controllo delle unità e della divisione lecita.', 'Sostituzione dei fattori nel modello completo prima di cancellare termini.', 'Entrambi gli ingressi modificati usati nel medesimo bilancio prima del rapporto.', 'Media delle uscite distinta dal modello agli ingressi medi e da un contatto fisico nuovo.', 'Bersaglio ricostruito prima dell’inversa; valore dell’ingresso distinto dal suo rapporto.', 'Taratura del display continuo separata dall’inversa fisica e dall’offset termometrico.', 'Guadagno e offset strumentali ricavati da due riferimenti prima di ricostruire la grandezza.', 'Vincolo sostituito prima di decidere unicità e rami ammessi; preparazioni distinte dal tempo interno del processo.']
EXPECTED_IDS={'AR-u5-calorimeter-capacity-02', 'AR-u5-calorimeter-capacity-08', 'AR-u5-calorimeter-capacity-13', 'AR-u5-calorimeter-capacity-03', 'AR-u5-calorimeter-capacity-10', 'AR-u5-calorimeter-capacity-01', 'AR-u5-calorimeter-capacity-06', 'AR-u5-calorimeter-capacity-12', 'AR-u5-calorimeter-capacity-05', 'AR-u5-calorimeter-capacity-14', 'AR-u5-calorimeter-capacity-11', 'AR-u5-calorimeter-capacity-15', 'AR-u5-calorimeter-capacity-04', 'AR-u5-calorimeter-capacity-16', 'AR-u5-calorimeter-capacity-07', 'AR-u5-calorimeter-capacity-09'}
REVIEWED_CANDIDATES={'AR-u5-calorimeter-capacity-01': '8e43f1bd6dfccef1d1160be2b7d50ff3811d715ec01367b9ceb00d27aeb12823', 'AR-u5-calorimeter-capacity-02': '3fb681d9b3f5e87eb352fc1aadd1b4529a7832f87f341a7cbdfcd86a50fd1d0b', 'AR-u5-calorimeter-capacity-03': '2aaba1485e162656e01a539877276cdb8d8561edf21446882e77e005db684955', 'AR-u5-calorimeter-capacity-04': '974ccca8225d570b50d35aecac9a14176f04faed01473a691671acdbbbdf9288', 'AR-u5-calorimeter-capacity-05': '84bd8019b5c103fef56444bcbde28c8579f6a8e425e05de54207e9ace6acb359', 'AR-u5-calorimeter-capacity-06': '1ec5389f103d96d22a0d7a1fe45ffeea359008a1fcc073343e7df3813efa5d67', 'AR-u5-calorimeter-capacity-07': '01bdea0f84fc249a60bab2a890a5124c47d342e123a1c67955bef1bd9f943c27', 'AR-u5-calorimeter-capacity-08': 'e67849663fd4a7365199d828c25cb758a82569b7edaacc453ef42e3c2f416ff1', 'AR-u5-calorimeter-capacity-09': '9f402bf9ed1bf2b92a1f4504b7e0910bf108f30395468f5be2ecec46e9e3f7f0', 'AR-u5-calorimeter-capacity-10': '3fb8c808dd050ef90beb74a8dc59b867bb02af453054f1eb436adbdb9c85a10f', 'AR-u5-calorimeter-capacity-11': '819854bae096977a5be1637499e76f7cc21121f266f7cfd74bd98ddac04312fa', 'AR-u5-calorimeter-capacity-12': 'b369c433fa480623f08c97a01b0c9568ffd9cbf372db5ae74939ce1401ddaf58', 'AR-u5-calorimeter-capacity-13': '241e9c4f89cc26dcadac7d88101fa5c542694dee9af1113a767b6e5189137dd1', 'AR-u5-calorimeter-capacity-14': '8f07e56dd11616e4a391838bb2d470b3b61f77df4954b9ce947165bab396ddba', 'AR-u5-calorimeter-capacity-15': '12f02231e2d05fe1230cf93b441fe8369cc065b0edd4ae7d41bc18dc899853d4', 'AR-u5-calorimeter-capacity-16': '136d8271afa1511aff8de8721d30848ced71c1cfd57e8872cb33bc1df709d45b'}
REQUIRED_RECTS={(300, 665, 200, 45), (140, 1170, 252, 40), (100, 565, 400, 45), (140, 1010, 240, 40), (100, 665, 200, 45), (140, 1090, 264, 40)}
GEOMETRY_REVIEW='Primo pannello schematico dei tre contributi: caldo 80→40 °C, freddo e recipiente 20→40 °C. La barra lunga 400 unità intrinseche rappresenta 80 J ceduti e i due segmenti lunghi 200 ciascuno rappresentano 40+40 J ricevuti, dalla stessa origine. Nel terzo, lunghezze 240, 264 e 252 rappresentano 40, 44 e 42 °C. Zero Celsius distinto da zero assoluto; XML e immagine intera finali letti, con i due zeri fuori dalle aste.'

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

def equilibrium(hot_mass,cold_mass):
    hot_mass,cold_mass=map(Fraction,(hot_mass,cold_mass))
    if min(hot_mass,cold_mass)<=0:raise ValueError("Positive masses required")
    equivalent=(SI.Quantity(2,"joule/kelvin")/SI.Quantity(1,"joule/(gram*kelvin)")).to("gram")
    assert equivalent.magnitude==2
    value=(80*hot_mass+20*(cold_mass+2))/(hot_mass+cold_mass+2)
    assert 20<value<80
    heat_hot=(SI.Quantity(hot_mass,"gram")*SI.Quantity(1,"joule/(gram*kelvin)")*SI.Quantity(80-value,"kelvin")).to("joule")
    heat_cold=((SI.Quantity(cold_mass,"gram")*SI.Quantity(1,"joule/(gram*kelvin)")+SI.Quantity(2,"joule/kelvin"))*SI.Quantity(value-20,"kelvin")).to("joule")
    assert heat_hot==heat_cold
    return value

def hot_from_reading(reading,cold_mass):
    reading,cold_mass=map(Fraction,(reading,cold_mass))
    if not 20<reading<80 or cold_mass<=0:raise ValueError("Interior reading and positive cold mass required")
    return (cold_mass+2)*(reading-20)/(80-reading)

def cold_from_reading(reading,hot_mass):
    reading,hot_mass=map(Fraction,(reading,hot_mass))
    if not 20<reading<80 or hot_mass<=0:raise ValueError("Interior reading and positive hot mass required")
    value=hot_mass*(80-reading)/(reading-20)-2
    if value<=0:raise ValueError("Fixed container would require nonpositive cold mass")
    return value

def equilibrium_scaled(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if min(a,b)<=0:raise ValueError("Positive preparation factors required")
    return equilibrium(a*hot,b*cold)/equilibrium(hot,cold)

def equal_mass_from_reading(reading):
    reading=Fraction(reading)
    if not 20<reading<50:raise ValueError("Equal positive masses with fixed cold container require 20<reading<50")
    return 2*(reading-20)/(100-2*reading)

@lru_cache(maxsize=1)
def oracle():
    mh,mc,x,m=sp.symbols("mh mc x m",positive=True)
    law=sp.Eq(mh*(80-x),(mc+2)*(x-20))
    result=sp.solve(law,x)[0]
    assert sp.simplify(result-(80*mh+20*(mc+2))/(mh+mc+2))==0
    assert sp.simplify(sp.solve(law,mh)[0]-(mc+2)*(x-20)/(80-x))==0
    equal=sp.solve(law.subs({mh:m,mc:m}),m)[0]
    assert sp.simplify(equal-2*(x-20)/(100-2*x))==0
    first=sp.Rational(equilibrium(2,2));second=sp.Rational(equilibrium(4,4))
    assert equilibrium(1,1)==35
    assert equilibrium(3,3)==sp.Rational(85,2)
    fit=calibrate(first,second,120,132,81,89,101,"dimensionless")
    assert fit==(3,1,44,50)
    return [first,"°C","B e C hanno la stessa temperatura e sono in equilibrio termico fra loro","Da 40 a 50",
      hot_from_reading(40,2),cold_from_reading(40,2),sp.Rational(equilibrium(2,4))/first,80-first,
      "m_h = (m_c + m₀) (θ_f − 20) / (80 − θ_f)","N_B D / (D_B N)",second/first,(first+second)/2,
      cold_from_reading(sp.Rational(11,10)*first,4)/2,hot_from_reading(fit[2],4),hot_from_reading(fit[3],2),equal_mass_from_reading(40)]

REQUIRED_ZERO_LABELS={(116, 1255), (76, 765)}

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
