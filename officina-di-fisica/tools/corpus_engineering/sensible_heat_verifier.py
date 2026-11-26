"""Independent U5-02 source-first thermodynamic review, no authoring imports."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-02.json'
FAMILY='sensible-heat'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C3-L03', 2: 'C3-L03', 3: 'C3-L01', 4: 'C3-L03', 5: 'C3-L03', 6: 'C3-L03', 7: 'C3-L03', 8: 'C3-L03', 9: 'C3-L03', 10: 'C3-L03', 11: 'C3-L03', 12: 'C3-L03', 13: 'C3-L03', 14: 'C3-L03', 15: 'C3-L03', 16: 'C3-L03'}
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

def sensible_heat(mass,increment,specific=sp.Integer(2)):
    if mass<=0 or increment<=0 or specific<=0:raise ValueError('Heating branch requires positive mass, increment and specific capacity')
    return sp.simplify(mass*specific*increment)

def mass_inverse(heat,increment,specific=sp.Integer(2)):
    if heat<=0 or increment<=0 or specific<=0:raise ValueError('Positive heat and nonzero capacity factors required')
    return sp.cancel(sp.sympify(heat)/(specific*increment))

def classify_boundary(matter_can_cross,heat_can_cross):
    if not matter_can_cross and heat_can_cross:return 'Chiuso e non isolato termicamente'
    if matter_can_cross:return 'Aperto'
    return 'Chiuso e adiabatico'

@lru_cache(maxsize=1)
def oracle():
    m,c,d,E,a,b,T,Ti,F=sp.symbols('m c d E a b T Ti F',positive=True)
    # Calorimetry is integrated with fixed mass and constant specific capacity.
    law=sp.simplify(sp.integrate(m*c,(T,Ti,Ti+d)))
    assert law==m*c*d
    inverse=sp.solve(sp.Eq(E,law),m)[0]
    interval=sp.solve(sp.Eq(E,law),d)[0]
    ratio=sp.cancel(law.subs({m:a*m,d:b*d})/law)
    unique([E/(c*d),E*c*d,c*d/E,E/d,E/(c*F)],inverse)
    unique([a*b,a/b,b/a,a+b,a*b*b],ratio)
    first=sensible_heat(sp.Integer(2),sp.Integer(10))
    second=sensible_heat(sp.Integer(4),sp.Integer(20))
    gain,offset=calibrate(first,second,81,321)
    assert (first,second,gain,offset)==(40,160,2,1)
    target=4*first;target_interval=interval.subs({E:target,m:4,c:2})
    assert target_interval==20
    assert (first+second)/2==100 and sensible_heat(sp.Integer(3),sp.Integer(15))==90
    u=sp.symbols('u',real=True)
    roots=sp.solve(sp.Eq(sp.Rational(2,5)*u**2,40),u)
    assert roots==[-10,10]
    physical=[v for v in roots if v>0 and sp.Rational(1,5)*v>0]
    assert physical==[10] and sp.Rational(1,5)*physical[0]==2
    # A closed boundary may allow heat exchange even when net Q happens to vanish.
    assert classify_boundary(False,True)=='Chiuso e non isolato termicamente'
    net_heat=7+(-7);assert net_heat==0
    Q=SI.Quantity
    assert Q(2,'J/g/K').to('J/kg/K').magnitude==2000
    assert (Q(2,'g')*Q(2,'J/g/K')*Q(10,'K')).to('J').magnitude==40
    assert (Q(40,'J')/(Q(2,'J/g/K')*Q(10,'K'))).to('g').magnitude==2
    assert (Q(40,'J')/Q(10,'K')).to('J/K').magnitude==4
    assert (Q(2,'J/g/K')*Q(sp.Rational(1,5),'g/K')).to('J/K**2').magnitude==sp.Rational(2,5)
    return [first,'J',classify_boundary(False,True),'Da 40 a 80 J',
      inverse.subs({E:first,c:2,d:10}),interval.subs({E:first,c:2,m:2}),
      sensible_heat(sp.Integer(2),sp.Integer(20))/first,80-first,
      'm = Q / (c ΔT)','κ₁ κ₂',second/first,(first+second)/2,target_interval/10,
      mass_inverse(480/(120/first),sp.Integer(20)),
      mass_inverse((161-offset)/gain,sp.Integer(10)),physical[0]]

MANUAL=['c 2 J/(g K), m 2 g, ΔT10 K. Q=2·2·10 J=40 J. La capacità totale èmc 4 J/K e non va confusa col calore specifico 2 J/(g K).', 'Q è calore trasferito e si esprime in J. Con le unità prescritte, g·J/(g K)·K=J; W richiederebbe dividere per una durata non assegnata.', 'Il confine include recipiente e sostanza: nessun flusso di materia, ma il calore può attraversarlo dal bagno esterno. Sistema chiuso, non isolato. Sigillato non significa adiabatico. Non è necessario assumere alcun lavoro per classificare il confine.', 'Con ΔT10 K costante, c 2, passare da 2 a 4 g porta Q da 40 a 80 J. Il doppio della massa richiede doppio calore per lo stesso incremento.', 'm=Q/(c ΔT)=40 J/[2 J/(g K)·10 K]=2 g. Il denominatore ha unità J/g e la divisione restituisce massa.', 'ΔT=Q/(mc)=40 J/[2 g·2 J/(g K)]=10 K. È un incremento, numericamente anche 10 °C di differenza; non si aggiunge 273, 15.', 'Con massa 2 g fissa, ΔT passa 10→20 K e Q40→80 J. Rapporto 2, puro, perchéc e massa si cancellano.', 'Proposta 80 J−corretto 40 J=+40 J. L’energia aggiuntiva proposta non è giustificata dai dati; il confronto resta fra calori, non temperature.', 'm=Q/(c ΔT). Con c assegnato, il calcolo numerico in grammi è Q[J]/(2ΔT[K]); la formula fisica conserva c e le sue unità. ΔT>0 rende il divisore positivo.', 'Q_B/Q_A=κ₁κ₂ per massa e incremento scalati indipendentemente a c costante. La legge è bilineare, non un rapporto delle due variazioni.', 'A2 g, 10 K→40 J. B4 g, 20 K→160 J. Rapporto 4, prodotto dei due raddoppi.', 'Media=(40+160)/2=100 J. Medie degli ingressi m 3 g, ΔT15 K danno Q90 J. La differenza 10 J nasce dalla correlazione dei due ingressi nel prodotto, non da un errore di unità.', 'Target Q_B4·40=160 J. Con m 4 g, c 2, ΔT_B=160/(4·2)=20 K; rapporto incrementi 20/10=2.', 'AQ40 J, S120⇒q 3 J⁻¹. SB480⇒QB160 J. ΔT_B20 K⇒m_B=160/(2·20)=4 g.', 'QA40 J, QB160 J. q=(321−81)/(160−40)=2 J⁻¹, b 1. SC161⇒QC80 J. ΔT_C=10 K⇒m C80/(2·10)=4 g.', 'Vincolo m=(1/5 g/K)ΔT. Q=(2/5 J/K²)(ΔT)²=40 J⇒(ΔT)²=100 K². Le radici algebriche±10 K sono alternative; soltanto+10 K rispetta ΔT>0 e m>0. m=2 g. Unicità sul ramo positivo.']
DISTRACTORS=['20 J omette uno dei due fattori 2; 80 J raddoppia un dato già incluso. La legge usa ΔT, non T_f. Il calore è un trasferimento, mentre l’energia interna è una funzione di stato.', 'J/K indica la capacità totale, J/(g·K) quella specifica, K l’incremento e W la potenza. La conversione è 2 J/(g·K)=2000 J/(kg·K), non 2 J/(kg·K).', 'Il passaggio di calore non rende aperto un sistema: serve un flusso di materia. Sigillato non significa isolato termicamente; adiabatico contraddirebbe la possibilità di calore. Un calore netto nullo non prova isolamento.', '40 J ignora la massa maggiore; 20 J rende inversa la dipendenza.160 J raddoppierebbe anche ΔT, qui fisso. Zero viola i tre dati positivi. Le capacità totali sono 4 e 8 J/K.', 'Quattro è il numero della capacità totale in J/K, non la massa in grammi. Il prodotto Qc ΔT avrebbe J²/g e non g; 2 g ricostruiscono 40 J.', '20 K omette la massa e 40 copia il numero dell’energia. Non si aggiunge 273, 15 a un incremento. La temperatura finale non è nota perché manca quella iniziale.', '1/2 è il reciproco; 4 introduce un quadrato; 1 ignora l’incremento; −2 non rappresenta il rapporto di due calori entranti positivi. Solo 2 segue la legge con mc costante.', '−40 J scambia l’ordine; 80 J copia la proposta; zero la accetta e 20 J dimezza ancora lo scarto. Il segno dello scarto non cambia la convenzione del calore assegnato.', 'Il prodotto ha J²/g e il reciproco g⁻¹. Q/ΔT dà una capacità in J/K. Q/(c T_f) ha unità giusta ma usa la temperatura finale invece dell’incremento. Le cinque formule sono confrontate come leggi generali.', 'I quozienti invertono una dipendenza diretta; la somma dà 2 per prove uguali e κ₁κ₂² aggiunge un quadrato. Le cinque alternative sono confrontate simbolicamente.', 'Due considera uno solo dei raddoppi; 160 è un’energia e non il rapporto; 1/4 è il reciproco. Il rapporto 4 deriva da 160/40.', '200 J somma senza dimezzare; 50 J divide due volte; 60 J è metà della differenza.90 J è il prodotto degli ingressi medi, diverso dalla media delle uscite.', 'Un fattore 4 su ΔT con massa doppia darebbe 8 volte Q_A; un fattore 1 soltanto il doppio. Il bersaglio quadruplo richiede fattore 2 sull’incremento.', 'Trattare S come joule darebbe 480/(c ΔT)=12 g.2 g restituirebbero S=240, non 480. Il guadagno 3 J⁻¹ va applicato prima dell’inversa.', '8 g restituiscono S=321 e 2 g restituiscono S=81.161/40 g omette l’offset e produce S=162.80 g copia il numero dell’energia 80 J e produce S=3201.4 g ricostruiscono S=161.', '−10 K rende negativi sia ΔT sia m; 100 è il numero del quadrato.5 K dà 10 J e 20 K dà 160 J sotto il vincolo. L’unica radice fisica è+10 K.']
ASSUMPTIONS=['Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Il sistema include recipiente sigillato e sostanza; bagno esterno. Il confine non permette materia ma consente energia come calore. Sistema chiuso e non isolato termicamente; la possibilità di scambio conta anche se un particolare Q netto fosse nullo. Il modello calorimetrico degli altri 15 record è separato.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.', 'Corpo omogeneo di massa m>0, calore specifico costante c=2 J/(g K)=2000 J/(kg K), riscaldamento ΔT>0 senza fase nuova e senza lavoro meccanico apprezzabile. Q=mc ΔT>0; capacità totale C=mc in J/K distinta da c specifico. Si usano grammi coerenti con c; gli incrementi Celsius e kelvin hanno stesso numero, senza aggiungere 273, 15 a una differenza. Il caso 03 è distinto e non richiede questa legge: il confine è dichiarato recipiente+sostanza e lascia passare calore ma non materia.']
UNITS={1: 'J', 2: 'J', 3: '', 4: 'J', 5: 'g', 6: 'K', 7: '', 8: 'J', 9: 'g', 10: '', 11: '', 12: 'J', 13: '', 14: 'g', 15: 'g', 16: 'K'}
NUMERIC_UNITS={1: 'J', 5: 'g', 6: 'K', 11: '1', 13: '1', 14: 'g'}
SUFFIX={8: ' J', 12: ' J', 15: ' g', 16: ' K'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti: freccia Q entrante schematica al corpo 2 g, c 2 J/(g K), capacità 4 J/K; caption 03 distingue questo corpo dal sistema recipiente+sostanza. Retta Q=4ΔT conorigine(110, 690), 15 px/K e 3 px/J; punti(260, 570), (410, 450) danno 10 K/40 J e 20 K/80 J. Barre finali da x 145, larghezze 80/320/200 px a 2 px/J per 40/160/100 J. Nessuna massa cambia nel processo; il vincolo 16 riguarda preparazioni diverse.'
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






CANDIDATE_REF='c7864e5afaf96e18ac24a3c530a3ff2137b0b795'
SOURCE_READING='Primaria80 U5-02 prima di candidati/chiavi/opzioni, SHA2568fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65. Fonte prompt soltanto e80 derivazioni individuali persistite. Nessuna chiave anticipata nei messaggi autore: soltantoSHA, file e ipotesi generali. Dopo la primaria, tutti16 candidati finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. SVG XML e rendering nativo completo riletti, leggi/domini e calcoli rifatti. Mapping sui reali corsi/lezioni Cric C3, senza inventareID. Package/binding/asset byte identici al pin finale e al ROOT integrato. Nessun authoring importato; reviewer diverso dall’autore.'
REVIEWED_PACKAGE_SHA256='e65479b882c69f4c78eae262bf5919055f6b780d97148e1abc862d9b9943d7b3'
REVIEWED_BINDINGS_SHA256='0938f28f403d0ec51655fe71356dbbe16a7d408a0cc5c6ff478e5459d4f1057b'
REVIEWED_CANDIDATES={'AR-u5-sensible-heat-01': '62c9272c065e34682c94c3c9256cf3cbdade499ad5382b96554a86aa48905905', 'AR-u5-sensible-heat-02': 'e5d6dd21e383ed6475f37936de629b2f77ec8103c98a2b960b15c78dd429a892', 'AR-u5-sensible-heat-03': '1a6780a69daf38e15004a16d59b68a628b367b4b72123301b40341430eb3ae11', 'AR-u5-sensible-heat-04': '29c25904204dd63c7a93641154b41d3b4cff4b161506f99b6d9bd3b4c1109b15', 'AR-u5-sensible-heat-05': '91bcfc891b6b2259be031413c7fbfe21c016866564d61810f8bff7a8f9326395', 'AR-u5-sensible-heat-06': '601d78f90e7dbd83aeddbb6df07a129cd73a7a6364a90fb9d6a4935c0fbdeb29', 'AR-u5-sensible-heat-07': 'bb373718a4c54cbc95845dc35a716ce71d132ea332ea2cba5adcb840f79ffb9b', 'AR-u5-sensible-heat-08': '256b1e58a0275c414b7f6aba9dd6e40aee8f37707d103d4e0906ea009ca58f0b', 'AR-u5-sensible-heat-09': '9df0950bf74740fec010ba4c059a91ed1c3d2d7bb0c113641502043a38ebd4c7', 'AR-u5-sensible-heat-10': '37c3c258ef6b5d552155e559c79a181962901702332415a901ca548ea5bcad39', 'AR-u5-sensible-heat-11': 'ab8215e1fb53e01d5ce43f149b8a86f1b7293c3a7ed464c0128962127f003022', 'AR-u5-sensible-heat-12': '35db1cf4ada19f33ccb7c0a68513583a7bddc08b407e98251e315b139d83cc87', 'AR-u5-sensible-heat-13': 'e19317b5b5a043378bb19136e6c409732c5276e7e1b2098ed055511da5c2640f', 'AR-u5-sensible-heat-14': 'b7bbe93234fda96ffdef651fb7f3daad061df37fb68c40f465f3190cb71e51ad', 'AR-u5-sensible-heat-15': 'd0074484f2bc0e42aa619f892d4445034ad657361cadc24693ca4c84f91e6cd3', 'AR-u5-sensible-heat-16': 'f3d3b92b4a3932842ca09b4f9e73f9e2d5de53d8d0a8796e3b6d7d3960253b14'}
READ_SOURCE_SHA256={'u5-sensible-heat-01': '6cdf541eaafc393995ac579d69694e77c8ac8a4b38a40ef44d67dab3b75817fc', 'u5-sensible-heat-02': '8f724b0f1ebe7ed64056c2e43f062eacd5d3ba03cef67f795dae3f19876852d5', 'u5-sensible-heat-03': 'fc61e4d4eed105f68b12cf5ec60a2d8ceb86731fb6a3fd9721a19985eec422ac', 'u5-sensible-heat-04': 'aa871a014db25dd3f6607e366a8fad7a8c6e3972b20c47a9c23c2a47752de6d0', 'u5-sensible-heat-05': '80a8b141c4ea8caf5c6d5f89042fe2d4096c71a9820491fc5a3fa704a68173e5', 'u5-sensible-heat-06': '1ba6030e9f415fecad8dfea9c03f0caae69343b033b51019cdff8a603adb0f00', 'u5-sensible-heat-07': 'c83fdaa7f8d0783bd58898804e19aeae809e5bb07fb52e8c43ed7921da5dc425', 'u5-sensible-heat-08': 'd05c19914c4f03f29b81eb171658f6d610dba7b9f0a726c00cf89c4b1de9784e', 'u5-sensible-heat-09': 'a02c15706708189aa3a8c98ccaf693456c2bc5a53e7221ab358434f4abdefd0f', 'u5-sensible-heat-10': 'd5df6e0439c30c9ea804f21a67291787b897d0838f2637f010e62eaf0bb45dc3', 'u5-sensible-heat-11': '1622adc1e11546f80ce84c9410d81f7e2ba828cd2b47d241459226166ddb08d7', 'u5-sensible-heat-12': 'fb5e4b076be7366b086d3c30c1f02e38864e69accf111c43e56b77db70d19e27', 'u5-sensible-heat-13': '554952b8c20df5b6558feb7afcd1f261046040723e829571bade291b3d95837c', 'u5-sensible-heat-14': '463de718decb9d5f519f8718e0254712c81e3f4043b131b061e888bc11ef6d6f', 'u5-sensible-heat-15': '74bfe5594aa7650f4b5ef3d2c4d7029b292caee25cd5e6145fd0053cf32b9c9c', 'u5-sensible-heat-16': '14e5a5fad45334ee68d6815d4e288ff5f13836d535f36abb3ceb3906cce87b7e'}
