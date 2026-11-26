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
CANDIDATE_REF='bb1838bc2cda1fa04a269dbca40c2284190f5889'
PRIMARY_SHA256='2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C1.json', 'sourceSha256': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf', 'primarySkill': 'C1-L003', 'title': 'Leggere il movimento nel tempo', 'actualLessonPrerequisites': ['C1-L001', 'C1-L002']}
FAMILY='cric-c1-l003'
BATCH='cric-c1-l003'
ASSET_NAME='cric-c1-l003-progressive.svg'
REVIEWED_PACKAGE_SHA256='265609e34cd5d2ff2573f939517df3454ba54c56120d078b2623b7371ae6ae1a'
REVIEWED_BINDINGS_SHA256='e8ecee4331e1a3210fec8fef71f5b7e065d9b3348863ff454393883ed2d8c918'
SOURCE_REFERENCE='Dieci problemi Cric distinti, risolti individualmente nella primaria prompt-only prima dei candidati; leggere le note per ID per modelli e domini.'
FALSE_PROOF='La proiezione di un vettore sul semiasse negativo deve avere componente positiva perché il modulo è positivo.'
SVG_MUTATION=(b'M120 380L280 260', b'M120 380L280 261')
SVG_LABEL_MUTATION=(b'+12 m', b'+13 m')
EXPECTED_MAPPING={1: ('C1-L003', ['C1-L003']), 2: ('C1-L003', ['C1-L003']), 3: ('C1-L003', ['C1-L003']), 4: ('C1-L003', ['C1-L003']), 5: ('C1-L003', ['C1-L003']), 6: ('C1-L003', ['C1-L003']), 7: ('C1-L003', ['C1-L003']), 8: ('C1-L003', ['C1-L003']), 9: ('C1-L003', ['C1-L003']), 10: ('C1-L003', ['C1-L003'])}
NUMERIC_UNITS={}
OPTION_SUFFIX={1: ' m', 2: ' m/s', 6: ' s', 7: ' m', 9: ' m/s²'}
UNITS={1: 'meter', 2: 'meter/second', 3: 'meter/second', 4: 'meter/second', 5: 'meter', 6: 'second', 7: 'meter', 8: 'meter/second', 9: 'meter/second**2', 10: 'meter'}
MANUAL=['La legge uniforme x=x₀+vt usa x₀=−12 m,v=5/2 m/s,t=8 s: x=−12+20=8 m. La posizione finale è distinta dallo spostamento20 m.', 'Due tratti uguali12 m a2 e3 m/s richiedono6 e4 s. La rapidità media è24/10=12/5 m/s; la media aritmetica5/2 non pesa le durate diverse.', 'v<0 indica verso x decrescenti; pendenza positiva del grafico v–t implica a>0. Poiché |v|=−v nell’intervallo, la rapidità diminuisce: non si deduce il segno di x.', 'La velocità istantanea è dx/dt, pendenza della tangente a x–t nel punto. Una secante dà una media su un intervallo e coincide solo in casi particolari.', 'Spostando l’origine5 m a destra, x′=x−5 m. La differenza fra due posizioni e le derivate sono invariate; cambia la coordinata assoluta.', 'Incontro:2t=15−t con unità dei coefficienti m/s. Da3t=15 ricavo t=5 s e in entrambe le leggi x=10 m; dominio t≥0 rispettato.', 'Le aree orientate sono3·4=12 m e−2·5=−10 m. Somma2 m; la distanza è22 m perché somma i moduli dei due spostamenti.', 'Orizzontale sopra zero in x–t significa x positiva costante e v=0. In v–t significa v positiva costante e a=0; la posizione di quel secondo moto resta non determinata.', 'La media è(v_f−v_i)/Δt=(1−(−3))/2=2 m/s². L’accelerazione non deve essere costante; −1 m/s² deriva dai moduli(1−3)/2.', 'La traiettoria è l’insieme geometrico delle posizioni attraversate. La legge oraria vi associa tempi; né velocità né accelerazione sono l’insieme di punti nello spazio.']
DISTRACTORS=['20 m omette x₀;−32 m usa velocità negativa;32 m aggiunge il modulo della posizione iniziale;−8 m cambia il segno del risultato.', '5/2 m/s è la media semplice non temporale;5 somma rapidità;6/5 dimezza ancora;2 copia la prima rapidità.', 'Grafico crescente non implica moto verso x crescente; v negativa non significa quiete o posizione necessariamente negativa.', 'La secante è velocità media; l’orizzontale ha pendenza zero; dall’origine vale solo se quel punto è pertinente; la normale non dà dx/dt.', 'Differenze e derivate eliminano la costante−5 m; anche distanza fisica e verso del moto restano invariati.', '15 s e15/2 s usano una sola velocità;10 copia la posizione in metri;−5 s non soddisfa l’incontro né il dominio.', '22 m è distanza,−2 inverte la differenza,−22 impone segni entrambi negativi;7 m non è la somma delle aree.', 'La linea orizzontale annulla la derivata dell’ordinata, che cambia fra i due grafici; v>0 non determina x>0.', '−1 usa i moduli,1 perde la variazione attraverso zero,−2 scambia estremi;4 copia Δv senza dividere per2 s.', 'Legge oraria comprende il tempo; il grafico v–t riguarda velocità e tempo, spostamento è differenza di posizioni e accelerazione una derivata.']
ASSUMPTIONS=['Un solo asse, x₀=−12 m e velocità costante+2,5 m/s per8 s; origine e orientazione fisse.', 'Percorso complessivo24 m diviso in due tratte di12 m, senza pause, rapidità costanti2 e3 m/s.', 'Grafico della componente v nel tempo con v negativa e crescente nell’intervallo; non un grafico di posizione.', 'Legge x(t) differenziabile nell’istante, velocità istantanea e non media fra tempi lontani.', 'Riferimento traslato spazialmente di5 m a destra, stesso verso, unità e origine temporale; traslazione fissa.', 'Due punti sulla stessa retta, x_A=(2 m/s)t e x_B=15 m−(1 m/s)t, t≥0 e nessun cambio di regime.', 'Due intervalli successivi,4 s a+3 m/s e5 s a−2 m/s, stessa orientazione.', 'Due grafici autonomi: uno x–t e uno v–t, entrambi piatti con ordinata positiva; ordinata da identificare prima del moto.', 'Velocità orientate iniziale−3 m/s e finale+1 m/s separate da2 s; nessuna ipotesi di accelerazione costante.', 'Descrizione geometrica del luogo delle posizioni, distinta dall’assegnazione temporale di un moto.']
PEDAGOGY=['Condizione iniziale con segno conservata prima del prodotto vt.', 'Media totale come rapporto spazio/tempo, con due durate diverse esplicite.', 'Segni di x,v,a e rapidità distinti.', 'Tangente e secante separate mediante derivata e media.', 'Stessa traslazione sottratta agli estremi prima del bilancio.', 'Condizione simultanea di incontro e controllo in entrambe le leggi.', 'Aree positive e negative confrontate con distanza cumulativa.', 'Nome degli assi letto prima della forma del grafico.', 'Variazione orientata e media senza introdurre a costante.', 'Geometria della traiettoria separata dalla temporizzazione.']
EXPECTED_IDS={'C1-Q026', 'C1-Q030', 'C1-Q027', 'C1-Q029', 'C1-Q024', 'C1-Q025', 'C1-Q021', 'C1-Q028', 'C1-Q022', 'C1-Q023'}
REVIEWED_CANDIDATES={'C1-Q021': '53d552c1deafbcb0786e6f72723d8ad87c012c2d55121980dff7a32ee0106288', 'C1-Q022': 'd05f233aff97897f7fad424acb5e477392fabf5263f310a264c59ee83c092bd8', 'C1-Q023': '3391341f32f3f23e3ca8e33d0ad77d04e834c6fe320137d2a9e9ec88a4396572', 'C1-Q024': '3bf5fbeb9911963a1bbeaa259751125849a90746e9abe2b4f8ea0023852366ed', 'C1-Q025': '6de7abb913d59c9bad0571b8321cf080a1ab8109b13df85c71774c1befc668fd', 'C1-Q026': 'd0e1c753c3ed5793712a646b75b49eed76f400341a57c164f9b215ba1bcb70b2', 'C1-Q027': 'c7aa677c3556d327bfd1c3cb4ebe802d6a716d38eab917bde395c08554ae65c6', 'C1-Q028': 'c77e5fb731d2df11f2c399b8dffee766c494dcb53d237699d3f367afa983134f', 'C1-Q029': '06b7c98b3bd75ae556087f4193674354b18a68f1f661be2bc62c9a89b5249f06', 'C1-Q030': 'e4a8ca37b9a61b19ab0fd092778459de312a96cc6cc170845a7a8c1392b1a1b1'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1740, 1)), (Fraction(280, 1), Fraction(1430, 1), Fraction(200, 1), Fraction(80, 1)), (Fraction(120, 1), Fraction(1310, 1), Fraction(160, 1), Fraction(120, 1))}
REQUIRED_PATHS={'M120 450V165M100 200H530', 'M120 870H320V990', 'M280 260V200M120 260H280', 'M120 990L400 822', 'M280 1310V1510', 'M120 1570V1260M100 1430H530', 'M120 1010V755M100 990H505', 'M120 1310H280M280 1510H480', 'M120 380L280 260', 'M120 810L400 894'}
REQUIRED_CIRCLES={(Fraction(320, 1), Fraction(870, 1), Fraction(5, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Prima gli assi, poi la forma', '1 · v negativa ma crescente', 'v (m/s)', 't (s)', '0', '−3', '−1', '2', 'v < 0: il moto procede verso x minori.', 'La rapidità scende da 3 m/s a 1 m/s.', '2 · Stessa posizione allo stesso tempo', 'x (m)', 't (s)', '0', '15', '10', '5', 'A', 'B', 'Incontro: t = 5 s, x = 10 m.', 'Le pendenze sono +2 m/s e −1 m/s.', '3 · Aree di segno opposto', 'v (m/s)', 't (s)', '3', '−2', '0', '4', '9', '+12 m', '−10 m', 'Spostamento: 12 m−10 m = 2 m.', 'Distanza: 12 m+10 m = 22 m.')
GEOMETRY_REVIEW='XML finale e nuovo PNG indipendente640×1740 letti per intero; vecchia resa con due contatti conservata separatamente. Primo grafico: origine velocità y200, scala60/(m/s),−3 a380,−1 a260; due secondi in160coordinate. Le label2 e titolo v sono ora lontane dalle linee. Secondo:40coordinate/s e12/m, incontro(320,870) corrisponde5s,10m. Terzo:40/s e40/(m/s), aree3·4=12m e−2·5=−10m, spostamento2m e distanza22m. Nessuna nuova ambiguità grafica.'
DECIMAL_REGRESSION_NUMBER=1
EXPECTED_CONTEXT={'C1-Q021': {'id': 'C1-Q021', 'kind': 'question', 'course': 'C1', 'order': 21, 'skill': 'C1-L003', 'family': 'partenza-lontano-dallorigine', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q022': {'id': 'C1-Q022', 'kind': 'question', 'course': 'C1', 'order': 22, 'skill': 'C1-L003', 'family': 'due-tratti-di-pari-lunghezza', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q023': {'id': 'C1-Q023', 'kind': 'question', 'course': 'C1', 'order': 23, 'skill': 'C1-L003', 'family': 'un-grafico-sotto-lo-zero', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 2}, 'C1-Q024': {'id': 'C1-Q024', 'kind': 'question', 'course': 'C1', 'order': 24, 'skill': 'C1-L003', 'family': 'una-lettura-allistante', 'difficulty': 1, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q025': {'id': 'C1-Q025', 'kind': 'question', 'course': 'C1', 'order': 25, 'skill': 'C1-L003', 'family': 'traslare-lorigine-spaziale', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q026': {'id': 'C1-Q026', 'kind': 'question', 'course': 'C1', 'order': 26, 'skill': 'C1-L003', 'family': 'intersezione-di-due-leggi-orarie', 'difficulty': 3, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q027': {'id': 'C1-Q027', 'kind': 'question', 'course': 'C1', 'order': 27, 'skill': 'C1-L003', 'family': 'aree-di-segno-opposto', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 2}, 'C1-Q028': {'id': 'C1-Q028', 'kind': 'question', 'course': 'C1', 'order': 28, 'skill': 'C1-L003', 'family': 'tratto-orizzontale-in-due-grafici', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 2}, 'C1-Q029': {'id': 'C1-Q029', 'kind': 'question', 'course': 'C1', 'order': 29, 'skill': 'C1-L003', 'family': 'una-variazione-durante-la-retromarcia', 'difficulty': 2, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}, 'C1-Q030': {'id': 'C1-Q030', 'kind': 'question', 'course': 'C1', 'order': 30, 'skill': 'C1-L003', 'family': 'la-curva-nello-spazio-reale', 'difficulty': 1, 'prerequisites': ['C1-L003'], 'exam': None, 'version': 1}}
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
    assert sp.simplify(v['C1-Q021']-sp.Rational(8))==0
    assert sp.simplify(v['C1-Q022']-sp.Rational('12/5'))==0
    assert sp.simplify(v['C1-Q026']-sp.Rational(5))==0
    assert sp.simplify(v['C1-Q027']-sp.Rational(2))==0
    assert sp.simplify(v['C1-Q029']-sp.Rational(2))==0
    assert d['C1-Q019']==v['C1-Q019']==2
    return [v['C1-Q021'],v['C1-Q022'],'Verso x decrescenti, rallentando','La tangente al grafico nell’istante','La coordinata della posizione',v['C1-Q026'],v['C1-Q027'],'x–t: fermo a posizione positiva; v–t: moto a velocità positiva costante',v['C1-Q029'],'Traiettoria']
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c1_l003_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
