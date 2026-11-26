"""Independent source-first distinct Cric vector and motion problems; no candidate authoring imports.
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
SOURCE_PATH='officina-di-fisica/content/C1.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c'
CANDIDATE_REF='f7b7abe30068318bbaefef8eb2a137b96da60a41'
PRIMARY_SHA256='2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C1.json', 'sourceSha256': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf', 'primarySkill': 'C1-L002', 'title': 'Costruire e proiettare un vettore', 'actualLessonPrerequisites': ['C1-L001']}
FAMILY='cric-c1-l002'
BATCH='cric-c1-l002'
ASSET_NAME='cric-c1-l002-progressive.svg'
REVIEWED_PACKAGE_SHA256='7870b19e6daa67422f0b0e0ddfe3ef095f08de804eb44a558159612c12612b44'
REVIEWED_BINDINGS_SHA256='4a89ed4f94f8f97c6eee83cf10b0517320b9a66b934e0a68675cbf797971435f'
SOURCE_REFERENCE='Dieci problemi Cric distinti, risolti individualmente nella primaria prompt-only prima dei candidati; leggere le note per ID per modelli e domini.'
FALSE_PROOF='La proiezione di un vettore sul semiasse negativo deve avere componente positiva perché il modulo è positivo.'
SVG_MUTATION=(b'M335 400H215', b'M335 400H216')
SVG_LABEL_MUTATION=(b'F\xe2\x82\x93 = \xe2\x88\x926 N', b'F\xe2\x82\x93 = \xe2\x88\x927 N')
EXPECTED_MAPPING={1: ('C1-L002', ['C1-L002']), 2: ('C1-L002', ['C1-L002']), 3: ('C1-L002', ['C1-L002']), 4: ('C1-L002', ['C1-L002']), 5: ('C1-L002', ['C1-L002']), 6: ('C1-L002', ['C1-L002']), 7: ('C1-L002', ['C1-L002']), 8: ('C1-L002', ['C1-L002']), 9: ('C1-L002', ['C1-L002']), 10: ('C1-L002', ['C1-L002'])}
NUMERIC_UNITS={}
OPTION_SUFFIX={1: ' N', 2: ' m', 3: ' m', 6: ' m', 8: '', 9: ' J', 10: '°'}
UNITS={1: 'newton', 2: 'meter', 3: 'meter', 4: 'dimensionless', 5: 'dimensionless', 6: 'meter', 7: 'dimensionless', 8: 'dimensionless', 9: 'joule', 10: 'degree'}
MANUAL=['La componente orizzontale è 12 cos120°=−6 N. Il segno segue il secondo quadrante; 6√3 N è la componente verticale positiva, non quella richiesta.', 'Con est positivo, Δx=−7+11=+4 m. Il risultato è a est. La distanza percorsa è invece 7+11=18 m; quattro a ovest avrebbe componente negativa.', 'B−A=(5−2,1−(−3))=(3,4) m: il modulo è 5 m per Pitagora. L’errata differenza (3,−2) avrebbe √13 m; la somma (7,−2) avrebbe √53 m.', 'Con moduli non nulli, A·B=ab cosθ=0 impone cosθ=0 e angolo90°. Il vincolo non nullo evita il vettore zero, che non definisce una direzione.', 'Nella base ortonormale destrorsa e_x×e_y=e_z. Scambiare i fattori inverte il segno; il prodotto vettoriale è ortogonale al piano e non è uno scalare.', 'Il filo fa30° con la verticale: lo spostamento orizzontale è ℓsin30°=(12/5)(1/2)=6/5 m. Il coseno darebbe la proiezione verticale,6√3/5 m.', 'A moduli positivi fissi, A·B=ab cosθ raggiunge ab per cosθ=1: paralleli concordi. Antiparalleli danno−ab, perpendicolari0.', 'La tangente del piccolo angolo geometrico è0,45/3=45/300=3/20, numero puro. Non si chiede né l’angolo in gradi né il rapporto inverso20/3.', 'Il prodotto scalare è3·2+4·(−1)=6−4=2 N·m=2 J. Il prodotto dei soli moduli ignorerebbe l’angolo e la componente negativa dello spostamento.', 'Le due componenti uguali negative individuano il terzo quadrante. L’angolo di riferimento45° dà180°+45°=225° nel dominio[0°,360°);45° ha componenti positive.']
DISTRACTORS=['+6 N omette il segno del coseno;−12 N non proietta;6√3 N usa la componente verticale;zero impone un angolo retto non assegnato.', '18 m somma le lunghezze;4 m a ovest inverte il verso;zero suppone erroneamente uguali tratte;7 m copia la prima tratta.', '√13 m appartiene all’errata differenza(3,−2),√53 m alla somma(7,−2);3 e4 sono solo componenti.', 'Paralleli concordi danno ab>0, discordi−ab<0. Un angolo non definito richiederebbe un vettore nullo, escluso.', '−z corrisponde all’ordine invertito;±x,±y restano nel piano e non possono essere ortogonali a entrambi i fattori.', '1,2√3 m è la proiezione verticale;2,4 m è tutta la fune;4,8 m e0,8 m non sono il cateto orizzontale a30°.', 'Perpendicolari producono0, antiparalleli−ab; l’uguaglianza dei moduli non è richiesta e non fissa l’angolo.', '20/3 inverte i cateti;3/2,9/20 e3/5 non ricostruiscono il rapporto0,45/3.', '10 J somma moduli dei contributi6 e4;5√5 J usa il prodotto dei moduli senza coseno;−2 J inverte il segno;6 J omette la componente y.', '45° ha entrambi segni positivi;135° ha y positivo;315° ha x positivo;180° ha componente y nulla anziché negativa.']
ASSUMPTIONS=['Forza di modulo12 N, angolo orientato120° da+x, assi cartesiani ortonormali. Si chiede una componente con segno.', 'Due spostamenti successivi collineari:7 m a ovest e11 m a est; est scelto positivo, nessuna richiesta di distanza cumulativa.', 'Posizioni A=(2,−3)m,B=(5,1)m nello stesso riferimento e nella stessa base. Differenza finale meno iniziale, non somma di posizioni.', 'Due vettori entrambi non nulli, prodotto scalare euclideo zero. Nessuna ipotesi di forza o lavoro necessaria.', 'Base ortonormale destrorsa assegnata, ordine e_x poi e_y mantenuto. Operazione vettoriale distinta dal prodotto scalare.', 'Filo rettilineo teso lungo2,4 m, inclinato30° rispetto alla verticale. Proiezione orizzontale come modulo positivo.', 'Moduli dei due vettori fissati e strettamente positivi, angolo libero fra0 eπ; si massimizza il prodotto scalare.', 'Geometria rettangola con cateto verticale0,45 m e orizzontale3 m: rapporto tangente adimensionale.', 'Forza costante(3,4)N e spostamento(2,−1)m nella stessa base ortonormale; lavoro della sola forza assegnata.', 'Componenti x e y uguali e negative, angolo antiorario misurato da+x e intervallo0≤θ<360°.']
PEDAGOGY=['Angolo orientato e proiezione con segno distinti dal modulo della forza.', 'Spostamento orientato e distanza percorsa confrontati esplicitamente.', 'Differenza di coordinate seguita da triade3–4–5; errore della componente y ricalcolato prima del freeze finale.', 'Ipotesi non nullo necessaria prima di dedurre l’ortogonalità.', 'Base destrorsa e ordine dei fattori motivano il verso.', 'Angolo rispetto alla verticale: scelta del seno spiegata prima dei numeri.', 'Massimo del coseno nel dominio fisico, senza condizioni superflue sui moduli.', 'Decimale trasformato in frazione esatta e unità cancellate.', 'Prodotto scalare come lavoro con controllo N·m=J.', 'Quadrante risolto dai segni prima dell’angolo notevole.']
EXPECTED_IDS={'C1-Q017', 'C1-Q012', 'C1-Q014', 'C1-Q013', 'C1-Q016', 'C1-Q018', 'C1-Q019', 'C1-Q020', 'C1-Q015', 'C1-Q011'}
REVIEWED_CANDIDATES={'C1-Q011': 'fead61e3514f999a58af0097706eb5df243b80b3a2a86d6bb77850fc12b7217d', 'C1-Q012': '30313a76e581e53be440065bd2c2785a661e1648cba9ad725d34479278111e16', 'C1-Q013': '8673168ad03b34acc802ecdfbf97a7c5974910fde5c5dea5a78847cd941ec7a8', 'C1-Q014': 'b16b3b0dab958014c9ec0a011e49970244a77d767e00c24a517ffc7d803af5b0', 'C1-Q015': 'dd1e574be1945e37de40744ec0d8b0fecbd939e5ee480bc5cde6b8efb4871815', 'C1-Q016': 'b1741f6bff8eccd0b3cf8d4865f60a20698a0e077e9f75a91a03a1732d538759', 'C1-Q017': 'cac5b506644400075c15deb293c03d700d7dee973e732b05806f245ff23addfb', 'C1-Q018': '0957776518b11d24d30ede4b77773ac250acc5b61b936e118d60b917ea506f38', 'C1-Q019': '28e230a6bbeccbff4ca0df8788cd25558b34403e1c77d2c3fbce3548bb7d3c60', 'C1-Q020': 'ff121a5bfd3038b07db67f30443610e6673e0d62baafeed54fea276c404216a1'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1740, 1))}
REQUIRED_PATHS={'M300 1020H420V860', 'M335 400L215 192.154', 'M95 400H535M335 470V145', 'M100 900H570M220 1010V630', 'M220 900L300 1020', 'M240 1350A60 60 0 0 0 270 1341.962', 'M240 1290V1530H378.564Z', 'M0 0L10 5L0 10Z', 'M215 192.154V400', 'M240 1290L378.564 1530', 'M395 400A60 60 0 0 0 305 348.038', 'M335 400H215', 'M220 900L420 860', 'M300 1020L420 860'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Vettori: leggere assi e angoli', '1 · La componente può essere negativa', 'x', 'y', 'O', '120°', 'F = 12 N', 'Fₓ = −6 N', 'cos 120° = −1/2, quindi Fₓ = −6 N.', '2 · Differenza fra le punte', 'x', 'y', 'O', 'A (2, −3) m', 'B (5, 1) m', ' ', '3 m', '4 m', '5 m', 'Ogni passo sugli assi vale 1 m.', 'D = (3, 4) m; il modulo è 5 m.', '3 · L’angolo parte dalla verticale', '30°', 'ℓ = 2,4 m', 'd = 1,2 m', 'd = ℓ sin 30° = ℓ/2.', 'La fune è l’ipotenusa, d il cateto opposto.')
GEOMETRY_REVIEW='XML e nuovo PNG indipendente640×1740 letti per intero. Forza12N da(335,400) a(215,192.154): scala comune20coordinate/N, componente orizzontale−6N lunga120, seconda componente6√3N lunga207.846. Nel piano posizioni, scala40/m sui due assi: A(2,−3),B(5,1), differenza(3,4), diagonale200coordinate=5m. Filo2,4m inclinato30° dalla verticale: cateti138.564 e240, ipotenusa277.128, proiezione orizzontale1,2m nella stessa scala. Testi e angoli leggibili, nessun taglio o contatto residuo rilevato.'
DECIMAL_REGRESSION_NUMBER=3
EXPECTED_CONTEXT={'C1-Q011': {'id': 'C1-Q011', 'kind': 'question', 'course': 'C1', 'order': 11, 'skill': 'C1-L002', 'family': 'la-proiezione-allindietro', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q012': {'id': 'C1-Q012', 'kind': 'question', 'course': 'C1', 'order': 12, 'skill': 'C1-L002', 'family': 'risultante-di-versi-opposti', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q013': {'id': 'C1-Q013', 'kind': 'question', 'course': 'C1', 'order': 13, 'skill': 'C1-L002', 'family': 'differenza-fra-due-letture', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 2}, 'C1-Q014': {'id': 'C1-Q014', 'kind': 'question', 'course': 'C1', 'order': 14, 'skill': 'C1-L002', 'family': 'vettori-ortogonali', 'difficulty': 1, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q015': {'id': 'C1-Q015', 'kind': 'question', 'course': 'C1', 'order': 15, 'skill': 'C1-L002', 'family': 'il-verso-della-normale', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q016': {'id': 'C1-Q016', 'kind': 'question', 'course': 'C1', 'order': 16, 'skill': 'C1-L002', 'family': 'un-angolo-misurato-dalla-verticale', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q017': {'id': 'C1-Q017', 'kind': 'question', 'course': 'C1', 'order': 17, 'skill': 'C1-L002', 'family': 'somma-di-moduli-massima', 'difficulty': 1, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q018': {'id': 'C1-Q018', 'kind': 'question', 'course': 'C1', 'order': 18, 'skill': 'C1-L002', 'family': 'quanto-vale-la-pendenza', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q019': {'id': 'C1-Q019', 'kind': 'question', 'course': 'C1', 'order': 19, 'skill': 'C1-L002', 'family': 'prodotto-con-componenti-note', 'difficulty': 2, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}, 'C1-Q020': {'id': 'C1-Q020', 'kind': 'question', 'course': 'C1', 'order': 20, 'skill': 'C1-L002', 'family': 'due-direzioni-con-la-stessa-tangente', 'difficulty': 3, 'prerequisites': ['C1-L002'], 'exam': None, 'version': 1}}
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
    # One calculation for each numerical original; no source answer field read.
    return {
        'C1-Q001':q(250)*q(10)**-9/q(10)**-9,
        'C1-Q004':q(4,100)/(q(80)*q(10)**-6),
        'C1-Q005':q(10)**-4 if q(7)**2>10 else q(10)**-5,
        'C1-Q007':q(546,10)-q(420,10000)*1000,
        'C1-Q009':q(125,100)*q(3600,1000),
        'C1-Q011':12*sp.cos(2*sp.pi/3),
        'C1-Q012':-7+11,
        'C1-Q013':sp.sqrt((5-2)**2+(1-(-3))**2),
        'C1-Q016':q(24,10)*sp.sin(sp.pi/6),
        'C1-Q018':q(45,100)/3,
        'C1-Q019':3*2+4*(-1),
        'C1-Q020':180+45,
        'C1-Q021':-12+q(25,10)*8,
        'C1-Q022':q(24)/(q(12,2)+q(12,3)),
        'C1-Q026':q(15,3),
        'C1-Q027':3*4-2*5,
        'C1-Q029':q(1-(-3),2),
        'C1-Q031':q(-(4**2),2*(-2)),
        'C1-Q033':q(2*6,10),
        'C1-Q034':q(10,2)*(2**2-1**2),
        'C1-Q036':q(60,30),
        'C1-Q037':q(3**2)/q(45,10),
        'C1-Q040':2+2*3*2,
        'C1-Q042':q(32,10)*10,
        'C1-Q044':5*10-12,
        'C1-Q046':sp.sqrt(6**2+8**2)/5,
        'C1-Q048':q(24,10)*4,
        'C1-Q050':2*10*sp.cos(sp.pi/3),
    }
def dimensional_crosschecks():
    si=pint.UnitRegistry(non_int_type=Fraction)
    return {
        'C1-Q001':si.Quantity(250,'microliter').to('millimeter**3').magnitude,
        'C1-Q007':(si.Quantity(Fraction(546,10),'gram')-si.Quantity(Fraction(42,1000),'kilogram')).to('gram').magnitude,
        'C1-Q008':{str(k):str(v) for k,v in (si.Unit('meter')/si.Unit('second')**2).dimensionality.items()},
        'C1-Q009':si.Quantity(Fraction(5,4),'meter/second').to('kilometer/hour').magnitude,
        'C1-Q019':(si.Quantity(3,'newton')*si.Quantity(2,'meter')-si.Quantity(4,'newton')*si.Quantity(1,'meter')).to('joule').magnitude,
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
    if number==2:
        for direction,sign in [(' m a est',1),(' m a ovest',-1)]:
            if option.endswith(direction):return sign*mapped_literal(option.removesuffix(direction))
        if option=='0 m':return sp.Integer(0)
        raise ValueError('Required displacement orientation absent')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return mapped_literal(option.removesuffix(suffix) if suffix else option)
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_NUMERIC_EXPRESSIONS:return sp.Rational(KNOWN_NUMERIC_EXPRESSIONS[raw])
    return parse_literal(raw)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded quantity literal required')
    for direction,sign in [(' m a est',1),(' m a ovest',-1)]:
        if option.endswith(direction):
            try:return 'length',sign*mapped_literal(option.removesuffix(direction))
            except ValueError:return None
    units={' m/s²':('acceleration',sp.Integer(1)),' m/s':('speed',sp.Integer(1)),' cm':('length',sp.Rational(1,100)),' m':('length',sp.Integer(1)),' N':('force',sp.Integer(1)),' J':('energy',sp.Integer(1)),' s':('time',sp.Integer(1)),'°':('angle',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda pair:-len(pair[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert sp.simplify(v['C1-Q011']-sp.Rational(-6))==0
    assert sp.simplify(v['C1-Q012']-sp.Rational(4))==0
    assert sp.simplify(v['C1-Q013']-sp.Rational(5))==0
    assert sp.simplify(v['C1-Q016']-sp.Rational('6/5'))==0
    assert sp.simplify(v['C1-Q018']-sp.Rational('3/20'))==0
    assert sp.simplify(v['C1-Q019']-sp.Rational(2))==0
    assert sp.simplify(v['C1-Q020']-sp.Rational(225))==0
    assert d['C1-Q019']==v['C1-Q019']==2
    return [v['C1-Q011'],v['C1-Q012'],v['C1-Q013'],'Sono perpendicolari','Lungo +z',v['C1-Q016'],'Paralleli e concordi',v['C1-Q018'],v['C1-Q019'],v['C1-Q020']]
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
    if root.get('viewBox')!='0 0 640 1740':raise ValueError('Independent physical scale viewport changed')
    if {e.get('points') for e in root.iter() if e.tag.endswith('polygon')}!=REQUIRED_POLYGONS:raise ValueError('Independent physical scale prism geometry changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c1-001-050-independent-models.py"
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c1_l002_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_source_prompt_only_distinct_measurement_calculations_and_separate_conceptual_derivations",
            "Pint_exact_volume_mass_speed_dimensions_and_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c1-001-050-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"7a2a3784421f346b4784a581e275760a623b4adf"},"postReadNumericGuardHardening":"All constitutive, inverse, calibration and exact finite guard function bodies are identical to the actual pre-key snapshot from first version.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c1-001-050-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
    idx=next(i for i,r in enumerate(changed['records']) if int(r['id'][-3:])-ORDINAL_OFFSET in OPTION_SUFFIX and OPTION_SUFFIX[int(r['id'][-3:])-ORDINAL_OFFSET])
    row=changed['records'][idx];number=int(row['id'][-3:])-ORDINAL_OFFSET;bad=equivalent_literal(oracle()[number-1])+' kg';prior=row['answer']['value'];row['answer']['value']=bad;row['answer']['options']=[bad if o==prior else o for o in row['answer']['options']]
    links[idx]['candidateSha256']=digest(row);result=retoken(changed,links,row['id'])
    if result['ok'] or 'Independent exact answer or physical unit invalid' not in result['errors']:raise AssertionError('Wrong choice unit accepted after retokenization')
    cases.append({'case':'wrong_unit_rebound_and_retokenized','id':row['id'],'rejectedBy':result['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("C1.json","C2.json")
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
