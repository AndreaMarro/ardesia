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
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='64927c6305dc9ac7cc6d05392764eae221b37ff87fd99d9afc1c60f8d4c1fe05'
CANDIDATE_REF='08061cb49341ef7e9fc368c29977893398c4618d'
PRIMARY_SHA256='7d8acc4e7e582836a85007a404c3486695a8b83a436464790a08f0f5fa2a84e5'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L05', 'title': 'Quanto vale una corrente', 'actualLessonPrerequisites': ['C4-L01', 'C4-L03']}
FAMILY='cric-c4-l05'
BATCH='cric-c4-l05'
ASSET_NAME='cric-c4-l05-progressive.svg'
REVIEWED_PACKAGE_SHA256='820daf8b64aa3a74b85fb53099831b3d320f05bb2eed01dee95479cd18a26994'
REVIEWED_BINDINGS_SHA256='db6bb073d84d0f2626b739ca5a11f80ca52ac622a092118d124acd52c93a9dd9'
SOURCE_REFERENCE='Ten distinct original Cric C4 questions read completely after their frozen prompt-only primary and computations; no authoring module imported.'
FALSE_PROOF='Il segno e le condizioni al contorno non cambiano mai alcuna previsione elettrica.'
SVG_MUTATION=(b'width="144" height="210"', b'width="145" height="210"')
SVG_LABEL_MUTATION=(b'12 mC', b'13 mC')
EXPECTED_MAPPING={41: ('C4-L05', ['C4-L01', 'C4-L03']), 42: ('C4-L05', ['C4-L01', 'C4-L03']), 43: ('C4-L05', ['C4-L01', 'C4-L03']), 44: ('C4-L05', ['C4-L01', 'C4-L03']), 45: ('C4-L05', ['C4-L01', 'C4-L03']), 46: ('C4-L05', ['C4-L01', 'C4-L03']), 47: ('C4-L05', ['C4-L01', 'C4-L03']), 48: ('C4-L05', ['C4-L01', 'C4-L03']), 49: ('C4-L05', ['C4-L01', 'C4-L03']), 50: ('C4-L05', ['C4-L01', 'C4-L03'])}
NUMERIC_UNITS={41: 'mC', 44: 'ms', 46: '1', 50: 'A'}
OPTION_SUFFIX={41: ' mC', 44: ' ms', 46: '', 48: ' Ω', 50: ' A'}
UNITS={41: 'millicoulomb', 42: 'dimensionless', 43: 'dimensionless', 44: 'millisecond', 45: 'dimensionless', 46: 'dimensionless', 47: 'dimensionless', 48: 'ohm', 49: 'dimensionless', 50: 'ampere'}
MANUAL=['La carica orientata è l’area sotto I(t). I due intervalli hanno lo stesso verso, perciò Q=3 mA·4 s+1 mA·6 s=18 mC. Non si fa una media aritmetica delle correnti senza pesare le durate.', 'La deriva media degli elettroni è verso sinistra, opposta alla corrente convenzionale, perché i portatori metallici sono negativi. Il verso della corrente è definito come verso di trasporto di carica positiva.', 'Il generatore ideale mantiene la differenza di potenziale, detta tensione, fra i morsetti. La corrente dipende dal circuito collegato; i potenziali assoluti richiedono un riferimento.', 'Con corrente costante t=Q/I. 8 μC/(0,40 mA)=20 ms, perché 1 mA·1 ms=1 μC. La durata è positiva e non è pari al numero 20 espresso in secondi.', 'Per un resistore ohmico I=V/R, la pendenza del grafico I contro V è 1/R. La retta meno inclinata ha resistenza maggiore. Nel grafico opposto V contro I la pendenza sarebbe invece R.', 'Conservando il volume materiale, A_f L_f=A_i L_i. A lunghezza doppia corrisponde area dimezzata. Da R=ρL/A, con resistività invariata, R_f/R_i=2/(1/2)=4. Si assume filo omogeneo e stiramento uniforme.', 'È la resistività. ρ=RA/L ha unità Ω·m; non è la resistenza totale R né la densità di massa, che può usare lo stesso simbolo in altri contesti.', 'La sezione è larghezza per spessore: A=(2×10⁻³)(1×10⁻⁴)=2×10⁻⁷ m². R=(2×10⁻⁸)(1/5)/(2×10⁻⁷)=1/50 Ω=0,020 Ω. Si convertono entrambe le dimensioni trasversali prima di moltiplicarle.', 'I due rapporti V/I sono 1000 Ω e 1500 Ω, quindi quei due punti non appartengono alla stessa retta ohmica per l’origine con resistenza costante. Non si conclude la causa del cambiamento senza altri dati: può dipendere anche dalle condizioni fisiche del componente.', 'La carica netta verso destra è 12−2=10 C. La corrente media orientata è 10/5=2 A; sommare i moduli darebbe un flusso totale non orientato diverso dalla corrente convenzionale richiesta.']
DISTRACTORS=['12 and 6 count one interval;40 multiplies summed currents by total time as if simultaneous.', 'Negative carriers drift opposite current; microscopic random motion does not cancel mean drift.', 'Current, power and transferred charge depend on load and duration, not voltage alone.', '2 ms transfers 0.8 microC,200 ms transfers 80 microC; charge times current has wrong dimension.', 'I/V is conductance, whereas V/I slope of swapped axes is resistance.', 'Factor 2 omits area change; positive constant-volume geometry givesfactor 4, not 1/2 or 8.', 'Resistance is ohm, conductance reciprocal ohm, current ampere; rho meaning fixed by context.', '0.002 or 0.20 ohm requires tenfold larger or smaller cross section; two mm dimensions form squared conversion.', 'Secant 2 kΩ is not a common static V/I; data cannot identify a generator or the causal mechanism.', '14/5 adds magnitudes;12/5 omits reverse transport;−2 changes orientation.']
ASSUMPTIONS=['Two successive positive constant-current intervals 3 mA for 4 s and 1 mA for 6 s; common orientation.', 'Conventional current right in a metal, carriers are negative electrons; compare mean drift, not thermal paths.', 'Ideal voltage source in admitted operating conditions fixes terminal potential difference.', 'Constant current 0.40 mA and positive transferred charge 8 microC.', 'Two ohmic resistors at fixed temperature, positive distinct slopes in I versusV through origin.', 'Uniform wire, positive initial geometry and resistivity, resistivity unchanged and material volume conserved, final length doubled.', 'Homogeneous wire constitutive law R=rho*l/A identifies material parameter dimensions.', 'Uniform 0.20 m conductor, cross section 2 mm by 0.10 mm, rho 2 e-8 ohm*m at stated temperature.', 'Same component gives two data points; no assumed thermal constancy or interpolation beyond data.', 'Five-second interval with positive-equivalent charges 12 C right and 2 C left; reference right.']
PEDAGOGY=['Exact signed rectangular areas give charge, not mean current.', 'Mean carrier motion separated from conventional orientation.', 'Source constraint separated from response of external load.', 'Inverse duration checked by multiplying current and time.', 'Read graph axis order before identifying a slope.', 'Two multiplicative geometric changes under constant volume.', 'Material property separated from a particular object resistance.', 'Correct transverse area and exact fraction rather than binary float answer.', 'Static ratio is distinct from differential/secant resistance and causal diagnosis.', 'Net signed transport defines average over the whole interval.']
EXPECTED_IDS={'C4-Q041', 'C4-Q049', 'C4-Q048', 'C4-Q044', 'C4-Q046', 'C4-Q045', 'C4-Q043', 'C4-Q050', 'C4-Q042', 'C4-Q047'}
REVIEWED_CANDIDATES={'C4-Q041': '5c40f20cdbe1085c88a12718cf78e13dc4023119428ac2481a5d6903c859921a', 'C4-Q042': '87fa2e246f66fa73b59cb28e6c57bf6b88586b7e56c06c7df1da6b24d13f277f', 'C4-Q043': '97de75eda77ba4f69d1963fdfe6710a5b8561d0502c6db915badfed8150fd439', 'C4-Q044': 'f455ce471fed407eeb04d26fa1906cdc6043d7e44bc24e941222e0b6e601bd40', 'C4-Q045': '56787fe07c759c2b32155ba63b49a07be186c056f531af443505e483831191e4', 'C4-Q046': '399def81026ded8816a45dd442dd1b7a0cd86d2dd9bd36f8074628abcccc2d80', 'C4-Q047': 'd5568eecf8fcbf6e1743355276d1b1f760d063301f1a882d8ad39e571593eb92', 'C4-Q048': '4e5f4956281b0c22a267d3f80cce6d797dd6612e74af475363a589410c66d144', 'C4-Q049': '3ec6962c6df2e9e419645f4fdec7d4876e20da2b8dfa1325a09b66cbe1592784', 'C4-Q050': 'c5ace68da19f0867fe2e83dbb075fc9f86c483c26e0aa9b55d797abb7087fece'}
REQUIRED_RECTS={(Fraction(120, 1), Fraction(840, 1), Fraction(320, 1), Fraction(40, 1)), (Fraction(100, 1), Fraction(160, 1), Fraction(144, 1), Fraction(210, 1)), (Fraction(120, 1), Fraction(650, 1), Fraction(160, 1), Fraction(80, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1)), (Fraction(244, 1), Fraction(300, 1), Fraction(216, 1), Fraction(70, 1))}
REQUIRED_PATHS={'M100 400V130M100 370H520', 'M100 160H244V300H460', 'M40 465H600', 'M100 1320H220V1420M100 1220H460V1420', 'M100 1460V1140M100 1420H520', 'M0 0L7 3.5L0 7Z', 'M40 1010H600'}
REQUIRED_CIRCLES={(Fraction(220, 1), Fraction(1320, 1), Fraction(6, 1)), (Fraction(460, 1), Fraction(1220, 1), Fraction(6, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1 · L’area è carica trasferita', 'I (mA)', 't (s)', '0', '4', '10', '3', '1', '12 mC', '6 mC', '2 · Volume e resistività invariati', 'Schema rettangolare, profondità costante.', 'ℓ', 'A', '2ℓ', 'A/2', 'R_f / R_i = 2 / (1/2) = 4', '3 · Due rapporti V/I differenti', 'I (mA)', 'V (V)', '1', '2', '0', '1', '3', 'V/I = 1 kΩ', 'V/I = 1,5 kΩ')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Corrente, filo stirato e rapporti statici'), ('desc', 'Tre problemi distinti. Grafico a gradini di corrente positiva con aree 12 e 6 millicoulomb. Schema di un filo rettangolare a profondità costante: lunghezza doppia e altezza dimezzata conservano il volume. Due soli punti di corrente e tensione danno rapporti statici diversi, senza interpolare una curva.'))
GEOMETRY_REVIEW='Tre pannelli letti integralmente nel nuovo PNG640×1540: gradini I(t) da3 mA per4 s e1 mA per6 s hanno larghezze144/216 e altezze210/70, aree coerenti12/6 mC. Filo rettangolare a profondità comune160×80 e320×40, volume costante e resistenza quadruplicata. Due soli punti I(V) a(1V,1mA)/(3V,2mA), coordinate120/360 e100/200, senza curva interpolata; rapporti statici1/1.5 kΩ. Zeri e unità leggibili, scale indipendenti tra pannelli.'
DECIMAL_REGRESSION_NUMBER=41
EXPECTED_CONTEXT={'C4-Q041': {'id': 'C4-Q041', 'kind': 'question', 'course': 'C4', 'order': 41, 'skill': 'C4-L05', 'family': 'carica-dal-tracciato-di-corrente', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q042': {'id': 'C4-Q042', 'kind': 'question', 'course': 'C4', 'order': 42, 'skill': 'C4-L05', 'family': 'moto-degli-elettroni-in-un-filo', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q043': {'id': 'C4-Q043', 'kind': 'question', 'course': 'C4', 'order': 43, 'skill': 'C4-L05', 'family': 'energia-per-carica-al-generatore', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q044': {'id': 'C4-Q044', 'kind': 'question', 'course': 'C4', 'order': 44, 'skill': 'C4-L05', 'family': 'durata-di-un-trasferimento', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 2}, 'C4-Q045': {'id': 'C4-Q045', 'kind': 'question', 'course': 'C4', 'order': 45, 'skill': 'C4-L05', 'family': 'confrontare-due-curve-ohmiche', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q046': {'id': 'C4-Q046', 'kind': 'question', 'course': 'C4', 'order': 46, 'skill': 'C4-L05', 'family': 'filo-stirato-a-volume-costante', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q047': {'id': 'C4-Q047', 'kind': 'question', 'course': 'C4', 'order': 47, 'skill': 'C4-L05', 'family': 'resistenza-di-un-dato-materiale', 'difficulty': 1, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q048': {'id': 'C4-Q048', 'kind': 'question', 'course': 'C4', 'order': 48, 'skill': 'C4-L05', 'family': 'lama-metallica-a-sezione-rettangolare', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}, 'C4-Q049': {'id': 'C4-Q049', 'kind': 'question', 'course': 'C4', 'order': 49, 'skill': 'C4-L05', 'family': 'analizzare-un-componente-non-lineare', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 2}, 'C4-Q050': {'id': 'C4-Q050', 'kind': 'question', 'course': 'C4', 'order': 50, 'skill': 'C4-L05', 'family': 'corrente-media-con-uninversione', 'difficulty': 2, 'prerequisites': ['C4-L01', 'C4-L03'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
REQUIRED_DOMAIN_FRAGMENTS={'C4-Q041': ['sempre nello stesso verso positivo'], 'C4-Q044': ['corrente costante'], 'C4-Q045': ['ohmici a temperatura fissata', 'pendenze positive diverse'], 'C4-Q046': ['iniziali positive, resistività positiva e invariata', 'conservando il volume'], 'C4-Q050': ['carica positiva equivalente', 'destra come verso positivo']}
REQUIRED_TEXT_ATTRIBUTES=((('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), (('x', '35'), ('y', '110')), (('x', '540'), ('y', '380')), (('x', '75'), ('y', '410')), (('text-anchor', 'middle'), ('x', '244'), ('y', '410')), (('text-anchor', 'middle'), ('x', '460'), ('y', '410')), (('x', '65'), ('y', '167')), (('x', '65'), ('y', '307')), (('x', '135'), ('y', '275')), (('x', '320'), ('y', '345')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '520')), (('font-size', '18'), ('x', '40'), ('y', '565')), (('text-anchor', 'middle'), ('x', '200'), ('y', '620')), (('x', '315'), ('y', '700')), (('text-anchor', 'middle'), ('x', '280'), ('y', '815')), (('x', '475'), ('y', '868')), (('x', '40'), ('y', '960')), (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1065')), (('x', '45'), ('y', '1120')), (('x', '540'), ('y', '1430')), (('x', '70'), ('y', '1327')), (('x', '70'), ('y', '1227')), (('x', '75'), ('y', '1490')), (('text-anchor', 'middle'), ('x', '220'), ('y', '1470')), (('text-anchor', 'middle'), ('x', '460'), ('y', '1470')), (('x', '245'), ('y', '1360')), (('x', '320'), ('y', '1180')))
REQUIRED_MARKER_ATTRIBUTES=((('id', 'g'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')), (('id', 'v'), ('markerHeight', '7'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '7'), ('orient', 'auto'), ('refX', '7'), ('refY', '3.5')))
OFFSET=40
MODEL_PATH='editorial/reviews/cric-c4-041-050-partial-models.py'
MODEL_REF='6fbd440c1a31462c678b126b541f5b3dc00f0218'

def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def partial_source_predictions():
 q=sp.Rational
 return {'C4-Q041':3*4+1*6,'C4-Q044':q(8,10**6)/q(40,10**5)*1000,'C4-Q046':q(2)/(q(1,2)),'C4-Q048':q(2,10**8)*q(1,5)/(q(2,1000)*q(1,10000)),'C4-Q050':q(12-2,5)}
def partial_dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [u(3,'milliampere')*u(4,'second')+u(1,'milliampere')*u(6,'second'),u(8,'microcoulomb')/u(q(2,5),'milliampere'),u(q(2,10**8),'ohm*meter')*u(q(1,5),'meter')/(u(2,'millimeter')*u(q(1,10),'millimeter'))]
def main():
 values=partial_source_predictions();expected={41:18,44:20,46:4,48:sp.Rational(1,50),50:2}
 for n,v in expected.items():assert sp.simplify(values[f'C4-Q{n:03}']-v)==0
 for x,unit,v in zip(partial_dimensional_crosschecks(),['millicoulomb','millisecond','ohm'],[18,20,Fraction(1,50)]):assert x.to(unit).magnitude==v
 assert sp.Rational(1,sp.Rational(1,1000))!=sp.Rational(3,sp.Rational(2,1000))
 print('PARTIAL10_SOURCE_PROMPTS;5_exact_numeric_checks;3_Pint_checks;ONLY_Q041_050_MODELED;candidate_SCI_NOT_RUN',flush=True)
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
    return [values['C4-Q041'],'Verso sinistra, opposto alla corrente convenzionale','Differenza di potenziale',values['C4-Q044'],'Quello con pendenza I/V minore, quindi con retta meno ripida',values['C4-Q046'],'Resistività',values['C4-Q048'],'Il rapporto V/I cambia: una sola resistenza costante non descrive entrambi i punti',values['C4-Q050']]
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
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c4-041-050-partial-models.py"
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c4_l05_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c4-041-050-partial-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"6fbd440c1a31462c678b126b541f5b3dc00f0218"},"modelFunctionBodies":"All functions in the frozen source-only C4 partial model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c4-041-050-partial-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
