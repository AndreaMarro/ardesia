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
CANDIDATE_REF='74f8241f3bf148d78da26a297478559ef99dfd85'
PRIMARY_SHA256='2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C1.json', 'sourceSha256': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf', 'primarySkill': 'C1-L005', 'title': 'Isolare un corpo e disegnare le forze', 'actualLessonPrerequisites': ['C1-L002', 'C1-L004']}
FAMILY='cric-c1-l005'
BATCH='cric-c1-l005'
ASSET_NAME='cric-c1-l005-progressive.svg'
REVIEWED_PACKAGE_SHA256='5ede06a341e9d83e3066f9802ec37911a62627e789382a1932f458583399e14a'
REVIEWED_BINDINGS_SHA256='df5711821ffc2c90113960dd100871f0a0b90a4482d8ce4d5b70706e4c87f168'
SOURCE_REFERENCE='Dieci problemi Cric distinti, risolti individualmente nella primaria prompt-only prima dei candidati; leggere le note per ID per modelli e domini.'
FALSE_PROOF='La proiezione di un vettore sul semiasse negativo deve avere componente positiva perché il modulo è positivo.'
SVG_MUTATION=(b'M200 355V203', b'M200 355V204')
SVG_LABEL_MUTATION=(b'N = 38 N', b'N = 39 N')
EXPECTED_MAPPING={1: ('C1-L005', ['C1-L005']), 2: ('C1-L005', ['C1-L005']), 3: ('C1-L005', ['C1-L005']), 4: ('C1-L005', ['C1-L005']), 5: ('C1-L005', ['C1-L005']), 6: ('C1-L005', ['C1-L005']), 7: ('C1-L005', ['C1-L005']), 8: ('C1-L005', ['C1-L005']), 9: ('C1-L005', ['C1-L005']), 10: ('C1-L005', ['C1-L005'])}
NUMERIC_UNITS={}
OPTION_SUFFIX={2: ' N', 4: ' N', 6: ' m/s²', 8: ' N', 10: ' N'}
UNITS={1: 'meter/second', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'dimensionless', 6: 'meter/second**2', 7: 'newton', 8: 'newton', 9: 'newton', 10: 'newton'}
MANUAL=['Con massa costante positiva in riferimento inerziale,F_R=ma=0 implica a=0. Il pattino già in moto conserva la velocità vettoriale, non deve arrestarsi.', 'Secchio a velocità costante:a_y=0. Con verso positivo alto,T−mg=0 e T=(16/5)·10=32 N, pur mentre il secchio sale.', 'Il peso è forza della Terra sul libro. La reazione della stessa interazione è forza gravitazionale del libro sulla Terra, destinatario diverso; normale non è quella reazione.', 'Peso50 N verso il basso, fune12 N e normaleN verso l’alto. Equilibrio verticale:N+12−50=0, N=38 N>0, contatto possibile.', 'Un riferimento in cui un corpo isolato mantiene velocità vettoriale costante è inerziale; non serve quiete assoluta, né ogni corpo deve essere fermo.', 'Forze ortogonali6 e8 N: risultante√(36+64)=10 N. Per massa5 kg,modulo accelerazione2 m/s²; peso e normale compensati.', 'Sistema dei due blocchi esclude mano, piano e Terra. La spinta della mano attraversa il confine ed è orizzontale esterna; contatto fra blocchi interno e opposto.', 'Massa invariata m=P_T/g_T=24/10=12/5 kg. Nuovo peso m g_A=(12/5)·4=48/5 N, non cambia massa ma cambia la forza gravitazionale.', 'Filo ideale teso rettilineo tira lungo se stesso dal corpo verso il supporto. ModuloT≥0, direzione assegnata dal segmento; non spinge e non deve essere verticale.', 'Asse normale al piano fisso, accelerazione normale nulla. N−mg cos60°=0, N=2·10·(1/2)=10 N>0; non equilibra tutta la componente parallela.']
DISTRACTORS=['Rallentare,curvare o accelerare richiedono risultante;la quiete è possibile in generale ma esclusa dal moto iniziale assegnato.', 'Zero è risultante,64 somma forze opposte,3,2 copia la massa e320 aggiunge un fattore10.', 'La normale agisce sullo stesso libro e appartiene a interazione diversa;libro sul tavolo reagisce alla normale,non al peso.', '50 omette fune,62 la somma al sostegno richiesto,12 copia Ty,−38 dà verso errato alla spinta del supporto.', 'Rotante non è generalmente inerziale;quiete assoluta,tutti fermi e assenza del tempo non definiscono il principio.', '14/5 somma moduli,6/5 e8/5 sono componenti,10 copia il coefficiente della risultante in N anziché dividere per5 kg.', 'I contatti hanno sorgente/destinatario interni;sommarli di nuovo duplica interazioni. Peso esterno è verticale e non risponde alla domanda.', '24 conserva erroneamente il peso,60 inverte gravità,2,4 copia massa,96 moltiplica un peso per nuova g senza togliere vecchia g.', 'Verticale vale solo per filo verticale;perpendicolare non è trazione;allontanare dal supporto richiederebbe spinta del filo.', '20 uguaglia N a tutto il peso;10√3 è componente parallela,zero elimina il sostegno e40 divide per coseno invece di proiettare.']
ASSUMPTIONS=['Pattino già in moto, massa costante positiva, risultante nulla e riferimento inerziale.', 'Massa totale del secchio3,2 kg,filo verticale ideale,solo peso e tensione,velocità costante,g=10 m/s².', 'Libro sulla Terra: richiesta della coppia gravitazionale del terzo principio, non della forza che lo mantiene fermo sul tavolo.', 'Blocco5 kg su piano orizzontale fisso,a_y=0,g=10 m/s²; verticalmente solo peso,fune con Ty=12 N uscente e normale.', 'Definizione operativa inerziale: corpo isolato e velocità vettoriale costante. Nessuna immobilità assoluta assunta.', 'Piattaforma5 kg,due spinte orizzontali ortogonali6/8 N;normale e peso compensati,nessuna ulteriore resistenza.', 'Due blocchi su piano liscio,mano esclusa dal sistema insieme a piano/Terra;si chiede una forza orizzontale esterna.', 'Peso iniziale24 N con g_T=10 m/s²,nuova g_A=4 m/s² e stessa massa del corpo.', 'Filo ideale teso,rettilineo e obliquo,fissato a un supporto;forza di trazione sul corpo non necessariamente in equilibrio.', 'Massa2 kg,rampa rettilinea fissa60°,contatto e accelerazione normale nulla;solo peso e normale lungo quel normale,g=10 m/s².']
PEDAGOGY=['Inerzia e moto preesistente separati dall’idea di forza motrice necessaria.', 'Velocità costante non significa tensione nulla.', 'Sorgente e destinatario scambiati nella stessa interazione.', 'Bilancio di sole componenti verticali e controllo del contatto.', 'Definizione del riferimento distinta da quiete o rotazione.', 'Somma vettoriale prima della divisione per massa.', 'Confine del sistema esplicito prima di sommare le forze.', 'Massa invariata ricavata prima del nuovo peso.', 'Filo può tirare ma non spingere,verso fissato dalla geometria.', 'Asse normale e proiezione del peso distinti dalla verticale.']
EXPECTED_IDS={'C1-Q046', 'C1-Q042', 'C1-Q050', 'C1-Q044', 'C1-Q041', 'C1-Q049', 'C1-Q047', 'C1-Q045', 'C1-Q043', 'C1-Q048'}
REVIEWED_CANDIDATES={'C1-Q041': '0effd0c2202bd07ce9524b88ea860b5f7dfe24c8796124232ab46dc46167902a', 'C1-Q042': 'afbfd084b06317cf2a8d0387a1f872f7cf33776bbaf43737661cc89dd24f6eeb', 'C1-Q043': '02ec415134c3887f98f8b756457f90e4159d382c4b6aff046debe2ff307bc2cb', 'C1-Q044': '851e867d00904603e90a49dae79b1eaa33363d0763c0ca0f399d6758a2b54770', 'C1-Q045': 'b1844656e5a29a31af23723bfee05f1cba499ae39cc37a3ca33730faa86a4dc1', 'C1-Q046': 'ae71bbbb85482edc8733afae3420530f6b81feb451b4323b6193bb15c6a01ac6', 'C1-Q047': 'dbe89e5fad6023df6bde08494a9d421e177abcd9d87661608cddad8a577db5bc', 'C1-Q048': '5864cee08c28bc97737c451768c532b6e0546c9e1eabd91223043fcc6ed77a27', 'C1-Q049': '202f69babf75858210e874e8e93ee0fa1f937ebef603f4a7cb72d54c564bd036', 'C1-Q050': '8859963e8a0e3454c65327572c709cbe1797f5adb1347a935f3ecb7e9c6a093f'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1900, 1)), (Fraction(180, 1), Fraction(345, 1), Fraction(240, 1), Fraction(20, 1))}
REQUIRED_PATHS={'M224.019 1487.154V1627.154', 'M224.019 1487.154L163.397 1452.154', 'M200 1010V770', 'M0 0L10 5L0 10Z', 'M170 1010H440M200 1040V750', 'M300 355V555', 'M200 770H380V1010', 'M400 355V307', 'M224.019 1487.154L284.641 1522.154', 'M200 355V203', 'M130 1710L350 1328.949M130 1710H390', 'M200 1010H380', 'M200 1010L380 770', 'M170 1710A40 40 0 0 0 150 1675.359'}
REQUIRED_CIRCLES={(Fraction(224019, 1000), Fraction(743577, 500), Fraction(5, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Isolare il corpo, poi proiettare', '1 · La fune sostiene parte del peso', 'N = 38 N', 'Tᵧ = 12 N', 'P = 50 N', 'Bilancio verticale: 38 N + 12 N = 50 N.', 'Frecce separate sul corpo per leggerle.', '2 · Sommare due spinte ortogonali', 'O', '6 N', '8 N', '10 N', 'Risultante: √(6² + 8²) N = 10 N.', 'Massa 5 kg: a = 10 N / (5 kg) = 2 m/s².', '3 · Normale su una rampa a 60°', '60°', 'N = 10 N', 'mg cos 60° = 10 N', 'P = 20 N', 'La freccia tratteggiata è una componente', 'del peso, non una forza aggiuntiva.', 'N bilancia soltanto la componente normale.')
GEOMETRY_REVIEW='XML e nuovo PNG indipendente640×1900 letti per intero. Bilancio verticale: N38N lungo152,Ty12N lungo48,P50N lungo200, scala comune4coordinate/N e152+48=200. Secondo pannello forza6/8/10N con segmenti180/240/300, scala comune30coordinate/N. Rampa60°:peso20N lungo140, normale10N lungo70, vettori normali opposti con componenti±(60.622,35); tangente della rampa(220,−381.051) perpendicolare alla normale. Corpo indicato sopra la superficie, assi e testi leggibili; componente tratteggiata distinta da forza aggiuntiva.'
DECIMAL_REGRESSION_NUMBER=2
EXPECTED_CONTEXT={'C1-Q041': {'id': 'C1-Q041', 'kind': 'question', 'course': 'C1', 'order': 41, 'skill': 'C1-L005', 'family': 'muoversi-senza-risultante', 'difficulty': 1, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q042': {'id': 'C1-Q042', 'kind': 'question', 'course': 'C1', 'order': 42, 'skill': 'C1-L005', 'family': 'trazione-verticale-a-velocita-costante', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q043': {'id': 'C1-Q043', 'kind': 'question', 'course': 'C1', 'order': 43, 'skill': 'C1-L005', 'family': 'la-coppia-del-terzo-principio', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q044': {'id': 'C1-Q044', 'kind': 'question', 'course': 'C1', 'order': 44, 'skill': 'C1-L005', 'family': 'una-trazione-solleva-in-parte-il-peso', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 2}, 'C1-Q045': {'id': 'C1-Q045', 'kind': 'question', 'course': 'C1', 'order': 45, 'skill': 'C1-L005', 'family': 'il-riferimento-adatto', 'difficulty': 1, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q046': {'id': 'C1-Q046', 'kind': 'question', 'course': 'C1', 'order': 46, 'skill': 'C1-L005', 'family': 'due-forze-perpendicolari-sul-carrello', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q047': {'id': 'C1-Q047', 'kind': 'question', 'course': 'C1', 'order': 47, 'skill': 'C1-L005', 'family': 'due-corpi-spinti-insieme', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q048': {'id': 'C1-Q048', 'kind': 'question', 'course': 'C1', 'order': 48, 'skill': 'C1-L005', 'family': 'massa-su-un-altro-pianeta', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q049': {'id': 'C1-Q049', 'kind': 'question', 'course': 'C1', 'order': 49, 'skill': 'C1-L005', 'family': 'dove-disegnare-la-tensione', 'difficulty': 2, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}, 'C1-Q050': {'id': 'C1-Q050', 'kind': 'question', 'course': 'C1', 'order': 50, 'skill': 'C1-L005', 'family': 'reazione-di-un-supporto-inclinato', 'difficulty': 3, 'prerequisites': ['C1-L005'], 'exam': None, 'version': 1}}
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
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return mapped_literal(option.removesuffix(suffix) if suffix else option)
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_NUMERIC_EXPRESSIONS:return sp.Rational(KNOWN_NUMERIC_EXPRESSIONS[raw])
    return parse_literal(raw)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded quantity literal required')
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
    assert sp.simplify(v['C1-Q042']-sp.Rational(32))==0
    assert sp.simplify(v['C1-Q044']-sp.Rational(38))==0
    assert sp.simplify(v['C1-Q046']-sp.Rational(2))==0
    assert sp.simplify(v['C1-Q048']-sp.Rational('48/5'))==0
    assert sp.simplify(v['C1-Q050']-sp.Rational(10))==0
    assert d['C1-Q019']==v['C1-Q019']==2
    return ['Mantiene la velocità vettoriale iniziale',v['C1-Q042'],'La forza gravitazionale del libro sulla Terra',v['C1-Q044'],'Inerziale',v['C1-Q046'],'La forza della mano sul primo blocco',v['C1-Q048'],'Lungo il filo, dal corpo verso il supporto',v['C1-Q050']]
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
    if root.get('viewBox')!='0 0 640 1900':raise ValueError('Independent physical scale viewport changed')
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c1_l005_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
