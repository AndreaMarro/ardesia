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
CANDIDATE_REF='493d3132b8bf706e3a861ad2e8899fa512786f7f'
PRIMARY_SHA256='16fddaa0a20d4180bd14648b2a47700896a9a77490e80b1daaa92efe189b31c5'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L03', 'title': 'Dal potenziale all’energia', 'actualLessonPrerequisites': ['C4-L01', 'C4-L02']}
FAMILY='cric-c4-l03'
BATCH='cric-c4-l03'
ASSET_NAME='cric-c4-l03-progressive.svg'
REVIEWED_PACKAGE_SHA256='5d09fde19875f64fed3c3ee3de2890e3bb3ec9a141b27b48cd16068929744504'
REVIEWED_BINDINGS_SHA256='1ff4deb46b7d132994b2c19042f95d427cb6e784d5658c3942d1c8ee8c8c75d0'
SOURCE_REFERENCE='Ten distinct original Cric C4 questions read completely after their frozen prompt-only primary and computations; no authoring module imported.'
FALSE_PROOF='Il segno e le condizioni al contorno non cambiano mai alcuna previsione elettrica.'
SVG_MUTATION=(b'width="180" height="50"', b'width="181" height="50"')
SVG_LABEL_MUTATION=(b'\xe2\x88\x9215 eV', b'\xe2\x88\x9214 eV')
EXPECTED_MAPPING={21: ('C4-L03', ['C4-L01', 'C4-L02']), 22: ('C4-L03', ['C4-L01', 'C4-L02']), 23: ('C4-L03', ['C4-L01', 'C4-L02']), 24: ('C4-L03', ['C4-L01', 'C4-L02']), 25: ('C4-L03', ['C4-L01', 'C4-L02']), 26: ('C4-L03', ['C4-L01', 'C4-L02']), 27: ('C4-L03', ['C4-L01', 'C4-L02']), 28: ('C4-L03', ['C4-L01', 'C4-L02']), 29: ('C4-L03', ['C4-L01', 'C4-L02']), 30: ('C4-L03', ['C4-L01', 'C4-L02'])}
NUMERIC_UNITS={21: 'V', 22: 'J', 24: 'V/m', 26: 'eV', 28: 'm/s', 30: '1'}
OPTION_SUFFIX={21: ' V', 22: ' J', 24: ' V/m', 26: ' eV', 28: ' m/s', 30: ''}
UNITS={21: 'volt', 22: 'joule', 23: 'dimensionless', 24: 'volt/meter', 25: 'dimensionless', 26: 'joule', 27: 'dimensionless', 28: 'meter/second', 29: 'dimensionless', 30: 'dimensionless'}
MANUAL=['Il potenziale è una somma scalare con segni, V=k(q₁/r₁+q₂/r₂). Le due distanze uguali danno V=(9×10⁹)(1×10⁻⁹)/(1/10)=90 V. I contributi non vanno composti come vettori.', 'Il lavoro elettrostatico è W=q(V_i−V_f). Sulla stessa superficie equipotenziale la differenza è zero, quindi W=0 anche se la carica ha percorso una distanza non nulla.', 'È il volt: 1 V=1 J/C. Si distingue l’unità del potenziale da quelle di campo o capacità.', 'Nel campo uniforme la caduta di potenziale lungo il campo ha modulo Ed. Con d=3/100 m, E=12/(3/100)=400 V/m. Il campo punta dal potenziale maggiore al minore.', 'Nel punto medio i potenziali di +q e −q si cancellano, ma i campi si sommano nello stesso verso, dalla carica positiva alla negativa. Si ha V=0 e E non nullo per q non nullo e separazione finita; potenziale nullo non equivale a campo nullo.', 'Per l’elettrone q=−e. Il lavoro del campo è −qΔV=e·15 V, perciò l’energia cinetica aumenta di 15 eV. Il segno negativo della carica permette un aumento di K andando a potenziale maggiore.', 'La parola è riferimento, o zero convenzionale. Fissare V=0 all’infinito sceglie l’origine della scala senza cambiare differenze di potenziale, campo o lavoro fra due punti finiti.', 'La massa è 2,0 mg=2×10⁻⁶ kg. Il campo cede q(V_i−V_f)=(4×10⁻⁶)·9=36×10⁻⁶ J. Da mv²/2=36×10⁻⁶ J segue v²=36 m²/s²; la rapidità finale è la radice positiva, 6 m/s, nel modello classico assegnato.', 'A parità del salto di potenziale tra linee adiacenti, il campo medio normale è più intenso dove la loro distanza normale è minore, perché il modulo del gradiente è circa |ΔV|/Δs. Non si confronta soltanto il valore assoluto del potenziale.', 'Si includono tutte le coppie non ordinate una sola volta: 4·3/2=6 termini. Sommare coppie ordinate conterebbe due volte ciascuna energia; non si includono energie proprie infinite di cariche puntiformi.']
DISTRACTORS=['270 V adds magnitudes;−90 V omits positive 180 V; zero would require zero charge sum.', 'Nonzero work needs a nonzero endpoint difference here; path length alone is insufficient.', 'Coulomb is charge, joule energy, newton force, ampere current; none equals J/C.', '4 V/m treats 3 cm as 3 m; multiplication gives wrong dimension.', 'Scalar potential cancellation does not cancel the concordant field vectors.', '−15 eV is ΔU;19 adds endpoint potentials rather than subtracting; eV is energy.', 'Reference choice is neither a path nor matter transfer and does not null the field.', '36 copies the square of speed; omitting factor 2 gives sqrt 18, not 6; mg must convert to kg.', 'More distant equipotentials reduce the average field at equal nonzero interval; potential origin irrelevant.', '12 double-counts ordered pairs;4 counts particles rather than pairs.']
ASSUMPTIONS=['Vacuum point charges+2 and−1 nC, equal 0.10 m distance, zero potential at infinity and assigned Coulomb constant.', 'Electrostatic field and equal endpoint potentials on one equipotential surface.', 'Potential difference is energy per charge, with SI units.', 'Uniform field, distance 0.030 m measured along field, potential difference magnitude 12 V.', 'Distinct fixed charges+q and−q with q positive; midpoint equidistant and potential zero at infinity.', 'Electron charge−e, potential rises from 2 to 17 V, only electrostatic force.', 'Fixed source distribution; changing additive potential origin changes no differences.', 'Nonrelativistic particle at rest, mass 2 mg positive, charge+4 microC and potential drop 9 V; only electric work.', 'Same nonzero potential interval and distances along the field in two regular small regions; compare average gradient.', 'Four distinct point charges with nonzero charges; pair energy excludes self-energy and reversed duplicates.']
PEDAGOGY=['Signed scalar sum distinguished from vector superposition.', 'Work of field distinguished from distance or field magnitude.', 'Name the derived SI unit.', 'Convert cm before forming a gradient.', 'Construct a counterexample to V zero implying E zero.', 'Charge sign and kinetic/potential changes solved separately.', 'Gauge shift leaves physical differences invariant.', 'Positive physical root of energy equation, no direction inferred.', 'Average gradient is explicitly an average over a specified separation.', 'Manual enumeration 3+2+1 verifies combinatorial expression.']
EXPECTED_IDS={'C4-Q026', 'C4-Q024', 'C4-Q023', 'C4-Q021', 'C4-Q022', 'C4-Q028', 'C4-Q029', 'C4-Q025', 'C4-Q027', 'C4-Q030'}
REVIEWED_CANDIDATES={'C4-Q021': '6f4e9cb62dc11286348dcc1d81c30b9895637bfeca1417c6cd9f11d18c5c4d4a', 'C4-Q022': 'b7c9818613b6847736d1e9011d92af20508e1d5b1726889899add272ac7be204', 'C4-Q023': 'f7fd1f92255b56f471bddcdc9b5ef4861ce70930e098a440ade95e4e4fd6a431', 'C4-Q024': '29e99c68dca404980d467a9cb1b7e6afcadf040018597bd7efecbc621dbaed97', 'C4-Q025': '2c2e63df60b286f4f00584c9ade6696ae14e6f664910978d2dd884b1fa88a062', 'C4-Q026': '82c8f76fa4b775cc093e69adcc573faba37ab2e18c7fdfad227875dd633108fd', 'C4-Q027': '1a46d1bc5bc370876a4c6484b88477bd9fdbaebda66880b4c2b039f7035dfaf4', 'C4-Q028': 'e5cd1f1d4e926413c19729388ee0e8dd5926f78524c4bae44aeee84809c37a29', 'C4-Q029': 'baad7b71c166e6912cb7d568756482e53b7811dbcd1a2db55ca5be9c6565ec7a', 'C4-Q030': 'fcf57b002741aa155f0dc4f22a627174876097dc9050dbc38c892de7474e410e'}
REQUIRED_RECTS={(Fraction(140, 1), Fraction(1230, 1), Fraction(180, 1), Fraction(50, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1)), (Fraction(320, 1), Fraction(1360, 1), Fraction(180, 1), Fraction(50, 1))}
REQUIRED_PATHS={'M140 250H500', 'M40 465H600', 'M140 290V315H320V290M320 315H500V290', 'M40 1020H600', 'M0 0L7 3.5L0 7Z', 'M140 650V840M240 650V840M340 650V840M440 650V840', 'M180 760H400', 'M140 865V885H440V865', 'M320 1180V1470'}
REQUIRED_CIRCLES={(Fraction(500, 1), Fraction(250, 1), Fraction(6, 1)), (Fraction(140, 1), Fraction(250, 1), Fraction(6, 1)), (Fraction(320, 1), Fraction(250, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1 · Sommare potenziali con i segni', 'Nel vuoto, con zero all’infinito.', '+2,0 nC', '−1,0 nC', 'P', '0,10 m', '0,10 m', '+180 V − 90 V = 90 V', '2 · Campo uniforme fra equipotenziali', '12 V', '8 V', '4 V', '0 V', 'E', '3,0 cm', 'E = (12 V) / (0,030 m) = 400 V/m', '3 · Due variazioni opposte', 'Elettrone: q = −e ; da 2 V a 17 V', 'ΔU', 'ΔK', '−15 eV', '+15 eV', '0')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Potenziale, campo e variazioni di energia'), ('desc', 'Tre problemi distinti: potenziale in P da due sorgenti equidistanti; piani equipotenziali in campo uniforme; variazioni opposte di energia potenziale e cinetica di un elettrone. Le barre delle due variazioni condividono origine e scala, non descrivono energie assolute.'))
GEOMETRY_REVIEW='Tre pannelli letti integralmente nel nuovo PNG640×1540: P dista180 coordinate da ciascuna sorgente, per due distanze0.10 m; somma scalare180−90=90 V. Quattro piani a12,8,4,0 V hanno passo100, totale300 per3 cm, con campo verso potenziale minore. Barre ΔU e ΔK partono dalla stessa origine320, hanno lunghezza180 e segni opposti per15 eV; non sono energie assolute. Nessun testo attraversato o tagliato.'
DECIMAL_REGRESSION_NUMBER=21
EXPECTED_CONTEXT={'C4-Q021': {'id': 'C4-Q021', 'kind': 'question', 'course': 'C4', 'order': 21, 'skill': 'C4-L03', 'family': 'potenziale-in-un-punto-equidistante', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}, 'C4-Q022': {'id': 'C4-Q022', 'kind': 'question', 'course': 'C4', 'order': 22, 'skill': 'C4-L03', 'family': 'muoversi-su-una-equipotenziale', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}, 'C4-Q023': {'id': 'C4-Q023', 'kind': 'question', 'course': 'C4', 'order': 23, 'skill': 'C4-L03', 'family': 'unita-di-potenziale', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}, 'C4-Q024': {'id': 'C4-Q024', 'kind': 'question', 'course': 'C4', 'order': 24, 'skill': 'C4-L03', 'family': 'campo-dalla-spaziatura-delle-equipotenziali', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 2}, 'C4-Q025': {'id': 'C4-Q025', 'kind': 'question', 'course': 'C4', 'order': 25, 'skill': 'C4-L03', 'family': 'potenziale-nullo-senza-campo-nullo', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}, 'C4-Q026': {'id': 'C4-Q026', 'kind': 'question', 'course': 'C4', 'order': 26, 'skill': 'C4-L03', 'family': 'quanta-energia-cinetica-in-elettronvolt', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 2}, 'C4-Q027': {'id': 'C4-Q027', 'kind': 'question', 'course': 'C4', 'order': 27, 'skill': 'C4-L03', 'family': 'scelta-dello-zero', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}, 'C4-Q028': {'id': 'C4-Q028', 'kind': 'question', 'course': 'C4', 'order': 28, 'skill': 'C4-L03', 'family': 'velocita-guadagnata-fra-due-punti', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 2}, 'C4-Q029': {'id': 'C4-Q029', 'kind': 'question', 'course': 'C4', 'order': 29, 'skill': 'C4-L03', 'family': 'campi-e-curve-di-livello', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 2}, 'C4-Q030': {'id': 'C4-Q030', 'kind': 'question', 'course': 'C4', 'order': 30, 'skill': 'C4-L03', 'family': 'numero-di-coppie-in-una-configurazione', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L02'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
REQUIRED_DOMAIN_FRAGMENTS={'C4-Q025': ['con q>0', 'sono distinte'], 'C4-Q028': ['parte da ferma', 'Agisce solo il campo elettrostatico', 'nel regime non relativistico'], 'C4-Q029': ['stesso intervallo non nullo', 'lungo il campo']}
REQUIRED_TEXT_ATTRIBUTES=((('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), (('x', '40'), ('y', '108')), (('text-anchor', 'middle'), ('x', '140'), ('y', '195')), (('text-anchor', 'middle'), ('x', '500'), ('y', '195')), (('text-anchor', 'middle'), ('x', '320'), ('y', '220')), (('text-anchor', 'middle'), ('x', '230'), ('y', '355')), (('text-anchor', 'middle'), ('x', '410'), ('y', '355')), (('x', '125'), ('y', '415')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '520')), (('text-anchor', 'middle'), ('x', '140'), ('y', '620')), (('text-anchor', 'middle'), ('x', '240'), ('y', '620')), (('text-anchor', 'middle'), ('x', '340'), ('y', '620')), (('text-anchor', 'middle'), ('x', '440'), ('y', '620')), (('x', '470'), ('y', '767')), (('text-anchor', 'middle'), ('x', '290'), ('y', '930')), (('x', '65'), ('y', '980')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1080')), (('x', '40'), ('y', '1130')), (('x', '55'), ('y', '1265')), (('x', '55'), ('y', '1395')), (('x', '205'), ('y', '1210')), (('x', '380'), ('y', '1450')), (('text-anchor', 'middle'), ('x', '320'), ('y', '1510')))
REQUIRED_MARKER_ATTRIBUTES=((('id', 'g'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')), (('id', 'v'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')))
OFFSET=20
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
    return [values['C4-Q021'],sp.Integer(0),'Volt',values['C4-Q024'],'Il potenziale è zero e il campo è non nullo, diretto da +q verso −q',values['C4-Q026'],'Riferimento',values['C4-Q028'],'Dove le equipotenziali sono più ravvicinate lungo il campo',values['C4-Q030']]
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c4_l03_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
