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
CANDIDATE_REF='af6a3adeecb2946e79aca6e8509c23b4bd0afe85'
PRIMARY_SHA256='34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C2.json', 'sourceSha256': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23', 'primarySkill': 'C2-L001', 'title': 'Distribuire massa e forza', 'actualLessonPrerequisites': []}
FAMILY='cric-c2-l001'
BATCH='cric-c2-l001'
ASSET_NAME='cric-c2-l001-progressive.svg'
REVIEWED_PACKAGE_SHA256='229d0e9167a8a7729d7c15d4cf2312d7d36bce0a556db30a96583c40ff5d8645'
REVIEWED_BINDINGS_SHA256='1c7dd05e0242c43b95d0282b60c36e2cfe226e74777deb0eec9d609201be3c83'
SOURCE_REFERENCE='Dieci problemi distinti di fluido ordinario, forza normale e pressione, riferimenti di pressione, densità media e conservazione della massa.'
FALSE_PROOF='A forza costante la pressione cresce insieme all’area, quindi il prodotto pressione per area non deve restare uguale.'
SVG_MUTATION=(b'width="240"', b'width="241"')
SVG_LABEL_MUTATION=(b'18 kPa', b'19 kPa')
EXPECTED_MAPPING={1: ('C2-L001', ['C2-L001']), 2: ('C2-L001', ['C2-L001']), 3: ('C2-L001', ['C2-L001']), 4: ('C2-L001', ['C2-L001']), 5: ('C2-L001', ['C2-L001']), 6: ('C2-L001', ['C2-L001']), 7: ('C2-L001', ['C2-L001']), 8: ('C2-L001', ['C2-L001']), 9: ('C2-L001', ['C2-L001']), 10: ('C2-L001', ['C2-L001'])}
NUMERIC_UNITS={2: 'kPa', 4: 'kPa', 7: 'kPa'}
OPTION_SUFFIX={5: ' g/mL', 9: ' kg/m³'}
UNITS={1: 'pascal', 2: 'kilopascal', 3: 'pascal', 4: 'kilopascal', 5: 'gram/milliliter', 6: 'pascal', 7: 'kilopascal', 8: 'kilogram/meter**3', 9: 'kilogram/meter**3', 10: 'pascal'}
MANUAL=['Un liquido ordinario non sostiene staticamente un taglio persistente non nullo: continua a deformarsi. Un solido elastico può equilibrarlo con deformazione finita; la proprietà distingue il comportamento reologico, non la sola forma esterna.', 'p=F_normale/A=45/(15/1000)=3000 Pa=3 kPa. Il risultato usa la componente normale; la distribuzione uniforme rende uguali pressione locale e media.', 'La pressione idrostatica in un punto è isotropa e scalare. Ruotando una piccola superficie con lo stesso centro cambia la normale e quindi la direzione della forza pA, non p.', 'p_rel=p_ass−p_atm. Da−12 kPa e99 kPa assoluti ricavo p_ass=99−12=87 kPa>0. Segno relativo negativo non significa assoluta negativa.', 'Le masse dei due volumi sono16 g e36 g; somma52 g,volume additivo50 mL. La densità media è52/50=26/25 g/mL, tra le densità iniziali e diversa dalla media semplice a volumi disuguali.', 'Una pressione riferita al vuoto è assoluta. Pressione relativa e atmosferica sono collegate alla stessa assoluta da p_ass=p_atm+p_rel; lo zero manometrico non coincide col vuoto.', 'A forza normale costante p₁A₁=p₂A₂. L’area cresce3 volte e la pressione scende a18/3=6 kPa. L’opzione erronea54 kPa, insieme all’area tripla, produrrebbe invece una forza9 volte maggiore.', 'Massa del solo liquido omogeneo nello stesso stato:m=ρV. Nel grafico m controV la pendenza Δm/ΔV èρ, con dimensione massa/volume. La tara non deve essere inclusa.', 'Chiusura alla materia impone stessa massa:ρ₁V₁=ρ₂V₂. Quindiρ₂=(6/5)(6/4)=9/5 kg/m³. Non occorre imporre isoterma o gas ideale per questo bilancio di massa.', 'La forza normale per unità di area definisce pressione media; quella tangenziale per unità di area definisce taglio. Le unità Pa uguali non eliminano la diversa componente geometrica.']
DISTRACTORS=['Equilibrio elastico finito descrive il solido; un liquido può esercitare forza normale. Scorrere non mantiene forma fissa e non converte automaticamente taglio in pressione negativa.', '0,675 copia F·A, che ha dimensione N·m². 3000 kPa non converte Pa;0,003 kPa è mille volte troppo piccolo rispetto a3;45 copia il dato di forza.', 'Cambiare orientazione non assegna due pressioni allo stesso punto; forza non resta verticale se cambia la normale. Parete orizzontale può ricevere pressione e non nasce un taglio statico dalla rotazione.', '111 kPa sottrae un dato già negativo;−12 è manometrica,12 solo modulo della lettura e99 ignora la differenza.', '1,00 media due densità senza pesare volumi;2,00 le somma;0,96 copia il prodotto dei coefficienti senza bilancio;52 copia i grammi totali senza dividere per50 mL.', 'Relativa e differenziale atmosferica hanno altro riferimento; tangenziale indica direzione dello sforzo e volumetrica non distingue lo zero di pressione.', '54 kPa aumenta p eA ciascuno3 volte,quindi F9 volte.18 ignora l’area nuova;2 divide di nuovo senza ragione;72 è coefficiente del prodotto pA prima di dividerlo per12.', 'Volume e massa sono coordinate,non pendenza;pressione ha dimensione diversa. L’inverso diρ sarebbe la pendenza del grafico ad assi scambiati;tara produrrebbe intercetta.', '0,80 usa4/6 anziché6/4 e non conserva massa;1,20 conserva erroneamenteρ;7,20 e0,20 moltiplicano o dividono per6 senza usare il rapporto completo.', 'F_tangenziale/A è taglio;somma dei moduli non ridefinisce pressione. Prodotto di forze dàN² eforza perareaN·m²,non Pa.']
ASSUMPTIONS=['Liquido ordinario e solido nel campo elastico, piccolo sforzo tangenziale costante e non nullo; confronto fra risposta persistente e statica.', 'Forza45 N interamente normale e uniformemente distribuita su area0,015 m²; conversione esatta Pa→kPa.', 'Liquido in quiete, superficie piccola rispetto alle variazioni spaziali di pressione, centro fissato allo stesso punto mentre cambia orientazione.', 'Atmosfera locale assoluta99 kPa, manometro−12 kPa relativo a essa; camera con pressione assoluta positiva.', 'Due volumi20/30 mL a densità0,8/1,2 g/mL, nessuna perdita di massa e volumi additivi; densità media del campione finale.', 'Riferimento al vuoto per pressione assoluta; atmosfera come riferimento per la particolare lettura relativa richiamata.', 'Forza normale mantenuta costante, area4→12 cm²; sono confrontate pressioni medie nelle medesime unità.', 'Liquido omogeneo nello stesso stato, massa del solo liquido, grafico m verticale eV orizzontale.', 'Gas chiuso senza scambio di materia, densità iniziale6/5 kg/m³,volume6→4 L; volume e densità possono cambiare.', 'Stessa faccia con componenti di forza normale e tangenziale, richiesta della pressione media e non dello sforzo risultante totale.']
PEDAGOGY=['Confronto reologico legato alla direzione dello sforzo e alla durata.', 'Frazione decimale e unità trattate prima della divisione.', 'Valore scalare distinto dal verso della forza sulla parete.', 'Riferimento e segno del manometro espliciti.', 'Masse calcolate separatamente prima della densità media.', 'Riferimento di misura distinto dallo stato del fluido.', 'Grandezza controllata identificata prima dell’inversa;controprova della forza ricalcolata.', 'Assi e assenza della tara letti prima della pendenza.', 'Conservazione della massa sufficiente senza legge termica aggiuntiva.', 'Stessa unità di pressione e taglio distinta dalla componente geometrica.']
EXPECTED_IDS={'C2-Q004', 'C2-Q008', 'C2-Q007', 'C2-Q010', 'C2-Q001', 'C2-Q003', 'C2-Q009', 'C2-Q005', 'C2-Q002', 'C2-Q006'}
REVIEWED_CANDIDATES={'C2-Q001': '81b81db534a0e0dd2ab01d471274f822150b673584050494c9ab7264989075bb', 'C2-Q002': '92abc2ddc16a1aee789828447ef299ec13d6731d4d3153664fd9eb731becdd1a', 'C2-Q003': '45cce590d1ad6fb083a3d25700ff93cde305600599908810de525402fb817635', 'C2-Q004': '26411770ace1fc03db0a09740ff4e4852d0f268ce2d8c2edf6c3d4c0d3cd8138', 'C2-Q005': 'ef2fd7fac383f7ff8f313f03c617c6d21ebf6306f788f0553a8ccb80ee3ac2ac', 'C2-Q006': '2b0ce2230833bcadf0d5a70483bab75915611228e3ad4843fd20caff35fec18d', 'C2-Q007': '6dfdc227840b63b315430976af8c6abe378717970558c5a27a7367012eca55fd', 'C2-Q008': 'f0597736ad2cf9b4530eda2f24c88d4b3d6688f501fdb80bf2f573a17716d48c', 'C2-Q009': '99877b6e946e73e1192294099f01147eec875f1fffc86c39ff6f16c86be11287', 'C2-Q010': 'b03251a8cc5e7b88a976eb54d3bfcc381e5c1f2328ee44dd4346f103ebbcc7b3'}
REQUIRED_RECTS={(Fraction(155, 1), Fraction(275, 1), Fraction(330, 1), Fraction(72, 1)), (Fraction(100, 1), Fraction(675, 1), Fraction(80, 1), Fraction(70, 1)), (Fraction(300, 1), Fraction(675, 1), Fraction(240, 1), Fraction(70, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1430, 1))}
REQUIRED_PATHS={'m308 242 12 18 12-18', 'm410 634 10 16 10-16', 'M120 1290 480 1090', 'M300 1290V1190H120M480 1290V1090H120', 'M32 480H608', 'M32 940H608', 'M120 1290H560M120 1290V1040', 'M140 570V650', 'm130 634 10 16 10-16', 'M320 160V260', 'M420 570V650'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Forza, area e densità', '1. Una forza normale distribuita', 'F = 45 N', 'A = 0,015 m²', 'p = (45 N) / (0,015 m²)', 'p = 3000 Pa = 3 kPa', '2. La stessa forza, area tripla', 'F', 'F', '4 cm²', '12 cm²', '18 kPa', '6 kPa', 'p₁A₁ = p₂A₂ : forza uguale', '3. Un esempio: ρ = 1 g/mL', 'm (g)', '0', '20', '40', '20', '40', 'V (mL)', 'Pendenza = Δm / ΔV = ρ')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Distribuire una forza e leggere una densità'), ('desc', 'Tre pannelli distinti: forza normale 45 newton su 0,015 metri quadrati; stessa forza su aree nel rapporto uno a tre e pressioni 18 e 6 kilopascal; retta massa volume con densità d’esempio un grammo per millilitro.'))
GEOMETRY_REVIEW='XML e nuovo PNG indipendente640×1430 letti integralmente sui byte finali af6a3ade. Primo pannello forza normale45N e area0,015m², quoziente dimensionato corretto e risultato3kPa; nessuna scala condivisa con le prove successive. Secondo:rettangoli con stessa profondità70 e larghezze80/240, aree4/12cm² in rapporto3; vettori della stessa forza entrambi lunghi80 e pressioni18/6kPa inversamente proporzionali. Terzo:asseV9coordinate/mL,assemassa5coordinate/g; punti(20mL,20g) e(40mL,40g) sulla retta dalla stessa origine,ρ=1g/mL. Titoli, unità e zero visibili, nessun contatto o taglio residuo rilevato.'
DECIMAL_REGRESSION_NUMBER=5
EXPECTED_CONTEXT={'C2-Q001': {'id': 'C2-Q001', 'kind': 'question', 'course': 'C2', 'order': 1, 'skill': 'C2-L001', 'family': 'uno-sforzo-tangenziale-persistente', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q002': {'id': 'C2-Q002', 'kind': 'question', 'course': 'C2', 'order': 2, 'skill': 'C2-L001', 'family': 'una-pressione-media-al-contatto', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 2}, 'C2-Q003': {'id': 'C2-Q003', 'kind': 'question', 'course': 'C2', 'order': 3, 'skill': 'C2-L001', 'family': 'ruotare-una-piccola-parete', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q004': {'id': 'C2-Q004', 'kind': 'question', 'course': 'C2', 'order': 4, 'skill': 'C2-L001', 'family': 'un-sensore-con-riferimento-atmosferico', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q005': {'id': 'C2-Q005', 'kind': 'question', 'course': 'C2', 'order': 5, 'skill': 'C2-L001', 'family': 'densita-di-un-composto-di-due-porzioni', 'difficulty': 3, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q006': {'id': 'C2-Q006', 'kind': 'question', 'course': 'C2', 'order': 6, 'skill': 'C2-L001', 'family': 'il-riferimento-al-vuoto', 'difficulty': 1, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q007': {'id': 'C2-Q007', 'kind': 'question', 'course': 'C2', 'order': 7, 'skill': 'C2-L001', 'family': 'aumentare-la-superficie-di-appoggio', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q008': {'id': 'C2-Q008', 'kind': 'question', 'course': 'C2', 'order': 8, 'skill': 'C2-L001', 'family': 'il-grafico-massavolume', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q009': {'id': 'C2-Q009', 'kind': 'question', 'course': 'C2', 'order': 9, 'skill': 'C2-L001', 'family': 'conservare-la-massa-comprimendo-un-gas', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}, 'C2-Q010': {'id': 'C2-Q010', 'kind': 'question', 'course': 'C2', 'order': 10, 'skill': 'C2-L001', 'family': 'una-forza-parallela-alla-faccia', 'difficulty': 2, 'prerequisites': ['C2-L001'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()

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
    units={' g/mL':('density',sp.Integer(1000)),' kg/m³':('density',sp.Integer(1)),' kg/m3':('density',sp.Integer(1)),' kPa':('pressure',sp.Integer(1000)),' Pa':('pressure',sp.Integer(1)),' N':('force',sp.Integer(1)),' m²':('area',sp.Integer(1)),' cm²':('area',sp.Rational(1,10000)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda pair:-len(pair[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert v['C2-Q002']==d['pressure']==3
    assert v['C2-Q004']==87 and v['C2-Q005']==d['density']==sp.Rational(26,25)
    assert v['C2-Q007']==6 and v['C2-Q009']==sp.Rational(9,5)
    assert SI.Unit('newton/meter**2').dimensionality==SI.Unit('pascal').dimensionality
    return ['Continua a deformarsi e scorrere finché persiste lo sforzo',v['C2-Q002'],'Il valore p resta uguale; la forza di pressione rimane normale alla parete',v['C2-Q004'],v['C2-Q005'],'Assoluta',v['C2-Q007'],'La densità del liquido',v['C2-Q009'],'La componente normale divisa per l’area']
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
    if root.get('viewBox')!='0 0 640 1430':raise ValueError('Independent physical scale viewport changed')
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
        errors.extend(common);number=int(row["id"][-3:]);source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c2_l001_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"][-3:]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"][-3:]);wanted=oracle()[number-1]
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
