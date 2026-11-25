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
CANDIDATE_REF='eebdbfb3f4d1ddc5f1ff9b748b976d59dee307ca'
PRIMARY_SHA256='c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c'
FAMILY='composite-wall-series'
BATCH='composite-wall-series-179'
ASSET_NAME='composite-wall-series-progressive.svg'
REVIEWED_PACKAGE_SHA256='643a1f15f8fd53bc009755e604c56a4ae743755a05901257db703dd0cc318322'
REVIEWED_BINDINGS_SHA256='a9f2d028363272dcf3e9b68b37a8d478d53b56e13c6bf4b296ecb3c15e5f586b'
SOURCE_REFERENCE='Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.'
FALSE_PROOF='In serie ciascuno strato riceve tutti i60 K e le due potenze vanno sommate.'
SVG_MUTATION=(b'width="240"', b'width="250"')
EXPECTED_MAPPING={1: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 2: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 3: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 4: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 5: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 6: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 7: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 8: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 9: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 10: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 11: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 12: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 13: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 14: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 15: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06']), 16: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05', 'C3-L06'])}
NUMERIC_UNITS={1: 'W', 5: 'm', 6: 'm', 14: 'm'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' m', 16: ' m'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'meter', 6: 'meter', 7: 'dimensionless', 8: 'watt', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'meter'}
MANUAL=['R₁=1/(1·1)=1 K/W, R₂=2/(2·1)=1 K/W; P=60/(1+1)=30 W. Cadute 30 K ciascuna.', 'K diviso K/W dà W, energia per tempo.', 'Stazionarietà impone P comune; ΔT=PR₁+PR₂, quindi P=ΔT/(R₁+R₂).', 'A: R_tot 2 e P=30; B: R_tot 3 e P=20 W. Cambia soltanto R₁.', 'R_tot 60/30=2 K/W; sottraggo R₂=1, moltiplico residuo 1 per k₁ A: L₁=1 m.', 'R_tot 2−R₁=1 K/W; L₂=k₂ A·1=2 m.', 'B con L₂=4 ha R_tot 3 e P=20; rapporto 20/30=2/3.', 'Proposta 60−corretta 30=+30 W.', 'R₁=ΔT/P−R₂>0; L₁=k₁ A(ΔT/P−R₂), con unità m.', 'R_B=a R₁+b R₂; P_B/P_A=(R₁+R₂)/(a R₁+b R₂). Fattore comune dà 1/a.', 'A30 W, B15 W per resistenze entrambe doppie; rapporto 1/2.', '(30+15)/2=45/2 W. Ai mezzi spessori 3/2 e 3 m il totale è3 K/W e P=20 W.', 'Target 15 W richiede R_tot 4; L₁ B2 dà R₁ B2, residuo R₂ B2 e L₂ B4 m; rapporto 2.', 'q=90/30=3 W⁻¹; S45→15 W, R_tot 4; L₂ B4→R₂ B2, residuo 2→L₁ B2 m.', 'q=(61−31)/(30−15)=2 W⁻¹, b=1; S41→20 W, R_tot 3, R₂=1, L₁=2 m.', 'L₁=L₂/2 e k₂=2 k₁ danno R₁=R₂, R_tot=L₂/(k₁ A). P=30 impone R_tot 2 e L₂=2 m, unico.']
DISTRACTORS=['60 W usa un solo strato; 120 somma due percorsi paralleli col salto intero, incompatibili con serie.', 'J energia, K/W resistenza, W/K conduttanza, W/(m·K) conducibilità.', 'ΔT·R ha K²/W; due quozienti conΔT intero sono parallelo; differenza può annullarsi; reciproco non potenza.', '15 raddoppia anche R₂ invariata; 60 e 40 vanno contro aumento di resistenza; 30 ignora cambiamento.', 'L₁=2 omette secondo strato. Residuo negativo non è spessore; sottrarre direttamente L₂ da R_tot è eterogeneo.', 'L₂=1 usa k₁ e nonk 2; 4 omette R₁. k non è resistenza.', '1/2 dimentica R₁ fisso; 3/2 è reciproco; 2 rende diretta potenza con spessore; 1 ignora B.', '−30 inverte ordine, 60 copia proposta, zero accettaerrore, 2 W confonde rapporto.', 'Più aggiunge stratonoto; P/ΔT è conduttanza; dividere per k A ha dimensione errata; omissione R₂ perde uno strato.', 'Rapporto opposto rende P crescente con R; soli fattori non pesano le resistenze, somma non preserva identità.', '2 inverte rapporto; 1/4 raddoppia due volte il totale; 4 e 1 non seguono inversa.', '20 usa ingressi medi; 45 non dimezza; 15/2 dimezza differenza; 30 ignora B.', '1/2 inverte; 4 copia metri; 1 dà P=20; 15 copia watt.', '45 usato come W dà R_tot 4/3<R₂=2, residuo negativo: serve decodifica.', '79/41 ometteb: P=41/2 e S42, non 41.1 torna ad A; 3 dà S31; 20 copia P.', '1 copia L₁; 4 dà 15 W; 30 copia P. Rapporto da solo non determina scala, ma P misurata sì.']
ASSUMPTIONS=['Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.', 'Due strati omogenei in serie ad area comune 1 m² e conducibilità 1 e 2 W/(m·K); spessori positivi, ΔT60 K mantenuto. Contatto perfetto, lati isolati, regime monodimensionale stazionario senza generazione interna. La medesima potenza attraversa entrambi; si sommano cadute e resistenze. Inverse ammesse solo se residuo di resistenza strettamente positivo. Display continuo, vincolo 16 fra preparazioni.']
PEDAGOGY=['Legge motivata dalle ipotesi prima del risultato, con unità conservate.', 'Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.', 'Legge o meccanismo fisico ricostruiti separatamente dalla chiave.', 'Confronto controllato fra prove mantenendo fissi i parametri dichiarati.', 'Inversa derivata prima della sostituzione, con dominio strettamente positivo.', 'Seconda inversa e verifica dimensionale del residuo o del denominatore.', 'Le due prove ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto mantenuto e distinto da un rapporto.', 'Inversa simbolica con geometria e divisioni lecite.', 'Scalature sostituite nel modello completo, senza cancellare pesi diversi.', 'Entrambi gli ingressi variati inclusi nel medesimo bilancio.', 'Media delle uscite distinta dalla risposta agli ingressi medi.', 'Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.', 'Display continuo tarato prima di invertire la relazione fisica.', 'Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.', 'Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.']
EXPECTED_IDS={'AR-u5-composite-wall-series-09', 'AR-u5-composite-wall-series-03', 'AR-u5-composite-wall-series-11', 'AR-u5-composite-wall-series-07', 'AR-u5-composite-wall-series-12', 'AR-u5-composite-wall-series-14', 'AR-u5-composite-wall-series-02', 'AR-u5-composite-wall-series-10', 'AR-u5-composite-wall-series-13', 'AR-u5-composite-wall-series-16', 'AR-u5-composite-wall-series-08', 'AR-u5-composite-wall-series-01', 'AR-u5-composite-wall-series-04', 'AR-u5-composite-wall-series-15', 'AR-u5-composite-wall-series-06', 'AR-u5-composite-wall-series-05'}
REVIEWED_CANDIDATES={'AR-u5-composite-wall-series-01': 'f6c1466756db8913d82cab1ac240bb3de7d6b9069ad8971f80de33c637cc6aa9', 'AR-u5-composite-wall-series-02': '9600bf26c9771199274e0f503e27624a810b807b7bb6a072a9c88207f2a31f44', 'AR-u5-composite-wall-series-03': '99116cae40422ba561f793f1a31af0a650f65bb7d357a928d5c0b81b23af2dca', 'AR-u5-composite-wall-series-04': '5363b3eb9c9e58770fecfe6a67397ae201a3d497407f6a3fa769b70e0b53f382', 'AR-u5-composite-wall-series-05': '102e7b8267b7fbb4a5aeff9590348b3552c9ac42b73cd3052f75d6738680941d', 'AR-u5-composite-wall-series-06': 'c6e96209864ad5111bd42772a97b500a90c9633eaa372a7e34d95cc514eb89d4', 'AR-u5-composite-wall-series-07': '989fe9e9e2cb4f6a89b6b3f8403ae06f45ca27e536f5612441f122f9d2734a90', 'AR-u5-composite-wall-series-08': 'dc528b0078f0076c805e765ba5292bee48394e3b9207fe2fc91d2d9a259ae984', 'AR-u5-composite-wall-series-09': '43b297ba5365f87b2f4a7a4d9a2c6170d1e1995da093bdc863264b77a48d9c45', 'AR-u5-composite-wall-series-10': '29cc015ea44bf2cc1764f81fbefb3d857be76b2eb1f461f9b0abdc7f7b5d2b74', 'AR-u5-composite-wall-series-11': 'dfb5aab284571b021c882fcc6ee5e611c479550130433910c35888f72346cec7', 'AR-u5-composite-wall-series-12': '0dab36a8009e2ca6b8defb6e16a2f0acc84f8cc03bbd8aba66b4faa60b3930e0', 'AR-u5-composite-wall-series-13': 'b10863fb3f8267f161e7bc66642ff485850431e3f2dcfa4416a99255c5afdf35', 'AR-u5-composite-wall-series-14': 'c01fd7368046b449c39fddee8b5d2bd0c5cad13bacfeabd03520430a2d91b9a8', 'AR-u5-composite-wall-series-15': '2131ccad4c27bd826dca9c84f356149367fa28983a080609f2b6555c54d6ead4', 'AR-u5-composite-wall-series-16': '8a29d5ddbd4d45e4abcf35e6404cc616fcee7f4b037ecf25fc13a7042b09cb3c'}
REQUIRED_RECTS={(250, 155, 240, 120), (130, 155, 120, 120), (130, 980, 240, 34), (130, 1132, 180, 34), (130, 1056, 120, 34)}
REQUIRED_PATHS={'M100 585L220 685', 'M220 685L460 785'}
GEOMETRY_REVIEW='SVG integrale XML/render asset-only letti: sezioni 120 ×120 e 240 ×120 rappresentano L₁=1 m, L₂=2 m, lato 1 m, scala comune 120 unità/m. Profilo 60→30→0 K continuo ai confini x=0, 1, 3 m; cadute 30 K in tratti 120/240, pendenza seconda metà della prima. Barre 30/15/45/2 W lunghe 240/120/180, origine comunex 130, 8 unità/W. Assi ed etichette non si attraversano.'

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

def power(l1,l2):
    l1,l2=map(Fraction,(l1,l2))
    if min(l1,l2)<=0:raise ValueError('Both layers must have positive thickness')
    area=SI.Quantity(1,'meter**2')
    r1=SI.Quantity(l1,'meter')/(SI.Quantity(1,'watt/meter/kelvin')*area)
    r2=SI.Quantity(l2,'meter')/(SI.Quantity(2,'watt/meter/kelvin')*area)
    result=(SI.Quantity(60,'kelvin')/(r1+r2)).to('watt')
    return Fraction(result.magnitude)
def inverse_l1(p,l2):
    p,l2=map(Fraction,(p,l2))
    if min(p,l2)<=0 or 60/p<=l2/2:raise ValueError('Known resistance must be below total resistance')
    return 60/p-l2/2
def inverse_l2(p,l1):
    p,l1=map(Fraction,(p,l1))
    if min(p,l1)<=0 or 60/p<=l1:raise ValueError('Known resistance must be below total resistance')
    return 2*(60/p-l1)
def scaled(l1,l2,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive thickness factors required')
    return power(a*l1,b*l2)/power(l1,l2)
def constrained(p):
    p=Fraction(p)
    if p<=0:raise ValueError('Positive power required')
    return 60/p
@lru_cache(maxsize=1)
def oracle():
    p,r1,r2,d=sp.symbols('p r1 r2 delta',positive=True)
    drops=sp.Eq(d,p*r1+p*r2)
    assert sp.solve(drops,p)==[d/(r1+r2)]
    assert sp.simplify(sp.solve(drops,r1)[0]-(d/p-r2))==0
    first=sp.Rational(power(1,2));second=sp.Rational(power(2,4))
    fit=calibrate(first,second,90,45,61,31,41,'watt')
    assert fit==(3,1,15,20)
    assert power(Fraction(3,2),3)==20
    return [first,'W','P = ΔT / (R₁ + R₂)','Da 30 a 20 W',inverse_l1(first,2),inverse_l2(first,1),scaled(1,2,1,2),60-first,'L₁ = k₁ A (ΔT/P − R₂)','(R₁ + R₂) / (κ₁ R₁ + κ₂ R₂)',second/first,(first+second)/2,inverse_l2(first/2,2)/2,inverse_l1(fit[2],4),inverse_l1(fit[3],2),constrained(30)]

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
