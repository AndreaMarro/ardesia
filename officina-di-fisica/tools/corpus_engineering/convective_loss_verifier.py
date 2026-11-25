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
CANDIDATE_REF='a2699006ba266cc06c0ef42ad08edab752f7f2f0'
PRIMARY_SHA256='c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c'
FAMILY='convective-loss'
BATCH='convective-loss-182'
ASSET_NAME='convective-loss-progressive.svg'
REVIEWED_PACKAGE_SHA256='982ded36f909408529ea475b4cce118d8c6029998eb9c7d272d8d01eb40ca0e8'
REVIEWED_BINDINGS_SHA256='416fe5ed618f00f3f5d719cd6cedc4134ca5fbaedda8e673a62aedd8b056ae97'
SOURCE_REFERENCE='Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.'
FALSE_PROOF='Il rapporto delle potenze a h fisso è sempre il rapporto delle letture Celsius T_s, senza sottrarre la temperatura dell’aria.'
SVG_MUTATION=(b'width="80"', b'width="90"')
EXPECTED_MAPPING={1: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 2: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 3: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 4: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 5: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 6: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 7: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 8: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 9: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 10: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 11: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 12: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 13: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 14: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 15: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05']), 16: ('C3-L05', ['C1-L001', 'C3-L01', 'C3-L05'])}
NUMERIC_UNITS={1: 'W', 5: 'W/(m²·K)', 6: '°C', 14: 'W/(m²·K)'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' W/(m²·K)', 16: ' °C'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'watt/meter**2/kelvin', 6: 'kelvin', 7: 'dimensionless', 8: 'watt', 9: 'watt/meter**2/kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'watt/meter**2/kelvin', 15: 'watt/meter**2/kelvin', 16: 'kelvin'}
MANUAL=['ΔT=(30−20) K=10 K; h A=5 W/K e P=50 W.', '[h][A][ΔT]=(W/(m²·K))m²K=W, energia trasferita per tempo.', 'La legge assegnata usa la differenza rispetto all’aria: P=h AΔT, non h A T_s. Il distrattore ΔT/(h A) ha K²/W, non W né W⁻¹.', 'A cede 50 W, B con h doppio e stesso salto cede 100 W: rapporto 2.', 'h=P/(AΔT)=50/(1·10)=5 W/(m²·K), divisore positivo.', 'ΔT=P/(h A)=10 K; aggiungo riferimento 20 °C e ottengo 30 °C, non 10 °C.', 'A ha salto 10 K e P=50 W; B salto 20 K e P=100 W: rapporto 2, diverso dalle letture 40/30.', 'Proposta 100 meno corretto 50 dà+50 W, rapporto 2 non è differenza.', 'P=h AΔT implica h=P/(AΔT), ΔT=(θ_s−20) K>0 e area positiva.', 'B ha salto(bθ_s−20) K, non b(θ_s−20) K; rapporto a(bθ_s−20)/(θ_s−20), entrambi i salti positivi.', 'A50 W; B10·(40−20)=200 W; rapporto 4.', '(50+200)/2=125 W. Ai dati medi h=15/2 eθ35 il salto 15 K dà 225/2 W, diverso.', 'Target 200 W e h B10 richiedono salto 20 K, lettura 40 °C: rapporto numerico 40/30=4/3, non 2.', 'q=150/50=3 W⁻¹; S600→200 W; T_s40 dà salto 20 K, quindi h B10 W/(m²·K).', 'q=(401−101)/(200−50)=2 W⁻¹, b=1; S201→100 W; salto 10 K, h C10 W/(m²·K).', 'P₀=βA·1 K=(1/6) W, P=P₀θ(θ−20). θ²−20θ−300=(θ−30)(θ+10); solo 30>20 e h=5>0.']
DISTRACTORS=['150 usa 30 al posto del salto 10; 5 copia h; 10 copia intervallo; nessun offset 273, 15 per differenze.', 'J energia, W/(m²·K) coefficiente, m² area, K intervallo. Non si ricava energia senza durata.', 'T_s da sola dipende dallo zero della scala; h A/ΔT ha W/K²; ΔT/(h A) ha K²/W; hΔT/A altera la dipendenza dall’area.', '25 rende inversa dipendenza; 200 introduce quadrato; 300 usa lettura 30 anziché salto 10.', '5/3 divide per 30 anziché 10; 50 copia P; moltiplicare perΔT sbaglia dimensione.', '10 °C perde riferimento e viola ramo caldo; 20 annulla salto; 303, 15 è stesso punto in K, non °C.', '4/3 usa letture; 1/2 inverte; 4 introduce quadrato; 1 ignora nuovo salto.', '−50 inverte ordine; 100 copia proposta; zero accetta; 2 è puro rapporto.', 'Moltiplicare per area o salto altera dimensione; AΔT/P è reciproco di h; T_s puntuale non sostituisce intervallo.', 'ab scala il salto e non la lettura; rapporto termico inverso sbaglia dipendenza; a/b perde l’aria; somma non segue prodotto.', '2 usa un solo cambiamento; 4/3 usa letture, 8/3 aggiunge h a questo errore; 1/4 è reciproco.', '225/2 usa dati medi; 250 non dimezza; 75 dimezza differenza; 50 ignora B.', '2 è rapporto dei salti; 3/4 inverte letture; 4 copia rapporto potenze; 1 non aumenta uscita abbastanza.', '600 come watt darebbe h=30; h=5 predice S300; 20 copia salto.', '201/20 omette b e predice S202; h=5 torna ad A; 20 predice 401; 100 predice 2001.', '−10 viola ramo caldo e rende h negativo, non è esclusa perché tutti i Celsius negativi siano impossibili.10 è sotto aria; 50 e 300 non soddisfano potenza.']
ASSUMPTIONS=['Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.', 'Superficie di area 1 m² mantenuta più calda dell’aria a 20 °C. h positivo assegnato e costante entro prova, sola potenza convettiva uscente P=h AΔT, senza sommare altri meccanismi né dedurre transitori. θ_s è numero della lettura Celsius, ΔT=(θ_s−20) K. Scalare θ_s non scala il salto; ogni prova resta nel ramo caldo. Vincolo 16 fra preparazioni, con β dimensionato e nessuna legge locale h(T) imposta.']
PEDAGOGY=['Legge motivata dalle ipotesi prima del risultato, con unità conservate.', 'Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.', 'Legge o meccanismo fisico ricostruiti separatamente dalla chiave.', 'Confronto controllato fra prove mantenendo fissi i parametri dichiarati.', 'Inversa derivata prima della sostituzione, con dominio strettamente positivo.', 'Seconda inversa e verifica dimensionale del residuo o del denominatore.', 'Le due prove ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto mantenuto e distinto da un rapporto.', 'Inversa simbolica con geometria e divisioni lecite.', 'Scalature sostituite nel modello completo, senza cancellare pesi diversi.', 'Entrambi gli ingressi variati inclusi nel medesimo bilancio.', 'Media delle uscite distinta dalla risposta agli ingressi medi.', 'Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.', 'Display continuo tarato prima di invertire la relazione fisica.', 'Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.', 'Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.']
EXPECTED_IDS={'AR-u5-convective-loss-02', 'AR-u5-convective-loss-06', 'AR-u5-convective-loss-03', 'AR-u5-convective-loss-07', 'AR-u5-convective-loss-04', 'AR-u5-convective-loss-05', 'AR-u5-convective-loss-09', 'AR-u5-convective-loss-10', 'AR-u5-convective-loss-15', 'AR-u5-convective-loss-08', 'AR-u5-convective-loss-13', 'AR-u5-convective-loss-12', 'AR-u5-convective-loss-11', 'AR-u5-convective-loss-01', 'AR-u5-convective-loss-14', 'AR-u5-convective-loss-16'}
REVIEWED_CANDIDATES={'AR-u5-convective-loss-01': 'bcde7e9e342ca1e63cbcc534b67f6211207c36cf3021ffcf908642bb7d21f7b1', 'AR-u5-convective-loss-02': '853d8727adeae8687f79f7fb3634a8d30b75b78011fc2f997f893b81e1b0b2f6', 'AR-u5-convective-loss-03': '2fdae18d19c4d63cd169e35df5db142871424f9186659c02bc43e90584ef839a', 'AR-u5-convective-loss-04': '1ef824856ee6d97f00b185f960683d1e047e8286aaf73a8b40e7eb2ddbf0b46d', 'AR-u5-convective-loss-05': '2816df8d95937fc3dceab3734c3438dc5e15b77e36fd32b63b566711583e6d53', 'AR-u5-convective-loss-06': 'c70b19c3265888fc34b199d71319d694b20af1146a6947f73c30c2a9e4dfb829', 'AR-u5-convective-loss-07': '49691c8efb27324d17c590c9044d360c918ef248866aecd80eaec2a8ad9e7f0a', 'AR-u5-convective-loss-08': 'b43439fef6dfc35e7dafc0a11deab1cc12c3c3bbedeaa496f674fc2019b9f22e', 'AR-u5-convective-loss-09': '4798f0bd959e8cf2ce13a64dde5dd2e55d619d687730c8043ad872306bd83d3e', 'AR-u5-convective-loss-10': '328e3cff35e75573b1b9feeee1ba90f1be19f2e6a6ed85a9bd585575639ba1c2', 'AR-u5-convective-loss-11': '26f859eddc47cd786805c1047d38281ba4506379ba1ac8113224df7987533b13', 'AR-u5-convective-loss-12': '39e5ee1ed29098788edaa2bc72710d9dedf2d02936bd0010fe4b93bbdc3fad74', 'AR-u5-convective-loss-13': 'e369ecf27fc4b02080af3570e89251565ec899b4c0db446b0d68e8cb4a895fdf', 'AR-u5-convective-loss-14': '295a5971f1a32e47412981881dfbc6f28cec88efb57e3a25d5ab8bf9aa7f7c74', 'AR-u5-convective-loss-15': '71a07eca66180448589d3b244012ebaef91c3cf321ccd4e852a29728030edc3e', 'AR-u5-convective-loss-16': '4a7434254c4565d16383b60c97ce87be3a7675542c326f149a47e21d5264f0be'}
REQUIRED_RECTS={(130, 1080, 320, 34), (130, 1153, 200, 34), (130, 1007, 80, 34)}
REQUIRED_PATHS={'M100 795L300 695L500 595'}
GEOMETRY_REVIEW='SVG integrale XML e rendering asset-only letti: schema caldo 30 °C verso aria 20 °C con freccia energetica. Retta a h=5 fissato: limite aperto(20 °C, 0 W), punti(30, 50), (40, 100), scale 20 unità/grado e 2 unità/W. Barre finali 50/200/125 W lunghe 80/320/200 dal comune x130 (8/5 unità/W); B cambia anche h e non appartiene alla medesima retta centrale. Testi e assi separati.'

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

def power(h,theta):
    h,theta=map(Fraction,(h,theta))
    if h<=0 or theta<=20:raise ValueError('Positive coefficient and surface warmer than air required')
    result=(SI.Quantity(h,'watt/meter**2/kelvin')*SI.Quantity(1,'meter**2')*SI.Quantity(theta-20,'kelvin')).to('watt')
    return Fraction(result.magnitude)
def inverse_h(p,theta):
    p,theta=map(Fraction,(p,theta))
    if p<=0 or theta<=20:raise ValueError('Positive power and surface warmer than air required')
    return p/(theta-20)
def inverse_theta(p,h):
    p,h=map(Fraction,(p,h))
    if min(p,h)<=0:raise ValueError('Positive power and coefficient required')
    return 20+p/h
def scaled(h,theta,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return power(a*h,b*theta)/power(h,theta)
def constrained(p,beta):
    p,beta=map(Fraction,(p,beta))
    if min(p,beta)<=0:raise ValueError('Positive power and preparation coefficient required')
    coefficient=(SI.Quantity(beta,'watt/meter**2/kelvin')*SI.Quantity(1,'meter**2')*SI.Quantity(1,'kelvin')).to('watt')
    return 10+sp.sqrt(100+sp.Rational(p)/sp.Rational(coefficient.magnitude))
@lru_cache(maxsize=1)
def oracle():
    p,h,area,d,beta,theta=sp.symbols('p h area delta beta theta',positive=True)
    law=sp.Eq(p,h*area*d)
    assert sp.solve(law,h)==[p/(area*d)]
    assert sp.solve(law,d)==[p/(area*h)]
    roots=sp.solve(sp.Eq(p,beta*theta*(theta-20)),theta)
    assert any(sp.simplify(root-(10+sp.sqrt(100+p/beta)))==0 for root in roots)
    bad=(SI.Quantity(1,'kelvin')/(SI.Quantity(1,'watt/meter**2/kelvin')*SI.Quantity(1,'meter**2'))).to('kelvin**2/watt')
    assert bad.magnitude==1
    first=sp.Rational(power(5,30));second=sp.Rational(power(10,40))
    fit=calibrate(first,second,150,600,101,401,201,'watt')
    assert fit==(3,1,200,100)
    assert power(Fraction(15,2),35)==Fraction(225,2)
    assert constrained(50,Fraction(1,6))==30
    return [first,'W','P = h A ΔT','Da 50 a 100 W',inverse_h(first,30),inverse_theta(first,5),sp.Rational(power(5,40))/first,100-first,'h = P / (A ΔT)','κ₁ (κ₂ θ_s − 20) / (θ_s − 20)',second/first,(first+second)/2,inverse_theta(4*first,10)/30,inverse_h(fit[2],40),inverse_h(fit[3],30),constrained(50,Fraction(1,6))]

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
