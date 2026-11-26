"""Independent source-first Cric dimensions and measurement; no candidate authoring imports.
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
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c'
CANDIDATE_REF='a9e769aeb23260ed09fea6646ca17a2c5749f69d'
PRIMARY_SHA256='2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C1.json', 'sourceSha256': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf', 'primarySkill': 'C1-L001', 'title': 'Dare una misura alle cose', 'actualLessonPrerequisites': []}
FAMILY='cric-c1-l001'
BATCH='cric-c1-l001'
ASSET_NAME='cric-c1-l001-progressive.svg'
REVIEWED_PACKAGE_SHA256='b189536e4a18503c4b98e83b14ca46e217f91d6a5e050e3c68d3693c3f207e11'
REVIEWED_BINDINGS_SHA256='4d50f9032e63997148b6e769d545ed2dcc4bfca1381c00c5d31efa33fb5d0378'
SOURCE_REFERENCE='Dieci problemi distinti di misura: volume, omogeneità dimensionale, estensività, conteggi di intervalli, ordine logaritmico, vettori, tara, coefficiente quadratico, conversione di rapidità e densità intensiva.'
FALSE_PROOF='Un microlitro equivale a un millilitro, quindi la conversione in mm³ introduce un fattore mille.'
SVG_MUTATION=(b'width="273"', b'width="274"')
SVG_LABEL_MUTATION=(b'12,6 g', b'13,6 g')
EXPECTED_MAPPING={1: ('C1-L001', ['C1-L001']), 2: ('C1-L001', ['C1-L001']), 3: ('C1-L001', ['C1-L001']), 4: ('C1-L001', ['C1-L001']), 5: ('C1-L001', ['C1-L001']), 6: ('C1-L001', ['C1-L001']), 7: ('C1-L001', ['C1-L001']), 8: ('C1-L001', ['C1-L001']), 9: ('C1-L001', ['C1-L001']), 10: ('C1-L001', ['C1-L001'])}
NUMERIC_UNITS={1: 'mm³', 4: '1'}
OPTION_SUFFIX={5: ' m', 7: ' g', 9: ' km/h'}
UNITS={1: 'millimeter**3', 2: 'joule', 3: 'kilogram', 4: 'dimensionless', 5: 'meter', 6: 'meter', 7: 'gram', 8: 'meter/second**2', 9: 'kilometer/hour', 10: 'kilogram/meter**3'}
MANUAL=['1 µL=10⁻⁶ L=10⁻⁹ m³ e 1 mm³=(10⁻³ m)³=10⁻⁹ m³. La conversione mantiene il coefficiente 250: volume 250 mm³. Il prisma è solo un volume equivalente.', 'Fℓ e mv²/2 hanno entrambi dimensione ML²T⁻². Il caso di forza concorde rende Fℓ un lavoro positivo. Non basta che uno solo dei due termini abbia la dimensione di energia.', 'La massa si somma fra le parti ed è estensiva. Per due metà identiche m₁=m₂=m/2; la densità nello stesso stato resta invece intensiva.', '4 cm sono 40 000 µm. Divido 40 000 per 80: 500 segmenti, risultato puro. Il prompt finale chiarisce che si contano lunghezze, non i punti che delimitano gli intervalli.', 'In scala logaritmica la soglia fra 10⁻⁵ e 10⁻⁴ è √10·10⁻⁵. Poiché 7²=49>10, il coefficiente è sopra la soglia e la potenza più vicina è 10⁻⁴ m. Nessun logaritmo decimale è necessario.', 'Quattro metri verso nord contiene modulo, direzione e verso: è uno spostamento vettoriale. La dimensione rimane lunghezza; non diventa forza o numero puro.', 'Converto la tara 0,0420 kg in 42,0 g. La massa del contenuto è 54,6−42,0=12,6 g, minore della massa lorda e positiva. Tutti i decimali vengono trattati come frazioni esatte nel modello assegnato.', 'Da x=kt², k=x/t² ha dimensione LT⁻² e unità m/s². Nella stessa legge d²x/dt²=2k: uguale dimensione non implica uguale valore numerico di k e accelerazione.', 'Il fattore di conversione da m/s a km/h è 3600/1000=18/5. Moltiplico 5/4 per 18/5: 9/2=4,5 km/h, stessa rapidità fisica in una diversa unità.', 'Stesso liquido omogeneo nello stesso stato termodinamico dà la stessa densità. Se la massa cresce di un fattore λ>0, il volume cresce dello stesso fattore e m/V resta invariato.']
DISTRACTORS=['0,25 mm³ copia il coefficiente in mL; 250000 mm³ tratta µL come mL. Il prefisso in una lunghezza va elevato al cubo nel volume.', 'F e mv non sono energie; Fv è potenza. mℓ, Ft e v² hanno dimensioni differenti da energia, quindi non formano la coppia richiesta.', 'Intensiva non scala con la quantità; adimensionale e vettoriale non descrivono la dipendenza additiva della massa. La proprietà resta scalare con dimensione M.', '50 e 5000 perdono o aggiungono un fattore dieci. 1/500 è il rapporto inverso. I 501 estremi di 500 intervalli non sono le 500 lunghezze richieste.', '10⁻⁵ copia l’esponente senza la soglia; 10⁻⁶ e 10⁻³ sono più lontane. 7·10⁻⁵ non è una singola potenza di dieci.', 'Scalare perde il verso nord; il numero 4 non elimina l’unità. Una forza ha dimensione diversa e non qualunque vettore è una forza; il tempo non è una lunghezza.', '54,558 g sottrae dati non uniformati. 96,6 somma la tara; 42,0 è la tara stessa. 0,0126 è il coefficiente in kg, non in g.', 'Nel prodotto kt², m/s darebbe LT; m²/s² darebbe L², s²/m darebbe T⁴/L e m darebbe LT². Soltanto m/s² ricostruisce L.', '0,45 e 45 introducono un fattore dieci; 5/4 copia il coefficiente precedente senza convertire e 25/72 divide per 18/5 invece di moltiplicare.', 'Le proporzioni diretta e inversa dalla sola massa omettono la variazione del volume. Masse diverse non impongono densità diverse e densità nulla contraddice massa positiva e volume finito.']
ASSUMPTIONS=['Volume di 250 µL assegnato; confronto fra unità di volume SI equivalenti, senza ipotesi sulla forma reale della micropipetta o una sua calibrazione.', 'Forza costante concorde al tratto rettilineo del punto di applicazione; m è massa, v rapidità e ℓ lunghezza. Si chiede omogeneità dimensionale di entrambi i termini della coppia, non una legge dinamica aggiuntiva.', 'Campione omogeneo diviso in due parti uguali senza mutarne lo stato. La massa classica è additiva fra le parti; dimensione, natura scalare ed estensività sono classificazioni distinte.', 'Lunghezze ideali di segmenti: 4 cm e 80 µm. Copertura esatta senza sovrapposizioni; si contano intervalli di lunghezza e non i loro punti estremi.', 'Grandezza positiva 7·10⁻⁵ m e definizione esplicita di potenza più vicina in scala logaritmica. Soglia geometrica √10, non arrotondamento lineare né semplice esponente della notazione scientifica.', 'Spostamento di modulo 4 m verso nord. Si distingue un vettore spostamento da una lunghezza scalare, una forza o il percorso realmente compiuto.', 'Stessa fiala piena e vuota, masse assegnate 54,6 g e 0,0420 kg; il contenuto non altera la massa del contenitore. Conversione delle unità prima della sottrazione, senza dedurre incertezze non fornite.', 'Legge dimensionale x=kt² con x lunghezza e t tempo; k è un coefficiente costante della legge. La sua unità coincide con quella di accelerazione, ma il valore dinamico sarebbe 2k se la stessa x descrive un moto.', 'Rapidità assegnata 1,25 m/s, da esprimere in km/h. Le definizioni 1 km=1000 m e 1 h=3600 s sono esatte; non cambia la rapidità fisica.', 'Due porzioni positive dello stesso liquido omogeneo, stessa composizione, temperatura e pressione. Stato identico e volume proporzionale alla massa: densità intensiva, senza cambiamenti di fase o composizione.']
PEDAGOGY=['Conversione cubica motivata attraverso m³; volume equivalente distinto dalla forma della pipetta.', 'Controllati entrambi i termini di ogni coppia; dimensioni uguali indicate come condizione necessaria per sommare energie.', 'Distinte additività, dimensione e natura scalare della massa.', 'Il prompt finale elimina la possibile ambiguità fra numero di segmenti e numero di estremi.', 'Procedura senza calcolatrice mediante confronto di quadrati positivi, con definizione logaritmica esplicita.', 'Modulo, direzione e verso separati dall’unità di lunghezza.', 'Tara portata in grammi prima della sottrazione; risultato reinserito nella somma massa vuota più contenuto.', 'Dimensione corretta e fattore dinamico 2k distinti, senza identificare unità uguali con valori uguali.', 'Fattori di conversione con cancellazione delle unità e controllo del verso della conversione.', 'La maggiore quantità di campione cambia insieme massa e volume, non la densità allo stesso stato.']
EXPECTED_IDS={'C1-Q007', 'C1-Q009', 'C1-Q003', 'C1-Q005', 'C1-Q006', 'C1-Q004', 'C1-Q008', 'C1-Q001', 'C1-Q010', 'C1-Q002'}
REVIEWED_CANDIDATES={'C1-Q001': '3a42c3fbc2fafdcbc48e6fd01724a02829cc54b5207944cf8ceb35f27fc5f682', 'C1-Q002': '0df8f5b58fc6436bf423e8a02c2fc4a59a89fe313e3fdaad7a3464d369512f4c', 'C1-Q003': 'f33a2fa0cbc15854de107be05f6ed5857ca2dca0d99a8f4602c76b03dce2a7af', 'C1-Q004': '323dbf19684404a069b21a887c02b3da30699676b6d67e5a8a126687b3808e35', 'C1-Q005': '489fe9869c4df1f8ee060bbbb99aa968986aa6d484d20263d8f708c3e0d9c7ff', 'C1-Q006': '12888786f3af14b166a34236f0833df055b18ec66ed0ecaa328973a9d93bcb1f', 'C1-Q007': 'cbc3e05963aa0ebaf41a051f22a4f74a83bf0886c7f3025aab229852fea5e2ca', 'C1-Q008': '21cf4b0b71d7064efa79fbe0fb2b162194ecdfc922853ecc804a30f39c662122', 'C1-Q009': '5a4fd2406742afc73313623e1be805ce9c9887fc039eef4b8667a2bd57dda569', 'C1-Q010': '07e0a4292d9a466d8264ea674b639ddde174f6ec7ebf1c4f9351c9e8e5059158'}
REQUIRED_RECTS={(Fraction(155, 1), Fraction(840, 1), Fraction(210, 1), Fraction(30, 1)), (Fraction(155, 1), Fraction(940, 1), Fraction(63, 1), Fraction(30, 1)), (Fraction(170, 1), Fraction(350, 1), Fraction(100, 1), Fraction(200, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1650, 1)), (Fraction(155, 1), Fraction(740, 1), Fraction(273, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M320 1500V1300', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES={(Fraction(313, 1), Fraction(1450, 1), Fraction(327, 1), Fraction(1450, 1)), (Fraction(313, 1), Fraction(1350, 1), Fraction(327, 1), Fraction(1350, 1)), (Fraction(313, 1), Fraction(1400, 1), Fraction(327, 1), Fraction(1400, 1)), (Fraction(313, 1), Fraction(1500, 1), Fraction(327, 1), Fraction(1500, 1)), (Fraction(313, 1), Fraction(1300, 1), Fraction(327, 1), Fraction(1300, 1))}
REQUIRED_SVG_TEXTS=('Misurare prima di confrontare', '1 · Un volume equivalente: 250 µL', '1 µL = 1 mm³; la forma non cambia il volume.', 'Prisma di lati 5 mm, 5 mm e 10 mm.', '5 mm', '10 mm', '5 mm', '5 × 5 × 10 = 250; il volume è 250 mm³.', '2 · Togliere la tara nella stessa unità', 'piena', '54,6 g', 'vuota', '42,0 g', 'contenuto', '12,6 g', '0,0420 kg = 42,0 g', '54,6 g − 42,0 g = 12,6 g', '3 · Un vettore spostamento verso nord', 'N', '1 m', '2 m', '3 m', '4 m', 'O', 'Δr', 'Il modulo è 4 m; la freccia aggiunge il verso.', 'Non è un percorso obbligato né una forza.')
GEOMETRY_REVIEW='XML e nuovo PNG indipendente 640×1650 interamente letti. Prisma obliquo con lati di lunghezza proiettata100,100,200 per5,5,10mm: volume250mm³, senza attribuire al disegno la forma della micropipetta. Barre massa tutte da x155:273,210,63 corrispondono54,6/42/12,6g, scala comune5 coordinate/g; differenza63. Freccia nord da(320,1500) a(320,1300), quattro intervalli uguali50 per1m; origine e verso coerenti. Tre pannelli indipendenti, nessuna label attraversata o tagliata rilevata.'
DECIMAL_REGRESSION_NUMBER=7
EXPECTED_CONTEXT={'C1-Q001': {'id': 'C1-Q001', 'kind': 'question', 'course': 'C1', 'order': 1, 'skill': 'C1-L001', 'family': 'un-volume-sulla-scala-si', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}, 'C1-Q002': {'id': 'C1-Q002', 'kind': 'question', 'course': 'C1', 'order': 2, 'skill': 'C1-L001', 'family': 'due-quantita-sommabili', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 2}, 'C1-Q003': {'id': 'C1-Q003', 'kind': 'question', 'course': 'C1', 'order': 3, 'skill': 'C1-L001', 'family': 'il-campione-si-divide', 'difficulty': 1, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}, 'C1-Q004': {'id': 'C1-Q004', 'kind': 'question', 'course': 'C1', 'order': 4, 'skill': 'C1-L001', 'family': 'due-misure-un-rapporto', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}, 'C1-Q005': {'id': 'C1-Q005', 'kind': 'question', 'course': 'C1', 'order': 5, 'skill': 'C1-L001', 'family': 'una-stima-in-scala-logaritmica', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}, 'C1-Q006': {'id': 'C1-Q006', 'kind': 'question', 'course': 'C1', 'order': 6, 'skill': 'C1-L001', 'family': 'il-dato-direzionale', 'difficulty': 1, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 2}, 'C1-Q007': {'id': 'C1-Q007', 'kind': 'question', 'course': 'C1', 'order': 7, 'skill': 'C1-L001', 'family': 'la-bilancia-con-la-tara', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 2}, 'C1-Q008': {'id': 'C1-Q008', 'kind': 'question', 'course': 'C1', 'order': 8, 'skill': 'C1-L001', 'family': 'dimensione-del-coefficiente', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 2}, 'C1-Q009': {'id': 'C1-Q009', 'kind': 'question', 'course': 'C1', 'order': 9, 'skill': 'C1-L001', 'family': 'velocita-annotata-in-reparto', 'difficulty': 2, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}, 'C1-Q010': {'id': 'C1-Q010', 'kind': 'question', 'course': 'C1', 'order': 10, 'skill': 'C1-L001', 'family': 'controllare-una-pesata-media', 'difficulty': 1, 'prerequisites': ['C1-L001'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={'10⁻⁴': Fraction(1, 10000), '10⁻⁵': Fraction(1, 100000), '10⁻⁶': Fraction(1, 1000000), '10⁻³': Fraction(1, 1000), '7,0 × 10⁻⁵': Fraction(7, 100000)}
REQUIRED_POLYGONS={'270,350 340.710678,279.289322 340.710678,479.289322 270,550', '170,350 270,350 340.710678,279.289322 240.710678,279.289322'}

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
    units={' mm³':('volume',sp.Rational(1,10**9)),' µL':('volume',sp.Rational(1,10**9)),' mL':('volume',sp.Rational(1,10**6)),' g':('mass',sp.Rational(1,1000)),' kg':('mass',sp.Integer(1)),' km/h':('speed',sp.Rational(5,18)),' m/s':('speed',sp.Integer(1)),' m':('length',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda pair:-len(pair[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert d['C1-Q001']==v['C1-Q001']==250 and d['C1-Q007']==v['C1-Q007']==sp.Rational(63,5)
    assert d['C1-Q009']==v['C1-Q009']==sp.Rational(9,2)
    assert d['C1-Q008']=={'[length]':'1','[time]':'-2'}
    assert v['C1-Q004']==500 and v['C1-Q005']==sp.Rational(1,10000)
    force_length=(SI.Unit('newton')*SI.Unit('meter')).dimensionality
    kinetic=(SI.Unit('kilogram')*SI.Unit('meter/second')**2).dimensionality
    assert force_length==kinetic==SI.Unit('joule').dimensionality
    return [v['C1-Q001'],'F ℓ e (1/2) m v²','Estensiva',v['C1-Q004'],v['C1-Q005'],'È vettoriale: servono modulo, direzione e verso',v['C1-Q007'],'m/s²',v['C1-Q009'],'Sono uguali: la densità è intensiva nello stesso stato']
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
    if root.get('viewBox')!='0 0 640 1650':raise ValueError('Independent physical scale viewport changed')
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
        errors.extend(common);number=int(row["id"][-3:]);source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c1_l001_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("C1.json","C2.json")
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
