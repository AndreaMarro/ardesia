"""Independent source-first electrostatic review; never imports authoring.
Per-ID frozen signatures follow complete text, source and full native SVG reading.
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
from . import entropy_state_review as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
EXACT_LITERAL_DEPENDENCY_SHA256='f75450bbf820fd030b618625bbecba044092df7bef895d31ea2d8cd9f8bc82cf'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
CANDIDATE_REF='5627f51bd046c63df3b04c9daeafad7e3c2f18a5'
PRIMARY_SHA256='12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a'
FAMILY='point-electric-potential'
BATCH='point-electric-potential-192'
ASSET_NAME='point-electric-potential-progressive.svg'
REVIEWED_PACKAGE_SHA256='25e4acde9233f143bb4bb911cbbc4c298adf7d732eb7a1290b7b3dd8196e4cd9'
REVIEWED_BINDINGS_SHA256='cc007223c802513070c103dc200fc3c3f11920209f3ca39408e37332d8566ac5'
SOURCE_REFERENCE='Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.'
FALSE_PROOF='Il potenziale è un vettore che si cancella sulle sfere equipotenziali.'
SVG_MUTATION=(b'width="60"', b'width="61"')
EXPECTED_MAPPING={1: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 2: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 3: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 4: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 5: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 6: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 7: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 8: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 9: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 10: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 11: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 12: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 13: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 14: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 15: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 16: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03'])}
NUMERIC_UNITS={1: 'V', 5: 'nC', 6: 'm', 11: '1', 14: 'nC'}
OPTION_SUFFIX={7: '', 12: ' V', 13: '', 15: ' nC'}
UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'nanocoulomb', 6: 'meter', 7: 'dimensionless', 8: 'volt', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'volt', 13: 'dimensionless', 14: 'nanocoulomb', 15: 'nanocoulomb', 16: 'nanocoulomb'}
MANUAL=['Con riferimento V(∞)=0, il potenziale scalare di Q positivo è V=kₑQ/r. Per Q=1 nC il numeratore è 9 N·m²/C; dividendo per 3 m si trova 3 N·m/C=3 J/C=3 V. Il potenziale non è il modulo del campo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il potenziale ha unità V=J/C=N·m/C. Un campo ha invece N/C=V/m. Senza alternative si identifica la dimensione della scelta richiesta. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Da V=kₑQ/r, con x=Q/(1 nC) e y=r/(1 m), V=(9 V)x/y. La prima potenza di r distingue potenziale e campo. Il riferimento comune all’infinito è necessario per questa formula senza costante aggiuntiva. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A dà 3 V, B con Q=2 nC alla stessa distanza dà 6 V. Il potenziale raddoppia perché è lineare nella carica, non perché cresca come Q². Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=Vr/kₑ. Nelle unità assegnate x=3·3/9=1: Q=1 nC. Si conserva la conversione nC→C prima di usare kₑ in SI. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'r=kₑQ/V. Con Q=1 nC e V=3 V, r=9/3=3 m. Non occorre una radice, perché il potenziale dipende da 1/r. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: V_A=3 V a 3 m; B: V_B=9 V a 1 m. Il rapporto è 3. Il fattore nove sarebbe quello del campo, non del potenziale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Caso speciale geometrico: V(r)=12 V e V(d)=6 V con la stessa Q positiva e zero all’infinito. 6/12=r/d=1/2 implica d=2r. L’insieme nello spazio è la superficie sferica di centro nella sorgente e raggio 2r, non la sfera piena, un piano o il luogo E costante dedotto con 1/r². Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=Vr/kₑ; in valori numerici Q/(1 nC)=(V/(1 V))[r/(1 m)]/9. Non si moltiplica per r² e non si cambia il riferimento del potenziale nell’inversa. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'V_B/V_A=κ₁/κ₂, perché il potenziale è lineare in Q e inverso alla prima potenza di r. I fattori positivi conservano V positivo con lo stesso zero. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A=3 V. B con 4 nC e 2 m dà 9·4/2=18 V. Rapporto 18/3=6; il contributo della distanza è 3/2, non 9/4. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Media=(3+18)/2=21/2 V. Ai dati medi Q=5/2 nC e r=5/2 m si trova 9 V, diverso. La media delle uscite non è il potenziale di una sorgente con parametri medi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Target V_B=6·3=18 V, Q_B=4 nC: r_B=9·4/18=2 m. Rapporto r_B/r_A=2/3, positivo e senza radici. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimento V_A=3 V, S=9: a_cal=3 per volt. S=54 decodifica V_B=18 V; a r=2 m la carica è Q_B/(1 nC)=18·2/9=4, quindi 4 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'I riferimenti fisici sono 3 e 18 V. a_cal=(37−7)/(18−3)=30/15=2 per volt, b_cal=1. S_C=13 dà V_C=(13−1)/2=6 V. A r=3 m, Q_C/(1 nC)=6·3/9=2, quindi 2 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=γr con γ=(1/3) nC/m. Inserendolo in V=kₑQ/r si ottiene V=kₑγ=3 V per qualsiasi r>0; la misura ripete la conseguenza del vincolo. Infinite coppie continue positive parametrizzate da r, per esempio (Q,r)=(1 nC,3 m) e (2 nC,6 m). Qui le cariche del modello sono grandezze continue, non conteggi di microstati: non si importa il dominio intero di U5-05. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.']
DISTRACTORS=['N/C è campo,9 V omette r e1 V usa r² numerico; joule richiede q.', 'N/C campo,J energia,C carica,N forza; solo V=J/C è potenziale.', 'ρ² importa campo; prodotto cresce allontanandosi; u al denominatore inverte Q; coefficiente1/9 è reciproco.', '3/2 rende inversa Q;12 usa quadrato del fattore2;3 ignora cambio;zero non segue Q positiva.', '3 nC aggiunge fattore r e dà9 V;1/3 nC dà1 V;3 volt non sono direttamente3 nC.', '√3 m usa falsa radice;9 m dà1 V;1 m dà9 V;distanza negativa esclusa.', '9 è rapporto dei campi,1/3 e1/9 invertono crescita;1 ignora spostamento.', 'r/2 dà24 V; piano/cilindro non hanno distanza costante; singolo punto non intera superficie.', 'r² aggiunge lunghezza;reciproco C⁻¹;r al denominatore non inverte;fattore2 arbitrario.', 'κ₂² importa campo;prodotto rende diretto r;reciproco inverte rapporto;κ₁² falsa non linearità.', '4 solo Q,3/2 solo r,9 usa quadrato e1/6 inverte;18 è volt non rapporto.', '9 V ai dati medi;21 somma;15/2 semidifferenza;3 solo A.', '3/2 reciproco,4/6 fattori copiati,4/9 quadrato del rapporto richiesto.', '12 nC usa54 come V;6 copia rapporto;1 nC a2 m predice9/2 V e D27/2.', '13/6 omette b e predice14;1 A;4 omette gain e predice25;6 copia volt e predice37.', 'Coppia iniziale solo esempio;due esempi non limitano continuum;r0 escluso dal campo puntiforme.']
ASSUMPTIONS=['Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.', 'Sorgente positiva fissa nel vuoto, r>0, zero comune V(∞)=0 e k_e9·10⁹ assegnato. Potenziale scalare V=k_eQ/r distinto da E e da U=qV. Caso08 superficie sferica tridimensionale, non volume pieno. Display continuo e vincolo fra preparazioni; cariche macroscopiche continue.']
PEDAGOGY=['Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.', 'Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.', 'Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.', 'Confronto controllato con distinzione fra sorgente variata e totale.', 'Inversa derivata prima di sostituire; controllo del dominio positivo.', 'Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza distinto dal rapporto e unità mantenute.', 'Inversa simbolica con cancellazione dimensionale e divisioni lecite.', 'Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.', 'Entrambi i parametri variati ricostruiti prima del rapporto.', 'Media delle uscite verificata separatamente dai dati medi; prove distinte.', 'Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.', 'Display continuo decodificato prima dell’inversa fisica.', 'Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.']
EXPECTED_IDS={'AR-u6-point-electric-potential-05', 'AR-u6-point-electric-potential-14', 'AR-u6-point-electric-potential-12', 'AR-u6-point-electric-potential-02', 'AR-u6-point-electric-potential-01', 'AR-u6-point-electric-potential-04', 'AR-u6-point-electric-potential-07', 'AR-u6-point-electric-potential-09', 'AR-u6-point-electric-potential-15', 'AR-u6-point-electric-potential-06', 'AR-u6-point-electric-potential-13', 'AR-u6-point-electric-potential-16', 'AR-u6-point-electric-potential-08', 'AR-u6-point-electric-potential-03', 'AR-u6-point-electric-potential-11', 'AR-u6-point-electric-potential-10'}
REVIEWED_CANDIDATES={'AR-u6-point-electric-potential-01': 'be0e838b0e342ad338c93e098d30011e4da38fbe4f89885191c8c8b1d631f039', 'AR-u6-point-electric-potential-02': 'df212831b078899527349955c4258960565da58774754141fd5c44d0edc68f4c', 'AR-u6-point-electric-potential-03': '0af255917cbf8b1f16fb710417fdc536a5b66fe8d48f857122ef810d35ee8b4a', 'AR-u6-point-electric-potential-04': '5abecea0c8176709cb2fb17b71edd5a57ba1eb84c7c3c48fa244dc8bca76eebf', 'AR-u6-point-electric-potential-05': 'e360de196f1939d0e999532c0d654c73a4ae383c3c6f98f1e0c3e1ca75f33070', 'AR-u6-point-electric-potential-06': '2e8efb131eb890b85d0b4f529d00ce6c814e08b9aee578bf23159aedfc1c24dc', 'AR-u6-point-electric-potential-07': 'ae5da483ec4b8873306384de5f28d5aedc40df67f7090d9cc12566fb62f7e52e', 'AR-u6-point-electric-potential-08': '93b07b4ae599425c0e314de4cf940cb78eea6f670e913e341776e6d1483303b2', 'AR-u6-point-electric-potential-09': '53f60b0d3b839398bc4d28cd771d4bb582ae381faef4a0dcd853592d4316766a', 'AR-u6-point-electric-potential-10': 'abc55fd0fde73781c93d7026fe6059fc06d65ef08f214742d80067df0b426b80', 'AR-u6-point-electric-potential-11': '2c2ec3bfbe1114675d46214b2c17ef9f6feb9a6d0c3179edb56e0670d9b2ac6a', 'AR-u6-point-electric-potential-12': '10236751c6dddebe885d560662eb9cf0f995d1d1f23d43bc73baf08f0da43f0a', 'AR-u6-point-electric-potential-13': '335f62e4076f7a648779eae37ada4550467593f63c3d88edace109b9ab6db1d7', 'AR-u6-point-electric-potential-14': '11e3e99091e0c26210bfd962e2dbbba69f732bc0b4b4070bcde875764b2dc96f', 'AR-u6-point-electric-potential-15': '05e28c4c7ecc7f2fefc2ef6c6f2e5221715e9e2a83dbcf1929da33e5db84dccc', 'AR-u6-point-electric-potential-16': 'bb078afda887c143f4d7556d841841b74c866fe8a3ddd5c930cd8963f1e0e088'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1128, 1), Fraction(210, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1057, 1), Fraction(360, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(986, 1), Fraction(60, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M32 364H608', 'M150 966V1200', 'M110 247H350M110 235V259M350 235V259', 'M32 853H608'}
REQUIRED_CIRCLES={(Fraction(300, 1), Fraction(610, 1), Fraction(135, 2)), (Fraction(300, 1), Fraction(610, 1), Fraction(12, 1)), (Fraction(110, 1), Fraction(165, 1), Fraction(15, 1)), (Fraction(350, 1), Fraction(165, 1), Fraction(4, 1)), (Fraction(300, 1), Fraction(610, 1), Fraction(135, 1))}
GEOMETRY_REVIEW='XML e immagine integrale letti: nessuna freccia per V. Cerchi concentrici raggi67,5/135 in rapporto1:2 rappresentano sezioni di sfere con12/6 V nel caso distinto. Barre60/360/210 per3/18/21/2 V, scala20 unità intrinseche/V comune, assi separati dalle etichette.'
DECIMAL_REGRESSION_NUMBER=7

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
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
    for suffix in (' N/C',' μC',' nC',' cm',' V',' N',' m',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def field_value(source,distance):
    source,distance=map(Fraction,(source,distance))
    if min(source,distance)<=0:raise ValueError('Positive source and separation required')
    k=SI.Quantity(9*10**9,'newton*meter**2/coulomb**2')
    return Fraction((k*SI.Quantity(source/10**9,'coulomb')/SI.Quantity(distance,'meter')).to('volt').magnitude)
def inverse_source(value,distance):
    value,distance=map(Fraction,(value,distance))
    if min(value,distance)<=0:raise ValueError('Positive infinity-referenced potential and distance required')
    return value*distance/9
def inverse_distance(value,source):
    value,source=map(Fraction,(value,source))
    if min(value,source)<=0:raise ValueError('Positive infinity-referenced potential and source required')
    return 9*source/value
def scaled(source,distance,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive factors required')
    return field_value(a*source,b*distance)/field_value(source,distance)
def constrained_value(distance):
    distance=Fraction(distance)
    if distance<=0:raise ValueError('Positive separation required')
    return field_value(distance/3,distance)
@lru_cache(maxsize=1)
def oracle():
    V,k,Q,r=sp.symbols('V k Q r',positive=True)
    law=sp.Eq(V,k*Q/r)
    assert sp.solve(law,Q)==[V*r/k];assert sp.solve(law,r)==[Q*k/V]
    first=sp.Rational(field_value(1,3));second=sp.Rational(field_value(4,2))
    assert (first,second)==(3,18)
    fit=calibrate(first,second,9,54,7,37,13,'volt');assert fit==(3,1,18,6)
    assert field_value(Fraction(5,2),Fraction(5,2))==9
    assert constrained_value(3)==constrained_value(6)==3
    return [first,'V','v = 9 u / ρ','Da 3 a 6 V',inverse_source(first,3),inverse_distance(first,1),scaled(1,3,1,Fraction(1,3)),'La superficie sferica di raggio 2r centrata sulla carica','Q = V r / k_e','κ₁/κ₂',second/first,(first+second)/2,inverse_distance(6*first,4)/3,inverse_source(fit[2],2),inverse_source(fit[3],3),'Infinite: ogni r>0 con Q=γr']

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u6-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C4" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
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
          "reviewDependencySha256":{"entropy_state_review.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_Coulomb_radial_field_scalar_potential_superposition_inverse_gauge_and_calibration",
            "Pint_exact_charge_force_field_potential_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"entropy_state_review.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-electrostatics-190-194-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-01","U2-01")
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
    # Exactly distinguish near-integer/quarter decimal lexemes after every edition guard is replaced.
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=DECIMAL_REGRESSION_NUMBER-1;row=changed['records'][idx];n=idx+1;wanted=sp.Rational(oracle()[idx])
    scale=10**18;integer=wanted*scale
    assert integer.is_Integer and integer>=0
    quotient,remainder=divmod(int(integer)+1,scale)
    decimal=f"{quotient}.{remainder:018d}"+OPTION_SUFFIX[n]
    previous=row['answer']['value'];row['answer']['value']=decimal
    row['answer']['options']=[decimal if o==previous else o for o in row['answer']['options']]
    links[idx]['candidateSha256']=digest(row);result=retoken(changed,links,row['id'])
    if result['ok'] or 'Independent primary physical exact result mismatch' not in result['errors']:
        raise AssertionError('Near-correct decimal rounded into the accepted exact answer')
    cases.append({'case':'decimal_lexeme_below_float_ulp_rebound_and_retokenized','id':row['id'],'lexeme':decimal,'rejectedBy':result['errors']})
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
