"""Independent source-first U5-03 phase-process review; no authoring imports."""
from fractions import Fraction
import ast,re
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-03.json'
FAMILY='warm-water-and-ice'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:"C3-L04" for n in range(1,17)}
def exact_literal(raw):
    """Bounded arithmetic AST for rational, pi and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=raw.replace('π','p')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\(|p)', '*',raw)
    if not re.fullmatch(r'[0-9rp()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Name) and node.id=='p':return sp.pi
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
        if isinstance(node,ast.Constant) and type(node.value) is float and len(str(node.value))<=16:
            return sp.Rational(str(node.value))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('unsupported arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('nonreal numeric result')
    return value


def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]


def increment(warm_mass,ice_mass):
    warm_mass,ice_mass=map(sp.sympify,(warm_mass,ice_mass))
    if warm_mass<=0 or ice_mass<=0 or 2*warm_mass<=3*ice_mass:raise ValueError('Positive masses and complete fusion branch required')
    return sp.cancel((200*warm_mass-300*ice_mass)/(4*(warm_mass+ice_mass)))
def warm_inverse(ice_mass,interval):
    ice_mass,interval=map(sp.sympify,(ice_mass,interval))
    if ice_mass<=0 or not 0<interval<50:raise ValueError('Positive ice mass and final below warm initial required')
    return sp.cancel(ice_mass*(300+4*interval)/(4*(50-interval)))
@lru_cache(maxsize=1)
def oracle():
    ma,mi,c,d,L,H,a,b=sp.symbols('ma mi c d L H a b',positive=True)
    eq=sp.Eq(c*ma*(H-d),mi*L+c*mi*d);law=sp.solve(eq,d)[0]
    unique([(c*ma*H-mi*L)/(c*(ma+mi)),ma*H/(ma+mi),(c*ma*H-mi*L)/(c*ma),(c*ma*H+mi*L)/(c*(ma+mi)),(c*mi*H-ma*L)/(c*(ma+mi))],law)
    inv=sp.solve(eq,ma)[0];unique([mi*(L+c*d)/(c*(H-d)),mi*L/(c*(H-d)),mi*(L+c*d)/(c*d),mi*c*(H-d)/(L+c*d),mi*(L-c*d)/(c*(H-d))],inv)
    rat=sp.cancel(law.subs({ma:a*ma,mi:b*mi})/law)
    unique([((200*a*ma-300*b*mi)*(ma+mi))/((a*ma+b*mi)*(200*ma-300*mi)),a/b,a*b,(200*a*ma-300*b*mi)/(200*ma-300*mi),a-b],rat.subs({c:4,H:50,L:300}))
    A,B=increment(4,1),increment(5,2);gain,offset=calibrate(A,B,51,sp.Rational(207,7));assert (A,B,gain,offset)==(25,sp.Rational(100,7),2,1)
    assert increment(sp.Rational(9,2),sp.Rational(3,2))==sp.Rational(75,4)
    assert (A+B)/2-sp.Rational(75,4)==sp.Rational(25,28)
    assert sp.cancel(law.subs({ma:4*mi,c:4,H:50,L:300}))==25
    assert warm_inverse(1,sp.Rational(325,9))==8
    Q=SI.Quantity;assert (Q(4,'g')*Q(4,'J/g/K')*Q(25,'K')).to('J').magnitude==(Q(1,'g')*(Q(300,'J/g')+Q(4,'J/g/K')*Q(25,'K'))).to('J').magnitude==400
    target=sp.Rational(4,7)*A;ice_b=sp.solve(sp.Eq(law.subs({ma:5,c:4,H:50,L:300}),target),mi)[0]
    return [A,'°C','Θ = [c_l m_a (50 K) − m_i L_f] / [c_l (m_a + m_i)]','Da 25 a 325/9 °C',warm_inverse(1,25),sp.solve(eq,mi)[0].subs({ma:4,c:4,H:50,d:25,L:300}),increment(4,2)/A,50-A,'m_a = m_i (L_f + c_l Θ) / [c_l (50 K − Θ)]','[(200 κ₁ m_a − 300 κ₂ m_i)(m_a + m_i)] / [(κ₁ m_a + κ₂ m_i)(200 m_a − 300 m_i)]',B/A,(A+B)/2,ice_b,warm_inverse(2,sp.Rational(300,7)/(75/A)),warm_inverse(1,(sp.Rational(659,9)-offset)/gain),'Infinite: ogni m_i>0 con m_a=4m_i']

MANUAL=['Il caldo cede 4·4(50−Θ) J, il ghiaccio riceve 300+4Θ J. 800−16Θ=300+4Θ dà Θ=25 K, lettura 25 °C; fusione completa perché 800>300 J.', 'Il risultato è una lettura in °C. L’incremento da 0 °C è in K con stesso numero, mentre il punto assoluto corrispondente è 298,15 K.', 'Raccogliendo Θ nel bilancio c_lm_a(50 K−Θ)=m_iL_f+c_lm_iΘ, il denominatore è c_l(m_a+m_i), la capacità di tutta l’acqua finale.', 'Con caldo 8 g e ghiaccio 1 g: residuo 1600−300=1300 J, capacità 36 J/K, lettura 325/9 °C fra 25 e 50.', 'A 25 °C il grammo di ghiaccio richiede 300+100=400 J; ogni grammo caldo cede 4·25=100 J. Servono 4 g.', 'Il caldo di 4 g cede 400 J; ogni grammo di ghiaccio richiede 400 J/g per fondere e arrivare a 25 °C. Massa ghiaccio 1 g.', 'B con 4 g caldi e 2 g di ghiaccio: (800−600)/24=25/3 K. Rapporto delle letture con A=25 è 1/3, entrambe nel ramo completo.', 'La proposta 50 °C supera il corretto 25 °C di 25 K. Alla proposta il caldo non cederebbe calore, impossibile per fondere una massa positiva.', 'm_a=m_i(L_f+c_lΘ)/[c_l(50 K−Θ)]. Il denominatore positivo richiede 0<Θ<50 K; la parentesi al numeratore è il fabbisogno per grammo ghiacciato.', 'Il rapporto è [(200κ₁m_a−300κ₂m_i)(m_a+m_i)]/[(κ₁m_a+κ₂m_i)(200m_a−300m_i)]. Si mantengono sia residui sia capacità finali; fattore comune lascia il rapporto 1.', 'A=25 °C; B=(1000−600)/28=100/7 °C. Rapporto (100/7)/25=4/7. I 1000 J disponibili superano i 600 latenti.', 'Media (25+100/7)/2=275/14 °C. Le masse medie 9/2 e 3/2 g danno 75/4 °C; scarto esatto fra le operazioni 25/28 K.', 'Bersaglio 100/7 K con caldo 5 g: cessione 5000/7 J; fabbisogno 2500/7 J/g. Ghiaccio B=2 g, rapporto con 1 g iniziale pari a 2.', 'A con Θ=25 K e S=75 dà q=3 K⁻¹. S_B=300/7 dà Θ_B=100/7 K; ghiaccio 2 g richiede 5000/7 J, ogni grammo caldo cede 1000/7 J: caldo B=5 g.', 'Differenze dei riferimenti: ΔS=150/7 su ΔΘ=75/7 K, quindi q=2 K⁻¹, b=1. S_C=659/9 dà Θ_C=325/9 K. Il grammo ghiacciato chiede 4000/9 J, ogni grammo caldo cede 500/9 J: 8 g.', 'Sostituire m_a=4m_i dà Θ=(800−300)/(4·5)=25 K per ogni m_i>0. Fusione completa 8m_i>3m_i. Infinite coppie, non soltanto 4 g e 1 g.']

DISTRACTORS=['Media aritmetica semplice delle temperature perde massa e calore latente; 50 °C non cede calore, zero ignora residuo positivo.', 'J, g, J/g e W sono grandezze diverse da una lettura termica.', 'Il denominatore include entrambe le masse finali; segno più farebbe della fusione una sorgente.', '50 °C è raddoppio ingiustificato; 25/2 °C va nel verso opposto, 100 °C supera le temperature iniziali.', '3 g coprono solo fusione a 25 K di raffreddamento; 1 g non garantisce fusione completa.', '4/3 g omettono il riscaldamento dell’acqua fusa; 4 g copiano il caldo e violano il ramo.', '1/2 segue solo massa ghiaccio, 3 è reciproco, 2 ha verso sbagliato, 1 ignora entrambi i costi.', '−25 K inverte sottrazione; 50 K copia la proposta, 2 è rapporto puro e non scarto.', 'Solo L_f omette il riscaldamento; c_lΘ al divisore scambia i due intervalli; reciproco non soddisfa il bilancio.', 'Residui da soli omettono capacità finali; prodotto e differenza non danno 1 per fattore comune.', '7/4 è reciproco; 5/4 segue solo caldo; 2 segue solo ghiaccio e 1/2 non è il rapporto completo.', '75/4 °C usa masse medie; 275/7 è somma e 75/14 metà differenza, 25 °C ignora B.', '4/7 è rapporto termico e 5/4 rapporto del caldo; 1/2 inverte la massa ricostruita.', 'Il display grezzo non è Θ: q deve precedere l’inversa e la massa non si somma a una lettura.', '4 g danno S=51; 5 g danno 178/3; 9 g danno 76, mentre C richiede 659/9.', '4 g e 1 g sono un esempio; 25 g copia una lettura, zero viola positività e rende indefinito il rapporto.']

ASSUMPTIONS=['Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.']

UNITS={1: 'K', 2: 'K', 3: 'K', 4: 'K', 5: 'g', 6: 'g', 7: '', 8: 'K', 9: 'g', 10: '', 11: '', 12: 'K', 13: '', 14: 'g', 15: 'g', 16: ''}

NUMERIC_UNITS={1: '°C', 5: 'g', 6: 'g', 13: '1', 14: 'g'}

SUFFIX={8: ' K', 12: ' °C', 15: ' g'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='SVG completo letto in XML e rendering nativo a piena altezza. Freccia unica e con punta dal caldo al ghiaccio, dichiarata schematica; nessuna lunghezza-massa inventata nei riquadri. Disponibilità 800 J al limite 0 °C distinta dai 400 J effettivamente ceduti alla finale 25 °C. Barre 320 e 240+80 rappresentano 400=300+100 J a scala comune 4/5. Incrementi 25/100/7/275/14 K con larghezze 175/100/137,5 a scala 7 coordinate/K.'

NON_NUMERIC_DISTRACTORS={}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u5-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C3' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='e6e35298f6e3e5d5f3a1be75924e523eb77fee8c'

SOURCE_READING='Primaria indipendente di tutti gli 80 prompt U5-03, prima di candidati, opzioni o chiavi: SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Fonte intera pin 5cf, SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Dopo la primaria, tutti i 16 candidati del lotto letti integralmente, ogni blocco, formula, opzione, hint e feedback, metadati e didascalie. Derivazioni ricontrollate sui dati finali; SVG XML e rendering nativo integrali letti. Catalogo reale C3-L01/L03/L04 verificato. Nessun authoring importato; autore e revisore distinti. ROOT identico ai byte finali B 9d647bca e, per 17309, 5579fe21. Successiva rilettura distinta dei record 01, 03, 09 sul commit e6e35298f6e3e5d5f3a1be75924e523eb77fee8c: letti integralmente nuovi record e diff contro la primaria ea13 e la precedente review80. Leggi, dati, domini, risposte e SVG invariati; nessun finding matematico. Il solo aggiornamento è delle definizioni/passaggi brevi in17601/03/09 o del titolo in17711. Nota e snapshot storica in thermal-mobile-176-177-independent-reread-20261125. Non si ritaggano vecchi report: esecuzione automatica locale e nuovo replay UI NOT_RUN; nuovi report da rigenerare esclusivamente mediante veri verifier sul runner remoto.'

REVIEWED_PACKAGE_SHA256='5d01c047a2a1a434752a2ae4fd9b187718132ee6f0cecaf96ad7f7dc8df68b88'

REVIEWED_BINDINGS_SHA256='6b6ad05a0a4c8f6f9e3f2ee87c77a00771c19a955931ad9c09b156c74bcadcaa'

REVIEWED_CANDIDATES={'AR-u5-warm-water-and-ice-01': 'e24c7dc4b592d33937b92a5f3a0dd36a4300cfea872060c5ccde7c6c12f5ad5c', 'AR-u5-warm-water-and-ice-02': '921b2db8e8507378a35bc34b57ff30e067243e3f5bac3b979e22e374da3ff819', 'AR-u5-warm-water-and-ice-03': '6c6b32eae3944dd7e435a62f5fe9ed859632ace2bd589a396feebea47db6a498', 'AR-u5-warm-water-and-ice-04': '23e8c0f5a1d018d4e13256c80b9b541deaa64a7486662df8fc1c07cfa4f71660', 'AR-u5-warm-water-and-ice-05': '7c944272f641986eeae6fe1455f3c0fd64c03fc2f4c05842be2e6f718033fab2', 'AR-u5-warm-water-and-ice-06': 'fa5306d784df13d9d78e0c4557dd572f8cb7338176bfb468108bd1ea8e5e7189', 'AR-u5-warm-water-and-ice-07': '1bea894ebca488e95724236655ec929d7340a26f6f353ae86c6783dc2b689247', 'AR-u5-warm-water-and-ice-08': 'efa16ee9d790ac9e73dc1b18213af120d28dae84678f735f91a12a0ec9c57ff0', 'AR-u5-warm-water-and-ice-09': '3bb9af79c4a0c55e9c2e21077a75cd92ac90a007d150ceefb0aa50fbb0306f72', 'AR-u5-warm-water-and-ice-10': '0935102969daa57cd2dea1dc42662fd8d4fa611611aaf334229b17339643f6ea', 'AR-u5-warm-water-and-ice-11': '6c866750756056b2f81af07c4aa2cf94b1b66d8ba274a977a148e3ed2668a4dd', 'AR-u5-warm-water-and-ice-12': 'dcdf61d4aa7e918bcf274b22752387885833d4ab277c0cd9cc52026793dddfde', 'AR-u5-warm-water-and-ice-13': 'd0da687515875108cc15a485bda832a3994d32dceeda27d0ab5b9f5bf72b52b7', 'AR-u5-warm-water-and-ice-14': '84db354f7290c59e34aa3b1b62bdaed5dfdd2226c1137d6fb874024a87a0de2a', 'AR-u5-warm-water-and-ice-15': '1c1aa2b03640c91dc60b4193a64369228cccac612a573ec321b775934b5c39ab', 'AR-u5-warm-water-and-ice-16': '0256e3dc1d91fc552e616c707b011cd855a19d8731bf79bb75fbc72362a8f726'}

READ_SOURCE_SHA256={'u5-warm-water-and-ice-01': '68fb763c5e1f05868262394c8ba202685781130441bc744927ef264e115e906b', 'u5-warm-water-and-ice-02': '53da214525a008459925404f699297c7e8f77c93d8d105d12eb5e61269564c7a', 'u5-warm-water-and-ice-03': 'bac7ba648790360e1782a250ecc303ae53759cc871221aa512af698cb63b1350', 'u5-warm-water-and-ice-04': 'dd6025630f7f293a8e315c2a94f3cabf4dcdede175ce6c2aa244df8f0b309ee7', 'u5-warm-water-and-ice-05': '2f831e254decf4617d7cdb5a584c22070d9621341bc15d5fb52d75e503c52491', 'u5-warm-water-and-ice-06': '65965c5cffcef570125b46be97f2d7be7bd83d1477481f8dbe7b5ca8c1ca178f', 'u5-warm-water-and-ice-07': '1beba96a61f719526818236a32a375161444eaace94bf333c3d0928923262d8f', 'u5-warm-water-and-ice-08': '4dd18223a94f0db4a734c08967d8c9ef78022e5fdd997becd3033a0d4acd850f', 'u5-warm-water-and-ice-09': 'fd73b8cbdbf267c53d5b556d69642da2ea4b76c8150e7bf02ab7f8431b10bf8b', 'u5-warm-water-and-ice-10': '9fc9c86f2ca950beefe96688c456141836f8c9d4de10c194ffc6205d397d2b43', 'u5-warm-water-and-ice-11': 'b33ab11c7edea4d83eaceb9316b715eeada6ac1dc2174683b34168941ae8d5e3', 'u5-warm-water-and-ice-12': '1959b0d1914875f93033924b332e5e4a3c7362394b16f0cb9504c619c2ccfd91', 'u5-warm-water-and-ice-13': '08dc252a1556bd99cd974e5ba6884c6b73777219416d116c1096f2785dfde2d3', 'u5-warm-water-and-ice-14': '82a6719726f16c4215a4be5455261ee6626815466f44e9bb2785dd1418caf250', 'u5-warm-water-and-ice-15': '8245da3e0a2a38e40a54a187bca9914af7b654fc03d76ecd6e19bdbdcd342061', 'u5-warm-water-and-ice-16': 'fe96699620277c0d554f3dfae11875739d36980bd8a6a98c8a64f3489c5f3adf'}
