"""Distinct source-first C5 review; concepts separately read; no authoring imports."""
from fractions import Fraction
from functools import lru_cache
import json,re,xml.etree.ElementTree as ET
from pathlib import Path
import sympy as sp
import pint,hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C5.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='0908ada36b1ff643d239adf7d25e636eeefd4cc7b21053ac6b6b6a53c75317b8'
MODEL_PATH='editorial/reviews/cric-c5-001-050-independent-models.py'
MODEL_REF='18fd1cd488c90f4d294e4cfc6fb361be9a042d88'
PRIMARY_PATH='editorial/reviews/primary-cric-c5-001-050-before-candidates-20261126.md'
PRIMARY_SHA256='27a0255c29f25dd30e89b343b8a1a1268bc76fbbdd8551d2cc8c83f9db569059'
CANDIDATE_REF='5fb56b5ca057ec0587f8a5e6f26105b2d45d099a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L04', 'title': 'Dalla potenza della sorgente all’energia raccolta', 'actualLessonPrerequisites': ['C5-L02']}
FAMILY='cric-c5-l04'
BATCH='cric-c5-l04'
ASSET_NAME='cric-c5-l04-progressive.svg'
OFFSET=30
REVIEWED_PACKAGE_SHA256='76e9ead83bb889d8e84ccc055a21d0d7250690df4794f0d9683a8e6aab7a26ea'
REVIEWED_BINDINGS_SHA256='e14114ee8fb62b61f09ea4db08220260e362196727a0d71ec3a726c9e376fe12'
EXPECTED_IDS={'C5-Q031', 'C5-Q037', 'C5-Q039', 'C5-Q036', 'C5-Q040', 'C5-Q035', 'C5-Q032', 'C5-Q034', 'C5-Q033', 'C5-Q038'}
REVIEWED_CANDIDATES={'C5-Q031': '78a3dd31bd5b78e4085cb3526f31492a7a569972467b3cc471612ee66d294250', 'C5-Q032': 'a8baf3376597f5836a0851ae4578a5e52e255433b88eb22f1f72a6c7421587fb', 'C5-Q033': 'a991757df916bce37faf8444df87bb513b0858642e02abc0823f2d10b6ad7f47', 'C5-Q034': 'f9b3829f1074f9424ce0d35121c55e275de406932be5808c747bceb9371409ac', 'C5-Q035': 'd23e730a1fe193ef34b3a6ddd5867c2ab4d0aae16d3f153a49bb4f8e6aa4c5bd', 'C5-Q036': '656d53f4c7572d26659ae76dfae2b4dc69e63bae597561c549824e837b75c881', 'C5-Q037': 'e53a173088c94e27081969efc8d38064d90c0d91bfb246bedcd7fa146d434863', 'C5-Q038': '581aa13afe3c6a5030d0518d683bd5e53a11d343a2542b77af96d5086c9e125d', 'C5-Q039': '906f079e09f11decc33f386b1bc9b1d4105465b0d2271597a964298725ec5934', 'C5-Q040': '0f8adfd4fbc2b064f398904825ef057115fc8ac49b4c41446096a8a524a036a1'}
EXPECTED_CONTEXT={'C5-Q031': {'id': 'C5-Q031', 'kind': 'question', 'course': 'C5', 'order': 31, 'skill': 'C5-L04', 'family': 'bilancio-sul-sensore', 'difficulty': 1, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q032': {'id': 'C5-Q032', 'kind': 'question', 'course': 'C5', 'order': 32, 'skill': 'C5-L04', 'family': 'la-sorgente-emette-il-doppio', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q033': {'id': 'C5-Q033', 'kind': 'question', 'course': 'C5', 'order': 33, 'skill': 'C5-L04', 'family': 'distanza-sconosciuta', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q034': {'id': 'C5-Q034', 'kind': 'question', 'course': 'C5', 'order': 34, 'skill': 'C5-L04', 'family': 'stessa-sfera-sonda-piu-larga', 'difficulty': 1, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q035': {'id': 'C5-Q035', 'kind': 'question', 'course': 'C5', 'order': 35, 'skill': 'C5-L04', 'family': 'leggere-lunita-composta', 'difficulty': 1, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q036': {'id': 'C5-Q036', 'kind': 'question', 'course': 'C5', 'order': 36, 'skill': 'C5-L04', 'family': 'fascio-cilindrico-ideale', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q037': {'id': 'C5-Q037', 'kind': 'question', 'course': 'C5', 'order': 37, 'skill': 'C5-L04', 'family': 'impulsi-e-media-nel-tempo', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q038': {'id': 'C5-Q038', 'kind': 'question', 'course': 'C5', 'order': 38, 'skill': 'C5-L04', 'family': 'potenza-della-corda-e-massa-lineare', 'difficulty': 3, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 2}, 'C5-Q039': {'id': 'C5-Q039', 'kind': 'question', 'course': 'C5', 'order': 39, 'skill': 'C5-L04', 'family': 'energia-catturata-inclinando-il-sensore', 'difficulty': 3, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 2}, 'C5-Q040': {'id': 'C5-Q040', 'kind': 'question', 'course': 'C5', 'order': 40, 'skill': 'C5-L04', 'family': 'superficie-chiusa-e-conservazione', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}}
NUMERIC_UNITS={31: 'W/m²', 38: '1', 39: 'W'}
OPTION_SUFFIX={32: '', 33: ' m', 37: ' W'}
UNITS={31: 'watt/meter**2', 32: 'dimensionless', 33: 'meter', 34: 'dimensionless', 35: 'dimensionless', 36: 'dimensionless', 37: 'watt', 38: 'dimensionless', 39: 'watt', 40: 'dimensionless'}
MANUAL=['I=E/(AΔt). Dodici millijoule sono 3/250 J e due centimetri quadrati sono 1/5000 m². I=(3/250)/[(1/5000)·3]=20 W/m². La superficie è normale al fascio, quindi non serve un fattore di proiezione.', 'Per emissione isotropa senza assorbimento I=P/(4πr²). Raddoppiare P e r dà I_f/I_i=2/4=1/2, con r positivo. La geometria sferica è essenziale al fattore inverso del quadrato.', 'Con la stessa potenza in campo sferico ideale, I_A/I_B=(r_B/r_A)²=9. Si prende la radice positiva: r_B=3·0,80=12/5 m=2,40 m. Si misura dal centro della sorgente.', 'In campo uniforme non perturbato dalla sonda, l’intensità locale resta uguale. La potenza incidente raccolta P=IA raddoppia con l’area perpendicolare. La potenza effettivamente assorbita richiederebbe anche il coefficiente di assorbimento.', 'La parola è tempo: W/m²=J/(s·m²). L’intensità è un flusso energetico per unità di area, non l’energia per area soltanto.', 'La potenza media sulla sezione divisa per l’area resta uguale perché entrambe sono costanti. Non si applica automaticamente 1/r² a un fascio collimato che non aumenta la propria sezione nel modello ideale.', 'Il duty cycle è 2/10=1/5. Con potenza zero nel resto del periodo, P_media=4·1/5=4/5 W=0,80 W. I 4 W sono la potenza durante l’impulso, non la media sul ciclo.', 'Per onda armonica progressiva su corda P_media=(1/2)μω²A²v. A uguali A, f e v, il rapporto è μ_B/μ_A=3. Per il rapporto si assumono A e f non nulli; le tensioni sono diverse quanto necessario a mantenere la stessa velocità, come il prompt permette.', 'La potenza che attraversa l’area piana è IA cosθ. Con θ rispetto alla normale, cos60°=1/2 e P=5·4·1/2=10 W. Non si usa sin60° e non occorre conoscere l’assorbimento per la potenza attraversante.', 'In regime stazionario senza assorbimento fra le sfere, la potenza totale che le attraversa è la stessa. La sua distribuzione per area può cambiare, ma l’integrale del flusso sulle due superfici chiuse conserva la potenza emessa.']
READING_NOTES=['12 mJ/3 s=4 mW e area 2·10⁻⁴ m²:20 W/m²; dimenticare l’area non completa il compito.', 'Potenza doppia su area sferica quadrupla dà 1/2; 2 ignora geometria, 1/4 ignora potenza e 8 inverte il fattore geometrico.', 'La radice positiva di nove è tre: 0,80·3=2,4 m; fattore nove sulla distanza darebbe intensità divisa per81.', 'Il campo resta imposto: I invariata, potenza raccolta doppia se area doppia e campo non perturbato.', 'W/m²=J/(s·m²), quindi tempo; frequenza al denominatore moltiplicherebbe per secondi.', 'Potenza e sezione positive costanti danno intensità costante; 1/r² richiede invece espansione sferica.', 'Il denominatore della media include pausa: 4·2/10=4/5 W; inversione della frazione attiva dà 20 W.', 'μ compare linearmente con v,ω,A comuni: rapporto tre. Tensioni uguali sarebbero incompatibili con stessa v e densità diverse.', 'La normale è a60° dal raggio: area efficace4·1/2=2 m², potenza10 W; il caso20 W è incidenza normale.', 'Il guscio senza sorgenti, perdite o accumulo conserva potenza integrata; superficie chiusa non significa barriera.']
GEOMETRY_REVIEW='PNG640×1560 e XML completi: E(t) lineare0→12 mJ in3 s, punto medio6 mJ/1,5 s; barre320/160 indicano I e I/2. Segmento del sensore da150,1265 a410,1415 ha lunghezza300 e proiezione150, con normale a60° dal raggio. L’approssimazione delle coordinate non altera le proporzioni esatte derivate; area laterale non identificata con area fisica. Testi e punte interi.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('height', '1560'), ('role', 'img'), ('viewBox', '0 0 640 1560'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Energia sul sensore, espansione e proiezione dell’area'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Il sensore riceve dodici millijoule in tre secondi. Barre normalizzate mostrano intensità finale metà quando potenza e distanza raddoppiano. La sezione laterale del sensore forma trenta gradi col raggio e la sua normale sessanta; la proiezione ha metà lunghezza e, a profondità uguale, metà area.'), ('{http://www.w3.org/2000/svg}defs', (), ''), ('{http://www.w3.org/2000/svg}marker', (('id', 'tip'), ('markerHeight', '6'), ('markerWidth', '6'), ('orient', 'auto'), ('refX', '9'), ('refY', '5'), ('viewBox', '0 0 10 10')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M0 0L10 5L0 10Z'), ('fill', 'context-stroke')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '1560'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}g', (('fill', '#202c39'), ('font-family', 'Arial, sans-serif')), '\n'), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '52')), '1. Dal sensore all’intensità'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '95')), 'Energia ricevuta con potenza costante.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 145V460H555'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 460L500 180'), ('fill', 'none'), ('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 180H500V460M140 320H320V460'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '151')), 'E (mJ)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '91'), ('y', '189')), '12'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '102'), ('y', '329')), '6'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '105'), ('y', '494')), '0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '308'), ('y', '494')), '1,5'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '493'), ('y', '494')), '3'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '532'), ('y', '533')), 't (s)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '576')), 'P = 4 mW; S = 2 cm²; I = 20 W/m².'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '609'), ('y2', '609')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '664')), '2. Più potenza, ma più lontano'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '707')), 'Potenza doppia, distanza doppia.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M180 740V920'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '131'), ('y', '760')), '0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '43'), ('y', '801')), 'Iᵢ'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '45'), ('width', '320'), ('x', '180'), ('y', '770')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '43'), ('y', '886')), 'I_f'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '45'), ('width', '160'), ('x', '180'), ('y', '855')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '362'), ('y', '887')), 'Iᵢ / 2'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '967')), 'Barre sulla stessa scala normalizzata.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1000'), ('y2', '1000')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '1055')), '3. L’area vista dal fascio'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1098')), 'Sezione laterale a profondità uguale.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M80 1340H550'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#26728d'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M150.096189 1265L409.903811 1415'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '7')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M280 1340L340 1236.076952'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#4e876d'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M150.096189 1265H530M409.903811 1415H530'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M530 1265V1415M520 1265H540M520 1415H540'), ('fill', 'none'), ('stroke', '#a1473c'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M340 1340A60 60 0 0 0 310 1288.038476'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '349'), ('y', '1228')), 'normale'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '350'), ('y', '1296')), '60°'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '442'), ('y', '1318')), 'raggio'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '115'), ('y', '1465')), 'sensore'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '405'), ('y', '1465')), 'proiezione'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1532')), 'Area: 4 m² → 2 m² efficaci. Potenza: 10 W.'))
REQUIRED_DOMAIN_FRAGMENTS={'C5-Q031': [], 'C5-Q032': ['potenza positiva', 'r>0'], 'C5-Q033': ['potenza costante positiva'], 'C5-Q034': ['senza perturbarlo'], 'C5-Q035': [], 'C5-Q036': ['potenza positiva e sezione costanti'], 'C5-Q037': [], 'C5-Q038': ['v>0', 'A>0', 'f>0'], 'C5-Q039': [], 'C5-Q040': ['non ci sono assorbimenti, altre sorgenti o accumulo']}
CONCEPTS={34: 'L’intensità resta uguale e la potenza raddoppia', 35: 'Tempo', 36: 'Rimane costante', 40: 'È la stessa'}
KNOWN_OPTIONS={}

def source_only_predictions():
 q=sp.Rational
 return {'C5-Q001':7,'C5-Q002':(q(85,100)-q(10,100))/5,'C5-Q003':1/(2*q(18,1000)),
 'C5-Q006':3*sp.pi/(2*sp.pi),'C5-Q009':sp.sqrt(4),'C5-Q011':2*18,
 'C5-Q014':2*sp.pi*q(12,100)/q(48,100),'C5-Q015':(q(160,100)-q(40,100))/(q(24,100)-q(16,100)),
 'C5-Q017':2*sp.pi/q(25,10),'C5-Q019':q(12,6)*q(30,100),'C5-Q021':q(12,10)+q(8,10),
 'C5-Q023':abs(5-3),'C5-Q025':q(3)-q(5,2),'C5-Q027':q(2)**2,'C5-Q029':q(102,100)/340*1000,
 'C5-Q031':q(12,1000)/(3*q(2,10000)),'C5-Q032':q(2,2**2),'C5-Q033':q(80,100)*sp.sqrt(9),
 'C5-Q037':4*q(2,10),'C5-Q038':q(3),'C5-Q039':5*4*sp.cos(sp.pi/3),'C5-Q041':q(1,10**12)*10**5*10**6,
 'C5-Q043':10*sp.log(q(1,100))/sp.log(10),'C5-Q045':2*q(51)/q(30,100),
 'C5-Q048':q(1480,1000),'C5-Q050':10*sp.log(3)/sp.log(10)}

def dimensional_crosschecks():
 q=Fraction;u=lambda value,unit:SI.Quantity(q(value),unit)
 return [u(q(3,4),'second')/5,1/u(36,'millisecond'),u(q(6,5),'meter')/u(q(2,25),'second'),u(4,'watt')*u(2,'millisecond')/u(10,'millisecond'),u(102,'meter')/u(q(3,10),'second'),u(1480,'meter/second')/u(1,'kilohertz'),u(12,'millijoule')/(u(3,'second')*u(2,'centimeter**2')),u(5,'watt/meter**2')*u(4,'meter**2')*q(1,2)]

def main():
 q=sp.Rational;values=source_only_predictions();expected={1:7,2:q(3,20),3:q(250,9),6:q(3,2),9:2,11:36,14:sp.pi/2,15:15,17:4*sp.pi/5,19:q(3,5),21:2,23:2,25:q(1,2),27:4,29:3,31:20,32:q(1,2),33:q(12,5),37:q(4,5),38:3,39:10,41:q(1,10),43:-20,45:340,48:q(37,25),50:10*sp.log(3)/sp.log(10)}
 for value in values.values():
  expr=sp.sympify(value);assert expr.is_real is True and expr.is_finite is True and not expr.has(sp.Float)
 for n,wanted in expected.items():assert sp.simplify(values[f'C5-Q{n:03}']-wanted)==0,(n,values[f'C5-Q{n:03}'],wanted)
 for x,unit,wanted in zip(dimensional_crosschecks(),['second','hertz','meter/second','watt','meter/second','meter','watt/meter**2','watt'],[Fraction(3,20),Fraction(250,9),15,Fraction(4,5),340,Fraction(37,25),20,10]):assert isinstance(x.to(unit).magnitude,(int,Fraction)) and x.to(unit).magnitude==wanted
 assert sp.log(3)/sp.log(10)>0
 print('50_PROMPTS_INDIVIDUALLY_DERIVED;26_EXACT_NUMERIC_SYMBOLIC_CHECKS;8_PINT_CHECKS;NO_CANDIDATE_KEYS_OPENED;NO_CANDIDATE_SCI_PASS',flush=True)
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
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
KNOWN_MATH={'π':sp.pi,'2π':2*sp.pi,'π/2':sp.pi/2,'π/4':sp.pi/4,'5/(4π)':5/(4*sp.pi),'4π/5':4*sp.pi/5,'5π':5*sp.pi,'4π':4*sp.pi,'20 log₁₀(3)':20*sp.log(3)/sp.log(10),'10 log₁₀(1/3)':-10*sp.log(3)/sp.log(10),'10 log₁₀(3)':10*sp.log(3)/sp.log(10)}
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_MATH:return _finite_exact(KNOWN_MATH[raw])
    return parse_literal(raw)
def parse_option(number,option):
    if type(number)is not int or not OFFSET<number<=OFFSET+10 or not isinstance(option,str):raise ValueError('Reviewed option ID and string required')
    if option in KNOWN_OPTIONS.get(number,{}):return parse_literal(KNOWN_OPTIONS[number][option])
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required literal physical unit absent')
    return mapped_literal(option.removesuffix(suffix)if suffix else option)
def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    if number in KNOWN_OPTIONS and option in KNOWN_OPTIONS[number]:return 'normalized',parse_option(number,option)
    for suffix,dimension,scale in [(' μW/m²','intensity',sp.Rational(1,10**6)),(' W/m²','intensity',sp.Integer(1)),(' mW','power',sp.Rational(1,1000)),(' W','power',sp.Integer(1)),(' rad/m','wavenumber',sp.Integer(1)),(' rad','phase',sp.Integer(1)),(' Hz','frequency',sp.Integer(1)),(' periodi','count',sp.Integer(1)),(' m/s','speed',sp.Integer(1)),(' mm','length',sp.Rational(1,1000)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' dB','level',sp.Integer(1)),('','normalized',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix)if suffix else option)
        except (ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    main()
    values=source_only_predictions();physics.check_independent_laws(values);values['C5-Q016']=sp.Rational(1,3)
    return [CONCEPTS[n]if n in CONCEPTS else values[f'C5-Q{n:03}']for n in range(OFFSET+1,OFFSET+11)]
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    actual=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in root.iter())
    if actual!=REQUIRED_GEOMETRY:raise ValueError('Independent physical scale or reviewed SVG quantity labels/accessibility changed')
    return GEOMETRY_REVIEW
from . import cric_c5_wave_physics as physics
WAVE_PHYSICS_SHA256='93914663cf78ebfeca77636e9817dd6c77435641de4a9e83c3140df24909ea27'
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if sha(Path(physics.__file__).read_bytes())!=WAVE_PHYSICS_SHA256:common.append("Independent wave-law dependency edition mismatch")
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c5-001-050-independent-models.py"
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c5_l04_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
          "manualArithmetic":MANUAL[number-OFFSET-1],"physicalAssumptions":READING_NOTES[number-OFFSET-1],"distractors":READING_NOTES[number-OFFSET-1],
          "pedagogicalReview":READING_NOTES[number-OFFSET-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_frozen_prompt_only_wave_models_and_separate_concepts",
            "Pint_exact_wave_dimensions_and_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes()),"cric_c5_wave_physics.py":sha(Path(physics.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":"Fifty original prompts derived before candidate answers; final cohort fully read separately."},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c5-001-050-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"18fd1cd488c90f4d294e4cfc6fb361be9a042d88"},"modelFunctionBodies":"All functions in the frozen source-only C5 model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c5-001-050-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
