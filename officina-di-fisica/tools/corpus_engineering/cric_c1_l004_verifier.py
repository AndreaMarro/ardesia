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
CANDIDATE_REF='4854852966e56fbf26f9cbd4dfb85661b8a345e9'
PRIMARY_SHA256='2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C1.json', 'sourceSha256': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf', 'primarySkill': 'C1-L004', 'title': 'Accelerare in linea retta e in curva', 'actualLessonPrerequisites': ['C1-L002', 'C1-L003']}
FAMILY='cric-c1-l004'
BATCH='cric-c1-l004'
ASSET_NAME='cric-c1-l004-progressive.svg'
REVIEWED_PACKAGE_SHA256='9b39887f2f6881ab5261dd4f5f9d3ea54051c8979a41c90f219385b6967ba063'
REVIEWED_BINDINGS_SHA256='a27900961bf330c2f07c973663212d39a7eb830549f3ecfb96ebc138bbd60c6c'
SOURCE_REFERENCE='Dieci problemi Cric distinti, risolti individualmente nella primaria prompt-only prima dei candidati; leggere le note per ID per modelli e domini.'
FALSE_PROOF='La proiezione di un vettore sul semiasse negativo deve avere componente positiva perché il modulo è positivo.'
SVG_MUTATION=(b'M120 170L440 410', b'M120 170L441 410')
SVG_LABEL_MUTATION=(b'Area: 4 m', b'Area: 5 m')
EXPECTED_MAPPING={1: ('C1-L004', ['C1-L004']), 2: ('C1-L004', ['C1-L004']), 3: ('C1-L004', ['C1-L004']), 4: ('C1-L004', ['C1-L004']), 5: ('C1-L004', ['C1-L004']), 6: ('C1-L004', ['C1-L004']), 7: ('C1-L004', ['C1-L004']), 8: ('C1-L004', ['C1-L004']), 9: ('C1-L004', ['C1-L004']), 10: ('C1-L004', ['C1-L004'])}
NUMERIC_UNITS={}
OPTION_SUFFIX={1: ' m', 3: ' s', 4: ' m', 6: ' s', 7: ' m', 8: '', 10: ' m/s'}
UNITS={1: 'meter', 2: 'meter/second', 3: 'second', 4: 'meter', 5: 'second', 6: 'second', 7: 'meter', 8: 'dimensionless', 9: 'meter/second**2', 10: 'meter/second'}
MANUAL=['Primo arresto da v=4−2t=0: T=2 s. Fino a T velocità non negativa, distanza uguale allo spostamento. L’area triangolare è(1/2)·2·4=4 m.', 'Al culmine del lancio obliquo senza aria, v_y=0 ma v_x=v₀x≠0. La forza gravitazionale resta presente e a_y=−g, a_x=0.', 'Ritorno verticale: y=t(v₀−gt/2)=0. La radice iniziale0 è esclusa; T=2v₀/g=12/10=6/5 s, doppio del tempo di salita3/5 s.', 'Caduta da fermo:s(t)=gt²/2. Fra1 e2 s la distanza è5(4−1)=15 m, non il totale20 m misurato dall’inizio.', 'Stessa quota, v₀y=0 e stessa g rendono identico y(t), quindi T=√(2h/g) per entrambe. La componente orizzontale cambia solo la posizione di arrivo.', '30 giri/min sono1/2 giri/s. Il tempo di un giro è60/30=2 s, inverso della frequenza e non il conteggio30.', 'Raggio:v²/a_c=9/(9/2)=2 m. Controprova del distrattore3/2 m:9/(3/2)=6 m/s², non9/2. Il rapporto v/a_c avrebbe invece unità s e valore2/3.', 'A ω comune non nulla, a_c=ω²r. Il rapporto per2r e r è2; in v²/r anche v=ωr raddoppia, quindi la semplificazione dà4/2=2.', 'Il vettore velocità gira anche a modulo costante. La sua derivata è radiale entrante, modulo v²/r>0; l’accelerazione tangenziale è nulla.', 'La derivata di1+2t+3t² con coefficienti dimensionati è2+6t. A2 s vale14 m/s;8 m/s omette il fattore2 della derivata di t² ma mantiene t.']
DISTRACTORS=['8 m usa l’area del rettangolo,2 copia la durata,16 omette2|a| dalla relazione;−4 assegna alla distanza il segno di a.', 'Il culmine annulla solo v_y; gravità e accelerazione non si annullano. v_x non nulla impedisce la quiete istantanea.', '3/5 s è la salita;3 s non ricostruisce y=0;5/6 inverte la durata;zero è la partenza, non il ritorno.', '20 m è cumulativo;5 m è la prima caduta;10 presuppone uguali distanze a ogni secondo;25 somma le posizioni.', 'La componente orizzontale non modifica l’equazione verticale; massa e percorso obliquo non danno durate differenti nel modello.', '30 e60 copiano conteggio o durata totale;1/2 è frequenza in Hz,1800 moltiplica anziché dividere.', '1/2 m inverte il rapporto;3/2 m darebbe6 m/s²;9 m non divide v² per a_c;6 m non ricostruisce9/2 m/s².', '1/2 tiene v fisso erroneamente;4 omette il raggio raddoppiato al denominatore;1 confondeω e a;1/4 inverte un rapporto quadratico non pertinente.', 'Tangente è direzione della velocità; accelerazione uscente ha verso errato;zero richiederebbe velocità vettoriale costante, impossibile sul cerchio.', '17 copia x in metri;8 omette2 in d(t²)/dt;12 omette la velocità iniziale;6 copia il coefficiente di accelerazione, con altra unità.']
ASSUMPTIONS=['Moto rettilineo con v₀=4 m/s,a=−2 m/s² costante, arresto al primo zero, nessuna estensione al moto successivo.', 'Lancio obliquo con componente orizzontale non nulla, riferimento terrestre inerziale approssimato, g uniforme e nessuna aria.', 'Lancio verticale da quota iniziale con v₀=6 m/s,g=10 m/s²; ritorno alla stessa quota a tempo strettamente positivo.', 'Rilascio da fermo,g=10 m/s² costante, suolo non raggiunto entro2 s; intervallo1–2 s dal rilascio.', 'Due sfere dalla stessa altezza positiva sullo stesso piano orizzontale, rilascio simultaneo, v₀y=0 per entrambe e assenza di aria.', 'Rotazione uniforme a30 giri/min, conteggio completo dei giri e conversione esatta60 s per minuto.', 'Moto circolare con rapidità3 m/s e componente centripeta9/2 m/s² positive, raggio geometrico positivo.', 'Disco rigido in rotazione uniforme,ω≠0, due distanze positive r e2r dall’asse; accelerazioni confrontate allo stessoω.', 'Moto circolare uniforme con r>0,v>0: direzione dell’accelerazione fisica, senza forza centrifuga nel riferimento inerziale.', 'Legge x=1 m+(2 m/s)t+(3 m/s²)t² differenziabile, velocità istantanea richiesta a2 s.']
PEDAGOGY=['Evento di arresto definito prima della distanza.', 'Moduli, componenti e forza residua al culmine distinti.', 'Due radici e ramo temporale fisico identificati.', 'Due posizioni dalla stessa origine sottratte.', 'Indipendenza delle componenti motivata dalle leggi verticali.', 'Frequenza e periodo separati dimensionalmente.', 'Inversa simbolica e ricostruzione del dato a_c; attribuzione errata del vecchio distrattore corretta prima del freeze.', 'Grandezza realmente comune scelta prima della scalatura.', 'Accelerazione come variazione vettoriale distinta dal solo modulo.', 'Derivata con unità dei coefficienti, fattore2 esplicito e controprova del vecchio feedback corretto.']
EXPECTED_IDS={'C1-Q036', 'C1-Q035', 'C1-Q037', 'C1-Q038', 'C1-Q040', 'C1-Q031', 'C1-Q039', 'C1-Q032', 'C1-Q033', 'C1-Q034'}
REVIEWED_CANDIDATES={'C1-Q031': 'bbdb47ac6708df95e4a93387b690b69b3ce41ded9462f79643225ae2b50bf80e', 'C1-Q032': '92a85db50914b07b8a1da728ac0fa0c19509bd7af0153c80b1d685f219b97b2a', 'C1-Q033': 'e9c689b6f66e4c83f909dc3e38533dab41ff8707791a82fab74358032c5a392d', 'C1-Q034': '3e052fb8e18b958f029509738088b071b48e0c57d60fceaf49d9701200fe5343', 'C1-Q035': '7f07e7d6761879def92182da46aa9d69411b1714e4891a35edb90fb75a7f7634', 'C1-Q036': '6c1d6f756f47f7c421cf45e029e6873e01618d537fc445d9a03311bf6b2b3c05', 'C1-Q037': 'ca4f745e7758a91b765ec424fcb634d254b728cb0a15ba1ba4ba700f24804553', 'C1-Q038': '8ca562d7f9f9291bdf6f462bcc98a56da1d8bead83def9a6a1ab6a53f97be4e1', 'C1-Q039': '7a62b57241b681ee258009b1336fc9fda4807d0c85a69fbaff094e5e9bd4b2fb', 'C1-Q040': 'f7427ac5db7d9fd24298f9a13baf4cf83e938f36b63b279fc525adc83ede2efa'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1820, 1))}
REQUIRED_PATHS={'M120 1030Q300 670 480 1030', 'M120 170L440 410H120Z', 'M460 1500H360', 'M120 1060V750M100 1030H530', 'M300 1420V1470', 'M120 850H300V1030', 'M0 0L10 5L0 10Z', 'M120 440V160M100 410H520', 'M120 170L440 410'}
REQUIRED_CIRCLES={(Fraction(300, 1), Fraction(1500, 1), Fraction(4, 1)), (Fraction(460, 1), Fraction(1500, 1), Fraction(4, 1)), (Fraction(300, 1), Fraction(1420, 1), Fraction(4, 1)), (Fraction(300, 1), Fraction(1500, 1), Fraction(80, 1)), (Fraction(300, 1), Fraction(1500, 1), Fraction(160, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Leggere l’accelerazione', '1 · Arrestarsi senza prolungare il moto', 'v (m/s)', 't (s)', '4', '0', '2', 'Area: 4 m', 'D = metà di (2 s) × (4 m/s) = 4 m.', 'Il modello si ferma al primo arresto.', '2 · Ritornare alla stessa quota', 'y (m)', 't (s)', '9/5', '0', '3/5', '6/5', 'Salita: 3/5 s. Ritorno: 6/5 s.', 'La curva rappresenta la quota nel tempo.', '3 · Stesso disco, stessa ω', 'O', 'r', '2r', 'a₁', 'a₂ = 2a₁', 'Le frecce a₁ e a₂ usano la stessa scala.', 'Entrambe puntano al centro; a_c = ω²r.')
GEOMETRY_REVIEW='XML e nuovo PNG indipendente640×1820 letti integralmente. Triangolo velocità-tempo:2s in320coordinate,4m/s in240, area fisica4m. Quota-tempo: ritorno6/5s in360coordinate; Bezier quadratica da(120,1030) controllo(300,670) a(480,1030), vertice(300,850)=3/5s,9/5m; scala100coordinate/m. Disco:r80,2r160, frecce radiali50 e100 verso il centro, rapporto2 aω comune. Nessuna label tagliata o sovrapposta rilevata.'
DECIMAL_REGRESSION_NUMBER=1
EXPECTED_CONTEXT={'C1-Q031': {'id': 'C1-Q031', 'kind': 'question', 'course': 'C1', 'order': 31, 'skill': 'C1-L004', 'family': 'arresto-a-decelerazione-costante', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q032': {'id': 'C1-Q032', 'kind': 'question', 'course': 'C1', 'order': 32, 'skill': 'C1-L004', 'family': 'la-cima-della-traiettoria', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q033': {'id': 'C1-Q033', 'kind': 'question', 'course': 'C1', 'order': 33, 'skill': 'C1-L004', 'family': 'ritorno-alla-quota-di-partenza', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q034': {'id': 'C1-Q034', 'kind': 'question', 'course': 'C1', 'order': 34, 'skill': 'C1-L004', 'family': 'caduta-durante-il-secondo-secondo', 'difficulty': 3, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 2}, 'C1-Q035': {'id': 'C1-Q035', 'kind': 'question', 'course': 'C1', 'order': 35, 'skill': 'C1-L004', 'family': 'una-coppia-di-lanci', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q036': {'id': 'C1-Q036', 'kind': 'question', 'course': 'C1', 'order': 36, 'skill': 'C1-L004', 'family': 'lettura-dei-giri-al-minuto', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q037': {'id': 'C1-Q037', 'kind': 'question', 'course': 'C1', 'order': 37, 'skill': 'C1-L004', 'family': 'raggio-dalla-curvatura-nota', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q038': {'id': 'C1-Q038', 'kind': 'question', 'course': 'C1', 'order': 38, 'skill': 'C1-L004', 'family': 'due-punti-sullo-stesso-disco', 'difficulty': 2, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}, 'C1-Q039': {'id': 'C1-Q039', 'kind': 'question', 'course': 'C1', 'order': 39, 'skill': 'C1-L004', 'family': 'verso-dellaccelerazione-normale', 'difficulty': 1, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 2}, 'C1-Q040': {'id': 'C1-Q040', 'kind': 'question', 'course': 'C1', 'order': 40, 'skill': 'C1-L004', 'family': 'trovare-la-velocita-del-fotogramma', 'difficulty': 3, 'prerequisites': ['C1-L004'], 'exam': None, 'version': 1}}
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
def _disk_ratio():
    r,w=sp.symbols("r w",positive=True)
    return sp.cancel((w**2*(2*r))/(w**2*r))
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert sp.simplify(v['C1-Q031']-sp.Rational(4))==0
    assert sp.simplify(v['C1-Q033']-sp.Rational('6/5'))==0
    assert sp.simplify(v['C1-Q034']-sp.Rational(15))==0
    assert sp.simplify(v['C1-Q036']-sp.Rational(2))==0
    assert sp.simplify(v['C1-Q037']-sp.Rational(2))==0
    assert sp.simplify(_disk_ratio()-sp.Rational(2))==0
    assert sp.simplify(v['C1-Q040']-sp.Rational(14))==0
    assert d['C1-Q019']==v['C1-Q019']==2
    return [v['C1-Q031'],'v_y=0, v_x resta non nulla e l’accelerazione è verso il basso',v['C1-Q033'],v['C1-Q034'],'Toccano il suolo nello stesso istante',v['C1-Q036'],v['C1-Q037'],_disk_ratio(),'Verso il centro del cerchio',v['C1-Q040']]
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
    if root.get('viewBox')!='0 0 640 1820':raise ValueError('Independent physical scale viewport changed')
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c1_l004_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
