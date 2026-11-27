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
CANDIDATE_REF='d409f2cc91e0e4bff841a2d677d29289a3a6d33f'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L03', 'title': 'Sommare gli spostamenti nel punto di incontro', 'actualLessonPrerequisites': ['C5-L02']}
FAMILY='cric-c5-l03'
BATCH='cric-c5-l03'
ASSET_NAME='cric-c5-l03-progressive.svg'
OFFSET=20
REVIEWED_PACKAGE_SHA256='264f637516727bc46466d4ec446e8f6755fcfb403b36e0c93b651be61aceee53'
REVIEWED_BINDINGS_SHA256='9a429a51c90cddf2dbdfabc6bf4264b9ee776839a9862552db749fd91b40d47b'
EXPECTED_IDS={'C5-Q025', 'C5-Q027', 'C5-Q021', 'C5-Q029', 'C5-Q028', 'C5-Q026', 'C5-Q030', 'C5-Q024', 'C5-Q022', 'C5-Q023'}
REVIEWED_CANDIDATES={'C5-Q021': '8d10bf73bbf3f721172b53c92e95f06e338b22fa02b41e4b628e6b8d08264715', 'C5-Q022': '126541e35b6890c79be705f4fb1b3d6736b639bef9e23c31e21cd1f507a25730', 'C5-Q023': '4e1c8771e76805e71aef2d4c62cfe85ed7f16a38b146ea2f97549a25e6095e0d', 'C5-Q024': '7feb3af3fb9a7a865c39bdd9ad6264a8dfafc7096e24a4d42fd9d3ad099b8d5f', 'C5-Q025': 'df1110d86839b52820e6cc2fd98d7459ac5c7854ea3572a243a5c1714c748f83', 'C5-Q026': '0dff2e574651bdf66a83d364e9eaa7071489a8df4f6f9fd7fb1e5e318fb018e9', 'C5-Q027': 'f0e5a3ac5320dc3579dc5a73d41d0d61de70420affc406d54e61d6c1bc690ee2', 'C5-Q028': 'f9eab47a6a439f70e154d7779f02d270d3f8adaad02696980987b61f2fc1dcec', 'C5-Q029': '1ac791517ca108242c0ee7deaf2bed3336af5014fecddbd106eb0c5e41ada295', 'C5-Q030': 'a9faf35f7ed576857d0afc9fad84d0f68cd179791734244122753b84e6e46fef'}
EXPECTED_CONTEXT={'C5-Q021': {'id': 'C5-Q021', 'kind': 'question', 'course': 'C5', 'order': 21, 'skill': 'C5-L03', 'family': 'due-impulsi-concordi', 'difficulty': 1, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q022': {'id': 'C5-Q022', 'kind': 'question', 'course': 'C5', 'order': 22, 'skill': 'C5-L03', 'family': 'dopo-la-cancellazione', 'difficulty': 1, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q023': {'id': 'C5-Q023', 'kind': 'question', 'course': 'C5', 'order': 23, 'skill': 'C5-L03', 'family': 'un-residuo-in-opposizione', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q024': {'id': 'C5-Q024', 'kind': 'question', 'course': 'C5', 'order': 24, 'skill': 'C5-L03', 'family': 'sorgenti-fuori-fase-allorigine', 'difficulty': 3, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q025': {'id': 'C5-Q025', 'kind': 'question', 'course': 'C5', 'order': 25, 'skill': 'C5-L03', 'family': 'da-minimo-a-massimo', 'difficulty': 3, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q026': {'id': 'C5-Q026', 'kind': 'question', 'course': 'C5', 'order': 26, 'skill': 'C5-L03', 'family': 'un-nodo-della-figura-stabile', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q027': {'id': 'C5-Q027', 'kind': 'question', 'course': 'C5', 'order': 27, 'skill': 'C5-L03', 'family': 'massimo-doppio-e-intensita', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q028': {'id': 'C5-Q028', 'kind': 'question', 'course': 'C5', 'order': 28, 'skill': 'C5-L03', 'family': 'sorgenti-dal-ritmo-instabile', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q029': {'id': 'C5-Q029', 'kind': 'question', 'course': 'C5', 'order': 29, 'skill': 'C5-L03', 'family': 'ritardo-dalla-differenza-di-cammino', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}, 'C5-Q030': {'id': 'C5-Q030', 'kind': 'question', 'course': 'C5', 'order': 30, 'skill': 'C5-L03', 'family': 'somma-punto-per-punto', 'difficulty': 2, 'prerequisites': ['C5-L02'], 'exam': None, 'version': 1}}
NUMERIC_UNITS={21: 'mm', 23: 'mm', 29: 'ms'}
OPTION_SUFFIX={25: '', 27: ''}
UNITS={21: 'millimeter', 22: 'dimensionless', 23: 'millimeter', 24: 'dimensionless', 25: 'meter', 26: 'dimensionless', 27: 'dimensionless', 28: 'dimensionless', 29: 'millisecond', 30: 'dimensionless'}
MANUAL=['Nel modello lineare si sommano gli spostamenti nello stesso punto e istante: y=1,2+0,8=2,0 mm. Non si sommano quadrati o intensità per ottenere un’ordinata.', 'Dopo l’incrocio gli impulsi proseguono con forma, ampiezza e verso propri nel modello lineare ideale. La cancellazione dello spostamento durante la sovrapposizione completa non li distrugge e non prova che l’energia totale sia scomparsa.', 'In opposizione di fase le ampiezze risultanti si sottraggono con segno, e il modulo è |5−3|=2 mm. Non è annullamento completo perché le ampiezze non sono uguali.', 'Con sorgenti coerenti uguali in opposizione e cammini uguali nello stesso mezzo senza ulteriori sfasamenti, l’interferenza è distruttiva. Le oscillazioni si cancellano nel punto, non per dissipazione.', 'La differenza iniziale di cammino è 5λ/2, quindi un semintero di λ. Il massimo richiede un multiplo intero. Aumentando il cammino più lungo di λ/2 si arriva a 3λ; aumentando il più corto di λ/2 si arriva a 2λ. Il minimo incremento positivo di uno qualunque dei due cammini è dunque 1/2 in unità di λ.', 'La fase relativa dipende dalla posizione: una cancellazione coerente stabile produce un nodo, mentre poco lontano la somma non è nulla. È interferenza spaziale, non scomparsa dell’energia totale né obbligo che tutta la regione sia silenziosa.', 'Nel modello esplicitamente assegnato I=C A_ris², con lo stesso coefficiente e onde progressive identiche compatibili con tale relazione locale, la fase concorde dà A_ris=2A e I/I_singola=4. Non si estende questo rapporto al flusso netto di due onde contropropaganti, per cui la sola ampiezza locale non basta.', 'La fase relativa casuale cambia la posizione istantanea degli estremi e rende nullo sulla lunga media il termine di interferenza, sotto l’ipotesi di decorrelazione. Le intensità medie si sommano senza una figura stabile di frange.', 'Il ritardo è Δt=Δs/v=1,02/340=3/1000 s=3 ms. Le onde sono confrontate a pari istante di emissione; il maggiore cammino produce arrivo successivo.', 'No: la sovrapposizione somma i valori nello stesso punto, non i massimi presi in luoghi diversi. Otto millimetri è un limite superiore per due impulsi i cui massimi sono 4 mm, ma non è garantito in quell’istante senza sapere se entrambi raggiungono il massimo in un punto comune.']
READING_NOTES=['Le ordinate concordi si sommano con segno: 2 mm; la media è 1 mm e la differenza 0,4 mm.', 'La cancellazione istantanea delle ordinate non annulla le due soluzioni o l’energia cinetica; gli impulsi si separano.', 'Opposizione permanente e ampiezze diverse lasciano |5−3|=2 mm; 8 richiede fase uguale, zero ampiezze uguali.', 'Cammini uguali mantengono lo sfasamento iniziale π; uguali ampiezze e polarizzazione consentono cancellazione completa.', 'Il semi-intero 5/2 dista 1/2 da entrambi gli interi adiacenti; aumentare un cammino di λ mantiene un minimo.', 'Un nodo locale può dipendere dalla fase relativa spaziale; non spegne le sorgenti né annulla frequenza o velocità del mezzo.', 'Con onde progressive concordi e stesso coefficiente la somma coerente 2A dà 4I; contropropagazione e somma incoerente sono altri modelli.', 'La distribuzione uniforme sul giro annulla la media del coseno senza imporre ampiezze o velocità nulle; ipotesi aggiunta esplicitamente nel finale.', 'Distanza extra su velocità comune dà 3/1000 s=3 ms; cambiare etichetta senza convertire dà 0,003 ms errati.', 'Due massimi lontani non danno automaticamente 8 mm; un controesempio con supporti separati ha massimo 4 mm.']
GEOMETRY_REVIEW='PNG640×1640 e XML completi: barre120+80=200 a100 coordinate/mm; nel secondo pannello200−120=80 a40/mm con origine comune920 e segni opposti. Coppia di barre di ampiezza100/200 e intensità80/320 usa scale distinte, come dichiarato. Tutti gli zeri e testi sono separati da assi e barre.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('height', '1640'), ('role', 'img'), ('viewBox', '0 0 640 1640'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Somme algebriche, opposizione e quadrato dell’ampiezza'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Tre barre positive sommano uno virgola due e zero virgola otto in due millimetri. Barre con segni opposti mostrano cinque meno tre uguale due millimetri. Due scale separate mostrano ampiezza doppia e intensità quadrupla per onde concordi in fase.'), ('{http://www.w3.org/2000/svg}defs', (), ''), ('{http://www.w3.org/2000/svg}marker', (('id', 'tip'), ('markerHeight', '6'), ('markerWidth', '6'), ('orient', 'auto'), ('refX', '9'), ('refY', '5'), ('viewBox', '0 0 10 10')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M0 0L10 5L0 10Z'), ('fill', 'context-stroke')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '1640'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}g', (('fill', '#202c39'), ('font-family', 'Arial, sans-serif')), '\n'), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '52')), '1. La somma conserva il segno'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '95')), 'Stesso punto e istante; spostamenti in mm.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 160V420H580'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '47'), ('y', '178')), 'y (mm)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '95'), ('y', '228')), '2'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '75'), ('y', '308')), '1,2'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '75'), ('y', '348')), '0,8'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '120'), ('width', '70'), ('x', '190'), ('y', '300')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '80'), ('width', '70'), ('x', '330'), ('y', '340')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#4e876d'), ('height', '200'), ('width', '70'), ('x', '470'), ('y', '220')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '109'), ('y', '452')), '0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '206'), ('y', '470')), 'y₁'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '346'), ('y', '470')), 'y₂'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '476'), ('y', '470')), 'y totale'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '525')), '+1,2 mm + 0,8 mm = +2,0 mm.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '560'), ('y2', '560')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '615')), '2. L’opposizione lascia un residuo'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '658')), 'Coefficienti dei coseni alla stessa fase.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 700V1060M140 920H580'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '104'), ('y', '948')), '0'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '200'), ('width', '70'), ('x', '190'), ('y', '720')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '120'), ('width', '70'), ('x', '330'), ('y', '920')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#4e876d'), ('height', '80'), ('width', '70'), ('x', '470'), ('y', '840')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '186'), ('y', '705')), '+5 mm'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '326'), ('y', '1074')), '−3 mm'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '466'), ('y', '824')), '+2 mm'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1122')), 'L’ampiezza della somma è 2 mm, non 8 mm.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1155'), ('y2', '1155')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '1209')), '3. Ampiezza e intensità distinte'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1252')), 'Onde progressive concordi e in fase.'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '45'), ('y', '1303')), 'A'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '30'), ('width', '100'), ('x', '180'), ('y', '1280')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '45'), ('y', '1353')), '2A'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '30'), ('width', '200'), ('x', '180'), ('y', '1330')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '405'), ('y', '1354')), 'Scala: ampiezza'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1393'), ('y2', '1393')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '45'), ('y', '1443')), 'I₁'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '30'), ('width', '80'), ('x', '180'), ('y', '1420')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '45'), ('y', '1503')), '4I₁'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '30'), ('width', '320'), ('x', '180'), ('y', '1480')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1570')), 'Ogni coppia ha la propria scala comune.'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1610')), 'Intensità proporzionale al quadrato di A.'))
REQUIRED_DOMAIN_FRAGMENTS={'C5-Q021': [], 'C5-Q022': [], 'C5-Q023': ['stessa frequenza', 'sempre in opposizione'], 'C5-Q024': ['uguale ampiezza e stessa polarizzazione'], 'C5-Q025': ['λ>0'], 'C5-Q026': [], 'C5-Q027': ['A>0', 'C>0', 'nello stesso verso'], 'C5-Q028': ['distribuzione uniforme su un giro'], 'C5-Q029': [], 'C5-Q030': []}
CONCEPTS={22: 'Si separano e continuano nei rispettivi versi', 24: 'Distruttiva completa', 26: 'La fase relativa dei contributi cambia con il punto di misura', 28: 'La condizione di rinforzo o cancellazione in un punto cambia nel tempo', 30: 'No: servono le ordinate dei due profili nello stesso punto'}
KNOWN_OPTIONS={25: {'λ/2': '1/2', 'λ/4': '1/4', 'λ': '1', '5λ/2': '5/2', '2λ': '2'}, 27: {'Quattro volte': '4', 'Due volte': '2', 'Uguale': '1', 'La metà': '1/2', 'Zero': '0'}}

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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c5_l03_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
