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
CANDIDATE_REF='45d53cc0c2443e2aedc5cba3bf163d4dcb7997a8'
PRIMARY_SHA256='34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C3.json', 'sourceSha256': '44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0', 'primarySkill': 'C3-L04', 'title': 'Quando la temperatura si ferma', 'actualLessonPrerequisites': ['C3-L03']}
FAMILY='cric-c3-l04'
BATCH='cric-c3-l04'
ASSET_NAME='cric-c3-l04-progressive.svg'
REVIEWED_PACKAGE_SHA256='58107c9a38eaacde77a9bcad5b2a32c959bb7abe4bb346b1570cb876c58d2f29'
REVIEWED_BINDINGS_SHA256='11f630567f3355f317a56bc30a4308642cad0ca084ec4afda22a5eee9d623d14'
SOURCE_REFERENCE='Dieci problemi distinti Cric C3 letti integralmente dopo primaria e modelli propri congelati; interpretazione di letture Celsius e intervalli termici distinta per ID.'
FALSE_PROOF='Durante la fusione a temperatura costante il calore assorbito è sempre zero, perché ΔT=0.'
SVG_MUTATION=(b'width="418" height="45"', b'width="419" height="45"')
SVG_LABEL_MUTATION=(b'centosessantasette', b'centosessantotto')
EXPECTED_MAPPING={1: ('C3-L04', ['C3-L03']), 2: ('C3-L04', ['C3-L03']), 3: ('C3-L04', ['C3-L03']), 4: ('C3-L04', ['C3-L03']), 5: ('C3-L04', ['C3-L03']), 6: ('C3-L04', ['C3-L03']), 7: ('C3-L04', ['C3-L03']), 8: ('C3-L04', ['C3-L03']), 9: ('C3-L04', ['C3-L03']), 10: ('C3-L04', ['C3-L03'])}
NUMERIC_UNITS={1: 'g', 4: 's', 6: 'kJ/kg'}
OPTION_SUFFIX={8: '%', 10: ' °C'}
UNITS={1: 'gram', 2: 'dimensionless', 3: 'dimensionless', 4: 'second', 5: 'dimensionless', 6: 'kilojoule/kilogram', 7: 'dimensionless', 8: 'dimensionless', 9: 'joule', 10: 'degC'}
MANUAL=['La massa evaporata è m=Q/L. 45,2 kJ/(2260 kJ/kg)=1/50 kg=20 g. Il campione è già al punto di ebollizione e non si aggiunge un tratto di riscaldamento sensibile.', 'Aumenta la frazione di fase liquida mentre il solido fonde. L’energia interna cresce nel passaggio assorbente a temperatura costante; non aumenta necessariamente l’energia cinetica media associata alla temperatura.', 'È condensazione. Il vapore passa a liquido cedendo energia latente all’ambiente, a differenza dell’evaporazione.', 'Per ghiaccio a 0 °C basta il calore latente: Q=(1/25 kg)(334000 J/kg)=13360 J. Alla potenza effettiva 80 J/s, t=13360/80=167 s. Nessuna perdita ulteriore viene sottratta a una potenza già netta.', 'È compatibile l’evaporazione dalla superficie a temperatura inferiore all’ebollizione. Non occorre che tutta l’acqua raggiunga il punto di ebollizione per diminuire la massa liquida.', 'Nel plateau la potenza netta va alla fusione: Q=60·150=9000 J. L=9000/(3/100 kg)=300000 J/kg=300 kJ/kg. Il termine sensibile è assente durante il plateau ideale.', 'È solidificazione, o congelamento per l’acqua. La cessione di calore latente è compatibile con temperatura costante finché coesistono le fasi nel modello a pressione fissa.', 'Si fondono 120−45=75 g. La frazione iniziale trasformata è 75/120=5/8, cioè 62,5%; non si divide per la massa solida finale.', 'Per il vapore compare anche la cessione del calore latente di condensazione mL_v a 100 °C. Dopo la condensazione, il raffreddamento dell’acqua da 100 a 40 °C è lo stesso contributo sensibile che avrebbe la massa inizialmente liquida.', 'L’acqua può cedere fino a 100·4,18·20=8360 J arrivando a 0 °C; fondere il ghiaccio richiede 10·334=3340 J, quindi tutto il ghiaccio fonde. Restano 5020 J che scaldano 110 g di acqua: θ_f=5020/(110·4,18)=25100/2299 °C. È positiva e minore di 20 °C; nessuna temperatura negativa è compatibile col ramo interamente liquido.']
DISTRACTORS=['0,020 g non converte kg→g; 20000 g omette MJ→kJ; QL ha unità diverse da una massa.', 'Nel plateau T non aumenta,massa totale chiusa non cresce,frazione solida cala; potenza non è imposta crescente.', 'Fusione parte dal solido,solidificazione termina nel solido,vaporizzazione opposta,sublimazione senza fase liquida.', '13,36 copia coefficiente Q in kJ; omissione g→kg porta durata 1000 volte maggiore; scaldare il liquido dopo è un processo aggiuntivo.', 'Evaporazione superficiale non richiede bolle; condensazione da sola aggiunge liquido; perdita volume non prova solidificazione.', '9000 J è Q totale; 300 J/g e 300 kJ/kg sono equivalenti,non due diversi calori latenti.', 'Fusione inversa assorbe calore; condensazione parte dal vapore; evaporazione e sublimazione terminano nel vapore.', '37,5% è residuo; 75 copia massa fusa in g; 100% ignora residuo; 5/8% perde 100 rispetto a 5/8 come frazione.', 'Fasi diverse hanno energie diverse pur a ugualeT; nessun ghiaccio né getto con K assegnata; condensazione è contributo aggiuntivo.', '0°C richiederebbe residuo solido escluso da 8360>3340; 20°C ignora fusione; quoziente raddoppiato non bilancia; negativo non compatibile col ramo liquido.']
ASSUMPTIONS=['Liquido già alla temperatura di ebollizione; Q 45,2 kJ soltanto vaporizzazione,L 2,26 MJ/kg.', 'Campione puro chiuso a pressione costante,solido e liquido coesistenti al punto di fusione,energia assorbita.', 'Vapore che diventa gocce liquide; non un passaggio al solido.', 'Ghiaccio 40 g già a 0°C,pressione atmosferica,L 334 kJ/kg,potenza netta 80 W costante senza altri scambi.', 'Goccia su piastra 22°C,aria che può ricevere vapore; si chiede un meccanismo compatibile senza ebollizione.', '30 g interamente fusi in 150 s,Pnetta 60 W,plateau a pressione fissa.', 'Passaggio liquido→solido con cessione di calore latente a pressione costante.', 'Campione chiuso 120 g inizialmente solido,residuo solido 45 g,percentuale riferita alla massa iniziale.', 'Masse uguali di vapore saturo e liquido a 100°C,stesso finale liquido 40°C epressione atmosferica.', 'Acqua 100 g 20°C,ghiaccio 10 g 0°C,isolamento,recipiente trascurabile,L 334 J/g,c 4,18 J/(gK),ramo interamente fuso verificato.']
PEDAGOGY=['Massa trasformata e prefissi energetici coerenti.', 'Temperatura separata dalla frazione di fase.', 'Nome del passaggio con verso fissato.', 'Energia latente prima del rapporto con la potenza netta.', 'Fenomeno compatibile distinto da inferenza obbligata.', 'Energia del plateau divisa per la massa effettivamente fusa.', 'Segno del calore nel cambiamento di fase.', 'Percentuale dal residuo e denominatore iniziale.', 'Bilancio a tratti con contributo comune esplicitato.', 'Controllo del ramo prima della temperatura, risultato frazionario esatto.']
EXPECTED_IDS={'C3-Q039', 'C3-Q037', 'C3-Q036', 'C3-Q038', 'C3-Q033', 'C3-Q032', 'C3-Q035', 'C3-Q034', 'C3-Q031', 'C3-Q040'}
REVIEWED_CANDIDATES={'C3-Q031': '48799ed3b6cd333543cbb2b07ad2dc09949f8ff2288d617baaa4b0973fee448b', 'C3-Q032': 'dc5f9b45ef6649438311c8a207588a925e03e468de5aafca51fe8ea0e8545b5a', 'C3-Q033': '360ef1a5b6fda671ce5eb7d8254a370e8fba0ff2961249139cf34f4aae8014b4', 'C3-Q034': '05db4b1ea4ea5dddd78a7476abc6e5f8855ea694e5f02b952d102fca0fbba160', 'C3-Q035': '865ad7660d34ada8859787cae955154a8fd7a564ed934c745fe857ee75335735', 'C3-Q036': '6255b07dae14d4613419fc8457393a40ed6cdabafc15a658fd5d113cf6115b77', 'C3-Q037': 'e959a7462cdc88da706dff11cbd6f40420f54ea64f713240ae4f982f831714e6', 'C3-Q038': 'c5fbc10eb92d3e274560d2ea41cca3d84c476a2003a70d7fcdcd38c523e44ff6', 'C3-Q039': '6fbf1a7571e7c1ff634d9675ab026a096923669501a15011cbc3195efc7771f5', 'C3-Q040': 'c894f4b3385214652e60c7a12181f2c705f9f7a5dc7ff37321a9954d92837a1d'}
REQUIRED_RECTS={(Fraction(140, 1), Fraction(1255, 1), Fraction(167, 1), Fraction(45, 1)), (Fraction(307, 1), Fraction(1255, 1), Fraction(251, 1), Fraction(45, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1500, 1)), (Fraction(140, 1), Fraction(1135, 1), Fraction(418, 1), Fraction(45, 1))}
REQUIRED_PATHS={'M140 1400V1100M140 1400H575', 'M130 280H260', 'M150 390L260 280H420L510 170', 'M140 930V650M140 930H540', 'M474 662.8V930', 'M130 420V125M130 420H540', 'M140 930L474 662.8', 'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('1. Temperatura ferma, fase variabile', 'Campione puro a pressione costante', 'T', 'T fus', 'Q fornito', 'solido + liquido', 'solido', 'liquido', 'Nel plateau cresce la frazione liquida.', '2. Fondere con potenza costante', '40 g di ghiaccio a 0 °C; P netta = 80 W', 'E (J)', '13360 J', '0', '167', 't (s)', 'E = Pt', '3. Il ghiaccio fonde tutto?', '8360 J cedibili fino a 0 °C', '3340 J per fondere', '5020 J residui', '0', 'Energia (J)')
REQUIRED_ACCESSIBLE_TEXTS=(('title', 'Plateau, durata di fusione e controllo energetico'), ('desc', 'Un plateau solido-liquido; energia lineare nel tempo fino a centosessantasette secondi; energia cedibile ottomilatrecentosessanta joule ripartita in tremilatrecentoquaranta di fusione e cinquemilaventi residui.'))
GEOMETRY_REVIEW='XML e nuovo PNG indipendente 640×1500 letti per intero. Il primo pannello è qualitativo: plateau Tfus fra solido e liquido,in ascissa Q e non tempo. La retta di fase è limitata al punto t 167 s,E 13360 J: origine(140,930),punto(474,662.8),2 coordinate/s e 1/50 coordinata/J,dunqueE/t=80 W. Le barre finali 8360/3340/5020 J hanno lunghezze 418/167/251,scala comune 1/20 coordinata/J e 167+251=418. Nessun taglio o contatto residuo; stessa immagine valida soltanto per gli identici SVG prima/dopo followup testuale 34.'
DECIMAL_REGRESSION_NUMBER=8
EXPECTED_CONTEXT={'C3-Q031': {'id': 'C3-Q031', 'kind': 'question', 'course': 'C3', 'order': 31, 'skill': 'C3-L04', 'family': 'massa-evaporata-dal-bilancio-energetico', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q032': {'id': 'C3-Q032', 'kind': 'question', 'course': 'C3', 'order': 32, 'skill': 'C3-L04', 'family': 'la-struttura-del-plateau', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q033': {'id': 'C3-Q033', 'kind': 'question', 'course': 'C3', 'order': 33, 'skill': 'C3-L04', 'family': 'gocce-sul-vetro-freddo', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q034': {'id': 'C3-Q034', 'kind': 'question', 'course': 'C3', 'order': 34, 'skill': 'C3-L04', 'family': 'cronometrare-una-fusione', 'difficulty': 2, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q035': {'id': 'C3-Q035', 'kind': 'question', 'course': 'C3', 'order': 35, 'skill': 'C3-L04', 'family': 'evaporare-lontano-dallebollizione', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q036': {'id': 'C3-Q036', 'kind': 'question', 'course': 'C3', 'order': 36, 'skill': 'C3-L04', 'family': 'ricavare-l-dalla-durata-del-plateau', 'difficulty': 2, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q037': {'id': 'C3-Q037', 'kind': 'question', 'course': 'C3', 'order': 37, 'skill': 'C3-L04', 'family': 'dal-liquido-al-solido', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q038': {'id': 'C3-Q038', 'kind': 'question', 'course': 'C3', 'order': 38, 'skill': 'C3-L04', 'family': 'frazione-fusa-dal-residuo', 'difficulty': 1, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q039': {'id': 'C3-Q039', 'kind': 'question', 'course': 'C3', 'order': 39, 'skill': 'C3-L04', 'family': 'perche-il-vapore-cede-piu-energia', 'difficulty': 2, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}, 'C3-Q040': {'id': 'C3-Q040', 'kind': 'question', 'course': 'C3', 'order': 40, 'skill': 'C3-L04', 'family': 'bilancio-di-una-miscela-con-ghiaccio', 'difficulty': 3, 'prerequisites': ['C3-L03'], 'exam': None, 'version': 1}}
KNOWN_NUMERIC_EXPRESSIONS={}
REQUIRED_POLYGONS=set()
ORDINAL_OFFSET=30

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
    units=[(' W/(m·K)','thermal conductivity',sp.Integer(1)),(' J/(kg·K)','specific heat',sp.Integer(1)),(' kJ/kg','latent specific heat',sp.Integer(1000)),(' J/kg','latent specific heat',sp.Integer(1)),(' J/g','latent specific heat',sp.Integer(1000)),(' kg/m³','density',sp.Integer(1)),(' g/L','density',sp.Integer(1)),(' g/mL','density',sp.Integer(1000)),(' J/K','heat capacity',sp.Integer(1)),(' mJ','energy',sp.Rational(1,1000)),(' kJ','energy',sp.Integer(1000)),(' J','energy',sp.Integer(1)),(' kPa','pressure',sp.Integer(1000)),(' Pa','pressure',sp.Integer(1)),(' cm³','volume',sp.Rational(1,10**6)),(' mL','volume',sp.Rational(1,10**6)),(' L','volume',sp.Rational(1,1000)),(' kg','mass',sp.Integer(1)),(' g','mass',sp.Rational(1,1000)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),(' s','time',sp.Integer(1)),(' W','power',sp.Integer(1)),(' °C','absolute temperature',sp.Integer(1)),(' K','absolute temperature',sp.Integer(1)),('%','dimensionless',sp.Rational(1,100)),('','dimensionless',sp.Integer(1))]
    for suffix,dimension,scale in units:
        if suffix and not option.endswith(suffix):continue
        raw=option[:-len(suffix)] if suffix else option
        try:value=parse_literal(raw.strip())
        except (ValueError,TypeError,SyntaxError,ZeroDivisionError):continue
        if suffix==' °C':value+=sp.Rational(27315,100)
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    values=source_only_predictions();dimensions=dimensional_crosschecks()
    assert sp.simplify(values['C3-Q031']-sp.Rational('20'))==0
    assert sp.simplify(values['C3-Q034']-sp.Rational('167'))==0
    assert sp.simplify(values['C3-Q036']-sp.Rational('300'))==0
    assert sp.simplify(values['C3-Q038']-sp.Rational('125/2'))==0
    assert sp.simplify(values['C3-Q040']-sp.Rational('25100/2299'))==0
    assert dimensions[0].to('joule/kilogram/kelvin').magnitude==450
    assert dimensions[1].to('kelvin').magnitude==Fraction(1240000,4157)
    return [values['C3-Q031'],'La frazione di massa liquida','Condensazione',values['C3-Q034'],'Evaporazione dalla superficie',values['C3-Q036'],'Solidificazione',values['C3-Q038'],'Il calore latente di condensazione mL_v',values['C3-Q040']]
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
    if root.get('viewBox')!='0 0 640 1500':raise ValueError('Independent physical scale viewport changed')
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
        errors.extend(common);number=int(row["id"][-3:])-ORDINAL_OFFSET;source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c3_l04_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"][-3:])-ORDINAL_OFFSET in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"][-3:])-ORDINAL_OFFSET;wanted=oracle()[number-1]
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
