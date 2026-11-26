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
CANDIDATE_REF='701f42eccce775559f0379a37071b22b36c91f33'
PRIMARY_SHA256='34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C2.json', 'sourceSha256': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23', 'primarySkill': 'C2-L004', 'title': 'Guardare il volume spostato', 'actualLessonPrerequisites': ['C2-L001', 'C2-L002']}
FAMILY='cric-c2-l004'
BATCH='cric-c2-l004'
ASSET_NAME='cric-c2-l004-progressive.svg'
REVIEWED_PACKAGE_SHA256='e50a3f30a93feaf8fea87ecffb3138772cabd21aacdd7d22edd898dcd72f1121'
REVIEWED_BINDINGS_SHA256='887dd9d3b9f34535dfe09203eb675968f74a91ce3ee64019dbd23e3db019ece9'
SOURCE_REFERENCE='Dieci problemi distinti Cric C2, con derivazioni individuali nella primaria prompt-only immutata e calcoli pre-key congelati; vedere le note per ID.'
FALSE_PROOF='La spinta è sempre uguale al peso del corpo immerso, anche quando lo tiene fermo un vincolo esterno.'
SVG_MUTATION=(b'width="260"', b'width="261"')
SVG_LABEL_MUTATION=(b'13 kg', b'14 kg')
EXPECTED_MAPPING={1: ('C2-L004', ['C2-L004']), 2: ('C2-L004', ['C2-L004']), 3: ('C2-L004', ['C2-L004']), 4: ('C2-L004', ['C2-L004']), 5: ('C2-L004', ['C2-L004']), 6: ('C2-L004', ['C2-L004']), 7: ('C2-L004', ['C2-L004']), 8: ('C2-L004', ['C2-L004']), 9: ('C2-L004', ['C2-L004']), 10: ('C2-L004', ['C2-L004'])}
NUMERIC_UNITS={6: 'kg', 8: 'g', 9: 'cm³'}
OPTION_SUFFIX={1: ' N', 3: ' N'}
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'meter**3', 5: 'newton', 6: 'kilogram', 7: 'newton', 8: 'gram', 9: 'centimeter**3', 10: 'meter**3'}
MANUAL=['La spinta valeρgV_spostato.75 cm³=75·10⁻⁶ m³, quindi massa d’acqua spostata 3/40 kg e spinta 3/4 N=0,75 N. La forma irregolare non altera il risultato per il volume completamente immerso.', 'Per un corpo rigido completamente immerso in liquido omogeneo incomprimibile, il volume spostato eρ non cambiano scendendo. La spintaρgV resta uguale, se g è uniforme; le pressioni assolute sulle singole facce aumentano ma la loro risultante non cresce.', 'La spinta sul volume 200 cm³ è 2 N e il peso è 0,12·10=1,2 N. Per la quiete completamente sott’acqua serve una forza esterna verso il basso di 2−1,2=0,8 N. La direzione assegnata è coerente con la densità media minore dell’acqua.', 'Galleggiando liberamente il peso è uguale alla spinta: V_imm=m/ρ. Lo stesso corpo ha dunque volume immerso maggiore nel liquido meno denso, l’olio, purché il volume disponibile basti a sostenerlo come esplicitamente dato.', 'Densità del corpo uguale a quella del liquido implica peso uguale a spinta per immersione completa. Il galleggiamento è neutro o indifferente: la quiete non seleziona una quota in un liquido omogeneo, trascurando altre interazioni.', 'Il volume massimo spostabile sostiene massa totaleρV=1000·0,018=18 kg. Tolgo i 5 kg del pontone: massa aggiuntiva massima 13 kg. È il limite teorico al livello assegnato, non una portata operativa con margini di sicurezza.', 'Uguale volume immerso nello stesso liquido dà la stessa spinta. Ogni dinamometro dall’alto misura T=mg−B, positivo perché entrambi affonderebbero liberi. L’oggetto più pesante produce lettura maggiore; la differenza delle tensioni è la differenza dei pesi, non una differenza di spinta.', 'Senza altre forze e trascurando tensione interfacciale, la quiete richiede m=ρ_acqua V_acqua+ρ_olio V_olio. In grammi: 60·1+40·(4/5)=92 g. La densità media 0,92 g/cm³ è fra 0,8 e 1, compatibile col sostegno all’interfaccia stabile acqua sotto olio. Il modello deve dichiarare trascurabili le forze capillari se serve una massa univoca.', 'Per galleggiamento liberoρV= m. V=60/(6/5)=50 cm³, con unità grammi e centimetri cubici coerenti. Non serve g, che si cancella fra peso e spinta.', 'La ciotola trattiene un volume d’aria e può spostare molta acqua rispetto alla propria massa, così la densità media del corpo più volume racchiuso è minore di quella dell’acqua. La pallina compatta ha densità del metallo maggiore dell’acqua e spinta insufficiente al suo peso. Conta il volume esterno immerso, non il solo volume di metallo.']
DISTRACTORS=['7,5 e 0,075 N sbagliano fattore 10; 75 e 750 N richiederebbero 7500/75000 cm³ di acqua, non 75. La massa del corpo non serve per la spinta a volume noto.', 'Pressione locale maggiore non cambia la risultante su volume chiuso rigido. Nessuna necessità di aria; pressione e spinta hanno unità diverse.', '2 N è spinta e 1,2 N peso,3,2 N somma forze opposte; −0,80 N non è un modulo, con verso già dichiarato.', 'Stesso peso impone stessa spinta, non uguali volumi se cambia densità; non è necessaria immersione totale e due liquidi possono entrambi sostenere il corpo.', 'Peso e spinta non sono nulli, ma uguali. Nel modello rigido omogeneo non nasce né richiamo né instabilità verticale dopo piccolo spostamento.', '18 kg include il pontone; 23 somma la sua massa invece di sottrarla; 5 copia il pontone; 130 copia il peso numerico inN per g 10 senza conservare unità.', 'Volumi uguali danno spinta uguale, non tensione. Maggiore massa non cambia la spinta a volume fisso; il peso completo ignora spinta, zero è incompatibile con affondamento libero.', '100 g usa tutta acqua,80 g tutto olio,90 g media semplice su volumi disuguali,28 g sottrae due contributi entrambi verso l’alto.', '72 è coefficiente di massa per densità, dimensione non volumetrica; 60 cm³ userebbeρ1 anziché 1,2; 0,05 e 50000 cm³ errano fattori 1000.', 'Forma non cambia densità intrinseca del metallo; anche la pallina riceve spinta verso l’alto. Cavità non basta se entra acqua o se il carico supera la capacità geometrica.']
ASSUMPTIONS=['Volume rigido completamente immerso 75 cm³, acquaρ1000 kg/m³, g 10, situazione idrostatica senza contatti o capillarità.', 'Sfera rigida totalmente immersa, densità uniforme e g costante, spostata in profondità senza cambiare volume e senza pareti vicine.', 'Galleggiante rigido 0,12 kg e 200 cm³, interamente in acquaρ1000, g 10; equilibrio con peso, spinta e forza esterna verso il basso.', 'Stesso cubetto libero galleggia in entrambi i liquidi; olio meno denso, geometria/massa invariate, aria e capillarità trascurate.', 'Sfera omogenea rigida alla stessa densità del liquido uniforme, immersione totale e assenza di vincoli; stabilità solo per traslazione verticale.', 'Pontone 5 kg, volume massimo ammesso 0,018 m³ in acquaρ1000, carico aggiuntivo al limite geometrico; equilibrio libero.', 'Uguale volume immerso, masse m₂>m₁, due corpi che affonderebbero; dinamometri dall’alto in equilibrio, tensioni positive.', 'Due liquidi immiscibili stabili, acqua sotto olio, densità 1 e 0,8 g/cm³, volumi esclusi 60/40 cm³; corpo libero senza capillarità.', 'Galleggiante 60 g libero in liquidoρ1,20 g/cm³; volume immerso richiesto, non volume totale né parte emersa.', 'Ciotola aperta asciutta con bordo emerso, pallina compatta dello stesso metallo; volume esterno escluso rispetto a massa totale, aria e capillarità trascurate.']
PEDAGOGY=['Volume immerso convertito prima del peso del liquido equivalente; vecchia attribuzione dei distrattori ricalcolata e corretta prima freeze.', 'Aumento comune delle pressioni distinto dalla loro risultante.', 'Diagramma di tre forze e modulo della forza esterna.', 'Peso comune confrontato con densità del fluido, non con volume totale.', 'Equilibrio neutro verticale distinto da assenza di forze.', 'Massa utile aggiuntiva distinta dalla massa totale sostenibile.', 'Sottrazione di due equilibri per cancellare spinta comune.', 'Due volumi e densità sommati nella stratificazione stabile.', 'Inversa della densità con unità coerenti senza inventare volume emerso.', 'Interno asciutto e bordo emerso fanno parte dell’ipotesi geometrica.']
EXPECTED_IDS={'C2-Q034', 'C2-Q035', 'C2-Q039', 'C2-Q032', 'C2-Q038', 'C2-Q033', 'C2-Q036', 'C2-Q040', 'C2-Q037', 'C2-Q031'}
REVIEWED_CANDIDATES={'C2-Q031': '1a175ca58657369aa248162c85339eaae6217e3e61513c669a52fa65172ceb75', 'C2-Q032': '0417d6a7dc287dbe22f8c1125e48bce931662fa7d2be4a2e8a5b45e3c1f98199', 'C2-Q033': 'f19624cc0332cdf4a4b2671bca5bdc88036a277198fe6e7d8a08ca5e2bf452dd', 'C2-Q034': '7d7255b094d4ea3e710d40b4dbbbd3409eee0a0fee774929272a7e705267447b', 'C2-Q035': '74d57d7d0cfa95ddcd2ddf4f5bda0c63544ebe3eb59d25092d3646a89cae8703', 'C2-Q036': 'c9ad770e94c975b6dd16cdbf6bddbc16a97e9796e360894822e6f268f2a11df0', 'C2-Q037': '881382550f38077cd4c8736bf5d53f01d6806d9ddbcf92891e9261a9ec296b6f', 'C2-Q038': '42f2898eb9167dfc9e1004074af3a503fe4455f3c78ec6a01d2b42a90041877c', 'C2-Q039': 'f244e54e0815a8b30183299b79e76e5009142e9b38b859046bd0dca728c438e8', 'C2-Q040': 'b8f8c09ea1326ffd7cef9d400b114ee07c25205c8886dbfc2ec7fa4b882f4b4e'}
REQUIRED_RECTS={(Fraction(145, 1), Fraction(680, 1), Fraction(260, 1), Fraction(45, 1)), (Fraction(145, 1), Fraction(750, 1), Fraction(360, 1), Fraction(45, 1)), (Fraction(145, 1), Fraction(610, 1), Fraction(100, 1), Fraction(45, 1)), (Fraction(145, 1), Fraction(1255, 1), Fraction(368, 1), Fraction(45, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1460, 1)), (Fraction(145, 1), Fraction(1075, 1), Fraction(240, 1), Fraction(45, 1)), (Fraction(145, 1), Fraction(1165, 1), Fraction(128, 1), Fraction(45, 1))}
REQUIRED_PATHS={'m498 252 12 18 12-18', 'M32 525H608', 'm323 292 12 18 12-18', 'm138 208 12-18 12 18', 'M335 190V310', 'M510 190V270', 'M32 950H608', 'M150 390V190'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Spinta, vincoli e massa sostenuta', '1. Confrontare i tre vettori verticali', 'Frecce traslate, non punti di applicazione', 'S = 2 N', 'P = 1,2 N', 'F = 0,8 N', 'S − P − F = 0', '2. Pontone: limite di 18 kg totali', '5 kg', 'pontone', '13 kg', 'carico', '18 kg', '5 kg + 13 kg = 18 kg', 'Masse, non forze: stessa scala', '3. Due volumi di liquido esclusi', '60 g', 'acqua', '32 g', 'olio', '92 g', '60 g + 32 g = 92 g', 'La massa del corpo equilibra i due contributi')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Bilanci di spinta e massa'), ('desc', 'Tre confronti distinti: vettori verticali traslati di spinta due newton, peso 1,2 newton e forza esterna 0,8 newton con scala comune; masse cinque e tredici chilogrammi per il pontone; sessanta e trentadue grammi nei due liquidi.'))
GEOMETRY_REVIEW='XML e nuovo PNG indipendente 640×1460 letti interamente. Tre vettori traslati, non punti di applicazione: spinta 2 N lunga 200, peso 1,2 N lungo 120, forza 0,8 N lunga 80, scala comune 100 coordinate/N e 200=120+80; versi corretti. Barre pontone 100/260/360 per 5/13/18 kg, scala 20 coordinate/kg. Barre due liquidi 240/128/368 per 60/32/92 g, scala 4 coordinate/g. Massa distinta da forza; testi e frecce visibili per intero, nessuna sovrapposizione residua.'
DECIMAL_REGRESSION_NUMBER=1
EXPECTED_CONTEXT={'C2-Q031': {'id': 'C2-Q031', 'kind': 'question', 'course': 'C2', 'order': 31, 'skill': 'C2-L004', 'family': 'un-volume-totalmente-immerso', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q032': {'id': 'C2-Q032', 'kind': 'question', 'course': 'C2', 'order': 32, 'skill': 'C2-L004', 'family': 'scendere-piu-in-profondita', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q033': {'id': 'C2-Q033', 'kind': 'question', 'course': 'C2', 'order': 33, 'skill': 'C2-L004', 'family': 'tenere-un-galleggiante-sommerso', 'difficulty': 3, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q034': {'id': 'C2-Q034', 'kind': 'question', 'course': 'C2', 'order': 34, 'skill': 'C2-L004', 'family': 'un-cubetto-fra-acqua-e-olio', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q035': {'id': 'C2-Q035', 'kind': 'question', 'course': 'C2', 'order': 35, 'skill': 'C2-L004', 'family': 'sospensione-senza-appoggio', 'difficulty': 1, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q036': {'id': 'C2-Q036', 'kind': 'question', 'course': 'C2', 'order': 36, 'skill': 'C2-L004', 'family': 'portata-di-carico-di-un-pontone', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q037': {'id': 'C2-Q037', 'kind': 'question', 'course': 'C2', 'order': 37, 'skill': 'C2-L004', 'family': 'due-solidi-dello-stesso-volume', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 2}, 'C2-Q038': {'id': 'C2-Q038', 'kind': 'question', 'course': 'C2', 'order': 38, 'skill': 'C2-L004', 'family': 'galleggiamento-alla-superficie-di-due-liquidi', 'difficulty': 3, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q039': {'id': 'C2-Q039', 'kind': 'question', 'course': 'C2', 'order': 39, 'skill': 'C2-L004', 'family': 'un-areometro-sale-di-poco', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}, 'C2-Q040': {'id': 'C2-Q040', 'kind': 'question', 'course': 'C2', 'order': 40, 'skill': 'C2-L004', 'family': 'una-ciotola-pesante-galleggia', 'difficulty': 2, 'prerequisites': ['C2-L004'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
ORDINAL_OFFSET=30

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
    assert sp.simplify((v['C2-Q031'])-sp.Rational('3/4'))==0
    assert sp.simplify((v['C2-Q033'])-sp.Rational('4/5'))==0
    assert sp.simplify((v['C2-Q036'])-sp.Rational('13'))==0
    assert sp.simplify((v['C2-Q038'])-sp.Rational('92'))==0
    assert sp.simplify((v['C2-Q039'])-sp.Rational('50'))==0
    assert d['pressure']==3 and d['density']==sp.Rational(26,25)
    return [v['C2-Q031'],'Resta uguale',v['C2-Q033'],'Nell’olio, perché la densità del liquido è minore','Neutro',v['C2-Q036'],'Il più massiccio dà una tensione maggiore; la spinta sui due è uguale',v['C2-Q038'],v['C2-Q039'],'La ciotola può escludere abbastanza acqua grazie al volume esterno, rispetto alla sua massa totale']
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
    if root.get('viewBox')!='0 0 640 1460':raise ValueError('Independent physical scale viewport changed')
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c2_l004_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
