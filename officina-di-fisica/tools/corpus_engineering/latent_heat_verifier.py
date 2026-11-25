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

FAMILY='latent-heat'
BATCH='latent-heat-172'
ASSET_NAME='latent-heat-progressive.svg'
REVIEWED_PACKAGE_SHA256='48e038f9181606783c31abf4a500dcf91f0ca707b68d11b5b373350a87a509e8'
REVIEWED_BINDINGS_SHA256='93e705eebf97adbcbc8405c24e131684d5e65f6af60ca5258e72ba1260c6bea0'
SOURCE_REFERENCE='Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.'
FALSE_PROOF='Se la temperatura non aumenta durante la fusione, il calore assorbito deve essere zero.'
SVG_MUTATION=(b'width="400"', b'width="390"')
EXPECTED_MAPPING={1: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 2: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 3: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 4: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 5: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 6: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 7: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 8: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 9: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 10: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 11: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 12: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 13: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 14: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 15: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06']), 16: ('C3-L04', ['C3-L01', 'C3-L03', 'C3-L04', 'C3-L06'])}
NUMERIC_UNITS={1: 'J', 5: 'g', 6: 'J/g', 14: 'g'}
OPTION_SUFFIX={7: '', 8: ' J', 11: '', 12: ' J', 13: '', 15: ' g', 16: ' J/g'}
UNITS={1: 'joule', 2: 'joule', 3: 'kelvin', 4: 'joule', 5: 'gram', 6: 'joule/gram', 7: 'dimensionless', 8: 'joule', 9: 'gram', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'gram', 15: 'gram', 16: 'joule/gram'}
MANUAL=['La massa è già alla transizione: Q=mL=(2 g)(100 J/g)=200 J, senza termine sensibile. A pressione fissata Q non si identifica automaticamente con ΔU se esiste lavoro di espansione.', 'g·J/g=J: Q è energia trasferita, L è energia per unità di massa.', 'In coesistenza di una sostanza pura a pressione fissata la temperatura resta costante e Q cambia la frazione liquida. Per una massa trasformata m_tr, Q=m_trL; ΔT=0 non implica Q=0.', 'm da 2 a 4 g con L=100 J/g dà Q da 200 a 400 J.', 'm=Q/L=200 J/(100 J/g)=2 g.', 'L=Q/m=200 J/(2 g)=100 J/g.', 'Con m=2 g e L da 100 a 200 J/g, Q da 200 a 400 J e rapporto 2.', 'Proposta meno corretta: 400−200=+200 J.', 'm=Q/L, unità g; QL ha J²/g, L/Q ha g⁻¹ e Q/L² ha g²/J.', 'Entrambi i fattori entrano una sola volta: Q_B/Q_A=κ₁κ₂. L resta costante entro la singola trasformazione.', 'B richiede 4·200=800 J, contro 200 J di A; rapporto 4.', 'Media=(200+800)/2=500 J. Massa media 3 g per L medio 150 J/g darebbe 450 J.', 'Il bersaglio è 800 J con m_B=4 g, quindi L_B=200 J/g e L_B/L_A=2.', 'q=600/(200 J)=3 J⁻¹; S=2400 dà Q=800 J, poi m=800/(200 J/g)=4 g.', 'q=(1601−401)/(800−200)=2 J⁻¹, b=1; S=801 dà Q=400 J e m=4 g a L=100 J/g.', 'm=αL con α=1/50 g²/J implica Q=αL²; L²=10000 (J/g)². Solo L=100 J/g e m=2 g soddisfano i domini positivi.']
DISTRACTORS=['L/m ha J/g²; 100 J riguarda un grammo, zero confonde ΔT=0 con Q=0 e 400 conta due volte la massa.', 'J/g è specifico, g massa, W potenza e J/K capacità; g·J/g lascia J.', 'Q positivo cambia la frazione liquida a T costante; c non diventa zero e il primo joule non trasforma tutto se l’energia non basta.', '100 rende inversa la massa, 200 ignora la massa nuova, 800 usa un quadrato e zero confonde isoterma con assenza di calore.', '20000 moltiplica QL, in J²/g; 1/2=L/Q ha g⁻¹, mentre 100 e 200 copiano i dati.', '400 moltiplica invece di dividere e ha J·g; 200 J è totale e 1/100 g/J è il reciproco di L.', '1/2 è il reciproco, 4 introduce un quadrato, 1 ignora L diversa e 200 copia L_B.', '−200 inverte l’ordine, 400 copia la proposta, zero la accetta e 2 è un rapporto, non calore.', 'QL ha J²/g, L/Q ha g⁻¹, Q/L² ha g²/J e Q+L somma grandezze diverse.', 'I quozienti invertono un fattore; la somma dà 2 per fattori unitari e il quadrato conta entrambi due volte.', '2 segue un solo raddoppio; 1/4 è il reciproco, 1/2 inverte un fattore e 800 è Q_B, non il rapporto.', '450 applica il modello alle medie; 1000 è la somma, 600 la differenza e 300 usa massa media con il solo L_A.', '1/2 è il reciproco; 4 ignora la massa nuova, 1 attribuisce tutto alla massa che cresce solo di 2 e 200 copia L_B.', '12 g usa il display come joule; 8 g usa L_A al posto di L_B e 2 g copia la massa del riferimento.', '801/200 g omette l’offset; 2 g copia A, 8 g mescola Q_B e L_C e 400 copia Q senza dividere per L.', '−100 è il ramo negativo; 10000 copia L², 2 copia la massa e 50 J/g dà m=1 g e Q=50 J. Il vincolo elimina la libertà della massa.']
ASSUMPTIONS=['Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.', 'Sostanza pura già alla transizione endotermica a pressione fissata; tutta la massa positiva cambia fase, senza ulteriori riscaldamenti o perdite. L positiva costante entro prova; diversi valori fra materiali o transizioni assegnati. Q è calore assorbito, non automaticamente ΔU in presenza di lavoro pV. Display continuo e vincolo 16 fra preparazioni.']
PEDAGOGY=['Ricostruzione del bilancio prima della sostituzione, con risultato e unità della grandezza richiesta.', 'Dimensione della grandezza distinta dalle altre quantità del problema e dalla scala dell’unità.', 'Caso speciale o legge motivati con le ipotesi pertinenti, senza usare la chiave come prova.', 'Confronto controllato con distinzione fra ingresso modificato e risposta complessiva.', 'Inversa svolta dal bilancio e verificata nel dominio positivo.', 'Seconda inversa con unità e condizioni di esistenza esplicite.', 'Entrambe le letture ricostruite prima del rapporto e letture Celsius distinte da kelvin.', 'Ordine dello scarto esplicito; differenza distinta da rapporto e da punto termometrico.', 'Inversa simbolica con controllo delle unità e della divisione lecita.', 'Sostituzione dei fattori nel modello completo prima di cancellare termini.', 'Entrambi gli ingressi modificati usati nel medesimo bilancio prima del rapporto.', 'Media delle uscite distinta dal modello agli ingressi medi e da un contatto fisico nuovo.', 'Bersaglio ricostruito prima dell’inversa; valore dell’ingresso distinto dal suo rapporto.', 'Taratura del display continuo separata dall’inversa fisica e dall’offset termometrico.', 'Guadagno e offset strumentali ricavati da due riferimenti prima di ricostruire la grandezza.', 'Vincolo sostituito prima di decidere unicità e rami ammessi; preparazioni distinte dal tempo interno del processo.']
EXPECTED_IDS={'AR-u5-latent-heat-03', 'AR-u5-latent-heat-15', 'AR-u5-latent-heat-08', 'AR-u5-latent-heat-07', 'AR-u5-latent-heat-10', 'AR-u5-latent-heat-02', 'AR-u5-latent-heat-06', 'AR-u5-latent-heat-11', 'AR-u5-latent-heat-14', 'AR-u5-latent-heat-05', 'AR-u5-latent-heat-09', 'AR-u5-latent-heat-16', 'AR-u5-latent-heat-12', 'AR-u5-latent-heat-01', 'AR-u5-latent-heat-04', 'AR-u5-latent-heat-13'}
REVIEWED_CANDIDATES={'AR-u5-latent-heat-01': '233c595d919030209534c675ec4cdc651b9da3b918c465c00a12d99b805b0911', 'AR-u5-latent-heat-02': '7cd8c5901cc1cfabf5eddae4674eaea9b715737f8cd4defdfef1e61cc53d4412', 'AR-u5-latent-heat-03': 'a10b0aae8e56819cd22b6c4540ce2627f11a85edb9606f1bf96d7fd121b0406d', 'AR-u5-latent-heat-04': '4206c56103badb73bad0faf9ba83846626dd3668b6a971f4cb35ff53de6d9bf6', 'AR-u5-latent-heat-05': '5f6b6cb2eb56cfc016f6ed8aa091e80fbc136874bca795be34a35d254a67844c', 'AR-u5-latent-heat-06': 'a7f4d8c1f7184a4581f98791cb257efc3d50fabae565a9331ddecbe3b8ad7a0a', 'AR-u5-latent-heat-07': 'a2c505345b103253c5b2926313f08286822c62e7d5f16215173197b95d23d989', 'AR-u5-latent-heat-08': 'c9c6e2b2f8e196028a36965699d5e19486b31459892e0831bc18f68b3eb0e560', 'AR-u5-latent-heat-09': '619fc07c4b85e96a477484acc4ae0caf538d58d42e80356709f2fe19bdc70da9', 'AR-u5-latent-heat-10': '2a251dedcccb609ff22c8ba6b7590d0196b0147a164c46bf8a561e954bd5ca11', 'AR-u5-latent-heat-11': '1f04b92412374a0b2c99bad6c672568e42a177d59771cd6b21a8e994e0b55328', 'AR-u5-latent-heat-12': 'b1d0f07b4c81937d93dfb0b88ffbb4902f44c0f4063d99cf6b9beaace3abf958', 'AR-u5-latent-heat-13': 'f9ab7fe530bbc399c5d0b72d9548b649167a5f82287ef8068796570ee7b7f66d', 'AR-u5-latent-heat-14': 'f5217b10df4ee97ee37f892a4bb93316eb13501d8ac24b4e009a1441b7ff4803', 'AR-u5-latent-heat-15': '1bbbf41440834f3b87189bc71347505f24c9b30757662ae3595a0191ff56c10f', 'AR-u5-latent-heat-16': '41914baa05611c09b13a637efb23894959e5607f84bf24f49933707f82151584'}
REQUIRED_RECTS={(205, 125, 75, 120), (110, 715, 400, 45), (140, 1045, 250, 45), (280, 125, 75, 120), (110, 615, 100, 45), (140, 1145, 225, 45)}
GEOMETRY_REVIEW='Il primo pannello rappresenta simbolicamente frazioni trasformate 0, 1/2 e 1 alla stessa T_tr; la metà del riquadro è 75+75 unità intrinseche, senza pretesa molecolare. Le barre energetiche A e B, dalla stessa origine x110, sono lunghe 100 e 400 per 200 e 800 J. Nel terzo, lunghezze 250 e 225 dalla stessa origine x140 rappresentano 500 J come media delle uscite e 450 J agli ingressi medi. XML e immagine intera finali controllati e zeri esterni agli assi. Le coordinate intrinseche non sono pixel CSS.'

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

def phase_heat(mass,latent):
    mass,latent=map(Fraction,(mass,latent))
    if min(mass,latent)<=0:raise ValueError("Positive transformed mass and assigned latent heat required")
    return Fraction((SI.Quantity(mass,"gram")*SI.Quantity(latent,"joule/gram")).to("joule").magnitude)

def mass_from_heat(heat,latent):
    heat,latent=map(Fraction,(heat,latent))
    if min(heat,latent)<=0:raise ValueError("Positive absorbed heat and latent heat required")
    return heat/latent

def latent_from_heat(heat,mass):
    heat,mass=map(Fraction,(heat,mass))
    if min(heat,mass)<=0:raise ValueError("Positive absorbed heat and mass required")
    return heat/mass

def heat_scaled(mass,latent,a,b):
    mass,latent,a,b=map(Fraction,(mass,latent,a,b))
    if min(a,b)<=0:raise ValueError("Positive preparation factors required")
    return phase_heat(a*mass,b*latent)/phase_heat(mass,latent)

def constrained_latent(heat,alpha):
    heat,alpha=map(Fraction,(heat,alpha))
    if min(heat,alpha)<=0:raise ValueError("Positive heat and dimensioned preparation coefficient required")
    square=(SI.Quantity(heat,"joule")/SI.Quantity(alpha,"gram**2/joule")).to("joule**2/gram**2")
    return sp.sqrt(sp.Rational(square.magnitude))

@lru_cache(maxsize=1)
def oracle():
    m,L,Q,a=sp.symbols("m L Q a",positive=True)
    assert sp.solve(sp.Eq(Q,m*L),m)==[Q/L]
    assert sp.solve(sp.Eq(Q,m*L),L)==[Q/m]
    assert sp.solve(sp.Eq(Q,a*L**2),L)==[sp.sqrt(Q)/sp.sqrt(a)]
    first=sp.Rational(phase_heat(2,100));second=sp.Rational(phase_heat(4,200))
    fit=calibrate(first,second,600,2400,401,1601,801,"joule")
    assert fit==(3,1,800,400)
    assert phase_heat(3,150)==450
    return [first,"J","La temperatura resta costante e aumenta la frazione liquida","Da 200 a 400 J",
      mass_from_heat(200,100),latent_from_heat(200,2),sp.Rational(phase_heat(2,200))/first,400-first,
      "m = Q / L","κ₁ κ₂",second/first,(first+second)/2,
      latent_from_heat(4*first,4)/100,mass_from_heat(fit[2],200),mass_from_heat(fit[3],100),constrained_latent(200,Fraction(1,50))]

REQUIRED_ZERO_LABELS={(116, 1240), (86, 815)}

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
