"""Independent U5-02 thermodynamic cycle/material review; no authoring imports."""
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
FAMILY='reversible-refrigerator'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L09' for n in range(1,17)}
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

def refrigerator(hot,cold):
    if not hot>cold>0:raise ValueError('Absolute temperatures must obey hot>cold>0')
    return sp.cancel(sp.sympify(cold)/(sp.sympify(hot)-cold))

def hot_inverse(coefficient,cold):
    if coefficient<=0 or cold<=0:raise ValueError('Positive COP and cold temperature required')
    return sp.cancel(cold*(1+1/sp.sympify(coefficient)))

@lru_cache(maxsize=1)
def oracle():
    h,c,C,qc,qh,win,a,b=sp.symbols('h c C qc qh win a b',positive=True)
    # Eliminate caloric scale using reversibility and first law, rather than key.
    heat_hot=sp.solve(sp.Eq(qh/h,qc/c),qh)[0]
    work=sp.solve(sp.Eq(win,heat_hot-qc),win)[0]
    law=sp.cancel(qc/work)
    assert sp.simplify(law-c/(h-c))==0
    inverse=sp.solve(sp.Eq(C,law),h)[0]
    cold_inverse=sp.solve(sp.Eq(C,law),c)[0]
    ratio=sp.cancel(law.subs({h:a*h,c:b*c})/law)
    unique([law,h/(h-c),1-c/h,(h-c)/c,c/h],law)
    unique([c*(1+1/C),c/C,c*(1-1/C),C*c,c/(1+C)],inverse)
    unique([b*(h-c)/(a*h-b*c),b/a,a/b,(a*h-b*c)/(h-c),a*b],ratio)
    first=refrigerator(sp.Integer(400),sp.Integer(200))
    second=refrigerator(sp.Integer(500),sp.Integer(300))
    gain,offset=calibrate(first,second,3,4)
    assert (first,second,gain,offset)==(1,sp.Rational(3,2),2,1)
    target=sp.Rational(3,2)*first
    target_cold=cold_inverse.subs({C:target,h:500})
    assert target_cold==300
    continuous=sp.Rational(9,2)/(3/first)
    affine=(sp.Rational(7,3)-offset)/gain
    assert continuous==sp.Rational(3,2) and affine==sp.Rational(2,3)
    # Coincidence at equal gaps is real; counterexample excludes general affinity.
    assert (first+second)/2==refrigerator(sp.Integer(450),sp.Integer(250))==sp.Rational(5,4)
    assert (first+refrigerator(sp.Integer(400),sp.Integer(300)))/2==2
    assert refrigerator(sp.Integer(400),sp.Integer(250))==sp.Rational(5,3)
    assert sp.simplify(law.subs(h,2*c))==1
    assert refrigerator(sp.Integer(400),sp.Integer(200))==refrigerator(sp.Integer(600),sp.Integer(300))==1
    Q=SI.Quantity
    assert (Q(200,'K')/Q(200,'K')).to('').magnitude==1
    assert (Q(20,'J')/Q(20,'J')).to('').magnitude==1
    assert Q(40,'J')/Q(400,'K')==Q(20,'J')/Q(200,'K')
    assert Q(40,'J')-Q(20,'J')==Q(20,'J')
    return [first,'1','C = T_c / (T_h − T_c)','Da 1 a 2/3: diminuisce',
      inverse.subs({C:first,c:200}),cold_inverse.subs({C:first,h:400}),
      refrigerator(sp.Integer(400),sp.Integer(300))/first,2-first,
      'T_h = T_c (1 + 1/C)',
      'C_B/C_A = κ₂ (T_h − T_c) / (κ₁ T_h − κ₂ T_c)',
      second/first,(first+second)/2,target_cold/200,
      hot_inverse(continuous,sp.Integer(300)),hot_inverse(affine,sp.Integer(200)),
      'Infinite coppie con T_c>0 e T_h=2T_c']

MANUAL=['T_h−T_c=400−200=200 K. C=200/200=1, puro. Per qualunque Q_c>0 il lavoro necessario è Q_c in questo caso e Q_h=2Q_c; la formula non fissa una scala di calori.', 'Calore diviso lavoro ha unità J/J=1; equivalentemente K/K=1. Né J, né W, né una temperatura sono il coefficiente richiesto.', 'La legge fornita segue da Q_h/Q_c=T_h/T_c e W=Q_h−Q_c. C=1/(T_h/T_c−1)=T_c/(T_h−T_c); denominatore positivo. T_h/(T_h−T_c) sarebbe il coefficiente pompa di calore, maggiore di uno rispetto a C.', 'A dà 1. B dà 200/(500−200)=200/300=2/3. A T_c fisso aumentare T_h allarga il salto e riduce C; non si moltiplica C per 500/400.', 'Con C=1 e T_c=200 K: C(T_h−T_c)=T_c, quindi T_h=T_c+T_c/C=400 K. L’inversa soddisfa T_h>T_c.', 'C T_h=(C+1)T_c; T_c=C T_h/(C+1)=1·400/2=200 K. Il divisore C+1 non è nullo perché C>0.', 'C_A=1. A T_h=400 K, T_c, B=300 K, il salto è 100 K e C_B=3. Rapporto B/A=3. È lecito C_B>1: non è un rendimento motore.', 'Valore corretto 1; proposta 2. Scarto proposto−corretto=2−1=+1, adimensionale. La proposta non è rifiutata da un falso limite C≤1 ma dal dato termico specifico.', 'C(T_h−T_c)=T_c⇒C T_h=(C+1)T_c⇒T_h=T_c(C+1)/C. Per C>0 risulta T_h/T_c=1+1/C>1, con T_c>0.', 'C_B/C_A=[κ₂T_c/(κ₁T_h−κ₂T_c)]·[(T_h−T_c)/T_c]=κ₂(T_h−T_c)/(κ₁T_h−κ₂T_c). Occorrono κ₁, κ₂>0 e κ₁T_h>κ₂T_c; il fattore comune lascia C invariato.', 'A dà 1. B dà 300/(500−300)=3/2. Il rapporto è 3/2, non 500/400 né il solo rapporto dei freddi in generale; qui quest’ultimo coincide perché il salto termico resta 200 K.', 'Media=(1+3/2)/2=5/4. Gli ingressi medi 450 K e 250 K danno 250/200=5/4, coincidenza qui giustificata dal salto 200 K comune. La legge non è affine in generale: con 400/200 K e 600/200 K le uscite 1 e 1/2 hanno media 3/4, mentre gli ingressi medi 500/200 K danno 2/3.', 'C_B=(3/2)C_A=3/2. Con T_h, B=500 K, T_c, B=(3/2)500/(5/2)=300 K. Rapporto freddi 300/200=3/2. Il freddo resta sotto 500 K.', 'A ha C_A=1 e S_A=3, quindi q=3 per letture adimensionali. S_B=9/2 dà C_B=(9/2)/3=3/2. Con T_c, B=300 K, T_h, B=300(1+2/3)=500 K. Nessun arrotondamento richiesto.', 'Riferimenti C_A=1, C_B=3/2. q=(4−3)/(3/2−1)=2, b=3−2=1. C_C=(7/3−1)/2=2/3. T_h, C=200(1+3/2)=500 K. Il guadagno è positivo e la temperatura calda supera 200 K.', 'T_h=2T_c implica C=T_c/(2T_c−T_c)=1 per ogni T_c>0. La misura ripete il vincolo, quindi infinite coppie; esempi 200/400 K e 300/600 K ordinate fredda/calda. Non si ricava una temperatura dalla sola misura adimensionale.']
DISTRACTORS=['Il coefficiente pompa di calore è Q_h/W=2, distinto dal frigorifero 1; il rendimento motore è 1/2. Nessuna creazione di energia: 20 J freddi+20 J lavoro=40 J caldi.', 'J e K sono dimensionati, J/K capacità e W potenza; entrambi i rapporti della definizione sono puri. Le cinque unità sono dimensionalmente distinte.', 'Confronto simbolico di tutte cinque le formule: calda al numeratore dà pompa di calore; 1−fredda/calda dà η motore; differenza/fredda è 1/C; fredda/calda confronta i calori, non il costo di lavoro.', 'Il reciproco di 2/3 è 3/2, 5/4 segue solo la temperatura calda. Resta 1 ignora il salto maggiore, negativo viola h>c>0.', '200 K annulla il salto, 0 K viola il dominio e il reciproco del coefficiente non è una temperatura.400 K ricostruisce C1.', '400 K darebbe salto 0; dividere per 1−C diverge qui e segue da un segno algebrico errato. Il fattore corretto è C/(1+C).', '3/2 considera il solo numeratore; 2 il solo fattore inverso sul salto.1/3 reciproco del rapporto 3, 1 ignora il cambiamento.', '−1 inverte lo scarto, 2 copia la proposta, 0 la accetta, 1/2 è il rendimento motore. Scarto corretto+1.', 'T_c/C è solo il salto. Con segno meno T_h<T_c; C T_c dà T_c per C1 e T_c/(1+C) dà T_c/2. Unicità come formula generale controllata con Sym Py.', 'κ₂/κ₁ e reciproco sostituiscono la differenza con un prodotto/quoziente semplice; il rapporto dei salti omette κ₂ e inverte l’effetto del salto.κ₁κ₂ cambia sotto una scala comune, mentre C no.', '2/3 reciproco, 5/4 solo calda, 1 solo salti comuni, 5/2 usa 500 K al numeratore di B: è la pompa di calore B.', '5/2 è somma, 3/4 dimezza soltanto B; 1 e 3/2 copiano i riferimenti. La coincidenza 5/4 sugli ingressi medi è giustificata dal salto comune 200 K; controesempio separato conferma non linearità generale.', '2/3 inverte il rapporto; 5/4 segue solo la calda. Scalare direttamente la fredda può coincidere qui, ma va ricostruito il nuovo salto per giustificarlo.1 e 5/2 non soddisfano bersaglio e dominio insieme.', 'Usare C=9/2 darebbe 300(1+2/9)=1100/3 K; fermarsi al salto dà 200 K<T_c 300 K. Guadagno q 3 applicato una sola volta.', '400 K→C1, S3; 300 K→C2, S5; 450 K→C4/5, S13/5; 200 K annulla il salto.500 K è l’unica alternativa che restituisce S7/3.', '400/200 K e 2/1 K sono esempi entrambi validi, non soluzioni uniche. Scambiare sorgenti viola h>c. Nessuna coppia è confutato da due esempi distinti.']
ASSUMPTIONS=['Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'C=Q_c/W_in con energie nella stessa unità; equivalente rapporto K/K fra temperature assolute. Non richiede calcolo numerico ma richiede prova dimensionale.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.', 'Ciclo reversibile fra due sorgenti ideali a T_h>T_c>0 assoluti. Dalla reversibilità Q_h/T_h=Q_c/T_c; dal primo principio, con W entrante positivo, W=Q_h−Q_c. Dunque C=Q_c/W=T_c/(T_h−T_c)>0. C non è limitato a 1; a differenza del coefficiente pompa di calore, non usa Q_h al numeratore. Temperature costanti entro ciascuna sorgente/prova. Sono rapporti assoluti, non letture Celsius. Le inverse richiedono C>0 e mantengono i due rami T_h>T_c>0.']
UNITS={n:'' for n in range(1,17)}
UNITS.update({5:'K',6:'K',9:'K',14:'K',15:'K'})
NUMERIC_UNITS={1:'1',5:'K',6:'K',14:'K'}
SUFFIX={15:' K'}
CALCULATION_SCOPE={2:'NO_STUDENT_CALCULATION',3:'SYMBOLIC_MANUAL_DERIVATION',9:'SYMBOLIC_MANUAL_DERIVATION',10:'SYMBOLIC_MANUAL_DERIVATION',16:'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti: sorgente fredda 200 K→macchina→calda 400 K, lavoro entrante verticale. Ogni freccia ha proprio path e marker-end; frecce schematiche dichiarate. Q_c 20 J+W20 J=Q_h 40 J e uguaglianza reversibile 40/400=20/200 J/K. Barre comuni x 160 larghe 100, 100, 200 px a 5 px/J. Ultimo pannello x 155: 200, 300, 250 px a 200 px/C per 1, 3/2, 5/4; scala dimensionale diversa dalla precedente e media non confusa con somma.'
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





CANDIDATE_REF='2427a4729b109e53210658b734bb676b25304a84'
SOURCE_READING='Primaria80 U5-02 prima di candidati/chiavi/opzioni, SHA2568fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65. Fonte prompt soltanto: risultati e leggi derivati indipendentemente. Nessuna esposizione delle chiavi dai messaggi autore, soloSHA e ipotesi generali. Dopo la primaria, tutti16 candidati finali163 letti integralmente, incluse opzioni/formule/hint/feedback/metadata/didascalie e SVG XML/render intero. Dati invariati rispetto alle derivazioni, medie coincidenti controllate e controesempio non affine distinto. Package/binding/asset confrontati byte per byte con pin e ROOT integrato. Nessun authoring importato; reviewer diverso dall’autore.'
REVIEWED_PACKAGE_SHA256='a5c77ab8ffbd58b6a97d6c6d6ecd4e4792748a885d346e3ccd2a12d099c109f5'
REVIEWED_BINDINGS_SHA256='aac177c0759dfb5805391f5fc2e1bdccb108576f41e5822e0fb9b7e3fd246ba5'
REVIEWED_CANDIDATES={'AR-u5-reversible-refrigerator-01': 'd28ed4f0455d170f419b7e40454b9ec32e6e4e7f4fd3ca29841ce2a8f41918dd', 'AR-u5-reversible-refrigerator-02': '25c0aa7cb6095e7608b01f09e7f7c2ea70273778008a6a48260175b04dabf0eb', 'AR-u5-reversible-refrigerator-03': 'b085b3a078860da4fb2e4bb1e08c82a20cbaa85fbb1b4d185568e48aba5fc8d8', 'AR-u5-reversible-refrigerator-04': '14a68a94137f6aacacbfcc7827efa66e3eacb43b2760e5871cef592461be00c6', 'AR-u5-reversible-refrigerator-05': '553d7d2d4386c73a27a2340d701df0c6863e81c7441bd8dd12ff63d2b35b0baf', 'AR-u5-reversible-refrigerator-06': '64ab02a4793992d4b973a9d2ac2515d95cde0304c74e2da2b9c816a4ca8c1691', 'AR-u5-reversible-refrigerator-07': 'f02de20f343ed97689177849973b65f83a018fc21dab7483c16f748ec0829c9a', 'AR-u5-reversible-refrigerator-08': '8b37eed198f5bac09e822641e8c80da999701425bd11064d6a5b053a88850f35', 'AR-u5-reversible-refrigerator-09': 'c7599f76e3940070f952139174379d6837d045c95a42bf9691356884158e13b8', 'AR-u5-reversible-refrigerator-10': 'bc9e5e03303cedddff6570af9e5b80d808f80962f0e33ed53f809ec97081a78d', 'AR-u5-reversible-refrigerator-11': 'f4867ffebe8601b6e37e6a1a68011d5255b4e4bddbe785804004b828f4e30c9e', 'AR-u5-reversible-refrigerator-12': 'b587702f82e6ca24c545b2d369e47593ca110d57965e67a02e883b5ac7ed8b70', 'AR-u5-reversible-refrigerator-13': 'f0cbb52c8d377b2c3aaf1dc9bf5fe10d57273a19b383d145305fbb1210d38036', 'AR-u5-reversible-refrigerator-14': 'a850b552772d6b26c226d2d453badb79269b5267e8ff018d1f948336667609e4', 'AR-u5-reversible-refrigerator-15': '9297e5ab04219ceccd0e6db030b32ab97e16e2cce5dc7339235c4f1a706fcbaf', 'AR-u5-reversible-refrigerator-16': 'dcac0cdcb498ad2e61b2c54bff875f6feb9a22fcb021ba01fb03307111697fc9'}
READ_SOURCE_SHA256={'u5-reversible-refrigerator-01': 'f85d93618e7d4700ecd83eb514c2c6273faa82bb710237a8b474e78d31ba86f6', 'u5-reversible-refrigerator-02': 'fff506e11f47a9fcb2ea4a62c4dbc3ad6306218e6d9dc02b5f108998c68bba35', 'u5-reversible-refrigerator-03': '9cad806478ab868336aa55cdd546e5374e7c1f09eacc6674592d3df88534ccd4', 'u5-reversible-refrigerator-04': 'd89c657de69d07edcf46a6ed711403c3e7539e3f673b2c1a0a7ba95546e86b38', 'u5-reversible-refrigerator-05': '2c89fccbdc08caf9d2c6a8748d55f0c588278fa122bd30d18c156c4271811b3c', 'u5-reversible-refrigerator-06': '0d210a3e961174c01c859ca103ffd5dff39855898f25247f3bb401387c0fa8ce', 'u5-reversible-refrigerator-07': '01c3f6ab08543744a6be0c156c88eb68f5b22fd986f772999cfcfaea32b1efe4', 'u5-reversible-refrigerator-08': '7916dc3507eea775741c724cdbd5d3a8392697b7cd0722a82f50afd046665e39', 'u5-reversible-refrigerator-09': 'b5ce1763d1fd1b9f23bf74102590918fe8ebb31247ae5ebf7002601b0db09903', 'u5-reversible-refrigerator-10': 'a394972a2c7ecdb650f0ad962e1a1cf3321ee7d078996e631ff56c6af99e4d8d', 'u5-reversible-refrigerator-11': '50834d3fef57097f3918338756fb399ecebce2df6cb4ca6f300e80bc528b0309', 'u5-reversible-refrigerator-12': 'cda87a1a042261f8869f56ff079fc754bd9bf410679ee917bdc430bbad06d1ed', 'u5-reversible-refrigerator-13': 'd6c31226c5dcf311679dacff0899a806e19814be1488d439abd8a304c1c72c32', 'u5-reversible-refrigerator-14': 'b898fd5d3c5a44b634881ca4403bd0c2ae37dfd8a819efaaddc67cd5c40b8dab', 'u5-reversible-refrigerator-15': '9b29e3e97f79bd7ea5909bc28a10f7f3dd4701cbadeca315bbfbb014491b5965', 'u5-reversible-refrigerator-16': 'a9c827bb975b73169431604537657308ce1738905ea465a032be1041b1a75aca'}
