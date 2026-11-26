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
CANDIDATE_REF='b2115d947dbd12a419a8b0c128584f121d4dd341'
PRIMARY_SHA256='34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C2.json', 'sourceSha256': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23', 'primarySkill': 'C2-L003', 'title': 'Trasmettere una pressione', 'actualLessonPrerequisites': ['C2-L001', 'C2-L002']}
FAMILY='cric-c2-l003'
BATCH='cric-c2-l003'
ASSET_NAME='cric-c2-l003-progressive.svg'
REVIEWED_PACKAGE_SHA256='9d354916aa761cfbf95d770fd837807b9050e2663aae400576f79e73ee2a6929'
REVIEWED_BINDINGS_SHA256='659007dd7178d7b14222edc10ef55f73210a93dfdb03356738b1d1b9fc3db56f'
SOURCE_REFERENCE='Dieci problemi distinti Cric C2, con derivazioni individuali nella primaria prompt-only immutata e calcoli pre-key congelati; vedere le note per ID.'
FALSE_PROOF='Nel circuito idraulico le forze e le corse sono sempre uguali anche quando le aree sono differenti.'
SVG_MUTATION=(b'width="270"', b'width="271"')
SVG_LABEL_MUTATION=(b'225 N', b'226 N')
EXPECTED_MAPPING={1: ('C2-L003', ['C2-L003']), 2: ('C2-L003', ['C2-L003']), 3: ('C2-L003', ['C2-L003']), 4: ('C2-L003', ['C2-L003']), 5: ('C2-L003', ['C2-L003']), 6: ('C2-L003', ['C2-L003']), 7: ('C2-L003', ['C2-L003']), 8: ('C2-L003', ['C2-L003']), 9: ('C2-L003', ['C2-L003']), 10: ('C2-L003', ['C2-L003'])}
NUMERIC_UNITS={2: 'N', 3: 'N', 5: 'cm', 7: 'mL', 9: 'N'}
OPTION_SUFFIX={}
UNITS={1: 'kilopascal', 2: 'newton', 3: 'newton', 4: 'meter**3', 5: 'centimeter', 6: 'pascal', 7: 'milliliter', 8: 'joule', 9: 'newton', 10: 'pascal'}
MANUAL=['A geometria, quote e densità invariati, p(z)=p_riferimento+termine idrostatico. Un incremento7 kPa trasmesso nel liquido confinato aumenta anche di7 kPa la pressione nel punto inferiore, mantenendo la differenza idrostatica fra quote.', 'Le aree sono proporzionali ai quadrati dei diametri. A_grande/A_piccola=(6/2)²=9, quindi F_grande=25·9=225 N, a pari quota e con lo stesso riferimento di pressione sulle facce esterne. È una relazione di equilibrio istantaneo, non da sola un bilancio di lavori su corse finite.', 'A pari quota p=F/A, dunque F_piccola=300·6/90=20 N. I centimetri quadrati si cancellano nel rapporto. Il modello ideale trascura pesi dei pistoni o li considera già inclusi nelle forze assegnate.', 'Quando una bolla si comprime, parte del volume spinto dal primo pistone riduce il volume del gas. La relazione semplice A₁Δx₁=A₂Δx₂ non vale durante quella fase: occorre includere la variazione di volume della bolla, con segni coerenti. Non viene meno la conservazione della massa.', 'Per liquido incomprimibile senza perdite o accumuli, A₁s₁=A₂s₂. Con rapporto8 e corsa piccola0,24 m, s₂=0,24/8=0,03 m=3 cm. Non si deduce da questa sola continuità l’uguaglianza dei lavori finiti se cambiano le quote.', 'Il principio è quello di Pascal: un incremento di pressione applicato a un fluido confinato viene trasmesso, nel modello statico appropriato, senza aggiungere la stessa forza su aree diverse. Pressione e forza vanno distinte.', 'Cinque millimetri sono mezzo centimetro. ΔV=12 cm²·(1/2 cm)=6 cm³=6 mL. La conversione della corsa va fatta prima di moltiplicare per l’area.', 'La differenza fra lavoro fornito e utile può aumentare l’energia interna delle parti e del fluido per attrito, ed eventualmente essere trasferita come calore. Un dispositivo reale non trasforma automaticamente tutta l’energia fornita in lavoro sul carico; il sistema va definito per il bilancio.', 'La forza netta sulla membrana èΔp A. Area2 cm²=2·10⁻⁴ m² eΔp150 kPa=150000 Pa: F=30 N. La pressione atmosferica comune è già eliminata dalla sovrapressione; non va aggiunta di nuovo.', 'In un liquido fermo collegato, alla stessa quota la pressione è uguale; con identico riferimento i manometri mostrano la stessa lettura. Aree diverse dei pistoni richiedono eventualmente forze diverse, non pressioni diverse a pari quota.']
DISTRACTORS=['Forza,peso e volume non aumentano di kPa. Il termine idrostatico fra quote resta costante;è la pressione di entrambi i punti ad aumentare.', '75N usa diametri senza quadrato;25N uguaglia forze anziché pressione;25/9N inverte il rapporto;675N usa la potenza cubica3³.', '4500N inverte aree;300N ignora la differenza;50N divide per6 senza usare90;1800N moltiplica per6 invece del rapporto completo.', 'La massa si conserva anche comprimendo gas. Definizioni di pressione e massa/volume non cambiano;non scompare la pressione. Serve il termine positivoδV_b nel bilancio dei volumi spinti.', '192cm moltiplica per8 e richiederebbe64volte il volume disponibile;24cm ignora il rapporto aree;0,03cm non converte metri;0,3cm perde un fattore10.', 'Archimede è spinta;Torricelli barometro oefflusso;Bernoulli energia di corrente;Hooke elasticità. Nessuno è il principio di trasmissione dell’incremento assegnato.', '60mL interpreta5mm come5cm;0,6mL introduce un fattore10opposto;24è coefficiente di area/corsa con dimensione errata;12copia il coefficiente di area senza una lunghezza.', 'L’energia non scompare né crea lavoro extra;attrito non implica fuga di massa. Il bilancio dei volumi continua a vincolare le corse,non le rende uguali.', '300000N non converte area;0,03N usa150Pa anziché150kPa;75 non ricostruisceΔpA;150N copia il coefficiente in kPa come newton.', 'Rapporto aree vale per forze,non pressioni alla stessa quota;quiete non significa pressione relativa nulla. Pascal misura pressione e non forza.']
ASSUMPTIONS=['Liquido confinato fermo,densità e quote invariate,incremento7kPa imposto in un punto;non si uguagliano le pressioni assolute a quote diverse.', 'Pistoni ideali circolari diametri2/6cm,medesima quota e atmosfera,forze aggiuntive nette25N sul piccolo;confronto di equilibri.', 'Pistoni ideali stessa quota e atmosfera,aree6/90cm²,carico aggiuntivo300N sul grande;attriti esclusi.', 'Circuito senza perdite,liquido incomprimibile ma bolla che si comprime durante avvio;spostamenti entrante/uscente e accumulo della bolla dichiarati.', 'Liquido incomprimibile senza bolle né perdite,rapporto aree8,corsa piccola0,24m;si chiede soltanto la corsa geometrica grande.', 'Principio di equilibrio per incremento di pressione in fluido confinato a geometria invariata;non omogeneità della pressione assoluta a quote diverse.', 'Pistone area12cm²,corsa5mm,liquido senza perdite,volume geometrico spostato;nessuna pressione richiesta.', 'Pressa reale con attriti,manovra lenta,lavoro in ingresso maggiore dell’utile e accumulo di energia meccanica nullo;considerati macchina,fluido,carico e ambiente.', 'Membrana area2cm²,differenza uniforme interno-esterno150kPa;forza netta e non forza della sola pressione assoluta.', 'Manometri con stesso riferimento,stessa quota e unico liquido connesso fermo;aree dei pistoni diverse,forze non necessariamente uguali.']
PEDAGOGY=['Due stati alla stessa coppia di quote sottratti prima di confrontare incrementi.', 'Quadrato del rapporto diametri prima del guadagno di forza.', 'Inversa area-carico e controllo della minore forza sul piccolo.', 'Accumulo volumetrico della bolla distinto da perdita di materia.', 'Bilancio geometrico senza dedurre uguaglianza di lavori finiti a quote diverse.', 'Cognome collegato al principio e limiti idrostatici espliciti.', 'Conversione5mm→0,5cm prima del prodotto area per corsa.', 'Sistema esteso per distinguere dissipazione da perdita di energia totale.', 'Differenza di pressioni e conversione quadratica dell’area.', 'Riferimenti dei manometri e direzione normale prima della forza.']
EXPECTED_IDS={'C2-Q024', 'C2-Q029', 'C2-Q022', 'C2-Q030', 'C2-Q027', 'C2-Q023', 'C2-Q028', 'C2-Q026', 'C2-Q021', 'C2-Q025'}
REVIEWED_CANDIDATES={'C2-Q021': '0bfb4468bfbff6d664130c9e4e0a21880ec9af1c3962b84c244c74e7c7e5ec15', 'C2-Q022': '9fd1acafbc0c5afa5971a844e7324925dd6f19ad18a07aab5bb6b60d72a0e1f6', 'C2-Q023': '46bef8146cdb74f4e2966764460a49e7d7f186100a276539a849af99c333611e', 'C2-Q024': '16911d6fcdc2ee46d0f91a782198d59b7f8fd6b42f47aed55e50b1091356b434', 'C2-Q025': 'f06616c702d474051727e271c2e303eb44e757ef4a6ae18dd92206a67c0ce088', 'C2-Q026': 'a8783a77c036fae6de947f0a182c22c03e81f174e7e059858dab266ef169bba3', 'C2-Q027': '57700dfc73cd6c8096d7e9571cefa73ee350dbb3c1e0c2a00a6e2f60b5c43b33', 'C2-Q028': '26437419aea5b12cc70374f31e5061b7339cbfc413e81aded2345321ac848ee1', 'C2-Q029': '0edfc582ed70ba84673d14e55e9838f179e01b5eac6dddb1ce0cbe3a34b593bd', 'C2-Q030': '48d3e2f62add6796dce600c66e2f4f715f3a088096265a0e85b7e96942aa0294'}
REQUIRED_RECTS={(Fraction(95, 1), Fraction(315, 1), Fraction(30, 1), Fraction(65, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1450, 1)), (Fraction(290, 1), Fraction(315, 1), Fraction(270, 1), Fraction(65, 1)), (Fraction(160, 1), Fraction(1120, 1), Fraction(300, 1), Fraction(150, 1))}
REQUIRED_PATHS={'m103 300 7 10 7-10', 'm440 824 10-14 10 14', 'M32 980H608', 'm415 293 10 17 10-17', 'M450 840V810', 'M160 1120 205 1085H505V1235L460 1270M460 1120 505 1085M460 1120V1270', 'M160 600V840', 'm148 822 12 18 12-18', 'M32 505H608', 'M425 130V310', 'M110 290V310'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Trasmettere pressione e volume', '1. Aree, non diametri: A₂ / A₁ = 9', 'F₁ = 25 N', '225 N', 'A₁', 'A₂ = 9 A₁', 'Stessa sovrapressione F₁/A₁ = F₂/A₂', '2. Esempio distinto: A₂ / A₁ = 8', 's₁ = 24 cm', 's₂ = 3 cm', 'A₁ · 24 cm = 8 A₁ · 3 cm', 'Frecce: moduli e versi delle corse', '3. Un piccolo volume spostato', 'A = 12 cm²', 's = 0,5 cm', 'ΔV = A s = 6 cm³ = 6 mL', 'Le facce delimitano il volume geometrico')
GEOMETRY_REVIEW='XML e nuovo PNG indipendente640×1450 letti per intero. Primo pannello:rettangoli area con profondità comune65 e larghezze30/270, rapporto9; sono dichiarati aree,non diametri. Frecce forze lunghe20/180 per25/225N,scala comune0,8coordinate/N. Secondo esempio autonomo:corse24/3cm in lunghezze240/30, stessa scala10coordinate/cm, piccolo entrante verso il basso e grande uscente verso l’alto; rapporto aree8 reciproco delle corse, nessuna uguaglianza di lavori finiti dedotta. Terzo:prisma schematico con facciaA12cm² e profonditàs0,5cm,volume6cm³=6mL, senza altre dimensioni assegnate o comune scala tridimensionale dichiarata. Testi e quantità leggibili,nessuna sovrapposizione residua rilevata.'
DECIMAL_REGRESSION_NUMBER=None
EXPECTED_CONTEXT={'C2-Q021': {'id': 'C2-Q021', 'kind': 'question', 'course': 'C2', 'order': 21, 'skill': 'C2-L003', 'family': 'che-cosa-arriva-uguale', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q022': {'id': 'C2-Q022', 'kind': 'question', 'course': 'C2', 'order': 22, 'skill': 'C2-L003', 'family': 'i-diametri-dei-pistoni', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q023': {'id': 'C2-Q023', 'kind': 'question', 'course': 'C2', 'order': 23, 'skill': 'C2-L003', 'family': 'ricavare-la-forza-di-comando', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q024': {'id': 'C2-Q024', 'kind': 'question', 'course': 'C2', 'order': 24, 'skill': 'C2-L003', 'family': 'una-bolla-intrappolata', 'difficulty': 3, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q025': {'id': 'C2-Q025', 'kind': 'question', 'course': 'C2', 'order': 25, 'skill': 'C2-L003', 'family': 'un-limite-di-corsa', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q026': {'id': 'C2-Q026', 'kind': 'question', 'course': 'C2', 'order': 26, 'skill': 'C2-L003', 'family': 'la-macchina-con-due-pistoni', 'difficulty': 1, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q027': {'id': 'C2-Q027', 'kind': 'question', 'course': 'C2', 'order': 27, 'skill': 'C2-L003', 'family': 'quanto-volume-percorre-la-linea', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q028': {'id': 'C2-Q028', 'kind': 'question', 'course': 'C2', 'order': 28, 'skill': 'C2-L003', 'family': 'un-impianto-reale-dissipa', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}, 'C2-Q029': {'id': 'C2-Q029', 'kind': 'question', 'course': 'C2', 'order': 29, 'skill': 'C2-L003', 'family': 'verifica-della-pressione-ammissibile', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 2}, 'C2-Q030': {'id': 'C2-Q030', 'kind': 'question', 'course': 'C2', 'order': 30, 'skill': 'C2-L003', 'family': 'due-manometri-alla-stessa-quota', 'difficulty': 2, 'prerequisites': ['C2-L003'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
ORDINAL_OFFSET=20

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
    assert sp.simplify((v['C2-Q022'])-sp.Rational('225'))==0
    assert sp.simplify((v['C2-Q023'])-sp.Rational('20'))==0
    assert sp.simplify((v['C2-Q025'])-sp.Rational('3'))==0
    assert sp.simplify((v['C2-Q027'])-sp.Rational('6'))==0
    assert sp.simplify((v['C2-Q029'])-sp.Rational('30'))==0
    assert sp.simplify((v['C2-Q021'])-sp.Rational('7'))==0
    assert d['pressure']==3 and d['density']==sp.Rational(26,25)
    return ['La pressione nel liquido',v['C2-Q022'],v['C2-Q023'],'A₁s₁=A₂s₂ senza alcun termine di accumulo',v['C2-Q025'],'Pascal',v['C2-Q027'],'In energia interna della macchina e del fluido, poi anche in calore ceduto all’ambiente',v['C2-Q029'],'La stessa pressione, pur potendo corrispondere a forze diverse sui pistoni']
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
    if root.get('viewBox')!='0 0 640 1450':raise ValueError('Independent physical scale viewport changed')
    if {e.get('points') for e in root.iter() if e.tag.endswith('polygon')}!=REQUIRED_POLYGONS:raise ValueError('Independent physical scale prism geometry changed')
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c2_l003_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
