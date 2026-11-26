"""Independent source-first Cric electric charge and Coulomb forces; no candidate authoring imports.
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
SOURCE_PATH='officina-di-fisica/content/C4.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='5162581bc4dc366e2a1fe26c00966661f1eae97cba671a8081a1a938cd00bc3a'
CANDIDATE_REF='c45cdc5edb5be3d457e0ec952617610a1f5ce825'
PRIMARY_SHA256='34337ec50e90ae61e6a447c62a98c698bf14a4bc47b24f92586a6e4bcd27f6ea'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L02', 'title': 'Guardare il campo prima della forza', 'actualLessonPrerequisites': ['C4-L01']}
FAMILY='cric-c4-l02'
BATCH='cric-c4-l02'
ASSET_NAME='cric-c4-l02-progressive.svg'
REVIEWED_PACKAGE_SHA256='875dfc728217e594ff7bf4a130804e8dbb52a3f4768b1a099b1e341e8e86e6de'
REVIEWED_BINDINGS_SHA256='4850e87421a372099fd23ae9160d3c1391cf881cf65e4317c8e7e8f70954d02c'
SOURCE_REFERENCE='Ten distinct original Cric C4 questions read completely after their frozen prompt-only primary and computations; no authoring module imported.'
FALSE_PROOF='Il segno e le condizioni al contorno non cambiano mai alcuna previsione elettrica.'
SVG_MUTATION=(b'M140 1360H320', b'M140 1360H321')
SVG_LABEL_MUTATION=(b'300 N/C', b'301 N/C')
EXPECTED_MAPPING={11: ('C4-L02', ['C4-L01']), 12: ('C4-L02', ['C4-L01']), 13: ('C4-L02', ['C4-L01']), 14: ('C4-L02', ['C4-L01']), 15: ('C4-L02', ['C4-L01']), 16: ('C4-L02', ['C4-L01']), 17: ('C4-L02', ['C4-L01']), 18: ('C4-L02', ['C4-L01']), 19: ('C4-L02', ['C4-L01']), 20: ('C4-L02', ['C4-L01'])}
NUMERIC_UNITS={12: 'N/C', 14: 'cm', 16: 'cm', 18: 'N/C', 20: 's'}
OPTION_SUFFIX={12: ' N/C', 14: ' cm', 16: ' cm', 18: ' N/C', 20: ' s'}
UNITS={11: 'dimensionless', 12: 'newton/coulomb', 13: 'dimensionless', 14: 'centimeter', 15: 'dimensionless', 16: 'centimeter', 17: 'dimensionless', 18: 'newton/coulomb', 19: 'dimensionless', 20: 'second'}
MANUAL=['Il campo resta invariato perché le sorgenti sono inalterate e la carica di prova è non perturbativa. La forza qE cambia verso, mantenendo il modulo per cariche di prova di uguale valore assoluto.', 'Il campo è F/q, diretto come la forza su una prova positiva. E=(1,2×10⁻⁶)/(4,0×10⁻⁹)=300 N/C verso est; il prompt richiede soltanto il modulo.', 'La parola è tangente. Il vettore campo non nullo ha direzione tangente alla propria linea di campo nel punto, con il verso stabilito dal campo.', 'Fra sorgenti positive i contributi hanno verso opposto. kq/x²=4kq/(30−x)² implica 30−x=2x nel ramo interno positivo; x=10 cm da +q. L’altra distanza è 20 cm, non 10 cm da entrambe.', 'Un campo non nullo assegna una sola direzione in ogni punto. Due tangenti differenti darebbero due direzioni incompatibili nello stesso punto; la rappresentazione è errata per un campo elettrostatico ben definito.', 'Il tempo è fissato dal moto orizzontale uniforme: t=0,80/4=1/5 s. Verticalmente y=(1/2)·6·(1/5)²=3/25 m=12 cm verso y positivo. Non si usa direttamente lo spostamento orizzontale come tempo.', 'La sorgente è negativa, perché le linee di campo entrano nelle cariche negative e ne escono per le positive. Il numero delle linee in un disegno non basta a determinare il valore numerico della carica.', 'Le componenti ortogonali vanno composte come vettori: |E|=√(300²+400²)=500 N/C. Il triangolo 3–4–5 rende il calcolo esatto senza trigonometria o calcolatrice.', 'La forza qE e quindi l’accelerazione sono verso sinistra, opposte al campo, perché la carica è negativa. Appena rilasciata da ferma la particella comincia a muoversi verso sinistra; non ha velocità iniziale verso il campo.', 'Con asse positivo verso destra, v(t)=6−3t. Al primo arresto v=0, quindi t=2 s; dopo quel tempo la velocità diventa negativa e il moto inverte verso. Campo e accelerazione sono costanti nel tratto assegnato.']
DISTRACTORS=['Source field does not reverse with the test particle; equal charge magnitudes preserve force magnitude.', '0.3 omits micro/nano factor 1000;4800 N/C would give 19.2 microN rather than 1.2.', 'Normal is perpendicular; a remote secant is not the local tangent; gravity is unrelated.', '15 cm leaves a fourfold field mismatch;20 cm is distance from the stronger source.', 'Lines are representations, not independent sources; their crossing cannot give two resultant vectors.', '24 cm omits half;60 cm requires 30 m/s² over 0.20 s rather than 6; horizontal acceleration remains zero.', 'Positive source has outward lines; a zero source cannot produce the specified nonzero radial pattern.', '700 assumes concordant collinear components and 100 opposite collinear components; neither applies.', 'Negative charge reverses force; zero initial velocity does not cancel nonzero acceleration.', 'At 1 s velocity is+3 and at 3 s−3 m/s; a/v has dimension inverse time.']
ASSUMPTIONS=['External nonzero field fixed by unperturbed sources; probe charge changes from +q to −q with q positive.', 'Positive nonperturbing probe 4 nC, force 1.2 microN east; field equals force per charge.', 'Regular point with nonzero field; local line tangent defines direction.', 'Two stationary positive point sources q and 4 q in vacuum, q positive, separation 30 cm; point lies strictly between them.', 'Nonzero resultant field at regular point; two distinct tangents cannot define one vector.', 'Only electric force, constant horizontal speed 4 m/s and vertical acceleration 6 m/s² from zero transverse speed; active region contains the considered path.', 'Single nonzero central point source, inward radial field lines defined by a positive probe.', 'Two nonzero perpendicular contributions 300 and 400 N/C, east and north.', 'Negative charge and positive mass, initially at rest, nonzero uniform field right, no other forces.', 'Uniform electric acceleration left persists throughout inversion, initial speed right 6 m/s and acceleration magnitude 3 m/s².']
PEDAGOGY=['Separate field of sources from force on a probe.', 'Interpret prefixes before division and check inverse multiplication.', 'Local geometry rather than shape of a whole curve.', 'Positive-root inverse and vector cancellation distinguished.', 'Uniqueness of a local vector has explicit nonzero condition.', 'Use one time for two independent component equations.', 'Relate line direction to sign of source.', 'Manual 3–4–5 triangle with dimensioned squares.', 'Release instant and immediately subsequent motion are distinguished.', 'Stopping instant is a change of velocity sign, not vanishing acceleration.']
EXPECTED_IDS={'C4-Q011', 'C4-Q020', 'C4-Q012', 'C4-Q014', 'C4-Q016', 'C4-Q013', 'C4-Q017', 'C4-Q015', 'C4-Q019', 'C4-Q018'}
REVIEWED_CANDIDATES={'C4-Q011': '0058f1dd22d63900ef6bb5e024930d25ff1a8986753a41c4d64b67bd95d8aac1', 'C4-Q012': 'bfcfd8e41d8ed049ca33d21f1fe89ed01466b8f6f0d38d838e11ca1e8a399539', 'C4-Q013': '9398f32101f9f36d287dea2f0f35b24dbbcf450560fff978b5d3b9304bb68b3e', 'C4-Q014': '2a16bf4e13152ca1cec8aca3b68984256ebd29aa6eb4ef911dc756266fdee685', 'C4-Q015': '9897a9ec212ea566427b322728199a733c0fed03691884f9b36e80d9d2c0d9e6', 'C4-Q016': '4edd1caac6e26277af48f722a9b321636c933ac45ee1baa31a501dea21f8e185', 'C4-Q017': '6b62a9860f8c1011b9903854bb66bc63297d4fdd9fe9c69023acb02931dede65', 'C4-Q018': '77b8b2e1ec5f9772c92262af1cba624ca10efc8ff68efd3a289eb9192f4694b7', 'C4-Q019': '9f6cb5ee9b81a283b299d5810333de10e0999d223fc7fcc955030a8b9a973c01', 'C4-Q020': '151f0517b8d1b2778c88aff09e7803fef59941aee1d4ec969ac2694ede784390'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1))}
REQUIRED_PATHS={'M140 1120H320V1360', 'M100 785V805H220V785M220 805H460V785', 'M100 715H460', 'M220 715H140', 'M140 1375V1095M125 1360H410', 'M140 1360V1120', 'M40 465H600', 'M0 0L8 4L0 8Z', 'M140 1360L320 1120', 'M135 230H455', 'M140 1360H320', 'M40 1010H600', 'M135 335H455', 'M220 715H300'}
REQUIRED_CIRCLES={(Fraction(135, 1), Fraction(230, 1), Fraction(5, 1)), (Fraction(220, 1), Fraction(715, 1), Fraction(3, 1)), (Fraction(100, 1), Fraction(715, 1), Fraction(6, 1)), (Fraction(460, 1), Fraction(715, 1), Fraction(6, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1 · La forza riferita alla carica', 'Prova positiva: q = +4,0 nC', 'F = 1,2 μN verso est', 'E = 300 N/C verso est', 'Due grandezze diverse: E = F/q.', '2 · Campi uguali e opposti in P', 'Fra due cariche positive: d₁ + d₂ = 30 cm.', '+q', '+4q', 'E₁', 'E₂', 'P', '10 cm', '20 cm', '|E₁| = |E₂| ; E₁ + E₂ = 0', 'L’ultima somma è vettoriale.', '3 · Componenti ortogonali', '400 N/C', '300 N/C', '500 N/C', 'Nord', 'Est', '300² + 400² = 500²')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Campo elettrico e somma vettoriale'), ('desc', 'Tre problemi distinti. Una prova positiva da 4 nanocoulomb subisce 1,2 micronewton a est: campo 300 newton per coulomb. Tra cariche positive q e 4q distanti 30 centimetri i campi si annullano a 10 centimetri dalla prima. Due contributi ortogonali 300 e 400 newton per coulomb danno un risultante 500, con scala comune nel terzo pannello. Le dimensioni dei simboli delle sorgenti non indicano dimensioni fisiche.'))
GEOMETRY_REVIEW='Tre pannelli letti integralmente nel nuovo PNG 640×1540: F e E hanno unità distinte e nessuna scala comune impropria; P divide 360 coordinate in 120 e 240, cioè10 e20 cm; due campi opposti hanno entrambe lunghezza80. Nel terzo pannello 180,240,300 coordinate rappresentano300,400,500 N/C: triangolo3–4–5 con punte intere e label separate.'
DECIMAL_REGRESSION_NUMBER=12
EXPECTED_CONTEXT={'C4-Q011': {'id': 'C4-Q011', 'kind': 'question', 'course': 'C4', 'order': 11, 'skill': 'C4-L02', 'family': 'la-prova-cambia-segno', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 2}, 'C4-Q012': {'id': 'C4-Q012', 'kind': 'question', 'course': 'C4', 'order': 12, 'skill': 'C4-L02', 'family': 'campo-da-una-forza-misurata', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q013': {'id': 'C4-Q013', 'kind': 'question', 'course': 'C4', 'order': 13, 'skill': 'C4-L02', 'family': 'verso-locale-di-una-linea', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q014': {'id': 'C4-Q014', 'kind': 'question', 'course': 'C4', 'order': 14, 'skill': 'C4-L02', 'family': 'annullare-due-contributi-collineari', 'difficulty': 3, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 2}, 'C4-Q015': {'id': 'C4-Q015', 'kind': 'question', 'course': 'C4', 'order': 15, 'skill': 'C4-L02', 'family': 'le-linee-possono-attraversarsi', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q016': {'id': 'C4-Q016', 'kind': 'question', 'course': 'C4', 'order': 16, 'skill': 'C4-L02', 'family': 'una-traiettoria-fra-le-armature', 'difficulty': 2, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 2}, 'C4-Q017': {'id': 'C4-Q017', 'kind': 'question', 'course': 'C4', 'order': 17, 'skill': 'C4-L02', 'family': 'linee-rivolte-verso-il-centro', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q018': {'id': 'C4-Q018', 'kind': 'question', 'course': 'C4', 'order': 18, 'skill': 'C4-L02', 'family': 'vettori-ortogonali-nel-punto-di-misura', 'difficulty': 2, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q019': {'id': 'C4-Q019', 'kind': 'question', 'course': 'C4', 'order': 19, 'skill': 'C4-L02', 'family': 'una-carica-negativa-inizialmente-ferma', 'difficulty': 1, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}, 'C4-Q020': {'id': 'C4-Q020', 'kind': 'question', 'course': 'C4', 'order': 20, 'skill': 'C4-L02', 'family': 'tempo-per-invertire-il-moto', 'difficulty': 2, 'prerequisites': ['C4-L01'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
REQUIRED_DOMAIN_FRAGMENTS={'C4-Q011': ['con q>0', 'Il campo è non nullo.'], 'C4-Q013': ['dove il campo elettrico è diverso da zero'], 'C4-Q015': ['punto regolare in cui E è diverso da zero'], 'C4-Q019': ['massa positiva', 'non nullo', 'Non agiscono altre forze.']}
REQUIRED_TEXT_ATTRIBUTES=((('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '108')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '235'), ('y', '200')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '205'), ('y', '380')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '425')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '520')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '565')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '100'), ('y', '655')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '460'), ('y', '655')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '264'), ('y', '690')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '155'), ('y', '690')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '220'), ('y', '760')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '160'), ('y', '850')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '340'), ('y', '850')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '925')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '965')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1065')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '30'), ('y', '1205')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '170'), ('y', '1410')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '340'), ('y', '1230')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '95'), ('y', '1100')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '425'), ('y', '1370')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '1495')))
REQUIRED_MARKER_ATTRIBUTES=((('id', 'violet'), ('markerHeight', '8'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '8'), ('orient', 'auto'), ('refX', '8'), ('refY', '4')), (('id', 'green'), ('markerHeight', '8'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '8'), ('orient', 'auto'), ('refX', '8'), ('refY', '4')), (('id', 'ochre'), ('markerHeight', '8'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '8'), ('orient', 'auto'), ('refX', '8'), ('refY', '4')))
OFFSET=10
MODEL_PATH='editorial/reviews/cric-c4-001-020-partial-models.py'
MODEL_REF='719bbd0fbc114937438b80a74d787297c5249336'

def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q001':q(480,100)*q(1,10**15)/(q(160,100)*q(1,10**19)),
 'C4-Q004':4*3,'C4-Q005':q(-25,10)-q(12,10),'C4-Q008':q(3,4),
 'C4-Q010':-q(9,10**6)*q(1,5)**2/(9*10**9*q(2,10**9))*10**9,
 'C4-Q012':q(12,10**7)/q(4,10**9),'C4-Q014':q(30,1+2),
 'C4-Q016':q(1,2)*6*(q(80,100)/4)**2*100,
 'C4-Q018':sp.sqrt(300**2+400**2),'C4-Q020':q(6,3)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(q(48,10**16),'coulomb')/u(q(16,10**20),'coulomb'),
 u(q(12,10**7),'newton')/u(q(4,10**9),'coulomb'),
 u(q(9,10**6),'newton')*u(q(1,5),'meter')**2/(u(9*10**9,'newton*meter**2/coulomb**2')*u(q(2,10**9),'coulomb')),
 u(q(1,2))*u(6,'meter/second**2')*(u(q(4,5),'meter')/u(4,'meter/second'))**2]
def main():
 values=partial_source_predictions();q=sp.Rational;wanted={1:30000,4:12,5:q(-37,10),8:q(3,4),10:-20,12:300,14:10,16:12,18:500,20:2}
 for n,v in wanted.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 checks=partial_dimensional_crosschecks();units=['','newton/coulomb','nanocoulomb','centimeter'];expected=[30000,300,20,12]
 for x,unit,v in zip(checks,units,expected):assert x.to(unit).magnitude==v
 print('PARTIAL20_PROMPTS;10_exact_numeric_checks;4_Pint_checks;ONLY_Q001_020_MODELED;candidate_SCI_NOT_RUN',flush=True)
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
    if type(number) is not int or not OFFSET+1<=number<=OFFSET+10 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return mapped_literal(option.removesuffix(suffix) if suffix else option)
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_NUMERIC_EXPRESSIONS:return sp.Rational(KNOWN_NUMERIC_EXPRESSIONS[raw])
    return parse_literal(raw)
def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    option=option.strip().replace('−','-')
    for suffix,dimension,scale in [(' kV/m','field',sp.Integer(1000)),(' V/m','field',sp.Integer(1)),(' N/C','field',sp.Integer(1)),(' mV','potential',sp.Rational(1,1000)),(' V','potential',sp.Integer(1)),(' eV','energy_eV',sp.Integer(1)),(' μJ','energy',sp.Rational(1,10**6)),(' J','energy',sp.Integer(1)),(' μC','charge',sp.Rational(1,10**6)),(' nC','charge',sp.Rational(1,10**9)),(' mC','charge',sp.Rational(1,1000)),(' C','charge',sp.Integer(1)),(' cm','length',sp.Rational(1,100)),(' m/s','speed',sp.Integer(1)),(' m','length',sp.Integer(1)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' kΩ','resistance',sp.Integer(1000)),(' Ω','resistance',sp.Integer(1)),(' mA','current',sp.Rational(1,1000)),(' A','current',sp.Integer(1)),('%','dimensionless',sp.Rational(1,100)),('','dimensionless',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option[:-len(suffix)]if suffix else option)
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError):continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    main()
    values=partial_source_predictions()
    return ['Il campo resta uguale, la forza cambia verso mantenendo il modulo',values['C4-Q012'],'Tangente',values['C4-Q014'],'Il disegno attribuisce due direzioni diverse a un unico campo nello stesso punto',values['C4-Q016'],'Negativa',values['C4-Q018'],'Accelera e inizia a muoversi verso sinistra',values['C4-Q020']]
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
    if root.get('viewBox')!='0 0 640 1540':raise ValueError('Independent physical scale viewport changed')
    if {e.get('points') for e in root.iter() if e.tag.endswith('polygon')}!=REQUIRED_POLYGONS:raise ValueError('Independent physical scale prism geometry changed')
    accessible=tuple((e.tag.rsplit('}',1)[-1],e.text or '') for e in root.iter() if e.tag.rsplit('}',1)[-1] in ('title','desc'))
    if accessible!=REQUIRED_ACCESSIBLE_TEXTS:raise ValueError('Independent physical scale or reviewed SVG quantity labels changed in accessible title/desc')
    if tuple(tuple(sorted(e.attrib.items())) for e in root.iter() if e.tag.endswith('text'))!=REQUIRED_TEXT_ATTRIBUTES:raise ValueError('Independent physical scale text positions or styling changed')
    if tuple(tuple(sorted(e.attrib.items())) for e in root.iter() if e.tag.endswith('marker'))!=REQUIRED_MARKER_ATTRIBUTES:raise ValueError('Independent physical scale arrow tips changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c4-001-020-partial-models.py"
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append("Independent frozen model edition mismatch")
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"][-3:]);source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        for fragment in REQUIRED_DOMAIN_FRAGMENTS.get(source_id,()):
            if fragment not in row.get('prompt',''):errors.append('Independent reviewed physical domain condition missing: '+fragment)
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c4_l02_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        context=EXPECTED_CONTEXT[row['id']]
        for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):
            if row.get(field)!=context.get(field) or type(row.get(field)) is not type(context.get(field)):errors.append('Individual Cric identity, context or protected exam mismatch: '+field)
        if row.get('baseVersion')!=source['version'] or row.get('version')!=source['version']+1 or type(row.get('baseVersion')) is not int or type(row.get('version')) is not int:errors.append('Individual Cric baseVersion or version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Independent reviewed course or actual lesson mapping mismatch')
        wanted=expected[number-OFFSET-1];value=row["answer"]["value"]
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
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option,number)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-OFFSET-1],"physicalAssumptions":ASSUMPTIONS[number-OFFSET-1],"distractors":DISTRACTORS[number-OFFSET-1],
          "pedagogicalReview":PEDAGOGY[number-OFFSET-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_frozen_prompt_only_electric_models_and_individual_concepts",
            "Pint_exact_dimensions_and_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c4-001-020-partial-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"719bbd0fbc114937438b80a74d787297c5249336"},"modelFunctionBodies":"All functions in the frozen source-only C4 partial model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c4-001-020-partial-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
    for field,value in [('baseVersion',0),('version',99),('exam',1),('family','invented-family'),('difficulty',99),('prerequisites',['C4-L02'])]:
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
    links[0]["provenance"]["sourcePath"]="officina-di-fisica/content/C1.json"
    assert links[0]["provenance"]["sourcePath"]!=SOURCE_PATH
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"][-3:]) in OPTION_SUFFIX)
    row=changed["records"][idx];number=int(row["id"][-3:]);wanted=oracle()[number-OFFSET-1]
    if row["answer"]["type"]!="choice":row["answer"]={"type":"choice","value":str(wanted)+OPTION_SUFFIX[number],"options":[str(wanted)+OPTION_SUFFIX[number],str(wanted+1)+OPTION_SUFFIX[number]]}
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
    idx=DECIMAL_REGRESSION_NUMBER-OFFSET-1;row=changed['records'][idx];n=idx+OFFSET+1;wanted=sp.Rational(oracle()[idx])
    scale=10**18;integer=abs(wanted)*scale
    assert integer.is_Integer and integer>=0
    quotient,remainder=divmod(int(integer)+1,scale)
    decimal=("-" if wanted<0 else "")+f"{quotient}.{remainder:018d}"+OPTION_SUFFIX[n]
    if row['answer']['type']!='choice':row['answer']={'type':'choice','value':str(wanted)+OPTION_SUFFIX[n],'options':[str(wanted)+OPTION_SUFFIX[n],str(wanted+1)+OPTION_SUFFIX[n]]}
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
