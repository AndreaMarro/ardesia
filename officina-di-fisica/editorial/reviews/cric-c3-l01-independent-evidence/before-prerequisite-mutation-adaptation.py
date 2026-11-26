"""Independent source-first Cric fluid pressure and density; no candidate authoring imports.
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
SOURCE_PATH='officina-di-fisica/content/C3.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f'
CANDIDATE_REF='119fd8a8b73803079ffb50c04e6aa808bd974f3e'
PRIMARY_SHA256='34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C3.json', 'sourceSha256': '44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0', 'primarySkill': 'C3-L01', 'title': 'Il confine del sistema e il termometro', 'actualLessonPrerequisites': []}
FAMILY='cric-c3-l01'
BATCH='cric-c3-l01'
ASSET_NAME='cric-c3-l01-progressive.svg'
REVIEWED_PACKAGE_SHA256='b128235bfb25712b8b1eeb253a93501dfa1bf9a27e9cac437c43859d13da9d10'
REVIEWED_BINDINGS_SHA256='65e83dfb87563dfd9a65a8776a6fe8d2ff0720549c83d0c4fb4cb247f6de847a'
SOURCE_REFERENCE='Dieci problemi distinti Cric C3 letti integralmente dopo primaria e modelli propri congelati; interpretazione di letture Celsius e intervalli termici distinta per ID.'
FALSE_PROOF='Una parete adiabatica rende sempre impossibile ogni lavoro meccanico.'
SVG_MUTATION=(b'width="300" height="45"', b'width="301" height="45"')
SVG_LABEL_MUTATION=(b'trecento', b'trecentouno')
EXPECTED_MAPPING={1: ('C3-L01', []), 2: ('C3-L01', []), 3: ('C3-L01', []), 4: ('C3-L01', []), 5: ('C3-L01', []), 6: ('C3-L01', []), 7: ('C3-L01', []), 8: ('C3-L01', []), 9: ('C3-L01', []), 10: ('C3-L01', [])}
NUMERIC_UNITS={8: '°C'}
OPTION_SUFFIX={2: ' K', 5: ' °C'}
UNITS={1: 'dimensionless', 2: 'kelvin', 3: 'dimensionless', 4: 'dimensionless', 5: 'degC', 6: 'pascal', 7: 'kilogram', 8: 'degC', 9: 'pascal', 10: 'dimensionless'}
MANUAL=['L’acqua liquida rimasta è un sistema aperto: la massa attraversa il confine trasformandosi in vapore, ed energia può entrare dalla sorgente di calore o uscire con la materia. La pentola scoperta non rende il liquido un sistema isolato.', 'Converto soltanto la lettura finale: 20,0 °C corrisponde a 293,15 K. La differenza finale meno iniziale è 293,15−311=−17,85 K=−357/20 K. Un intervallo in kelvin non richiede un secondo offset.', 'La parola è stato. Una funzione di stato dipende dagli estremi termodinamici e non dal percorso; calore e lavoro sono invece trasferimenti dipendenti dal processo.', 'Alla medesima temperatura iniziale non vi è un gradiente termico che provochi un flusso netto di calore fra i due blocchi. Non si può dedurre uguaglianza di energia interna o capacità termica da quella sola uguaglianza; si assumono assenza di reazioni e altri processi.', '26,85 °C+273,15 K danno 300 K. Raddoppiare la temperatura assoluta porta a 600 K, quindi la nuova lettura Celsius è 600−273,15=326,85 °C. Non si raddoppia direttamente il numero Celsius.', 'È la pressione. Nel modello uniforme la forza normale complessiva divisa per l’area ha unità N/m²=Pa; una pressione non è la forza totale.', 'Una proprietà estensiva si dimezza: per esempio la quantità di sostanza, la massa, il numero di particelle, il volume o l’energia interna dello stesso gas uniforme. Pressione, temperatura e densità restano intensive. Senza alternative il prompt non identifica una sola proprietà estensiva; la futura scelta va valutata nel suo contesto.', 'Gli intervalli 4 K e 6 K valgono rispettivamente 4 e 6 gradi Celsius. Sottraggo complessivamente 10 alla lettura iniziale: 35−4−6=25 °C. Non si aggiunge 273,15 agli intervalli.', 'Durante le onde di pressione non è definita una pressione uniforme d’equilibrio per tutto il gas. Occorre attendere il rilassamento meccanico, dopo avere fissato i vincoli, fino a un nuovo equilibrio; non basta mediare una lettura locale istantanea.', 'La parete è adiabatica: impedisce il trasferimento di energia come calore. Può muoversi e consentire lavoro meccanico, dunque adiabatica non significa immobile o isolata da ogni trasferimento energetico.']
DISTRACTORS=['Chiuso conserva materia, isolato anche energia; il sistema aperto ha un confine e l’ebollizione non impone adiabaticità.', '+17,85 K perde il segno; −291 K mescola scale; 293,15 K e 311 K copiano letture degli estremi, non la variazione.', 'Cammino esprime la dipendenza esclusa; calore e lavoro sono trasferimenti; tempo trascorso non completa funzione di stato.', 'Uguale T non implica uguale U; massa maggiore non genera da sola un diverso equilibrio; moto molecolare non si annulla.', '53,70°C raddoppia la lettura; 600°C scambia unità senza offset; 26,85°C resta iniziale; 300°C copia il coefficiente Kelvin iniziale.', 'Temperatura, volume e moli hanno altre unità; forza tangenziale non è pressione e forza sola manca della divisione per area.', 'p,T,ρ e c specifico restano intensivi; capacità totale sarebbe estensiva ma non è l’opzione data.', '31°C omette il secondo calo; 29°C omette il primo; 45°C somma un aumento; gli offset non si sommano agli intervalli.', 'Una misura locale transiente non descrive necessariamente tutto il gas; rapido non implica isobaro; sommare pressioni spaziali non dà lo stato uniforme.', 'Diatermica permette calore; rigida riguarda il movimento; temperatura costante e permeabilità alla materia non seguono da Q=0.']
ASSUMPTIONS=['Liquido rimasto come sistema; vapore attraversa il confine; apporto termico possibile, non vincolo adiabatico.', '311 K iniziali, lettura finale 20°C, offset esatto 273,15; variazione finale meno iniziale, non modulo.', 'Temperatura di equilibrio come funzione di stato; confronto dello stesso stato finale, non di un qualunque processo.', 'Due blocchi con uguale T, isolati dal resto, senza reazioni, transizioni di fase o lavoro.', 'Lettura iniziale 26,85°C, rapporto 2 applicato a T assoluta; ritorno finale a lettura Celsius.', 'Forza normale media complessiva su area positiva, gas nel modello di pressione macroscopica.', 'Gas uniforme diviso idealmente in volumi uguali, stesso stato intensivo e stessa composizione.', 'Due cali successivi 4 K e 6 K, lettura iniziale 35°C; nessuna durata attribuita agli stati.', 'Campione descritto a pressione macroscopica uniforme solo dopo smorzamento dei transitori ed equilibrio.', 'Vincolo adiabatico sulla parete mobile: Q attraverso la parete nullo, lavoro non escluso.']
PEDAGOGY=['Scelta esplicita del sistema prima della classificazione.', 'Due scale di lettura, una sola differenza con segno.', 'Funzione di stato distinta dal percorso e dai trasferimenti.', 'Equilibrio termico distinto da energia interna e moto microscopico.', 'Rapporto Kelvin prima dell’offset finale; scelte lessicali esatte.', 'Unità SI e componente normale della forza.', 'Classificazione estensiva/intensiva con alternativa unica verificata.', 'Accumulo di intervalli, senza confonderli con temperature assolute.', 'Una grandezza d’equilibrio non è una media arbitraria di transitori.', 'Calore, lavoro e materia sono vincoli indipendenti del confine.']
EXPECTED_IDS={'C3-Q007', 'C3-Q005', 'C3-Q002', 'C3-Q006', 'C3-Q003', 'C3-Q004', 'C3-Q010', 'C3-Q001', 'C3-Q008', 'C3-Q009'}
REVIEWED_CANDIDATES={'C3-Q001': 'cf940f42c935399820666028585fccddc1b0f53cd502eee4f385733edb71cbf2', 'C3-Q002': '2d3f6236dbefd43c992d7e7b52fdffb518da390ab6c5a0aaecdefddf488aae61', 'C3-Q003': '43637b26ca66cb42f9d9e0b894c1e1af1ac60e91cb3be7731c29b26748ae0629', 'C3-Q004': '2e17edb6fd8193be3a6077d9242d51c85da4e44f66467734dcf3466de0bd3d52', 'C3-Q005': 'ccbe9155697f38548dacd189b14ab8c67daa8d5c16e6831e6ca891eb588a88a0', 'C3-Q006': 'f205bb81eba0aa71f65e4cf5e903f1e20f6124a5256af40296a996556e8c2169', 'C3-Q007': 'bb987fbacc1c1abe285027779b0bf8baca579b69338c3c3d14addbf734346e80', 'C3-Q008': '7126193e9ab6b2d16957e516f6a1dca139c2f3eaa78ebe14f2399f2f5fe73008', 'C3-Q009': 'ced53389919205748e25efcc0ef137391d6bd56935e377a7e0a2b4d5ac3e7af5', 'C3-Q010': '10520167530fb33b5ef0d8b6d03f6950754069ac4fc54728aacc7921446e5f3c'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(215, 1), Fraction(320, 1), Fraction(150, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1)), (Fraction(140, 1), Fraction(735, 1), Fraction(300, 1), Fraction(45, 1)), (Fraction(145, 1), Fraction(205, 1), Fraction(330, 1), Fraction(170, 1)), (Fraction(140, 1), Fraction(650, 1), Fraction(150, 1), Fraction(45, 1))}
REQUIRED_PATHS={'M180 1120L330 1168L480 1240', 'M320 453V400', 'M130 1360V1080M130 1360H530', 'M130 200V390H490V200', 'M0 0L8 4L0 8Z', 'M140 835V620M140 835H510', 'M320 240V125'}
REQUIRED_CIRCLES={(Fraction(480, 1), Fraction(1240, 1), Fraction(6, 1)), (Fraction(180, 1), Fraction(1120, 1), Fraction(6, 1)), (Fraction(330, 1), Fraction(1168, 1), Fraction(6, 1))}
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1. Scegliere il confine', 'Sistema: il liquido rimasto nella pentola', 'vapore in uscita', 'calore entrante', 'La materia attraversa il confine: sistema aperto.', '2. Raddoppiare i kelvin', 'Origine delle barre: 0 K', '300 K → 26,85 °C', '600 K → 326,85 °C', '0', '300', '600', 'T (K)', 'Il rapporto riguarda le temperature assolute.', '3. Sommare due cali', 'Stati successivi, senza durate assegnate', 't (°C)', '35 °C', '31 °C', '25 °C', '0', '1', '2', 'indice dello stato', '−4 K', '−6 K')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Confini del sistema e letture di temperatura'), ('desc', 'Tre pannelli: vapore che lascia il liquido, barre a trecento e seicento kelvin con origine comune, tre stati di raffreddamento da trentacinque a trentuno e venticinque gradi Celsius.'))
GEOMETRY_REVIEW='XML e nuovo PNG indipendente 640×1480 letti per intero. Il vapore attraversa il confine del liquido; il calore è un possibile apporto dal fornello. Barre Kelvin da origine x 140,lunghezze 150/300 per 300/600 K,scala comune 1/2 coordinata/K. Ultimo pannello: stati 0/1/2 a x 180/330/480,non tempi; ordinate 1120/1168/1240 con scala 12 coordinate/K e letture 35/31/25°C,calo 48/72 per 4/6 K. Il tratto visibile dell’asse Celsius è troncato,senza etichetta 0: non viene assunto zero Celsius all’incrocio degli assi. Nessun contatto o taglio residuo. Asset byte-identico tra cf 9 d 08 ac e finale 119 fd 8 a 8; la ricevuta di rendering mantiene il suo riferimento originale,non viene ritaggata.'
DECIMAL_REGRESSION_NUMBER=5
EXPECTED_CONTEXT={'C3-Q001': {'id': 'C3-Q001', 'kind': 'question', 'course': 'C3', 'order': 1, 'skill': 'C3-L01', 'family': 'il-confine-della-pentola', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q002': {'id': 'C3-Q002', 'kind': 'question', 'course': 'C3', 'order': 2, 'skill': 'C3-L01', 'family': 'cronologia-di-un-raffreddamento', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q003': {'id': 'C3-Q003', 'kind': 'question', 'course': 'C3', 'order': 3, 'skill': 'C3-L01', 'family': 'lettura-senza-memoria', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q004': {'id': 'C3-Q004', 'kind': 'question', 'course': 'C3', 'order': 4, 'skill': 'C3-L01', 'family': 'due-termometri-e-zero-scambio-netto', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q005': {'id': 'C3-Q005', 'kind': 'question', 'course': 'C3', 'order': 5, 'skill': 'C3-L01', 'family': 'raddoppiare-la-temperatura-assoluta', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q006': {'id': 'C3-Q006', 'kind': 'question', 'course': 'C3', 'order': 6, 'skill': 'C3-L01', 'family': 'dal-micro-al-macro', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q007': {'id': 'C3-Q007', 'kind': 'question', 'course': 'C3', 'order': 7, 'skill': 'C3-L01', 'family': 'separare-due-campioni-uguali', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q008': {'id': 'C3-Q008', 'kind': 'question', 'course': 'C3', 'order': 8, 'skill': 'C3-L01', 'family': 'caduta-cumulativa-in-due-soste', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q009': {'id': 'C3-Q009', 'kind': 'question', 'course': 'C3', 'order': 9, 'skill': 'C3-L01', 'family': 'stato-del-gas-dopo-lo-scossone', 'difficulty': 2, 'prerequisites': [], 'exam': None, 'version': 1}, 'C3-Q010': {'id': 'C3-Q010', 'kind': 'question', 'course': 'C3', 'order': 10, 'skill': 'C3-L01', 'family': 'parete-che-isola-dal-calore', 'difficulty': 1, 'prerequisites': [], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()

def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def source_only_predictions():
 q=sp.Rational;R=q(4157,500)
 return {
 'C3-Q001':'sistema aperto, massa ed energia possono attraversare il confine',
 'C3-Q002':q(20)+q(27315,100)-311,
 'C3-Q003':'stato',
 'C3-Q004':'nessun flusso termico netto fra blocchi alla stessa temperatura; non uguaglianza di U',
 'C3-Q005':2*(q(2685,100)+q(27315,100))-q(27315,100),
 'C3-Q006':'pressione',
 'C3-Q007':'grandezza estensiva, per esempio n o massa; non unica senza opzioni',
 'C3-Q008':35-4-6,
 'C3-Q009':'attendere equilibrio meccanico, senza gradienti di pressione macroscopici',
 'C3-Q010':'adiabatica',
 'C3-Q011':100*(1-q(120,160)),
 'C3-Q012':'stesso numero di moli e di particelle, non massa necessariamente',
 'C3-Q013':q(180,100)*q(315,270),
 'C3-Q014':'pressione assoluta',
 'C3-Q015':q(100)*q(620,100)/(q(250,1000)*R),
 'C3-Q016':'densità alta o vicinanza alla condensazione richiedono cautela',
 'C3-Q017':90*q(2,3)*q(360,270),
 'C3-Q018':'R',
 'C3-Q019':'volume V ha pendenza doppia rispetto a volume 2V',
 'C3-Q020':q(100000)*q(280,10000)/(R*300),
 'C3-Q021':q(540)/(q(200,1000)*6),
 'C3-Q022':'capacità termica totale minore in A',
 'C3-Q023':'calore specifico',
 'C3-Q024':75*(32-48),
 'C3-Q025':q(300)*(30-20)/(70-30),
 'C3-Q026':'temperatura finale reale più bassa rispetto a ignorare recipiente freddo',
 'C3-Q027':R*15,
 'C3-Q028':'volume, e assenza di altri lavori nel riscaldamento isocoro',
 'C3-Q029':'temperatura finale deve stare fra 15 e45 Celsius',
 'C3-Q030':500-80*5,
 'C3-Q031':q(452,10)/q(2260)*1000,
 'C3-Q032':'aumentano frazione liquida ed energia interna durante fusione',
 'C3-Q033':'condensazione',
 'C3-Q034':q(40,1000)*334000/80,
 'C3-Q035':'evaporazione superficiale',
 'C3-Q036':q(60*150)/(q(30,1000)*1000),
 'C3-Q037':'solidificazione',
 'C3-Q038':100*q(120-45,120),
 'C3-Q039':'calore latente di condensazione oltre al raffreddamento liquido',
 'C3-Q040':(100*q(418,100)*20-10*334)/(110*q(418,100)),
 'C3-Q041':'convezione forzata',
 'C3-Q042':q(40,1000)*q(75,100)*20/12*100,
 'C3-Q043':'irraggiamento',
 'C3-Q044':9*q(2,2),
 'C3-Q045':'manico metallico a conducibilità maggiore',
 'C3-Q046':q(450,300)**4,
 'C3-Q047':'stazionario, non equilibrio necessariamente',
 'C3-Q048':'convezione naturale per instabilità di densità se superata la soglia',
 'C3-Q049':q(18)*q(20,1000)/(q(40,100)*15),
 'C3-Q050':'emissione e assorbimento non nulli, bilancio netto zero'}
def dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [
 u(q(540),'joule')/(u(q(1,5),'kilogram')*u(6,'kelvin')),
 u(q(620),'joule')/(u(q(1,4),'mole')*u(q(4157,500),'joule/mole/kelvin')),
 u(100000,'pascal')*u(q(7,250),'kilogram/mole')/(u(q(4157,500),'joule/mole/kelvin')*u(300,'kelvin')),
 u(1,'mole')*u(q(4157,500),'joule/mole/kelvin')*u(15,'kelvin'),
 u(q(45200),'joule')/u(2260000,'joule/kilogram'),
 u(q(1,25),'kilogram')*u(334000,'joule/kilogram')/u(80,'watt'),
 u(q(1,25),'watt/meter/kelvin')*u(q(3,4),'meter**2')*u(20,'kelvin')/u(12,'watt'),
 u(18,'watt')*u(q(1,50),'meter')/(u(q(2,5),'meter**2')*u(15,'kelvin'))]
def main():
 q=sp.Rational;values=source_only_predictions();assert len(values)==50
 expected={2:q(-357,20),5:q(6537,20),8:25,11:25,13:q(21,10),15:q(1240000,4157),17:80,20:q(14000,12471),21:450,24:-1200,25:75,27:q(12471,100),30:100,31:20,34:167,36:300,38:q(125,2),40:q(25100,2299),42:5,44:9,46:q(81,16),49:q(3,50)}
 for n,wanted in expected.items():assert sp.simplify(values[f'C3-Q{n:03}']-wanted)==0,(n,values[f'C3-Q{n:03}'],wanted)
 units=['joule/kilogram/kelvin','kelvin','kilogram/meter**3','joule','kilogram','second','meter','watt/meter/kelvin'];wanted=[Fraction(450),Fraction(1240000,4157),Fraction(14000,12471),Fraction(12471,100),Fraction(1,50),Fraction(167),Fraction(1,20),Fraction(3,50)]
 for quantity,unit,value in zip(dimensional_crosschecks(),units,wanted):assert quantity.to(unit).magnitude==value
 assert 100*q(418,100)*20>10*334 and 0<values['C3-Q040']<20
 assert values['C3-Q015']>0 and values['C3-Q020']>0
 print('SOURCE_ONLY_PRIMARY_MODELS 50 individual predictions;22 exact numeric checks;8 dimensional crosschecks; ice branch and positive absolute states checked; no candidate keys opened',flush=True)
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
    for suffix,dimension in [(' °C','temperature'),(' K','temperature'),('','dimensionless')]:
        if suffix and not option.endswith(suffix):continue
        raw=option[:-len(suffix)] if suffix else option
        try:value=parse_literal(raw)
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError):continue
        if dimension=='temperature':
            if number==2:return 'temperature interval',value
            return 'absolute temperature',value+sp.Rational(27315,100) if suffix==' °C' else value
        return dimension,value
    return None
@lru_cache(maxsize=1)
def oracle():
    v=source_only_predictions();d=dimensional_crosschecks()
    assert v['C3-Q002']==sp.Rational(-357,20)
    assert v['C3-Q005']==sp.Rational(6537,20)
    assert v['C3-Q008']==25
    assert d[0].to('joule/kilogram/kelvin').magnitude==450
    assert d[1].to('kelvin').magnitude==Fraction(1240000,4157)
    return ['Sistema aperto',v['C3-Q002'],'stato','Non c’è trasferimento netto di calore dovuto a una differenza di temperatura',v['C3-Q005'],'La pressione','La massa',v['C3-Q008'],'Attendere che i transitori si smorzino e il gas raggiunga l’equilibrio','Adiabatica']
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
    if root.get('viewBox')!='0 0 640 1480':raise ValueError('Independent physical scale viewport changed')
    if {e.get('points') for e in root.iter() if e.tag.endswith('polygon')}!=REQUIRED_POLYGONS:raise ValueError('Independent physical scale prism geometry changed')
    accessible=tuple((e.tag.rsplit('}',1)[-1],e.text or '') for e in root.iter() if e.tag.rsplit('}',1)[-1] in ('title','desc'))
    if accessible!=REQUIRED_ACCESSIBLE_TEXTS:raise ValueError('Independent physical scale or reviewed SVG quantity labels changed in accessible title/desc')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c3-001-050-independent-models.py"
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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c3_l01_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_source_prompt_only_pressure_density_mass_conservation_and_distinct_concepts",
            "Pint_pressure_density_mass_volume_dimensions_and_exact_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c3-001-050-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"030d4658b17ea6f6fd43be03cb59b21e91030eb0"},"modelFunctionBodies":"All functions in the frozen source-only C3 model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c3-001-050-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("C3.json","C1.json")
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
