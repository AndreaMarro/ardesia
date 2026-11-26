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
CANDIDATE_REF='cd2c949a12535d7504e92dffb874eddcc71eecee'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L01', 'title': 'Contare i ritorni all’equilibrio', 'actualLessonPrerequisites': []}
FAMILY='cric-c5-l01'
BATCH='cric-c5-l01'
ASSET_NAME='cric-c5-l01-progressive.svg'
OFFSET=0
REVIEWED_PACKAGE_SHA256='4f1677a2c93ad5053e2f5edec760100dd40f17a5316b6ae9471ed916e30c00cd'
REVIEWED_BINDINGS_SHA256='681117ee46008c699381f235a199f16bfd929a0b6bb28acca8a350c295488909'
EXPECTED_IDS={'C5-Q007', 'C5-Q006', 'C5-Q010', 'C5-Q009', 'C5-Q004', 'C5-Q005', 'C5-Q003', 'C5-Q001', 'C5-Q008', 'C5-Q002'}
REVIEWED_CANDIDATES={'C5-Q001': '80ba2a36fb20e4f38c9376ecf83799bc514e927f7ce9a4e7a2ef060bc9b8fa7f', 'C5-Q002': '7d4c385e4b062d478b2e7be6cb9c6fd625f6ae2645b3a78ab9db184eccbef961', 'C5-Q003': '9a58178c1de7e438fe67b0072ec4eca074b2f1521b599a57a020037ede92386f', 'C5-Q004': 'c6b17e1e5dd7d603c644e728e629bf4ddb6760571ea36eb5309275d7546f1819', 'C5-Q005': '5fceafdedfe5020935d09d9792218863be9cced349aebe495acac45079e4a95c', 'C5-Q006': '36461c038a40ec06062fb43d86aa7912c0e7b1a9a9bc18797357486c1edba47b', 'C5-Q007': 'de52dd79287c0b6c21a469b44193d4bffea973d7de7c4adaad91c0aba365301a', 'C5-Q008': 'fc594c7cd31128730afc27ce64d591137e10b8c319f828f3b320357cbc67a6d6', 'C5-Q009': '2e18bf48d2f8353221f4daf148dd4038f8cad034c2f13750f0fa3cd1d55ed237', 'C5-Q010': '9bccc0bfe97bcb8a233d3af5f1b78a05b7e94a2f4807e9ae138e8f796698d04c'}
EXPECTED_CONTEXT={'C5-Q001': {'id': 'C5-Q001', 'kind': 'question', 'course': 'C5', 'order': 1, 'skill': 'C5-L01', 'family': 'fra-due-estremi', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q002': {'id': 'C5-Q002', 'kind': 'question', 'course': 'C5', 'order': 2, 'skill': 'C5-L01', 'family': 'il-ciclo-mancante', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q003': {'id': 'C5-Q003', 'kind': 'question', 'course': 'C5', 'order': 3, 'skill': 'C5-L01', 'family': 'uno-zero-attraversato-due-volte', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 2}, 'C5-Q004': {'id': 'C5-Q004', 'kind': 'question', 'course': 'C5', 'order': 4, 'skill': 'C5-L01', 'family': 'quale-coppia-basta', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q005': {'id': 'C5-Q005', 'kind': 'question', 'course': 'C5', 'order': 5, 'skill': 'C5-L01', 'family': 'istante-iniziale-di-un-coseno', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q006': {'id': 'C5-Q006', 'kind': 'question', 'course': 'C5', 'order': 6, 'skill': 'C5-L01', 'family': 'meta-percorso-in-fase', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q007': {'id': 'C5-Q007', 'kind': 'question', 'course': 'C5', 'order': 7, 'skill': 'C5-L01', 'family': 'il-termine-del-richiamo', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q008': {'id': 'C5-Q008', 'kind': 'question', 'course': 'C5', 'order': 8, 'skill': 'C5-L01', 'family': 'verso-della-velocita-al-centro', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q009': {'id': 'C5-Q009', 'kind': 'question', 'course': 'C5', 'order': 9, 'skill': 'C5-L01', 'family': 'una-molla-meno-rigida', 'difficulty': 3, 'prerequisites': [], 'exam': None, 'version': 1}, 'C5-Q010': {'id': 'C5-Q010', 'kind': 'question', 'course': 'C5', 'order': 10, 'skill': 'C5-L01', 'family': 'traccia-con-escursione-calante', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}}
NUMERIC_UNITS={1: 'mm'}
OPTION_SUFFIX={2: ' s', 3: ' Hz', 6: ' periodi', 9: ''}
UNITS={1: 'millimeter', 2: 'second', 3: 'hertz', 4: 'dimensionless', 5: 'dimensionless', 6: 'dimensionless', 7: 'dimensionless', 8: 'dimensionless', 9: 'dimensionless', 10: 'dimensionless'}
MANUAL=['L’ampiezza è il massimo modulo dell’allontanamento dall’equilibrio: 7 mm. La distanza fra i due estremi è invece 14 mm e non è l’ampiezza.', 'Dal primo al sesto massimo trascorrono cinque periodi, non sei. Δt=0,85−0,10=0,75 s e T=0,75/5=3/20 s=0,15 s. Si suppongono massimi consecutivi dello stesso oscillatore.', 'Due attraversamenti consecutivi dell’equilibrio in versi opposti sono separati da T/2. T=36 ms=9/250 s, quindi f=250/9 Hz. Questa frazione è esatta; un decimale periodico richiederebbe un arrotondamento dichiarato.', 'Lontano dagli estremi, uguale posizione e uguale verso della velocità identificano la stessa fase modulo 2π per lo stesso oscillatore ideale ad ampiezza costante. La sola posizione non basta perché viene attraversata in due versi. La fase accumulata può differire di un numero intero di 2π.', 'A t=0 si ha x=A, velocità zero e accelerazione −ω²A, verso l’equilibrio. È l’estremo positivo, non un attraversamento dell’origine. Ampiezza e pulsazione sono positive nel moto oscillatorio non banale.', 'La fase accumulata cresce di 2π per ogni periodo. Il numero trascorso è N=3π/(2π)=3/2 periodi. Non si riduce prima la variazione modulo 2π e non si arrotonda N a un intero.', 'La parola è equilibrio. Il segno meno rende l’accelerazione opposta allo spostamento x e diretta verso x=0; non significa accelerazione sempre orientata nel verso negativo dell’asse.', 'La rapidità raggiunge il massimo, |v|=ωA, e di conseguenza anche l’energia cinetica è massima. Accelerazione e forza elastica sono invece nulle all’equilibrio. Senza opzioni il testo consente più grandezze correlate massime: la futura alternativa va controllata per evitare due risposte vere.', 'Con m invariata e k_f=k_i/4, ω_f=ω_i/2 da ω²=k/m. Poiché T=2π/ω, il periodo raddoppia. L’ampiezza non determina il periodo nel modello di molla lineare ideale.', 'È compatibile con oscillazioni smorzate, con ampiezza che cala e intervalli fra massimi quasi costanti. I rapporti 6/8 e 4,5/6 valgono entrambi 3/4; ciò è coerente con un decadimento esponenziale campionato ogni periodo. Non si pretende di identificare dal solo grafico una causa microscopica unica.']
READING_NOTES=['Il percorso fra estremi è 14 mm; ampiezza 7 mm rispetto allo zero. Non si divide ancora per due il massimo modulo.', 'Cinque intervalli fra sei massimi: 0,75/5 s; dividere per sei o usare un istante assoluto non ricostruisce le tacche.', 'Gli attraversamenti opposti sono separati da mezzo periodo; 18 ms come periodo raddoppia f, quattro intervalli la dimezzano.', 'Uguale posizione con verso opposto identifica le due fasi distinte; uguali energia o moduli di velocità e accelerazione non fissano il verso.', 'A t=0 il coseno vale uno e il seno zero: accelerazione verso il centro, non punto con velocità massima.', 'La fase è accumulata: 3π/(2π)=3/2, non fase ridotta a π né conteggio necessariamente intero.', 'Il segno meno confronta accelerazione e spostamento; non implica sempre asse negativo o forza opposta alla velocità.', 'Fra le alternative solo il modulo della velocità è massimo; forza, accelerazione e spostamento sono nulli. K sarebbe anch’essa massima ma non è proposta.', 'Il periodo varia con la radice di m/k: dividere k per quattro raddoppia T, non lo quadruplica.', 'Decadimento dei picchi con rapporti 3/4 e intervalli quasi costanti è compatibile con smorzamento; non identifica da solo la causa.']
GEOMETRY_REVIEW='Tre pannelli integralmente letti nel PNG640×1560 e XML: estremi+7/−7 mm a140 coordinate dal centro, stessa scala20/mm; sei tacche equispaziate rappresentano0,10..0,85 s e cinque intervalli0,15 s; barre160/120/90 rappresentano8/6/4,5 mm a20/mm. Gli indici dei massimi non rappresentano il tempo. Testi, estremi e zeri separati dagli assi.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('height', '1560'), ('role', 'img'), ('viewBox', '0 0 640 1560'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Ampiezza, intervalli fra massimi e altezze decrescenti'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Gli estremi a più e meno sette millimetri distano ciascuno sette millimetri dal centro. Sei massimi da zero virgola dieci a zero virgola ottantacinque secondi delimitano cinque intervalli di zero virgola quindici secondi. Tre barre di altezze otto, sei e quattro virgola cinque millimetri rappresentano massimi successivi.'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '1560'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}g', (('fill', '#202c39'), ('font-family', 'Arial, sans-serif'), ('font-size', '23')), '\n'), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '52')), '1. Dal centro a un solo estremo'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '95')), 'Posizioni rispetto all’equilibrio, in mm.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M320 150V480M130 320H510'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 180H480M140 460H480'), ('fill', 'none'), ('stroke', '#899a9f'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}circle', (('cx', '320'), ('cy', '180'), ('fill', '#26728d'), ('r', '8')), ''), ('{http://www.w3.org/2000/svg}circle', (('cx', '320'), ('cy', '460'), ('fill', '#26728d'), ('r', '8')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '78'), ('y', '188')), '+7'), ('{http://www.w3.org/2000/svg}text', (('x', '89'), ('y', '328')), '0'), ('{http://www.w3.org/2000/svg}text', (('x', '78'), ('y', '468')), '−7'), ('{http://www.w3.org/2000/svg}path', (('d', 'M500 180V320M490 180H510M490 320H510M500 320V460M490 460H510'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '516'), ('y', '257')), '7 mm'), ('{http://www.w3.org/2000/svg}text', (('x', '516'), ('y', '397')), '7 mm'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '520')), 'Ampiezza: 7 mm. Corsa completa: 14 mm.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '555'), ('y2', '555')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '612')), '2. Sei tacche, cinque intervalli'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '655')), 'Massimi consecutivi del medesimo moto.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M90 760H550'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}g', (('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 745V775M180 745V775M260 745V775M340 745V775M420 745V775M500 745V775'),), ''), ('{http://www.w3.org/2000/svg}text', (('x', '76'), ('y', '815')), '0,10'), ('{http://www.w3.org/2000/svg}text', (('x', '156'), ('y', '815')), '0,25'), ('{http://www.w3.org/2000/svg}text', (('x', '236'), ('y', '815')), '0,40'), ('{http://www.w3.org/2000/svg}text', (('x', '316'), ('y', '815')), '0,55'), ('{http://www.w3.org/2000/svg}text', (('x', '396'), ('y', '815')), '0,70'), ('{http://www.w3.org/2000/svg}text', (('x', '476'), ('y', '815')), '0,85'), ('{http://www.w3.org/2000/svg}text', (('x', '525'), ('y', '855')), 't (s)'), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 875V895H500V875'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '151'), ('y', '940')), 'Tempo complessivo: 0,75 s'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '995')), 'Ogni intervallo dura 0,75 s / 5 = 0,15 s.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1030'), ('y2', '1030')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '1085')), '3. L’altezza non è un tempo'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '1128')), 'Altezze di tre massimi successivi.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1180V1440H580'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '1195')), 'A (mm)'), ('{http://www.w3.org/2000/svg}text', (('x', '98'), ('y', '1288')), '8'), ('{http://www.w3.org/2000/svg}text', (('x', '98'), ('y', '1328')), '6'), ('{http://www.w3.org/2000/svg}text', (('x', '75'), ('y', '1358')), '4,5'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1280H220M140 1320H360M140 1350H500'), ('fill', 'none'), ('stroke', '#899a9f'), ('stroke-dasharray', '5 6'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#26728d'), ('height', '160'), ('width', '60'), ('x', '190'), ('y', '1280')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '120'), ('width', '60'), ('x', '330'), ('y', '1320')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#4e876d'), ('height', '90'), ('width', '60'), ('x', '470'), ('y', '1350')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '109'), ('y', '1470')), '0'), ('{http://www.w3.org/2000/svg}text', (('x', '213'), ('y', '1474')), '1'), ('{http://www.w3.org/2000/svg}text', (('x', '353'), ('y', '1474')), '2'), ('{http://www.w3.org/2000/svg}text', (('x', '493'), ('y', '1474')), '3'), ('{http://www.w3.org/2000/svg}text', (('x', '32'), ('y', '1525')), 'Ordine dei massimi; stessa scala verticale.'))
REQUIRED_DOMAIN_FRAGMENTS={'C5-Q001': [], 'C5-Q002': [], 'C5-Q003': ['volte consecutive', 'versi opposti'], 'C5-Q004': ['stesso oscillatore', 'lontani dagli estremi'], 'C5-Q005': ['A>0', 'ω>0'], 'C5-Q006': ['accumulata'], 'C5-Q007': [], 'C5-Q008': ['ampiezza non nulla'], 'C5-Q009': ['k₁>0'], 'C5-Q010': []}
CONCEPTS={4: 'Stessa posizione e stesso verso della velocità', 5: 'Estremo positivo e velocità nulla', 7: 'La posizione di equilibrio', 8: 'La velocità', 10: 'Ampiezza decrescente e periodo osservato quasi costante'}
KNOWN_OPTIONS={9: {'Raddoppia': '2', 'Quadruplica': '4', 'Si dimezza': '1/2', 'Diventa un quarto': '1/4', 'Resta uguale': '1'}}

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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c5_l01_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
