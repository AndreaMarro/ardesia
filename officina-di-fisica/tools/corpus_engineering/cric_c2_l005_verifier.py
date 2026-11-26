"""Independent source-first Cric fluid pressure and density; no candidate authoring imports.
All 50 source-prompt derivations and numerical computations frozen before candidate reading.
Complete final text, distractors, physical hypotheses and full native SVG read separately.
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
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C2.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc'
CANDIDATE_REF='91f13eef7412e3227bd11fc7e2bc747bd980bdd3'
PRIMARY_SHA256='34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C2.json', 'sourceSha256': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23', 'primarySkill': 'C2-L005', 'title': 'Contare ciò che attraversa una sezione', 'actualLessonPrerequisites': ['C2-L001']}
FAMILY='cric-c2-l005'
BATCH='cric-c2-l005'
ASSET_NAME='cric-c2-l005-progressive.svg'
REVIEWED_PACKAGE_SHA256='8c34882c17ae5263293480d4bf9936b1d05d4bb2db981bb4c7854e823d106624'
REVIEWED_BINDINGS_SHA256='9abc8e661dcaed5919548083ec77320256c87eed2b6ff2f37cc275dc456b961c'
SOURCE_REFERENCE='Dieci problemi distinti Cric C2, con derivazioni individuali nella primaria prompt-only immutata e calcoli pre-key congelati; vedere le note per ID.'
FALSE_PROOF='La portata entrante è sempre uguale a quella uscente anche mentre una vasca si riempie.'
SVG_MUTATION=(b'width="270"', b'width="271"')
SVG_LABEL_MUTATION=(b'22 mL/s', b'23 mL/s')
EXPECTED_MAPPING={1: ('C2-L005', ['C2-L005']), 2: ('C2-L005', ['C2-L005']), 3: ('C2-L005', ['C2-L005']), 4: ('C2-L005', ['C2-L005']), 5: ('C2-L005', ['C2-L005']), 6: ('C2-L005', ['C2-L005']), 7: ('C2-L005', ['C2-L005']), 8: ('C2-L005', ['C2-L005']), 9: ('C2-L005', ['C2-L005']), 10: ('C2-L005', ['C2-L005'])}
NUMERIC_UNITS={1: 'L', 3: 'cm', 4: 'mL/s', 9: 's', 10: 'cm²'}
OPTION_SUFFIX={6: ' kg'}
UNITS={1: 'liter', 2: 'meter**2', 3: 'centimeter', 4: 'milliliter/second', 5: 'meter/second', 6: 'kilogram', 7: 'meter/second', 8: 'meter/second', 9: 'second', 10: 'centimeter**2'}
MANUAL=['La portata netta è 9−5=4 L/min. Quarantacinque secondi sono 3/4 min, quindi accumulo 4·3/4=3 L. La somma delle portate darebbe una quantità diversa dall’accumulo netto.', 'Per un getto continuo stazionario incomprimibile, senza perdite laterali, Q=Av resta costante lungo il getto. La gravità ne aumenta la rapidità in caduta, dunque l’area deve diminuire. Stazionario non significa che la velocità sia uguale in tutti i punti.', 'Da Q=Av_m ricavo A=(8π)/(2)=4π cm². Con A=πr² ottengo r=2 cm e diametro 4 cm. La velocità assegnata è la media normale sulla sezione; r e diametro non sono intercambiabili.', 'Porto 840 mL/min a 14 mL/s. La continuità stazionaria dàQ₂=36−14=22 mL/s. Non si sottraggono numeri espressi in unità temporali diverse.', 'Per campo stazionario, la velocità in ogni punto fisso della condotta deve restare costante nel tempo, anche se varia da una sezione all’altra e all’interno della sezione. La sola portata costante non esclude cambiamenti temporali del profilo a integrale costante.', 'La portata massica èρQ=(0,85 kg/L)(12 L/min)=10,2 kg/min=17/100 kg/s. In un secondo passano 0,17 kg. Litri e densità si combinano prima di convertire il minuto in secondi. Il valore del modello pre-key è la portata di massa 17/100 kg/s; moltiplicando per 1 s si ottiene la massa 17/100 kg richiesta dalla nuova edizione, senza cambiare il coefficiente.', 'Senza accumulo la portata massicaρAv_m è la stessa. Raddoppiareρ e dimezzareA lasciaρA invariato; la velocità media resta uguale. Per un gas comprimibile non basta imporreQ volumetrica costante a priori.', 'La parola richiesta è media: in Q=Av si usa la media areale della componente normale alla sezione. Con profilo non uniforme non è in generale la velocità al centro né il massimo; eventuali contributi di flusso opposto hanno segno.', 'La pompa haQ=2,4 L/(3 min)=800 mL/min=40/3 mL/s. Per riempire 120 mL, t=120/(40/3)=9 s. È il modello ideale di una linea inizialmente vuota che si riempie senza compressibilità, dispersione o volume addizionale non dichiarato.', 'Converto 6 mL/s in 6 cm³/s. Dividendo per 0,20=1/5 cm/s ottengoA_tot=30 cm². La velocità è media sulle sezioni aperte complessive assegnate, non la velocità in ogni singolo ramo.']
DISTRACTORS=['6,75 L solo ingresso,3,75 solo uscita,10,5 somma invece di sottrarre,180 interpreta 45 s come 45 min.', 'Portata non cala senza accumulo/perdita; densità non nulla; stazionario non significa uniforme nello spazio e gravità non sottrae massa.', '2 cm è raggio,8 raddoppia già il diametro,4π copia coefficiente di area come lunghezza; 16 cm darebbeQ 128πcm³/s, non 8π.', '50 somma i flussi, −804 sottrae 840/min a 36/s senza convertire,14 è primo ramo,18 suppone rami uguali senza dati.', 'Uniformità spaziale è altra proprietà; particelle possono accelerare per variazioni spaziali. Q costante non determina il profilo né richiede velocità zero.', '10,2 kg transita in 1 min,0,85 copia densità,12 copia portata numerica in altre unità,17 perde fattore 100.', 'Raddoppio considera solo area, dimezzamento solo densità, quadruplicare applica entrambi nello stesso verso; in realtàρA resta uguale. Flusso non deve fermarsi.', 'Massimo, minimo e valore sull’asse non ricostruiscono in generale l’integrale; componente tangenziale non attraversa la sezione.', '0,15 è durata inmin,15 s fornirebbero 200 mL,90 s è fattore 10, zero ignora volume di riempimento; 3 min definisconoQ, non ritardo aggiuntivo.', '1,2 è coefficiente diQv con dimensione diversa,0,30 e 300 errano fattori 100/10,6 copia la portata; area individuale dei rami non è assegnata.']
ASSUMPTIONS=['Portate costanti 9 L/min entranti e 5 uscenti per 45 s, vasca senza trabocco; accumulo non nullo incluso.', 'Getto incomprimibile stazionario senza perdite laterali, velocità media normale cresce cadendo; portata comune.', 'Tubo circolare, portata 8πcm³/s e velocità normale media 2 cm/s; diametro positivo richiesto, non raggio.', 'Raccordo incomprimibile stazionario senza accumulo,36 mL/s in ingresso,840 mL/min nel primo ramo; secondo ramo uscente.', 'Campo di velocità in tubo a sezioni diverse; portata totale costante non basta a imporre profilo locale indipendente dal tempo.', 'Liquido omogeneoρ0,85 kg/L, Q 12 L/min costante; si chiede massa transitata nel preciso intervallo 1 s.', 'Gas senza accumulo, densità uniforme su ogni sezione, ρ₂=2ρ₁ eA₂=A₁/2, flusso normale medio confrontato.', 'Profilo non uniforme, portata integrale della componente normale sulla sezione; media areale, non massimo o media temporale.', 'Linea inizialmente vuota 120 mL, portata pompa 2,4 L/3 min costante, no perdite, elasticità o vie alternative; arrivo al termine del riempimento.', 'Rete stazionaria incomprimibile, Qtot 6 mL/s, media normale 0,20 cm/s sull’intera area aperta; area totale richiesta.']
PEDAGOGY=['Bilancio con accumulo e tempi nella medesima unità.', 'Continuità fra sezioni senza confondere stazionarietà e accelerazione della particella.', 'Area, raggio e diametro distinti, π cancellato esattamente.', 'Unità di tempo uniformate prima del nodo stazionario.', 'Definizione locale del campo stazionario esplicita.', 'Portata di massa trasformata in massa su 1 s, senza confonderla con accumulo.', 'Conservazione della massa anche quando le portate di volume differiscono.', 'Media normale areale derivata dall’integrale.', 'Transitorio di riempimento distinto dal flusso dopo l’uscita.', 'Area totale e media globale, senza inventare singoli diametri.']
EXPECTED_IDS={'C2-Q047', 'C2-Q042', 'C2-Q048', 'C2-Q050', 'C2-Q043', 'C2-Q046', 'C2-Q049', 'C2-Q044', 'C2-Q041', 'C2-Q045'}
REVIEWED_CANDIDATES={'C2-Q041': '14bd46884e15ed75c99d67a8d01cabf7304bc8270941b4559faadf03ce7a737d', 'C2-Q042': '45ce7f94566784943c321d8dd7375d77adf54ec191a05612fdbe4b85e20df60b', 'C2-Q043': '8cdaebe8586598b311938b9856a29892cd70abc1dfcf9e86c4b89463ef7007c9', 'C2-Q044': 'a9fafc94308b0aac95e249eedd201db40003e0679448d60e980fd72a4d99d5df', 'C2-Q045': '7603ba13649ce00fc3ce8ae461682a71163871c542c15c8f707f45c2ba3d4257', 'C2-Q046': '36c2b37803ad2f257a59396eb11fa180a10864c24d4b346fd3b340f68a2d292a', 'C2-Q047': '92f4b4dbbb9730519c91029a108f70f2dc9f66dec1c73641d9c8ec087af6549f', 'C2-Q048': '6d337fb3643914bdfe1b1528faa823b515449eb5805091d6111884c3186b7f28', 'C2-Q049': 'c7837eb787b856c24220c0d242f9fe31c84b604c537bc5a918ab049ddf0d6971', 'C2-Q050': '9f13a770e20b9ce8d43473803ec74ef1352b121adf4ffb0091e43891212e9acc'}
REQUIRED_RECTS={(Fraction(160, 1), Fraction(160, 1), Fraction(270, 1), Fraction(45, 1)), (Fraction(160, 1), Fraction(250, 1), Fraction(150, 1), Fraction(45, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1550, 1)), (Fraction(160, 1), Fraction(720, 1), Fraction(140, 1), Fraction(45, 1)), (Fraction(160, 1), Fraction(600, 1), Fraction(360, 1), Fraction(45, 1)), (Fraction(160, 1), Fraction(340, 1), Fraction(120, 1), Fraction(45, 1)), (Fraction(160, 1), Fraction(840, 1), Fraction(220, 1), Fraction(45, 1))}
REQUIRED_PATHS={'M140 1390 500 1150', 'M32 1000H608', 'M500 1390V1150H140', 'M140 1390H550M140 1390V1130', 'M32 490H608'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Contare ciò che attraversa', '1. In 45 s: entra, esce, si accumula', 'Entrato', '6,75 L', 'Uscito', '3,75 L', 'Accumulo', '3 L', '6,75 L − 3,75 L = 3 L', '2. Un nodo senza accumulo', 'Ingresso', '36 mL/s', 'Ramo 1', '14 mL/s', 'Ramo 2', '22 mL/s', '36 mL/s = 14 mL/s + 22 mL/s', '3. La linea inizialmente vuota', 'V (mL)', '120', '0', '9', 't (s)', 'A 9 s il volume interno di 120 mL è riempito')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Bilanci di volume e portata'), ('desc', 'Volumi in quarantacinque secondi: 6,75 litri entrati meno 3,75 usciti danno tre litri accumulati. Nodo stazionario con 36 millilitri al secondo in ingresso e rami 14 e 22. Riempimento iniziale di una linea fino a 120 millilitri in nove secondi.'))
GEOMETRY_REVIEW='XML e nuovo PNG indipendente 640×1550 letti per intero. Volumi in 45 s: barre 270/150/120 per 6,75/3,75/3 L, origine comune e 40 coordinate/L; 270−150=120. Nodo senza accumulo: barre 360/140/220 per 36/14/22 mL/s, scala 10 coordinate/(mL/s). Riempimento iniziale: origine(140,1390), punto(500,1150),360 coordinate per 9 s e 240 per 120 mL; pendenza 40/3 mL/s=800 mL/min. L’intervallo finisce all’arrivo del liquido, non è imposto un accumulo dopo 9 s. Nessun taglio o contatto residuo rilevato.'
DECIMAL_REGRESSION_NUMBER=6
EXPECTED_CONTEXT={'C2-Q041': {'id': 'C2-Q041', 'kind': 'question', 'course': 'C2', 'order': 41, 'skill': 'C2-L005', 'family': 'un-recipiente-si-riempie', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q042': {'id': 'C2-Q042', 'kind': 'question', 'course': 'C2', 'order': 42, 'skill': 'C2-L005', 'family': 'un-getto-che-si-assottiglia', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q043': {'id': 'C2-Q043', 'kind': 'question', 'course': 'C2', 'order': 43, 'skill': 'C2-L005', 'family': 'ricavare-il-diametro-dal-flusso', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q044': {'id': 'C2-Q044', 'kind': 'question', 'course': 'C2', 'order': 44, 'skill': 'C2-L005', 'family': 'un-ramo-laterale-non-misurato', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q045': {'id': 'C2-Q045', 'kind': 'question', 'course': 'C2', 'order': 45, 'skill': 'C2-L005', 'family': 'stazionario-non-vuol-dire-uniforme', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q046': {'id': 'C2-Q046', 'kind': 'question', 'course': 'C2', 'order': 46, 'skill': 'C2-L005', 'family': 'una-portata-di-massa', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q047': {'id': 'C2-Q047', 'kind': 'question', 'course': 'C2', 'order': 47, 'skill': 'C2-L005', 'family': 'gas-in-un-restringimento', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q048': {'id': 'C2-Q048', 'kind': 'question', 'course': 'C2', 'order': 48, 'skill': 'C2-L005', 'family': 'velocita-efficace-per-la-portata', 'difficulty': 1, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}, 'C2-Q049': {'id': 'C2-Q049', 'kind': 'question', 'course': 'C2', 'order': 49, 'skill': 'C2-L005', 'family': 'un-residuo-nella-linea', 'difficulty': 2, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 2}, 'C2-Q050': {'id': 'C2-Q050', 'kind': 'question', 'course': 'C2', 'order': 50, 'skill': 'C2-L005', 'family': 'somma-delle-aree-capillari', 'difficulty': 3, 'prerequisites': ['C2-L005'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
ORDINAL_OFFSET=40

def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def source_only_predictions():
    q=sp.Rational
    return {
        'C2-Q002':q(45)/q(15,1000)/1000,
        'C2-Q004':99-12,
        'C2-Q005':(20*q(4,5)+30*q(6,5))/50,
        'C2-Q007':18*q(4,12),
        'C2-Q009':q(6,5)*q(6,4),
        'C2-Q011':q(4000,1000*10),
        'C2-Q013':13600*q(74,100)*q(981,100)/1000,
        'C2-Q015':1000*10*q(2,5)*q(1,5)**2/2,
        'C2-Q017':800*10*q(1,2)*sp.sin(sp.pi/6)/1000,
        'C2-Q019':4500/(10*q(1,2)),
        'C2-Q021':sp.Integer(7),
        'C2-Q022':25*q(6,2)**2,
        'C2-Q023':300*q(6,90),
        'C2-Q025':q(24,100)/8*100,
        'C2-Q027':12*q(5,10),
        'C2-Q029':150000*q(2,10000),
        'C2-Q031':1000*10*q(75,10**6),
        'C2-Q033':1000*10*q(200,10**6)-q(12,100)*10,
        'C2-Q036':1000*q(18,1000)-5,
        'C2-Q038':60+40*q(4,5),
        'C2-Q039':60/q(6,5),
        'C2-Q041':(9-5)*q(45,60),
        'C2-Q043':2*sp.sqrt((8*sp.pi/2)/sp.pi),
        'C2-Q044':36-q(840,60),
        'C2-Q046':q(85,100)*q(12,60),
        'C2-Q047':1/(2*q(1,2)),
        'C2-Q049':120/(q(2400,3*60)),
        'C2-Q050':6/q(20,100),
    }
def dimensional_crosschecks():
    si=pint.UnitRegistry(non_int_type=Fraction)
    q=si.Quantity
    return {
        'pressure':(q(45,'newton')/q(Fraction(15,1000),'meter**2')).to('kilopascal').magnitude,
        'density':(q(52,'gram')/q(50,'milliliter')).to('gram/milliliter').magnitude,
        'depth':(q(4000,'pascal')/(q(1000,'kg/meter**3')*q(10,'meter/second**2'))).to('meter').magnitude,
        'swept_volume':(q(12,'centimeter**2')*q(5,'millimeter')).to('milliliter').magnitude,
        'membrane_force':(q(150,'kilopascal')*q(2,'centimeter**2')).to('newton').magnitude,
        'buoyancy':(q(1000,'kg/meter**3')*q(10,'meter/second**2')*q(75,'centimeter**3')).to('newton').magnitude,
        'mass_flow':(q(Fraction(85,100),'kg/liter')*q(12,'liter/minute')).to('kg/second').magnitude,
        'area':(q(6,'milliliter/second')/q(Fraction(1,5),'centimeter/second')).to('centimeter**2').magnitude,
    }
def _finite_exact(value):
    if isinstance(value, (float, bool)):
        raise ValueError('exact finite real input required')
    try:
        value = sp.sympify(value,strict=True)
    except (TypeError, ValueError, sp.SympifyError) as error:
        raise ValueError('invalid exact input') from error
    if value.atoms(sp.Float) or value.free_symbols or value.is_number is not True or (value.is_real is not True) or (value.is_finite is not True):
        raise ValueError('exact finite real input required')
    return value
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=10 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return mapped_literal(option.removesuffix(suffix) if suffix else option)
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_NUMERIC_EXPRESSIONS:return sp.Rational(KNOWN_NUMERIC_EXPRESSIONS[raw])
    return parse_literal(raw)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded quantity literal required')
    units={' g/mL':('density',sp.Integer(1000)),' kg/m³':('density',sp.Integer(1)),' kg/m3':('density',sp.Integer(1)),' kPa':('pressure',sp.Integer(1000)),' Pa':('pressure',sp.Integer(1)),' N':('force',sp.Integer(1)),' m²':('area',sp.Integer(1)),' cm²':('area',sp.Rational(1,10000)),' cm³':('volume',sp.Rational(1,10**6)),' mL':('volume',sp.Rational(1,10**6)),' L':('volume',sp.Rational(1,1000)),' kg':('mass',sp.Integer(1)),' g':('mass',sp.Rational(1,1000)),' mL/s':('flow',sp.Rational(1,10**6)),' m':('length',sp.Integer(1)),' cm':('length',sp.Rational(1,100)),' s':('time',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda pair:-len(pair[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert sp.simplify((v['C2-Q041'])-sp.Rational('3'))==0
    assert sp.simplify((v['C2-Q043'])-sp.Rational('4'))==0
    assert sp.simplify((v['C2-Q044'])-sp.Rational('22'))==0
    assert sp.simplify((v['C2-Q046'])-sp.Rational('17/100'))==0
    assert sp.simplify((v['C2-Q049'])-sp.Rational('9'))==0
    assert sp.simplify((v['C2-Q050'])-sp.Rational('30'))==0
    assert sp.simplify((v['C2-Q047'])-sp.Rational('1'))==0
    assert d['pressure']==3 and d['density']==sp.Rational(26,25)
    return [v['C2-Q041'],'Perché la stessa portata richiede A v_media costante',v['C2-Q043'],v['C2-Q044'],'Il vettore velocità in ogni punto fissato resta costante nel tempo',v['C2-Q046'],'Resta uguale','Media',v['C2-Q049'],v['C2-Q050']]
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
    if tuple(e.text or '' for e in root.iter() if e.tag.endswith('text'))!=REQUIRED_SVG_TEXTS:
        raise ValueError('Independent physical scale or reviewed SVG quantity labels changed')
    if root.get('viewBox')!='0 0 640 1550':raise ValueError('Independent physical scale viewport changed')
    if {e.get('points') for e in root.iter() if e.tag.endswith('polygon')}!=REQUIRED_POLYGONS:raise ValueError('Independent physical scale prism geometry changed')
    accessible=tuple((e.tag.rsplit('}',1)[-1],e.text or '') for e in root.iter() if e.tag.rsplit('}',1)[-1] in ('title','desc'))
    if accessible!=REQUIRED_ACCESSIBLE_TEXTS:raise ValueError('Independent physical scale or reviewed SVG quantity labels changed in accessible title/desc')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c2-001-050-independent-models.py"
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append("Independent frozen model edition mismatch")
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"][-3:])-ORDINAL_OFFSET;source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c2_l005_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        context=EXPECTED_CONTEXT[row['id']]
        for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):
            if row.get(field)!=context.get(field) or type(row.get(field)) is not type(context.get(field)):errors.append('Individual Cric identity, context or protected exam mismatch: '+field)
        if row.get('baseVersion')!=source['version'] or row.get('version')!=source['version']+1 or type(row.get('baseVersion')) is not int or type(row.get('version')) is not int:errors.append('Individual Cric baseVersion or version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Independent reviewed course or actual lesson mapping mismatch')
        wanted=expected[number-1];value=row["answer"]["value"]
        if row["answer"]["type"]=="numeric" and type(value) is not int:
            errors.append("Independent numeric answer must preserve an exact integer JSON value")
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_source_prompt_only_pressure_density_mass_conservation_and_distinct_concepts",
            "Pint_pressure_density_mass_volume_dimensions_and_exact_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c2-001-050-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"e37686ebab9f1ac50919592f189ab8cf7f37184f"},"postReadNumericGuardHardening":"All constitutive, inverse, calibration and exact finite guard function bodies are identical to the actual pre-key snapshot from first version.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c2-001-050-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
    for field,value in [('baseVersion',0),('version',99),('exam',1),('family','invented-family'),('difficulty',99),('prerequisites',[])]:
        changed,links=deepcopy(package),deepcopy(bindings);row=changed['records'][0];row[field]=value;links[0]['candidateSha256']=digest(row);result=retoken(changed,links,row['id'])
        if result['ok'] or not any('Cric' in e for e in result['errors']):raise AssertionError('Cric per-item identity/context escaped hostile rebinding: '+field)
        cases.append({'case':'Cric_'+field+'_rebound_and_retokenized','id':row['id'],'rejectedBy':result['errors']})
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("C2.json","C1.json")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"][-3:])-ORDINAL_OFFSET in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"][-3:])-ORDINAL_OFFSET;wanted=oracle()[number-1]
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
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed['records']) if r['answer']['type']=='numeric')
    row=changed['records'][idx];row['answer']['value']=float(row['answer']['value'])
    links[idx]['candidateSha256']=digest(row);bad=retoken(changed,links,row['id'])
    if bad['ok'] or 'Independent numeric answer must preserve an exact integer JSON value' not in bad['errors']:
        raise AssertionError('Binary float numeric key accepted after all edition guards replaced')
    cases.append({'case':'numeric_JSON_binary_float_rebound_and_retokenized','id':bad['id'],'rejectedBy':bad['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    uploaded=next(a for a in changed['assets'] if a['name']==ASSET_NAME)
    raw=base64.b64decode(uploaded['data']);before,after=SVG_LABEL_MUTATION;assert before in raw;raw=raw.replace(before,after,1)
    previous=uploaded['id'];uploaded.update(id=sha(raw),data=base64.b64encode(raw).decode())
    for row,b in zip(changed['records'],links):
        for block in row['blocks']:
            if block.get('src')=='/asset/'+previous:block['src']='/asset/'+uploaded['id']
        if ASSET_NAME in b.get('assetChecksums',{}):b['assetChecksums'][ASSET_NAME]=uploaded['id']
        b['candidateSha256']=digest(row)
    with tempfile.TemporaryDirectory(prefix='independent-nuclear-label-mutation-') as directory:
        home=Path(directory)
        for a in changed['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
        tokens={r['id']:s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as error:
                if 'reviewed SVG quantity labels' not in str(error):raise
                cases.append({'case':'wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced','rejectedBy':str(error)})
            else:raise AssertionError('Wrong quantitative label accepted after hostile rebinding')
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
