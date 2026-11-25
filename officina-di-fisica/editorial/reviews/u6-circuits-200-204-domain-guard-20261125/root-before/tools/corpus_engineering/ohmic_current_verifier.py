"""Independent source-first U6-02 laws; no candidate authoring imports.
Signatures identify the complete final text and full native SVG read separately.
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
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
CANDIDATE_REF='0ecd111f18033e67350a8dc8f3de29c7bbdc629b'
PRIMARY_SHA256='d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6'
FAMILY='ohmic-current'
BATCH='ohmic-current-203'
ASSET_NAME='ohmic-current-progressive.svg'
REVIEWED_PACKAGE_SHA256='61eda42a3637413e481b5de3591811c1a21fcf27b1cd0d8339bec74a3e532f5d'
REVIEWED_BINDINGS_SHA256='0723c1b3eb82e7bc9b4feda9c9d2f1c49a1b2128996de062d3311c8295875b0c'
SOURCE_REFERENCE='Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.'
FALSE_PROOF='A tensione ideale mantenuta, raddoppiare la resistenza raddoppia la corrente.'
SVG_MUTATION=(b'width="320"', b'width="321"')
EXPECTED_MAPPING={1: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 2: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 3: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 4: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 5: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 6: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 7: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 8: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 9: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 10: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 11: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 12: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 13: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 14: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 15: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 16: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05'])}
NUMERIC_UNITS={1: 'A', 5: 'V', 6: 'Ω', 14: 'V'}
OPTION_SUFFIX={7: '', 8: ' A', 11: '', 12: ' A', 13: '', 15: ' V'}
UNITS={1: 'ampere', 2: 'ampere', 3: 'ampere', 4: 'ampere', 5: 'volt', 6: 'ohm', 7: 'dimensionless', 8: 'ampere', 9: 'volt', 10: 'dimensionless', 11: 'dimensionless', 12: 'ampere', 13: 'dimensionless', 14: 'volt', 15: 'volt', 16: 'volt'}
MANUAL=['Per un resistore ohmico a temperatura costante e generatore ideale, V=RI. Con V 12 V e R 3 Ω, I=12/3=4 A, orientata secondo il verso convenzionale di caduta di potenziale nel resistore. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La corrente ha unità A=V/Ω=C/s. Resistenza, tensione e potenza sono grandezze diverse; si aspetteranno le alternative effettive prima di fissare una stringa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da V=RI con R>0 segue I=V/R. È una relazione costitutiva ohmica nel regime e alla temperatura assegnati, non una legge universale per qualsiasi componente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 12/3=4 A. A V_B=1 V con R 3 Ω si ottiene 1/3 A, dodici volte minore. Nessun cambio della resistenza è implicato dal confronto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V=IR=4 A·3 Ω=12 V. Unità V e dominio positivo conservati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R=V/I=12 V/(4 A)=3 Ω. La divisione richiede corrente non nulla e qui positiva. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A I 4 A; B con R 1 Ω eV 12 V dà 12 A. Rapporto 3, inverso al fattore 1/3 della resistenza. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Proposta 8 A meno corretta 4 A dà+4 A. Il rapporto 2 è diverso e adimensionale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolando V da I=V/R si ha V=IR, A·Ω=V. Moltiplicare e non dividere perR ricostruisce la tensione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V_B=κ₁V_A eR_B=κ₂R_A danno I_B/I_A=κ₁/κ₂, per fattori e resistenze positive e stesso regime ohmico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 4 A; B con 15 V e 5 Ω dà 3 A. Rapporto 3/4: maggiore tensione non garantisce maggiore corrente se cambia ancheR. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media aritmetica=(4+3)/2=7/2 A. Agli ingressi medi V=27/2 V, R 4 Ω si avrebbe 27/8 A, diverso da 28/8 A. Si trattano le due prove con uguale peso statistico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio I_B=(3/4)4=3 A. Con V_B 15 V serve R_B=5 Ω. Rapporto con R_A 3 Ω uguale 5/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento 4 A conS 12: a=3 perA nella scala strumentale. S 9 decodifica 3 A. A R_B 5 Ω, V_B=15 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 4 e 3 A e letture 9, 7: a=(9−7)/(4−3)=2, b=1. S_C 4 dà I_C=3/2 A. ConR_C 4 Ω, V_C=6 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo fra prove V=(4 A)R rende I=4 A per qualsiasi R>0. Infinite coppie continue positive(V, R) compatibili: misura e vincolo non identificano la scala. Non è un generatore ideale unico che vari da solo entro una prova. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['36 moltiplica V e R; 1/4 è il reciproco del valore corretto. Dodici e tre copiano i dati; il negativo non segue la convenzione passiva assegnata.', 'Volt, ohm, coulomb e watt misurano tensione, resistenza, carica e potenza. La corrente ha unità A=V/Ω.', 'R/V ha unità A⁻¹; VR non è corrente. R² aggiunge un fattore e la radice di V/R avrebbe dimensione A alla potenza 1/2.', '48 A rende inversa la dipendenza da V. Quattro ignora la modifica; uno copia V e tre copia R.', '3/4 usa R/I anziché il prodotto RI. Quattro copia la corrente, tre la resistenza. Una caduta negativa non descrive il ramo passivo dichiarato.', '1/3 è il valore della conduttanza I/V. 48 V·A sarebbe una potenza. Ω·m misura resistività, non resistenza.', '1/3 rende diretta la dipendenza da R; uno ignora il carico nuovo. Nove introduce un quadrato, il segno negativo contraddice le correnti positive.', '−4 A inverte la sottrazione; 8 A copia la proposta e zero la accetta. Due è un rapporto puro.', 'I/R e R/I non hanno unità volt. IR² aggiunge un fattore resistivo e I²R è potenza in watt, non tensione.', 'Il prodotto rende diretta R, il reciproco scambia B/A. Il denominatore al quadrato è assente; la somma dei fattori dà due per prove identiche.', '4/3 è il reciproco; 5/4 segue solo le tensioni e 3/5 solo le resistenze nell’ordine inverso. Uno presume una compensazione inesistente.', '27/8 A usa gli ingressi medi; sette somma, 1/2 è semidifferenza e tre copia B. La differenza esatta fra le medie è 1/8 A.', '3/5 inverte B/A; 5/4 copia le tensioni e 3/4 le correnti. Un rapporto delle resistenze uguale a uno darebbe 5 A invece di 3 A.', '45 V usa D come ampere; nove copia il display, cinque R e tre I. La taratura non è una resistenza elettrica.', '8 V omette b e predice D=5. 3/2 copia I; quattro copia D e predice D=3. Dodici V non divide per a e predice D=7.', 'Le coppie elencate sono esempi; V e R non sono libere indipendentemente. R=0 è esclusa, quindi un corto ideale non crea altre soluzioni.']
ASSUMPTIONS=['Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.', 'Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa o angolo autonomo con dominio e orientazione espliciti.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-ohmic-current-01', 'AR-u6-ohmic-current-05', 'AR-u6-ohmic-current-06', 'AR-u6-ohmic-current-11', 'AR-u6-ohmic-current-12', 'AR-u6-ohmic-current-02', 'AR-u6-ohmic-current-03', 'AR-u6-ohmic-current-07', 'AR-u6-ohmic-current-10', 'AR-u6-ohmic-current-08', 'AR-u6-ohmic-current-14', 'AR-u6-ohmic-current-13', 'AR-u6-ohmic-current-09', 'AR-u6-ohmic-current-15', 'AR-u6-ohmic-current-16', 'AR-u6-ohmic-current-04'}
REVIEWED_CANDIDATES={'AR-u6-ohmic-current-01': 'bde3160cf2c225c832b7120e4b783999751ec3dd64baf71ae4ab93a199ad256c', 'AR-u6-ohmic-current-02': '42a76be8229198040f105dd566d59cbf1b764323515dc00381be6e38cc68082b', 'AR-u6-ohmic-current-03': '98977e26d5f424111096b448f4b89cf2d50c6705f9b2d54c255d8e22449acd5e', 'AR-u6-ohmic-current-04': 'c5d36f8f6c61f151a65845bc970b3870b446bbed60f72c4da2776c97dc1d4f07', 'AR-u6-ohmic-current-05': 'e18e95e1730734dfcd6b0eaab9eec6f9c66ffc3589d30ceded1d4a52992f071d', 'AR-u6-ohmic-current-06': '2fb05e4abf0e6d6e42cd47db639a83cd8f81829062b75354a9ff8bb909819642', 'AR-u6-ohmic-current-07': 'ca8870c29c5f8f4b6fedf013eb5cf574d410f7de6f6864a4322bd8ac4ba10931', 'AR-u6-ohmic-current-08': '09ce1283e917e5438cc4337acb368a83ed88f25d9995f713bd942b06c3772e5b', 'AR-u6-ohmic-current-09': '1526fa90b4ba6f3afe5ddfb8391eedd4931ca33d3cb01766fa30f042108179f0', 'AR-u6-ohmic-current-10': '98d4e2904fb4f3f36a4a434c185000843300ef10115ad38153e993f360aa3669', 'AR-u6-ohmic-current-11': 'd85cb5c775adc1e383f860b728ebf62bc3fbb496511389d35b6b3064c5bd7529', 'AR-u6-ohmic-current-12': '207f363869bad45d743c96887c0289b39088b43f30893a869697413963c71eba', 'AR-u6-ohmic-current-13': '3c39556b435f838c76d5270c1fdda99b9c6453ead2d2869766a4a1ddbd016507', 'AR-u6-ohmic-current-14': 'f8d1d48b0328e942efe01d23a6165d13e6fd94584c51fde16a55b47561b86114', 'AR-u6-ohmic-current-15': 'e6d762ff17ea88d2ff039260f0c0865dfe4ba177ba442d0ea64bdf8c04e82e55', 'AR-u6-ohmic-current-16': '66ebf55aa9f14004923696bf78395d0de3c17608c82c545439aac94ac30f46f4'}
REQUIRED_RECTS={(Fraction(130, 1), Fraction(1218, 1), Fraction(280, 1), Fraction(38, 1)), (Fraction(130, 1), Fraction(1138, 1), Fraction(240, 1), Fraction(38, 1)), (Fraction(455, 1), Fraction(205, 1), Fraction(50, 1), Fraction(100, 1)), (Fraction(130, 1), Fraction(1058, 1), Fraction(320, 1), Fraction(38, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1450, 1))}
REQUIRED_PATHS={'M130 850L490 610', 'M130 790H220V850M130 610H490V850', 'M100 210V140H480V205M480 305V400H100V250', 'M32 957H608', 'M32 478H608', 'M130 850V590M130 850H550', 'M130 1032V1298', 'M75 210H125M85 250H115', 'M200 140H370', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(490, 1), Fraction(610, 1), Fraction(5, 1)), (Fraction(220, 1), Fraction(790, 1), Fraction(5, 1))}
GEOMETRY_REVIEW='XML e rendering integrale: schema con generatore positivo in alto e corrente convenzionale nel ramo alto verso destra, entrante nel resistore dal lato ad alto potenziale. RettaI(V)R3Ω da(0, 0) a(12V, 4A), coordinate 130850→490610, scale 30 unità/V e 60 unità/A. Punto 3V, 1A coerente. Barre 4/3/7/2A lunghe 320/240/280, scala 80; provaB haR5Ω e non appartiene alla retta.'
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
    for suffix in (' N/C',' nC',' mC',' ms',' mm²',' Ω',' V',' A',' m','°',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(voltage,resistance):
    voltage,resistance=map(Fraction,(voltage,resistance))
    if min(voltage,resistance)<=0:raise ValueError('Positive passive voltage drop and ohmic resistance required')
    return Fraction((SI.Quantity(voltage,'volt')/SI.Quantity(resistance,'ohm')).to('ampere').magnitude)
def inverse_voltage(current,resistance):
    current,resistance=map(Fraction,(current,resistance))
    if min(current,resistance)<=0:raise ValueError('Positive current and ohmic resistance required')
    return Fraction((SI.Quantity(current,'ampere')*SI.Quantity(resistance,'ohm')).to('volt').magnitude)
def inverse_resistance(current,voltage):
    current,voltage=map(Fraction,(current,voltage))
    if min(current,voltage)<=0:raise ValueError('Positive current and voltage required')
    return Fraction((SI.Quantity(voltage,'volt')/SI.Quantity(current,'ampere')).to('ohm').magnitude)
def scaled(voltage,resistance,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return result(a*voltage,b*resistance)/result(voltage,resistance)
def constrained_value(resistance):
    resistance=Fraction(resistance)
    if resistance<=0:raise ValueError('Positive ohmic resistance required')
    return result(4*resistance,resistance)
@lru_cache(maxsize=1)
def oracle():
    v,r,i=sp.symbols('v r i',positive=True)
    law=sp.Eq(v,r*i)
    assert sp.solve(law,i)==[v/r] and sp.solve(law,r)==[v/i]
    first=sp.Rational(result(12,3));second=sp.Rational(result(15,5));assert (first,second)==(4,3)
    fit=calibrate(first,second,12,9,9,7,4,'ampere');assert fit==(3,1,3,sp.Rational(3,2))
    assert result(sp.Rational(27,2),4)==sp.Rational(27,8)
    assert constrained_value(1)==constrained_value(3)==4
    return [first,'A','I = V/R','Da 4 a 1/3 A',inverse_voltage(first,3),inverse_resistance(first,12),scaled(12,3,1,sp.Rational(1,3)),8-first,'V = I R','κ₁/κ₂',second/first,(first+second)/2,inverse_resistance(sp.Rational(3,4)*first,15)/3,inverse_voltage(fit[2],5),inverse_voltage(fit[3],4),'Infinite coppie positive']
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
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_cancellation_vector_norm_current_Ohm_resistivity_inverse_and_calibration",
            "Pint_exact_charge_time_current_field_resistivity_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-circuits-200-204-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-02","U2-01")
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
