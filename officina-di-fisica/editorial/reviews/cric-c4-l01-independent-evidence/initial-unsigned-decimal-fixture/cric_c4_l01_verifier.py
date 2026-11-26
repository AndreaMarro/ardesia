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
CANDIDATE_REF='ae71218fa00fd87106584987dcf55d3330e07c7b'
PRIMARY_SHA256='34337ec50e90ae61e6a447c62a98c698bf14a4bc47b24f92586a6e4bcd27f6ea'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L01', 'title': 'Cariche che si attraggono e si respingono', 'actualLessonPrerequisites': []}
FAMILY='cric-c4-l01'
BATCH='cric-c4-l01'
ASSET_NAME='cric-c4-l01-progressive.svg'
REVIEWED_PACKAGE_SHA256='030e28f03a626acbf697e278b5debdd6c854166799aa9db61f1a934035aa4788'
REVIEWED_BINDINGS_SHA256='c62f46171ecaf451232b91ad7fae0e97e01be6e7805d255ecc77ca44b580fc85'
SOURCE_REFERENCE='Ten distinct original Cric C4 electric charge and Coulomb questions read completely after source-only primary and computations; no candidate authoring imported.'
FALSE_PROOF='La carica totale di un sistema isolato è sempre la somma dei moduli, non la somma algebrica.'
SVG_MUTATION=(b'cx="370" cy="865"', b'cx="371" cy="865"')
SVG_LABEL_MUTATION=(b'Totale: \xe2\x88\x922,5 nC', b'Totale: \xe2\x88\x922,4 nC')
EXPECTED_MAPPING={1: ('C4-L01', []), 2: ('C4-L01', []), 3: ('C4-L01', []), 4: ('C4-L01', []), 5: ('C4-L01', []), 6: ('C4-L01', []), 7: ('C4-L01', []), 8: ('C4-L01', []), 9: ('C4-L01', []), 10: ('C4-L01', [])}
NUMERIC_UNITS={1: '1', 4: 'cm', 10: 'nC'}
OPTION_SUFFIX={5: ' nC', 8: ''}
UNITS={1: 'dimensionless', 2: 'newton', 3: 'dimensionless', 4: 'centimeter', 5: 'nanocoulomb', 6: 'dimensionless', 7: 'newton', 8: 'dimensionless', 9: 'coulomb', 10: 'nanocoulomb'}
MANUAL=['La carica negativa indica elettroni acquistati. Il numero è |Q|/e=(4,80×10⁻¹⁵)/(1,60×10⁻¹⁹)=3×10⁴=30000, conteggio intero positivo. Il segno della carica non rende negativo il numero di elettroni.', 'Le forze reciproche hanno lo stesso modulo e versi opposti, agendo su oggetti diversi. La diversa carica non produce un diverso modulo dell’interazione reciproca; masse differenti potrebbero invece dare accelerazioni differenti.', 'Il prefisso è nano. La conversione è 1 nC=10⁻⁹ C; un prefisso non cambia il segno della carica.', 'Con cariche invariate F è proporzionale a 1/r². Per F_f/F_i=1/9 la distanza deve triplicare: r_f=3·4=12 cm. Il rapporto richiede cariche non nulle, come implicato dalla repulsione assegnata.', 'La conservazione della carica dà Q₂=Q_tot−Q₁=−2,5−1,2=−3,7 nC. Le cariche vanno sommate con segno, non come moduli.', 'Il punto di osservazione deve essere molto più lontano dell’estensione del corpo, r molto maggiore della dimensione caratteristica. Con carica netta non nulla domina il termine monopolare lontano; non basta essere appena fuori dalla superficie.', 'La forza è attrattiva. La legge di Coulomb fra cariche ferme di segno opposto dirige ciascuna forza verso l’altra carica.', 'Il prodotto delle cariche acquista fattore 3 e il quadrato della distanza fattore 4. F_f/F_i=3/4, assumendo cariche puntiformi ferme e mezzo invariato.', 'È coerente una perdita netta di elettroni da parte dell’oggetto. In questo modello ordinario lo strofinio trasferisce elettroni e la positività non richiede creazione di protoni.', 'Essendo attrattiva con prima carica positiva, q₂ è negativa. Il modulo è Fr²/(kq₁)=(9×10⁻⁶)(1/25)/[(9×10⁹)(2×10⁻⁹)]=2×10⁻⁸ C=20 nC. Dunque q₂=−20 nC. Il k assegnato è parametro del calcolo, non una costante arrotondata da reinterpretare.']
DISTRACTORS=['Negative particle count rejected;3000 gives−0.480 fC,300000 gives−48 fC; powers of ten checked.', 'Charge ratio does not set reciprocal-force ratio; equal geometric direction is not equal sense; masses needed for accelerations.', 'micro,pico,femto,milli correspond to different exact powers, not another spelling of nano.', '36 cm givesF/81; decreasing distance increases magnitude; negative root is not a positive separation.', '−1.3 nC sums with+1.2 to−0.1 nC; positive alternatives give positive totals; total copied to second omits first charge.', 'Inside/near sources is not the far regime; net zero removes monopole; spherical boundary alone does not impose symmetric charge distribution.', 'Like-sign sources repel; opposite signs do not cancel both bodies; electrostatic force follows the joining line.', '3/2 uses a first power of distance;3 omits distance;4/3 reverses ratio;12 multiplies rather than divides by four.', 'Gaining electrons gives negative charge; nuclei/neutrons do not change in the ordinary rubbing preparation.', '+20 nC repels;−2 nC gives 0.9μN and−200 nC gives 90μN; inverse uses radius squared and SI prefixes.']
ASSUMPTIONS=['Initially neutral droplet, ordinary electron transfer, assigned elementary charge 1.60 e-19 C; final net negative charge−4.80 fC.', 'Fixed nonzero point sources+q,+3 q, isolated from other sources; reciprocal forces act on different objects.', 'SI prefix is a dimensionless scale factor 10⁻⁹, independent of charge sign.', 'Same nonzero point charges in vacuum, positive distances, force magnitude targetF/9.', 'Electrically isolated two-object system, total−2.5 nC, one object+1.2 nC; signed charge conservation.', 'Far observation, nonzero net charge and explicitly dominant monopole contribution; size small relative to distance.', 'Opposite-sign stationary point charges in the electrostatic model.', 'Same medium, nonzero initial charges; one charge tripled and positive separation doubled.', 'Ordinary rubbing of initially neutral material, no nuclear transformations; electron transfer.', 'Vacuum point charges, positive known source 2 nC, attractive force 9μN at 0.20 m, assignedk 9 e 9 SI; sign determined separately.']
PEDAGOGY=['Integer count and sign of a charge are different quantities.', 'Action and reaction cannot cancel within one body force diagram.', 'Prefix knowledge separated from sign and base unit.', 'Square-root inverse with a physical positive branch.', 'Signed conservation before numerical subtraction.', 'Conditions of a point approximation separated from shape alone.', 'Interaction sign separated from force magnitude.', 'Independent numerator and squared-denominator scalings.', 'Microscopic carrier transfer distinguished from nuclear change.', 'Sign and magnitude solved in different steps and checked inversely.']
EXPECTED_IDS={'C4-Q007', 'C4-Q010', 'C4-Q008', 'C4-Q001', 'C4-Q009', 'C4-Q004', 'C4-Q005', 'C4-Q003', 'C4-Q006', 'C4-Q002'}
REVIEWED_CANDIDATES={'C4-Q001': '5086c3ec3d32b3c9b25df301adb0883dcbf7d6c26935256d8f94656469d3dd30', 'C4-Q002': '6619752fafe935fa6590c08a63733fb83c32a7953c444b0a02a081521e3b5df3', 'C4-Q003': '9bc9d1c0f676ee5828a2334627450235a20f1d1f89ed7737e5ff3a1d605d8b9f', 'C4-Q004': 'd149cc8a16749ed5abddc6a2eb28cde776cfa453da04a2fcf145cbb5d37eb3ef', 'C4-Q005': '45894e9ebd68b1e7b78ce95ec40142f6ab6c72b7dcf9121c4be6fec096d22bf1', 'C4-Q006': '67736fa4c520263f179a63f89ca8188f78f6b8904e8192c5d4a6b0f606d41c8b', 'C4-Q007': '4047dbe02aec5261b713c4ef0e8581ab1df9fa3482fe53269dc4411b2bdb81e5', 'C4-Q008': '9e7db4cd0278c2775b8941d46d964224c1ec534d0159be3b390e09975a532f88', 'C4-Q009': '3e57141fb950f77c6b9a9ef4ea583a17c8a0a6fcb2afae8c2e73a748ba031e10', 'C4-Q010': '7a4f9dca9013565939b7632cb3b27bf3d62b076cbb1f0d3e8a735777aea2b3a5'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1)), (Fraction(65, 1), Fraction(1150, 1), Fraction(510, 1), Fraction(265, 1))}
REQUIRED_PATHS={'M40 1060H600', 'M130 865H120', 'M130 908V930H370V908', 'M0 0L5 2.5L0 5Z', 'M370 865H380', 'M130 665H40', 'M210 665H300', 'M130 708V730H210V708', 'M40 460H600'}
REQUIRED_CIRCLES={(Fraction(130, 1), Fraction(865, 1), Fraction(4, 1)), (Fraction(210, 1), Fraction(665, 1), Fraction(4, 1)), (Fraction(120, 1), Fraction(235, 1), Fraction(62, 1)), (Fraction(445, 1), Fraction(1250, 1), Fraction(45, 1)), (Fraction(370, 1), Fraction(865, 1), Fraction(4, 1)), (Fraction(320, 1), Fraction(235, 1), Fraction(62, 1)), (Fraction(195, 1), Fraction(1250, 1), Fraction(45, 1)), (Fraction(520, 1), Fraction(235, 1), Fraction(62, 1)), (Fraction(130, 1), Fraction(665, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1 · Contare elettroni trasferiti', 'q = −4,80 fC ; e = 1,60 × 10⁻¹⁹ C', '10 000', 'elettroni', '10 000', 'elettroni', '10 000', 'elettroni', 'N = |q| / e = 30 000', 'Ogni gruppo è un conteggio simbolico, non una particella.', '2 · Stesse cariche, distanze diverse', 'Distanze misurate fra le posizioni delle cariche.', '+q₁', '+q₂', 'F', 'F', '4 cm', '+q₁', '+q₂', 'F/9', 'F/9', '12 cm', 'F_f / F_i = (4 / 12)² = 1/9', '3 · Il totale algebrico si conserva', 'A', 'B', '+1,2 nC', '−3,7 nC', 'Totale: −2,5 nC', 'Nessuna carica attraversa il confine dell’intero sistema.')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Carica elementare, distanza e conservazione'), ('desc', 'Tre pannelli distinti: tre gruppi simbolici da diecimila elettroni corrispondono a meno 4,80 femtocoulomb. Per cariche fisse la distanza passa da 4 a 12 centimetri e le forze da F a F/9, con la stessa scala entro ciascuna grandezza. Un sistema isolato ha cariche più 1,2 e meno 3,7 nanocoulomb, con totale meno 2,5 nanocoulomb. Le dimensioni dei simboli delle cariche non rappresentano dimensioni fisiche.'))
GEOMETRY_REVIEW='Complete native 640 by 1540 and XML read. Three symbolic electron groups each denote 10000, not single particles. Point separations 80 and 240 represent 4 and 12 cm at common scale; reciprocal-force arrows have coordinate lengths 90 and 10, ratio nine, and are drawn after the small point markers so the full paths remain visible. Four separate arrow paths carry their own tips. All labels, signs and isolation boundary are readable. The two final charge labels sum to -2.5 nC.'
DECIMAL_REGRESSION_NUMBER=5
EXPECTED_CONTEXT={'C4-Q001': {'id': 'C4-Q001', 'kind': 'question', 'course': 'C4', 'order': 1, 'skill': 'C4-L01', 'family': 'contare-gli-elettroni-trasferiti', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 2}, 'C4-Q002': {'id': 'C4-Q002', 'kind': 'question', 'course': 'C4', 'order': 2, 'skill': 'C4-L01', 'family': 'forze-fra-cariche-diverse', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q003': {'id': 'C4-Q003', 'kind': 'question', 'course': 'C4', 'order': 3, 'skill': 'C4-L01', 'family': 'prefisso-sotto-il-microcoulomb', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 2}, 'C4-Q004': {'id': 'C4-Q004', 'kind': 'question', 'course': 'C4', 'order': 4, 'skill': 'C4-L01', 'family': 'la-distanza-necessaria-a-ridurre-la-forza', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 2}, 'C4-Q005': {'id': 'C4-Q005', 'kind': 'question', 'course': 'C4', 'order': 5, 'skill': 'C4-L01', 'family': 'carica-mancante-dopo-la-separazione', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q006': {'id': 'C4-Q006', 'kind': 'question', 'course': 'C4', 'order': 6, 'skill': 'C4-L01', 'family': 'quando-approssimare-una-sfera-con-un-punto', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q007': {'id': 'C4-Q007', 'kind': 'question', 'course': 'C4', 'order': 7, 'skill': 'C4-L01', 'family': 'segni-opposti', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q008': {'id': 'C4-Q008', 'kind': 'question', 'course': 'C4', 'order': 8, 'skill': 'C4-L01', 'family': 'cambiare-insieme-cariche-e-distanza', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q009': {'id': 'C4-Q009', 'kind': 'question', 'course': 'C4', 'order': 9, 'skill': 'C4-L01', 'family': 'uno-sfregamento-lascia-il-materiale-positivo', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C4-Q010': {'id': 'C4-Q010', 'kind': 'question', 'course': 'C4', 'order': 10, 'skill': 'C4-L01', 'family': 'scegliere-il-valore-della-seconda-carica', 'difficulty': 3, 'prerequisites': [], 'exam': None, 'version': 2}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
REQUIRED_DOMAIN_FRAGMENTS={'C4-Q006': ['carica netta non nulla', 'nel regime in cui domina il contributo della carica totale'], 'C4-Q008': ['Le cariche iniziali sono non nulle.']}
REQUIRED_TEXT_ATTRIBUTES=((('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '108')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '120'), ('y', '229')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '120'), ('y', '256')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '320'), ('y', '229')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '320'), ('y', '256')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '520'), ('y', '229')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '520'), ('y', '256')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '365')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '405')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '515')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '557')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '130'), ('y', '605')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '210'), ('y', '605')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '65'), ('y', '635')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '264'), ('y', '635')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '170'), ('y', '765')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '130'), ('y', '805')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '370'), ('y', '805')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '77'), ('y', '833')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '356'), ('y', '833')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '250'), ('y', '965')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('x', '40'), ('y', '1015')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1115')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '195'), ('y', '1257')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '445'), ('y', '1257')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '195'), ('y', '1330')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '445'), ('y', '1330')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '21'), ('text-anchor', 'middle'), ('x', '320'), ('y', '1390')), (('fill', '#272536'), ('font-family', 'Arial, sans-serif'), ('font-size', '18'), ('x', '40'), ('y', '1480')))
REQUIRED_MARKER_ATTRIBUTES=((('id', 'arrow'), ('markerHeight', '5'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '5'), ('orient', 'auto'), ('refX', '5'), ('refY', '2.5')),)

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
    if type(number) is not int or not 1<=number<=10 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
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
    for suffix,dimension,scale in [(' fC','charge',sp.Rational(1,10**15)),(' nC','charge',sp.Rational(1,10**9)),(' μC','charge',sp.Rational(1,10**6)),(' C','charge',sp.Integer(1)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),('%','dimensionless',sp.Rational(1,100)),('','dimensionless',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option[:-len(suffix)] if suffix else option)
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError):continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    values=partial_source_predictions();dimensions=partial_dimensional_crosschecks()
    for key,wanted in {'C4-Q001':30000,'C4-Q004':12,'C4-Q005':sp.Rational(-37,10),'C4-Q008':sp.Rational(3,4),'C4-Q010':-20}.items():assert sp.simplify(values[key]-wanted)==0
    assert dimensions[0].to('').magnitude==30000
    assert dimensions[2].to('nanocoulomb').magnitude==20
    return [values['C4-Q001'],'Le due forze hanno uguale modulo e versi opposti','nano',values['C4-Q004'],values['C4-Q005'],'Le dimensioni del corpo sono molto minori della distanza dal punto di osservazione','Attrattiva',values['C4-Q008'],'L’oggetto perde alcuni elettroni',values['C4-Q010']]
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c4_l01_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option,number)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_source_prompt_only_charge_conservation_and_Coulomb_scaling",
            "Pint_charge_force_distance_dimensions_and_exact_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
