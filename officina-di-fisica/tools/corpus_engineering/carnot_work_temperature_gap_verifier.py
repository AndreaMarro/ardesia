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
FAMILY='carnot-work-temperature-gap'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C3-L09', 2: 'C3-L09', 3: 'C3-L09', 4: 'C3-L09', 5: 'C3-L09', 6: 'C3-L09', 7: 'C3-L09', 8: 'C3-L09', 9: 'C3-L09', 10: 'C3-L09', 11: 'C3-L09', 12: 'C3-L09', 13: 'C3-L09', 14: 'C3-L09', 15: 'C3-L09', 16: 'C3-L09'}
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

def cycle_work(hot,cold,coefficient=sp.Integer(1)):
    if not hot>cold>0 or coefficient<=0:raise ValueError('Positive ordered absolute reservoirs and coefficient required')
    return sp.cancel(coefficient*(hot-cold))

def cold_inverse(work,hot,coefficient=sp.Integer(1)):
    if not 0<work<coefficient*hot or coefficient<=0:raise ValueError('Cold reservoir must remain positive')
    return sp.cancel(hot-sp.sympify(work)/coefficient)

@lru_cache(maxsize=1)
def oracle():
    nR,h,c,K,E,v,V,a,b=sp.symbols('nR h c K E v V a b',positive=True)
    # Independent reversible isotherm integral; no numerical logarithm evaluation.
    hot_integral=sp.integrate(nR*h/v,(v,V,2*V))
    cold_integral=sp.integrate(nR*c/v,(v,2*V,V))
    assert sp.simplify(hot_integral-nR*h*sp.log(2))==0
    assert sp.simplify(cold_integral+nR*c*sp.log(2))==0
    law=K*(h-c)
    assert sp.simplify((hot_integral+cold_integral).subs(nR,K/sp.log(2))-law)==0
    inverse=sp.solve(sp.Eq(E,law),h)[0]
    inverse_cold=sp.solve(sp.Eq(E,law),c)[0]
    ratio=sp.cancel(law.subs({h:a*h,c:b*c})/law)
    unique([K*(h-c),K*h,K*c,K*(h+c),K*c/h],law)
    unique([c+E/K,c-E/K,E/K,c+K*E,c+E],inverse)
    unique([(a*h-b*c)/(h-c),a/b,a-b,a*b,(h-c)/(a*h-b*c)],ratio)
    first=cycle_work(sp.Integer(400),sp.Integer(200))
    second=cycle_work(sp.Integer(600),sp.Integer(300))
    gain,offset=calibrate(first,second,401,601)
    assert (first,second,gain,offset)==(200,300,2,1)
    target=sp.Rational(3,2)*first
    target_cold=cold_inverse(target,sp.Integer(600))
    assert target_cold==300
    assert (first+second)/2==cycle_work(sp.Integer(500),sp.Integer(250))==250
    # The same dimensionless temperature ratio does not fix the dimensional W.
    assert 1-sp.Rational(200,400)==1-sp.Rational(300,600)
    assert first!=second
    constraint=sp.solve(sp.Eq(E,law.subs(h,2*c)),c)[0]
    assert constraint==E/K
    Q=SI.Quantity
    assert (Q(1,'J/K')*Q(200,'K')).to('J').magnitude==200
    assert (Q(200,'J')/Q(1,'J/K')).to('K').magnitude==200
    assert SI.Unit('J/K').dimensionality!=SI.Unit('J').dimensionality
    assert (Q(1,'J/K')*Q(200,'K')/Q(400,'K')).dimensionality==SI.Unit('J/K').dimensionality
    return [first,'J','W = nR ln 2 (T_h − T_c)','Da 200 a 400 J: raddoppia',
      inverse.subs({E:first,K:1,c:200}),inverse_cold.subs({E:first,K:1,h:400}),
      cycle_work(sp.Integer(400),sp.Integer(300))/first,400-first,
      'T_h = T_c + W/c','(κ₁ T_h − κ₂ T_c) / (T_h − T_c)',second/first,(first+second)/2,target_cold/200,
      300+900/(600/first),(801-offset)/gain+200,constraint.subs({E:200,K:1})]

MANUAL=['K=1 J/K e salto 400−200=200 K. W=K·200 K=200 J. È lavoro uscente netto; Q_h=400 J e Q_c=200 J in questa parametrizzazione.', 'W è un lavoro e si misura in J. La presenza numerica del salto termico non ne cambia la dimensione, perché è moltiplicato da K in J/K.', 'Il lavoro è differenza dei due calori isoterme: W=n R ln 2(T_h−T_c)=K(T_h−T_c). Non la somma, non il rapporto dei due T e non una temperatura priva del coefficiente K.', 'A W=200 J. B con 600/200 K ha salto 400 K e W=400 J; raddoppia. La variazione segue la differenza delle temperature, non il rapporto 600/400=3/2 da solo.', 'T_h=T_c+W/K=200 K+(200 J)/(1 J/K)=400 K. Sommare lavoro grezzo a temperatura senza K sarebbe dimensionalmente scorretto.', 'T_c=T_h−W/K=400 K−200 K=200 K. Il dato soddisfa W<KT_h; un lavoro superiore a 400 J renderebbe T_c negativa e andrebbe rifiutato.', 'A salto 200 K, W200 J. B salto 400−300=100 K, W100 J. Rapporto W_B/W_A=1/2.', 'Corretto 200 J. Proposta 400 J: scarto 400−200=+200 J. Quattrocento J è qui Q_h e omette lo scarico freddo, non il lavoro netto.', 'W/K=T_h−T_c⇒T_h=T_c+W/K. Unità W/K=(J)/(J/K)=K. Ramo W>0 assicura T_h>T_c quando T_c>0.', 'Con K identico in A e B, W_B/W_A=(κ₁T_h−κ₂T_c)/(T_h−T_c). I due salti sono positivi per il dominio; un fattore comune κ sulle temperature porta il fattore κ anche sul lavoro.', 'A400/200 K dà 200 J, B600/300 K dà 300 J. Rapporto 300/200=3/2. Anche entrambe le temperature aumentano 3/2 in questo confronto specifico.', 'Media=(200+300)/2=250 J. Gli ingressi medi 500 K e 250 K danno lo stesso 250 J, perché K(T_h−T_c) è lineare a K fisso. Non si deve inventare una differenza fra le due operazioni.', 'Target W_B=(3/2)200=300 J. Con T_h, B=600 K, T_c, B=600 K−300 J/K=300 K. Rapporto 300/200=3/2.', 'S_A600 su W_A200 J dà q=3 J⁻¹ per display puro. S_B900→W_B300 J. T_h, B=300 K+300 J/(1 J/K)=600 K.', 'q=(601−401)/(300 J−200 J)=2 J⁻¹; b=401−2·200=1. S_C801→W_C400 J. Con T_c, C200 K, T_h, C600 K. Tutti i passaggi sono interi.', 'T_h=2T_c⇒W=K T_c. Dato W200 J, K1 J/K segue T_c 200 K e T_h 400 K, un’unica coppia positiva. Qui la misura non è ridondante, a differenza del COP del lotto 163.']
DISTRACTORS=['400 J è soltanto Q_h; 200 J ceduti vanno sottratti. Il coefficiente 1 J/K è necessario dimensionalmente.', 'K misura il salto e J/K il coefficiente, Pa pressione, watt J/s potenza. Solo J è energia.', 'Le due formule con un solo T descrivono un unico scambio; la somma tratta il calore ceduto come entrante. K T_c/T_h ha dimensione J/K, non energia. Adiabatiche Q=0 possono avere W non nullo.', '300 J moltiplica per 600/400 invece di confrontare i salti.800 J raddoppia due volte e il negativo viola il ramo motore. Restare 200 ignora l’ingresso modificato.', 'W/c da solo è il salto 200 K; T_h richiede aggiungere T_c. Joule e kelvin non si sommano senza conversione.', 'Aggiungere invece di sottrarre darebbe 600 K maggiore della sorgente calda. W≥c T_h viola il freddo positivo.', '2 è reciproco; 3/2 segue le sole fredde; 1 ignora il salto minore; 3/4 è 300/400, non il rapporto dei lavori.', '−200 inverte scarto, 400 copia proposta, 0 la accetta, 100 dimezza ancora. Il risultato è un’energia positiva.', 'Segno meno rende h<c, solo W/c omettecolda. c W ha J²/K e W ha J, non temperature. Cinque formule confrontate simbolicamente e dimensionalmente.', 'κ₁/κ₂ dà 1 per fattore comune, ma W cresce come κ. La differenza dei fattori dà 0 per prove uguali, il prodotto non modella una differenza e l’ultima opzione inverte il rapporto.', '2/3 è reciproco; 1 confonde rendimento invariato con W invariato.3 e 2 non ricostruiscono i salti 200 K e 300 K.', '500 J somma senza mediare; 100 differenza; 200 e 300 copiano una prova. Linearità dimostra che anche 500−250 K dà 250 J.', 'Rapporto 1 lascia freddo 200 K e dà W400 J; rapporto 2 dà freddo 400 K e W200 J.2/3 capovolge; 3 azzera il salto a 600 K e non raggiunge il bersaglio.', 'Usare 900 come J senzaq dà 1200 K; restituire solo 300 K annulla il salto quando Tc è 300 K. q 3 J⁻¹ va applicato prima della legge fisica.', '400 K→S401; 500 K→S601; 1200 K→S2001.1201/2 K ignoraoffset e dà S802. Soltanto 600 K riproduce 801.', '100 K e 400 K darebbero lavori 100 e 400 J. Le due alternative qualitative infinite/nessuna sono confutate dalla soluzione unica positiva 200 K e dalla legge W=c T_c.']
ASSUMPTIONS=['Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.', 'Ciclo motore reversibile di gas ideale: l’espansione isoterma calda ha V_f/V_i=2 e la corrispondente compressione isoterma fredda ha lo stesso rapporto, per chiusura attraverso le adiabatiche. Il coefficiente assegnato K=n R ln 2=1 J/K evita qualsiasi calcolo decimale di ln 2. Q_h=KT_h e Q_c=KT_c sono moduli; ΔU_ciclo=0 e W=K(T_h−T_c)>0. Non si può porre lavoro in J uguale a temperatura in K senza conservare K dimensionalmente. Per l’inversa fredda 0<W<KT_h. Le sorgenti sono fissate entro il ciclo e cambiano solo fra prove dichiarate.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'K', 6: 'K', 7: '', 8: 'J', 9: 'K', 10: '', 11: '', 12: 'J', 13: '', 14: 'K', 15: 'K', 16: 'K'}
NUMERIC_UNITS={1: 'J', 5: 'K', 6: 'K', 14: 'K'}
SUFFIX={8: ' J', 12: ' J', 15: ' K', 16: ' K'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti: primo pannello temperature 400/200 K, barre 400/200 px a 1 px/K da x 130; secondo 400 J assorbiti, 200 J ceduti e 200 J lavoro, barre 400/200/200 px a 1 px/J da x 130. Terzo 200/300/250 J, barre 200/300/250 px. Scale termica ed energetica distinte, nessun grafico p–V o falso lavoro nullo delle singole adiabatiche. Diagramma fisico e media coerenti.'
NON_NUMERIC_DISTRACTORS={16: {'Infinite temperature positive', 'Nessuna temperatura positiva'}}
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






CANDIDATE_REF='0817d173da0ef3181f532257f460f16ec76904d7'
SOURCE_READING='Primaria80 U5-02 prima di candidati/chiavi/opzioni, SHA2568fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65. Fonte prompt soltanto e80 derivazioni individuali persistite. Nessuna chiave anticipata nei messaggi autore: soltantoSHA, file e ipotesi generali. Dopo la primaria, tutti16 candidati finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. SVG XML e rendering nativo completo riletti, leggi/domini e calcoli rifatti. Mapping sui reali corsi/lezioni Cric C3, senza inventareID. Package/binding/asset byte identici al pin finale e al ROOT integrato. Nessun authoring importato; reviewer diverso dall’autore.'
REVIEWED_PACKAGE_SHA256='318195c13545650342e3bcd79dd3e393328834912ead52fff141f96e28ec9c9d'
REVIEWED_BINDINGS_SHA256='318463e54648550f4a4c56ee0e408f32691fc0ea790ebb7b5e7486da17688532'
REVIEWED_CANDIDATES={'AR-u5-carnot-work-temperature-gap-01': '22f7a26c8f21de3f4d209f4585b9230de19d605fb64ef8a9dca9f0026753f456', 'AR-u5-carnot-work-temperature-gap-02': '5ee84bfd8d01d3b29835adccc3e3a339b11c81db8d305c083e4c46a0a636653e', 'AR-u5-carnot-work-temperature-gap-03': '670dd608d86e06966f93b028fab8cf66f63453f8c0c669d222b4e779e83a4f3e', 'AR-u5-carnot-work-temperature-gap-04': 'f84161764e7502dd0577d10f3be3fc759b18f599bfd97ba45fe6b363d032ce15', 'AR-u5-carnot-work-temperature-gap-05': '06c11e937195410a758912535fdc04f490401047392f80e0fbea75b6e82ca9ba', 'AR-u5-carnot-work-temperature-gap-06': '173a353ab7014a57173cd9786366543cbcea8c43443c3063358082e6d2653cf5', 'AR-u5-carnot-work-temperature-gap-07': 'b867fa0222c62c8c68a2610d7e125feee545b138e5cd439cf9c6d1c9a23608c0', 'AR-u5-carnot-work-temperature-gap-08': 'a730780783e4b879d6ab561b6926c68ef5f34d24595544d4395df9f717b68bfe', 'AR-u5-carnot-work-temperature-gap-09': '2c3645ab072dca5d027f5ab594696daacc1bfaf9d1d7c6e6cf62f963bee4a3b4', 'AR-u5-carnot-work-temperature-gap-10': '9618a4d571156830f5c22a97c836f74475878d3c69d9b9f682deda4f46eb55a6', 'AR-u5-carnot-work-temperature-gap-11': 'bdbedb5221a2593188f9bcedf286fb7d9501e6b34cb857d441b8781bfeee3c26', 'AR-u5-carnot-work-temperature-gap-12': '8f29df8e6cd4c42e575ec3a1b91287e4f7480b74e7687f290a7eb01cee3c51d3', 'AR-u5-carnot-work-temperature-gap-13': '31c52e1a563a5b13bde715f2fdf295b84fbcbed667936914c9c8d56c2ef174f9', 'AR-u5-carnot-work-temperature-gap-14': '8507e594c3e517261a2416cf257979d0b54803153e25e8947331235e8a7c107e', 'AR-u5-carnot-work-temperature-gap-15': 'e1586aa73b57261fca44beeaf37c67b54d1cced060b080ecf891c9816dda29a2', 'AR-u5-carnot-work-temperature-gap-16': 'e637c76311114bedacc0c2fc01683a98103cde6e6551d369d15172615fec5922'}
READ_SOURCE_SHA256={'u5-carnot-work-temperature-gap-01': 'eedb9f090f425afc46eee626209010e65021cab27c1a3bf86cb09b47d3a2c373', 'u5-carnot-work-temperature-gap-02': 'feef7bfe14f48328e6d6e78bc49eba5c1e8ac635914ede5d31c4fdc491f301ce', 'u5-carnot-work-temperature-gap-03': 'cab7c712d549ab97ca70d35a4550687921b08c67326b7f1580b242a977af4705', 'u5-carnot-work-temperature-gap-04': 'e5f6aa9e6fdee659860ec5a4051e7bd556583c8c0c073f2e3ba1579a96ce6acc', 'u5-carnot-work-temperature-gap-05': '6394525b2f19601fdc58bae90944eb5061c34d4920c52a04450801b2d49803c6', 'u5-carnot-work-temperature-gap-06': '0f74f0be3a4ca72911cb45d6cf87d02738dba879d00595347e6247a31073c4fc', 'u5-carnot-work-temperature-gap-07': 'c7ec89d6f0718c1909d770e53c2b6f1c261f60d5a89b589a4890283466a6ca28', 'u5-carnot-work-temperature-gap-08': 'f309101312b18168f48ad72343b2b9fa146634e42b945a52a0fbdbc5a618fd9c', 'u5-carnot-work-temperature-gap-09': '69e310c56e1497e115131f80ccfdde80bbdb3bbf892623f752b3ff9c6fcac035', 'u5-carnot-work-temperature-gap-10': '5fc827e6d0e2cd2e8523a7b083fa3802f41408135a93e5c3915ca5c500f9658d', 'u5-carnot-work-temperature-gap-11': 'd879190b751b7aa9de9ff5a9c1ef243fac32c3ac803cb371b2f7336a51fd592c', 'u5-carnot-work-temperature-gap-12': '0a5bb002aaf719e703333277f83ffb0229cca5f741dfc060a07218db0925d600', 'u5-carnot-work-temperature-gap-13': '5382f136538edbe311be2ebb4cff18879402005c09c3201e7e08ba4fbc186fd5', 'u5-carnot-work-temperature-gap-14': 'b7f8c6ff051158d647030b1037c066df88320b117e6c984dee7a6cf175702e69', 'u5-carnot-work-temperature-gap-15': '0ef9a4462aac6d6ee5c03874792b4cd07c24f050888b2540cfe28fe18d2f96f4', 'u5-carnot-work-temperature-gap-16': '9ccfcd99de8152ce2ea533cf61784190d17a22852eb129352b3a4e3faf970497'}
