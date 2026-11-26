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
CANDIDATE_REF='83b8639f9f0796f680c2266f1f8b5a6fbbf1f440'
PRIMARY_SHA256='34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C2.json', 'sourceSha256': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23', 'primarySkill': 'C2-L002', 'title': 'Leggere una colonna di liquido', 'actualLessonPrerequisites': ['C2-L001']}
FAMILY='cric-c2-l002'
BATCH='cric-c2-l002'
ASSET_NAME='cric-c2-l002-progressive.svg'
REVIEWED_PACKAGE_SHA256='12a70d8345963b5b5f6cf020fa8ce4bf78bdff8f1b644536db132447dc0ad981'
REVIEWED_BINDINGS_SHA256='31debf7e4d834a45c32bbcfb5e21c4458452e1fb5a249bbb19f06bd834a0115d'
SOURCE_REFERENCE='Dieci problemi distinti Cric C2, con derivazioni individuali nella primaria prompt-only immutata e calcoli pre-key congelati; vedere le note per ID.'
FALSE_PROOF='La pressione di un liquido fermo è identica a ogni profondità, quindi la profondità richiesta dipende soltanto dalla forma del recipiente.'
SVG_MUTATION=(b'450 390H150Z', b'451 390H150Z')
SVG_LABEL_MUTATION=(b'4,5', b'4,6')
EXPECTED_MAPPING={1: ('C2-L002', ['C2-L002']), 2: ('C2-L002', ['C2-L002']), 3: ('C2-L002', ['C2-L002']), 4: ('C2-L002', ['C2-L002']), 5: ('C2-L002', ['C2-L002']), 6: ('C2-L002', ['C2-L002']), 7: ('C2-L002', ['C2-L002']), 8: ('C2-L002', ['C2-L002']), 9: ('C2-L002', ['C2-L002']), 10: ('C2-L002', ['C2-L002'])}
NUMERIC_UNITS={5: 'N', 7: 'Pa', 9: 'kg/m³'}
OPTION_SUFFIX={1: ' m', 3: ' kPa'}
UNITS={1: 'meter', 2: 'meter', 3: 'kilopascal', 4: 'pascal', 5: 'newton', 6: 'meter', 7: 'pascal', 8: 'pascal', 9: 'kilogram/meter**3', 10: 'meter'}
MANUAL=['Dall’incremento idrostatico Δp=ρgh isolo h=4000/(1000·10)=2/5 m=0,40 m. Conta la differenza rispetto alla superficie, quindi non serve assegnare p superficiale.', 'Stesso liquido collegato in quiete e uguale pressione atmosferica sulle superfici libere: alla stessa quota la pressione deve essere uguale. Trascurando capillarità, le superfici hanno la stessa quota, indipendentemente dalle larghezze.', 'Con pressione superiore trascurabile p_atm=ρgh=13600·(74/100)·(981/100) Pa=98727,84 Pa=98,72784 kPa. Una stima coerente è circa 99 kPa, oppure 98,7 kPa a tre cifre. Il prodotto può essere eseguito con interi, senza introdurre una diversa altezza o omettere la pressione sopra la colonna. Il verificatore mantiene il prodotto razionale 617049/6250 kPa e controlla l’arrotondamento al decimo con confronti esatti, senza usare float.', 'Risale di h significa aumento di quota: in un liquido omogeneo Δp=−ρgh. La pressione diminuisce, restando distinta dal modulo positivo della differenza; la legge richiede densità e g costanti sul tratto o l’integrale appropriato.', 'Le pressioni atmosferiche sui due lati si cancellano. La sovrapressione cresce linearmente da 0 al bordo alto aρgH al bordo basso; la media èρgH/2=1000 Pa. Area 0,40·0,20=0,08 m², forza netta 80 N. Equivale all’integrale ρgbH²/2.', 'Nella legge idrostatica entra il dislivello verticale fra le interfacce, non la lunghezza lungo il tubo inclinato. Se il tubo forma α con l’orizzontale, h=L sinα.', 'Il dislivello verticale è 0,50 sin 30°=0,25 m. Quindi |Δp|=800·10·0,25=2000 Pa=2 kPa. Usare 0,50 m come h raddoppierebbe impropriamente il risultato. La nuova risposta è in pascal: 2 kPa=2000 Pa, con conversione esatta del coefficiente del modello pre-key.', 'A stessa profondità nello stesso liquido, ciascuna pressione è p_s+ρgh. La pressione del gas superficiale maggiore si ritrova come uguale differenza positiva fra le pressioni al fondo; le due pressioni di fondo non sono uguali per il solo h uguale.', 'La pendenza Δp/Δh èρg. Con 4500 Pa in 0,50 m ricavoρ=4500/(10·0,50)=900 kg/m³. La pressione superficiale influenza l’intercetta, non questa pendenza.', 'Con gas residuo p_atm=p_gas+ρgh. A p_atm eρg uguali, h=(p_atm−p_gas)/(ρg) è minore dell’altezza con vuoto superiore. Non si aggiunge p_gas alla colonna disponibile.']
DISTRACTORS=['4 m e 0,04 m cambiano fattore 10; 40 m e 400 m darebbero 400 e 4000 kPa.4 Pa invece di 4 kPa produrrebbe 0,0004 m.', 'Aree e volumi non sostituiscono l’uguaglianza di pressione alla base; un dislivello non capillare produrrebbe un flusso prima dell’equilibrio.', '9,87 e 987 kPa spostano una potenza 10; 100,6 deriva da g 10 anziché 9,81; 0,740 copia altezza numerica senzaρg. Il valore esatto 98,72784 cade nell’intervallo che arrotonda a 98,7 kPa.', '+ρgh descrive il verso opposto; zero richiede h 0; ρg/h eρgh² hanno dimensioni diverse da pressione.', '160 N usa pressione massima uniforme; zero considera il solo bordo alto; 800 N introduce fattore 10; 2000 N copia il numero dei pascal senza area.', 'Tutta la lunghezza è altezza solo per tubo verticale; proiezione orizzontale, diametro e loro somme non sono dislivello lungo gravità.', '4000 Pa omette sin 30°; 1000 Pa applica due volte 1/2; 20 Pa perde fattore 100; 800 Pa copia il coefficiente della densità senza g h.', 'Uguale h dà uguali incrementi, non uguale pressione assoluta con riferimenti diversi; aggiungere stessoρgh non conserva in generale un rapporto.', '9000 non divide per g; 450 non divide per 0,50 m; 0,9 interpreta kPa comePa; 2250 kg/m³ darebbe 11250 Pa, non 4500.', 'Sommare p_g all’atmosfera inverte il suo ruolo superiore; altezza non uguale né raddoppiata universalmente; dominio 0<p_g<p_atm esclude altezze negative.']
ASSUMPTIONS=['Acqua omogenea fermaρ1000 kg/m³, g 10 m/s²; incremento 4 kPa rispetto alla superficie, non pressione assoluta.', 'Stesso liquido connesso in quiete, due recipienti aperti alla stessa atmosfera, capillarità esclusa.', 'Mercurioρ13600 kg/m³, colonna 0,740 m, pressione superiore trascurabile, g 9,81 m/s²; risposta proposta arrotondata a 0,1 kPa dopo prodotto esatto.', 'Quota crescente di h>0, densità e g uniformi; variazione finale meno iniziale, non modulo della diminuzione.', 'Sportello verticale b 0,40 m, H 0,20 m; superficie d’acqua al bordo superiore, stessa atmosfera sull’altro lato, ρ1000, g 10.', 'Due livelli in liquido fermo, densità costante e capillarità trascurata; dislivello verticale, non lunghezza obliqua.', 'Lunghezza obliqua 0,50 m a 30° dall’orizzontale, densità 800, g 10; si chiede modulo inPa, non il segno orientato.', 'Recipienti separati, stesso liquido modellato con densità uniforme comune, stessa profondità e g, pressioni dei gas superiori diverse.', 'Incremento 4500 Pa per 0,50 m di profondità, g 10 m/s², densità uniforme; pendenza, non intercetta.', 'Stesso barometro e atmosfera, gas superiore con 0<p_g<p_atm, ρ e g invariati; colonna positiva confrontata col vuoto superiore.']
PEDAGOGY=['Inversa della differenza idrostatica senza aggiungere atmosfera.', 'Pressioni alla stessa quota prima del confronto dei livelli.', 'Prodotto intero manuale e arrotondamento finale controllato con limiti esatti.', 'Verso della quota prima del segno della pressione.', 'Integrale lineare o media triangolare, senza assegnare erroneamente la posizione della risultante.', 'Proiezione verticale distinta dalla forma del tubo.', 'Seno notevole esatto e modulo esplicito.', 'Differenze e rapporti di pressioni distinti.', 'Pendenza depurata dall’intercetta prima di dividere per g.', 'Dominio del gas residuo esplicito prima di confrontare altezze.']
EXPECTED_IDS={'C2-Q013', 'C2-Q019', 'C2-Q015', 'C2-Q016', 'C2-Q014', 'C2-Q017', 'C2-Q012', 'C2-Q018', 'C2-Q020', 'C2-Q011'}
REVIEWED_CANDIDATES={'C2-Q011': '24b821333fc219518d1d66bb0b6f13c13c4328b08dfe1a5635807bc2ddbcc61f', 'C2-Q012': '96dd1e45eb58fd80f1dbc70400ac78c304fe387efafb25b82f5f8f89f8411a0f', 'C2-Q013': '7f821a6ebdcffc70b8f9d2800138aade7662eebf77a09bb1192e05edece11af4', 'C2-Q014': '5b5801cebc0fa5259781fd9bcf08b81a5f865b6ed853a27ab4ff119689e14c94', 'C2-Q015': '68917da94cd861d98e22dc83e36ea177e5426135567edaa97558cab03743cc75', 'C2-Q016': '738fb35fcc0bb2d4cbe4c329a063ea9b3804bace1010b733f11ac11dc998a992', 'C2-Q017': 'ffbc275777336cdff98d9177188cb54da3cd8c239b78d96187b3c15279100a68', 'C2-Q018': 'b23e73dd3f45b8335bba4744987c53d8344e8ac01dbfb2c3586837953c79a34c', 'C2-Q019': 'ca3e98cbd7f45c45e1a8196640ef5c359a6f9925a039b537ae8b170c2bca5e5a', 'C2-Q020': 'bcfde8efaa0cade5678f441d108879955de4d8c4dda6f70fd94e4c5b6e5692bc'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1490, 1))}
REQUIRED_PATHS={'M140 1370H555M140 1370V1110', 'M150 180H510M150 180V410', 'M32 990H608', 'M140 1370 500 1130', 'M140 850H486.4101615V650Z', 'M140 850H240M240 850 A100 100 0 0 0 226.60254 800', 'M500 1370V1130H140', 'M32 520H608', 'M150 180 450 390H150Z'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Leggere la profondità', '1. Sportello: H = 0,20 m, b = 0,40 m', 'Sovrapressione Δp (Pa)', '0', '2000', '0,20 m', 'Δp media = 1000 Pa', 'F = 1000 Pa · 0,08 m² = 80 N', '2. Inclinazione e proiezione', 's = 0,50 m', '30°', 'h =', '0,25 m', 'h = s sin30° = s / 2', '|Δp| = 2000 Pa', '3. Densità dalla pendenza', 'Δp (kPa)', '0', '4,5', '0,50', 'Δh (m)', 'ρ = 900 kg/m³')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Tre letture idrostatiche'), ('desc', 'Profilo triangolare della sovrapressione sullo sportello da zero a duemila pascal; proiezione verticale di un tratto lungo mezzo metro a trenta gradi; incremento di pressione 4,5 kilopascal in mezzo metro di profondità.'))
GEOMETRY_REVIEW='XML finale e nuovo PNG indipendente 640×1490 letti integralmente. Primo profilo: pressione da 0 a 2000 Pa in 300 coordinate, profondità 0,20 m in 210 coordinate; media 1000 Pa su area 0,08 m² dà 80 N. Non è localizzata la risultante al punto medio. Manometro: triangolo con cateti 346,4101615 e 200, ipotenusa 400 per 0,50 m; verticale 200 per 0,25 m. Arco corretto centrato(140,850), raggio 100, inizio(240,850), fine(226,60254,800), angolo 30°. Terzo grafico: 360 coordinate per 0,50 m e 240 per 4,5 kPa, pendenza 9 kPa/m, densità 900 kg/m³. Vecchio arco negativo preservato; nessun taglio o contatto residuo.'
DECIMAL_REGRESSION_NUMBER=1
EXPECTED_CONTEXT={'C2-Q011': {'id': 'C2-Q011', 'kind': 'question', 'course': 'C2', 'order': 11, 'skill': 'C2-L002', 'family': 'un-livello-sotto-la-superficie', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 2}, 'C2-Q012': {'id': 'C2-Q012', 'kind': 'question', 'course': 'C2', 'order': 12, 'skill': 'C2-L002', 'family': 'due-recipienti-comunicanti', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q013': {'id': 'C2-Q013', 'kind': 'question', 'course': 'C2', 'order': 13, 'skill': 'C2-L002', 'family': 'la-colonna-di-mercurio', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q014': {'id': 'C2-Q014', 'kind': 'question', 'course': 'C2', 'order': 14, 'skill': 'C2-L002', 'family': 'risalire-lungo-un-tubo', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 2}, 'C2-Q015': {'id': 'C2-Q015', 'kind': 'question', 'course': 'C2', 'order': 15, 'skill': 'C2-L002', 'family': 'una-parete-verticale-rettangolare', 'difficulty': 3, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 2}, 'C2-Q016': {'id': 'C2-Q016', 'kind': 'question', 'course': 'C2', 'order': 16, 'skill': 'C2-L002', 'family': 'lasse-da-misurare', 'difficulty': 1, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q017': {'id': 'C2-Q017', 'kind': 'question', 'course': 'C2', 'order': 17, 'skill': 'C2-L002', 'family': 'un-manometro-inclinato', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q018': {'id': 'C2-Q018', 'kind': 'question', 'course': 'C2', 'order': 18, 'skill': 'C2-L002', 'family': 'stesso-livello-gas-differenti', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q019': {'id': 'C2-Q019', 'kind': 'question', 'course': 'C2', 'order': 19, 'skill': 'C2-L002', 'family': 'riconoscere-il-liquido-dalla-pendenza', 'difficulty': 2, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}, 'C2-Q020': {'id': 'C2-Q020', 'kind': 'question', 'course': 'C2', 'order': 20, 'skill': 'C2-L002', 'family': 'il-quasi-vuoto-nel-barometro', 'difficulty': 3, 'prerequisites': ['C2-L002'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
ORDINAL_OFFSET=10

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
    if number==3:
        if not option.startswith('Circa '):raise ValueError('Reviewed approximate display prefix absent')
        option=option.removeprefix('Circa ')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return mapped_literal(option.removesuffix(suffix) if suffix else option)
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_NUMERIC_EXPRESSIONS:return sp.Rational(KNOWN_NUMERIC_EXPRESSIONS[raw])
    return parse_literal(raw)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded quantity literal required')
    approximate=option.startswith('Circa ')
    if approximate:option=option.removeprefix('Circa ')
    units={' g/mL':('density',sp.Integer(1000)),' kg/m³':('density',sp.Integer(1)),' kg/m3':('density',sp.Integer(1)),' kPa':('pressure',sp.Integer(1000)),' Pa':('pressure',sp.Integer(1)),' N':('force',sp.Integer(1)),' m²':('area',sp.Integer(1)),' cm²':('area',sp.Rational(1,10000)),' cm³':('volume',sp.Rational(1,10**6)),' mL':('volume',sp.Rational(1,10**6)),' L':('volume',sp.Rational(1,1000)),' kg':('mass',sp.Integer(1)),' g':('mass',sp.Rational(1,1000)),' mL/s':('flow',sp.Rational(1,10**6)),' m':('length',sp.Integer(1)),' cm':('length',sp.Rational(1,100)),' s':('time',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda pair:-len(pair[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return ('approximate '+dimension if approximate else dimension),sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert sp.simplify((v['C2-Q011'])-sp.Rational('2/5'))==0
    assert sp.simplify((sp.floor(10*v['C2-Q013']+sp.Rational(1,2))/10)-sp.Rational('987/10'))==0
    assert sp.simplify((v['C2-Q015'])-sp.Rational('80'))==0
    assert sp.simplify((1000*v['C2-Q017'])-sp.Rational('2000'))==0
    assert sp.simplify((v['C2-Q019'])-sp.Rational('900'))==0
    assert v['C2-Q013']==sp.Rational('617049/6250')
    assert d['pressure']==3 and d['density']==sp.Rational(26,25)
    return [v['C2-Q011'],'Alla stessa quota',sp.floor(10*v['C2-Q013']+sp.Rational(1,2))/10,'−ρgh',v['C2-Q015'],'Il dislivello verticale fra i livelli',1000*v['C2-Q017'],'La prima è maggiore della stessa differenza fra le pressioni dei gas',v['C2-Q019'],'Diminuisce, perché la colonna equilibra soltanto p_atm−p_g']
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
    if root.get('viewBox')!='0 0 640 1490':raise ValueError('Independent physical scale viewport changed')
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c2_l002_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
    for record in records:
        if record['id']=='C2-Q013':record.update(exactUnderlyingPressureKPa=str(source_only_predictions()['C2-Q013']),displayRoundingRule='nearest tenth kPa via exact floor(10p+1/2)/10')
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
