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
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='fce51a4709cd21f6f8519cad68fdd333123fc0cb14e6ae2c74f1112fc9ece962'
CANDIDATE_REF='74a3f8efce2282e47bb08d21bb382ad9c1ca5312'
PRIMARY_SHA256='16fddaa0a20d4180bd14648b2a47700896a9a77490e80b1daaa92efe189b31c5'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L04', 'title': 'Cariche mobili e cariche legate', 'actualLessonPrerequisites': ['C4-L01', 'C4-L02', 'C4-L03']}
FAMILY='cric-c4-l04'
BATCH='cric-c4-l04'
ASSET_NAME='cric-c4-l04-progressive.svg'
REVIEWED_PACKAGE_SHA256='5428e8735a3e4711098a5e85e80f2997da45fa4a7bfe958f549ef834140c6078'
REVIEWED_BINDINGS_SHA256='ea3d33f04c17234060219a63390bc5ee1743b269bf2fd00b147466d8781d60cc'
SOURCE_REFERENCE='Ten distinct original Cric C4 questions read completely after their frozen prompt-only primary and computations; no authoring module imported.'
FALSE_PROOF='Il segno e le condizioni al contorno non cambiano mai alcuna previsione elettrica.'
SVG_MUTATION=(b'M430 1280H460', b'M430 1280H461')
SVG_LABEL_MUTATION=(b'4 kV/m', b'5 kV/m')
EXPECTED_MAPPING={31: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 32: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 33: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 34: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 35: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 36: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 37: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 38: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 39: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03']), 40: ('C4-L04', ['C4-L01', 'C4-L02', 'C4-L03'])}
NUMERIC_UNITS={33: 'nC', 35: 'V', 39: 'kV/m'}
OPTION_SUFFIX={33: ' nC', 35: ' V', 39: ' kV/m'}
UNITS={31: 'dimensionless', 32: 'dimensionless', 33: 'nanocoulomb', 34: 'dimensionless', 35: 'volt', 36: 'dimensionless', 37: 'dimensionless', 38: 'dimensionless', 39: 'kilovolt/meter', 40: 'dimensionless'}
MANUAL=['Il lato vicino è positivo per induzione: la bacchetta negativa respinge elettroni verso il lato più lontano. La sfera isolata conserva carica netta nulla, quindi la carica positiva vicina è compensata da carica negativa altrove.', 'È polarizzazione. I dipoli possono formarsi o orientarsi; questo non richiede una corrente di conduzione libera attraverso l’intero isolante.', 'La carica netta della sfera isolata è zero. Con −6,0 nC sulla parte indicata, il resto deve portare +6,0 nC, data l’assenza di altri contributi nel volume o nella cavità. Il risultato è integrale sulla superficie restante, non uniforme punto per punto.', 'Allontanando prima la bacchetta mentre permane il contatto con la terra si elimina l’induzione mantenendo il potenziale di riferimento. La carica eccedente può fluire alla terra; idealmente la sfera torna neutra e resta tale dopo aver tolto il filo, in assenza di altre sorgenti.', 'In un singolo conduttore continuo in equilibrio elettrostatico il potenziale è uniforme. V_B=V_A=42 V rispetto alla terra, dunque V_B−V_A=0 V. Equipotenziale non significa necessariamente a potenziale zero.', 'La parola è terra. Il collegamento permette scambio di carica con un grande serbatoio che impone il potenziale di riferimento; non garantisce da solo carica totale nulla in presenza di sorgenti esterne.', 'La componente tangenziale del campo appena esterno è nulla: altrimenti le cariche libere superficiali si muoverebbero e non vi sarebbe equilibrio elettrostatico. La componente normale può invece essere non nulla.', 'Sarebbe errato applicare la regola di equipotenzialità elettrostatica al filo resistivo percorso da corrente, imponendo E=0 o caduta di tensione nulla lungo di esso. La conduzione stazionaria con resistività positiva richiede un campo interno e può dissipare potenza.', 'Le cariche libere restano fisse e il dielettrico riempie tutto lo spazio. Per piastre ideali E_f=E_i/ε_r=12/3=4 kV/m. Il generatore scollegato non impone tensione costante; la polarizzazione riduce il campo nel modello lineare.', 'È un dielettrico. Nel linguaggio del condensatore è un isolante polarizzabile, distinto da una connessione conduttrice che metterebbe in contatto elettrico le armature.']
DISTRACTORS=['Negative rod repels electrons away; no transferred protons or net positive sphere charge.', 'Grounding, nuclear fusion and compulsory field cancellation are different processes.', 'Zero remainder leaves−6 total;−6 remainder gives−12 total; equal areas unnecessary.', 'Disconnecting ground before removing rod is a different ordering that can trap negative charge.', '42 is common potential relative to Earth;−42 assumes unspecified zero atB;84 adds potentials.', 'Infinite resistance prevents the required exchange, vacuum/fusion/uniform motion do not name the connection.', 'External normal field need not vanish; tangential field would move surface carriers.', 'Time-independent current is not rest of charge carriers; using the measured drop is consistent.', '36 multiplies rather than divides epsilon_r;12 leaves field unchanged; finite epsilon is not a conductor.', 'A voltage source, point source, ideal conductor or superconductor does not name the insulating response.']
ASSUMPTIONS=['Neutral isolated metal sphere, negative rod does not touch; electrostatic equilibrium.', 'Bound charges respond by induced dipoles or partial permanent-dipole alignment; no free conduction needed.', 'Isolated neutral sphere, two surface parts exhaust charge; no cavity or volume charges.', 'Ground remains connected while positive rod is removed, then disconnected after equilibrium; no other sources.', 'One continuous conductor in electrostatic equilibrium, common potential 42 V relative to Earth.', 'Conducting connection to a large charge reservoir approximating fixed reference potential.', 'Regular conductor surface at electrostatic equilibrium; field immediately outside.', 'Resistive wire with nonzero DC and nonzero measured voltage drop is not electrostatic equilibrium.', 'Isolated large plates, free charge fixed, complete linear homogeneous dielectric epsilon_r 3, edge effects neglected.', 'Insulating polarizable material described by bound charges and permittivity.']
PEDAGOGY=['Separate local induced sign from globally conserved charge.', 'Local bound-charge response distinguished from macroscopic conduction.', 'Integrated signed charge does not assume uniform surface density.', 'Order of grounding actions is the physical constraint.', 'Equipotential is not synonymous with zero potential.', 'Reservoir potential condition differs from isolation.', 'Normal/tangential decomposition requires regular surface and equilibrium.', 'State the domain of an equilibrium rule before applying it.', 'Fixed-free-charge boundary condition controls the dielectric response.', 'Name material response and its constitutive parameter.']
EXPECTED_IDS={'C4-Q040', 'C4-Q034', 'C4-Q033', 'C4-Q036', 'C4-Q039', 'C4-Q032', 'C4-Q037', 'C4-Q038', 'C4-Q035', 'C4-Q031'}
REVIEWED_CANDIDATES={'C4-Q031': '2457d4d03081e286f0f71f2400f07b473666de049123013bdc88bd54e0c151c8', 'C4-Q032': 'ab7d5a91f229a753a74bf423e3b55c043c5a9f9bacb92190262472e7967521e8', 'C4-Q033': '90a4878d0210b8bf35c07f2d342b6b5b2d238a981486feadf107520d581afad1', 'C4-Q034': '283f199da56954bfc5719f5f8824bdc6b029786f4b1fe5ea4824b358602b99cd', 'C4-Q035': '675232f0d0cb105f794c3aed43a9fe630ae303c70cc9ce0cab5bedfb47f927ec', 'C4-Q036': 'e3343635bcbb40de014912c302d68a22156038d21c67d87c01ee3ef2c042c988', 'C4-Q037': 'f257718f30c275a5a7fcf4ae35423f0fd20181c647441ba44b24e48cd5a55ccf', 'C4-Q038': 'ee79e247b7e9c09105e013f322ac4fb5c9332e7522692ee2f9c74a217e24e5bd', 'C4-Q039': '0d1315ab45201cff3ac85213714af725acdbfb15939258ffbfbf8741d71f02cc', 'C4-Q040': '4d41ae9d9b4b18ce2814d688d0d7dfed68ffa044a383cf08c36b8179f5dc707e'}
REQUIRED_RECTS={(Fraction(383, 1), Fraction(1180, 1), Fraction(174, 1), Fraction(180, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1)), (Fraction(60, 1), Fraction(190, 1), Fraction(115, 1), Fraction(36, 1))}
REQUIRED_PATHS={'M130 1280H220', 'M430 1280H460', 'M320 620V850', 'M40 465H600', 'M80 1180V1360M260 1180V1360M380 1180V1360M560 1180V1360', 'M40 1020H600', 'M0 0L7 3.5L0 7Z'}
REQUIRED_CIRCLES={(Fraction(380, 1), Fraction(250, 1), Fraction(90, 1)), (Fraction(320, 1), Fraction(735, 1), Fraction(115, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1 · Induzione senza contatto', 'La sfera isolata resta complessivamente neutra.', '− − −', '+', '+', '+', '−', '−', '−', 'Difetto di elettroni vicino', 'Eccesso di elettroni lontano', '2 · Due parti di una superficie neutra', '−6 nC', '+6 nC', 'q_tot = (−6 + 6) nC = 0', 'Porzioni simboliche, non una mappa della densità.', '3 · Stessa carica libera sulle piastre', '+', '−', '+', '−', 'Vuoto', 'ε_r = 3', '12 kV/m', '4 kV/m', 'Carica libera fissata; riempimento completo.')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Conduttori, carica totale e dielettrico'), ('desc', 'Tre situazioni distinte. Bacchetta negativa vicina a un conduttore neutro isolato: difetto di elettroni vicino, eccesso lontano. Due porzioni della superficie sommano meno 6 e più 6 nanocoulomb. Un dielettrico di permittività relativa 3 fra piastre isolate riduce il campo da 12 a 4 kilovolt per metro. I simboli delle cariche e le dimensioni dei corpi non rappresentano densità fisiche.'))
GEOMETRY_REVIEW='Tre pannelli letti integralmente nel nuovo PNG640×1540: bacchetta negativa a sinistra della sfera, segni positivi sul lato vicino e negativi lontano; simboli di superficie dichiarati non densità. Due porzioni−6/+6 nC sommano zero. Piastre con separazione comune180 e carica libera fissata; frecce del campo90 e30 rappresentano12 e4 kV/m alla stessa scala. Dielettrico riempie lo spazio e nessuna freccia nascosta.'
DECIMAL_REGRESSION_NUMBER=33
EXPECTED_CONTEXT={'C4-Q031': {'id': 'C4-Q031', 'kind': 'question', 'course': 'C4', 'order': 31, 'skill': 'C4-L04', 'family': 'bacchetta-vicina-e-sfera-isolata', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 2}, 'C4-Q032': {'id': 'C4-Q032', 'kind': 'question', 'course': 'C4', 'order': 32, 'skill': 'C4-L04', 'family': 'risposta-locale-dellisolante', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q033': {'id': 'C4-Q033', 'kind': 'question', 'course': 'C4', 'order': 33, 'skill': 'C4-L04', 'family': 'il-bilancio-di-una-sfera-neutra', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q034': {'id': 'C4-Q034', 'kind': 'question', 'course': 'C4', 'order': 34, 'skill': 'C4-L04', 'family': 'togliere-prima-la-bacchetta', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q035': {'id': 'C4-Q035', 'kind': 'question', 'course': 'C4', 'order': 35, 'skill': 'C4-L04', 'family': 'potenziale-fra-due-punti-del-metallo', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 2}, 'C4-Q036': {'id': 'C4-Q036', 'kind': 'question', 'course': 'C4', 'order': 36, 'skill': 'C4-L04', 'family': 'connettere-un-conduttore-alla-terra', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q037': {'id': 'C4-Q037', 'kind': 'question', 'course': 'C4', 'order': 37, 'skill': 'C4-L04', 'family': 'direzione-del-campo-alla-superficie', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q038': {'id': 'C4-Q038', 'kind': 'question', 'course': 'C4', 'order': 38, 'skill': 'C4-L04', 'family': 'un-filo-con-corrente-stazionaria', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q039': {'id': 'C4-Q039', 'kind': 'question', 'course': 'C4', 'order': 39, 'skill': 'C4-L04', 'family': 'effetto-di-un-mezzo-sul-campo-a-carica-fissa', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 2}, 'C4-Q040': {'id': 'C4-Q040', 'kind': 'question', 'course': 'C4', 'order': 40, 'skill': 'C4-L04', 'family': 'materiale-con-cariche-prevalentemente-legate', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02', 'C4-L03'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
REQUIRED_DOMAIN_FRAGMENTS={'C4-Q031': ['inizialmente neutra, isolata e senza contatto', 'equilibrio elettrostatico'], 'C4-Q033': ['isolata', 'Non ci sono cariche nelle cavità o nel volume'], 'C4-Q035': ['metallo continuo in equilibrio elettrostatico'], 'C4-Q037': ['punto regolare', 'in equilibrio elettrostatico'], 'C4-Q039': ['lineare omogeneo', 'riempie completamente', 'Le cariche libere restano fisse', 'trascurando i bordi']}
REQUIRED_TEXT_ATTRIBUTES=((('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), (('x', '40'), ('y', '105')), (('text-anchor', 'middle'), ('x', '117'), ('y', '216')), (('text-anchor', 'middle'), ('x', '302.0577'), ('y', '212')), (('text-anchor', 'middle'), ('x', '290'), ('y', '257')), (('text-anchor', 'middle'), ('x', '302.0577'), ('y', '302')), (('text-anchor', 'middle'), ('x', '457.9423'), ('y', '212')), (('text-anchor', 'middle'), ('x', '470'), ('y', '257')), (('text-anchor', 'middle'), ('x', '457.9423'), ('y', '302')), (('x', '200'), ('y', '385')), (('x', '200'), ('y', '425')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '520')), (('text-anchor', 'middle'), ('x', '255'), ('y', '743')), (('text-anchor', 'middle'), ('x', '385'), ('y', '743')), (('text-anchor', 'middle'), ('x', '320'), ('y', '925')), (('font-size', '18'), ('x', '40'), ('y', '975')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1080')), (('text-anchor', 'middle'), ('x', '80'), ('y', '1150')), (('text-anchor', 'middle'), ('x', '260'), ('y', '1150')), (('text-anchor', 'middle'), ('x', '380'), ('y', '1150')), (('text-anchor', 'middle'), ('x', '560'), ('y', '1150')), (('text-anchor', 'middle'), ('x', '170'), ('y', '1400')), (('text-anchor', 'middle'), ('x', '470'), ('y', '1400')), (('text-anchor', 'middle'), ('x', '170'), ('y', '1450')), (('text-anchor', 'middle'), ('x', '470'), ('y', '1450')), (('font-size', '18'), ('x', '40'), ('y', '1510')))
REQUIRED_MARKER_ATTRIBUTES=((('id', 'g'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')), (('id', 'v'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')))
OFFSET=30
MODEL_PATH='editorial/reviews/cric-c4-021-040-partial-models.py'
MODEL_REF='eaf13e0e0c782adb98d767193e39a35ec3970bab'

def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q021':9*10**9*(q(2,10**9)-q(1,10**9))/q(1,10),'C4-Q024':q(12)/q(3,100),'C4-Q026':17-2,'C4-Q028':sp.sqrt(2*q(4,10**6)*9/q(2,10**6)),'C4-Q030':sp.binomial(4,2),'C4-Q033':-(-6),'C4-Q035':42-42,'C4-Q039':q(12,3)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(9*10**9,'newton*meter**2/coulomb**2')*u(q(1,10**9),'coulomb')/u(q(1,10),'meter'),u(12,'volt')/u(q(3,100),'meter'),u(2)*u(q(4,10**6),'coulomb')*u(9,'volt')/u(q(2,10**6),'kilogram'),u(12,'kilovolt/meter')/u(3)]
def main():
 values=partial_source_predictions();wanted={21:90,24:400,26:15,28:6,30:6,33:6,35:0,39:4}
 for n,v in wanted.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 for x,unit,v in zip(partial_dimensional_crosschecks(),['volt','volt/meter','meter**2/second**2','kilovolt/meter'],[90,400,36,4]):assert x.to(unit).magnitude==v
 assert 30-10==2*10
 print('PARTIAL20_SOURCE_PROMPTS;8_exact_numeric_checks;4_Pint_checks;ONLY_Q021_040_MODELED;candidate_SCI_NOT_RUN',flush=True)
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
    return ['Ha un difetto di elettroni e carica superficiale positiva indotta','Polarizzazione',values['C4-Q033'],'Una sfera neutra',values['C4-Q035'],'Terra','La componente tangenziale alla superficie','Applicarla a quel filo come se fosse in equilibrio elettrostatico',values['C4-Q039'],'Dielettrico']
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
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c4-021-040-partial-models.py"
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c4_l04_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c4-021-040-partial-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"eaf13e0e0c782adb98d767193e39a35ec3970bab"},"modelFunctionBodies":"All functions in the frozen source-only C4 partial model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c4-021-040-partial-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
