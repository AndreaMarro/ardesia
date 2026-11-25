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
FAMILY='adiabatic-monatomic'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C3-L07', 2: 'C3-L07', 3: 'C3-L07', 4: 'C3-L07', 5: 'C3-L07', 6: 'C3-L07', 7: 'C3-L07', 8: 'C3-L07', 9: 'C3-L07', 10: 'C3-L07', 11: 'C3-L07', 12: 'C3-L07', 13: 'C3-L07', 14: 'C3-L07', 15: 'C3-L07', 16: 'C3-L07'}
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

def adiabatic(initial,ratio):
    if initial<=0 or ratio<=0:raise ValueError('Positive absolute temperature and volume ratio required')
    return sp.simplify(initial*ratio**sp.Rational(2,3))

def initial_inverse(final,ratio):
    if final<=0 or ratio<=0:raise ValueError('Positive final temperature and volume ratio required')
    return sp.simplify(final/ratio**sp.Rational(2,3))

def ratio_inverse(initial,final):
    if initial<=0 or final<=0:raise ValueError('Absolute temperatures must be positive')
    return sp.simplify((sp.sympify(final)/initial)**sp.Rational(3,2))

@lru_cache(maxsize=1)
def oracle():
    nR,T,F,r,a,b,V,z=sp.symbols('nR T F r a b V z',positive=True)
    cv=sp.Rational(3,2)*nR;cp=cv+nR;gamma=sp.cancel(cp/cv)
    exponent=gamma-1;assert exponent==sp.Rational(2,3)
    law=T*r**exponent
    entropy=cv*sp.log(law/T)+nR*sp.log((V/r)/V)
    assert sp.simplify(sp.expand_log(entropy,force=True))==0
    inverse=sp.solve(sp.Eq(F,law),T)[0]
    ratio=sp.simplify(law.subs({T:a*T,r:b*r})/law)
    unique([law,T*r,T/r,T,T*r**gamma],law)
    unique([F/r**exponent,F*r**exponent,F/r,F/r**sp.Rational(3,2),r**exponent/F],inverse)
    unique([a*b**exponent,a*b,a/b**exponent,a**exponent*b,a+b**exponent],ratio)
    first=adiabatic(sp.Integer(100),sp.Integer(8))
    second=adiabatic(sp.Integer(200),sp.Integer(27))
    gain,offset=calibrate(first,second,801,3601)
    assert (first,second,gain,offset)==(400,1800,2,1)
    target=sp.Rational(9,2)*first
    target_r=ratio_inverse(sp.Integer(200),target)
    assert target_r==27
    roots=sp.solve(sp.Eq(sp.Rational(25,2)*z**5,400),z)
    assert roots==[2] and roots[0]**3==8
    assert sp.diff(sp.Rational(25,2)*r**sp.Rational(5,3),r)>0
    assert adiabatic(sp.Integer(100),sp.Integer(8))>100
    assert adiabatic(sp.Integer(400),sp.Rational(1,8))==100
    assert (first+second)/2==1100
    at_means=adiabatic(sp.Integer(150),sp.Rational(35,2))
    assert sp.simplify(at_means-1100)!=0
    Q=SI.Quantity
    assert (Q(8,'m**3')/Q(1,'m**3')).to('').magnitude==8
    assert (Q(100,'K')*4).to('K').magnitude==400
    internal=Q(3,'J/K')*Q(300,'K')
    assert internal.to('J').magnitude==900 and (-internal).to('J').magnitude==-900
    assert (Q(sp.Rational(25,2),'K')*8).to('K').magnitude==100
    return [first,'K','T₂ = T₁ r^(2/3)','Da 400 a 800 K',
      initial_inverse(first,sp.Integer(8)),ratio_inverse(sp.Integer(100),first),
      adiabatic(sp.Integer(100),sp.Integer(27))/first,800-first,
      'T₁ = T₂ / r^(2/3)','κ₁ κ₂^(2/3)',second/first,(first+second)/2,target_r/8,
      initial_inverse(5400/(1200/first),sp.Integer(27)),
      initial_inverse((1601-offset)/gain,sp.Integer(8)),roots[0]**3]

MANUAL=['8^(2/3)=(∛8)²=2²=4. T_2=100·4=400 K; compressione r 8>1 scalda, con Q=0 e lavoro entrante positivo sul gas.', 'T_2 ha unità K perché r è un rapporto di volumi e quindi puro. La scala assoluta è necessaria per la legge moltiplicativa; non si usa la lettura Celsius come T_1.', 'T_1 V_1^(2/3)=T_2 V_2^(2/3)⇒T_2=T_1(V_1/V_2)^(2/3)=T_1 r^(2/3). Il segno dell’esponente assicura T_2>T_1 per compressione.', 'Con r 8, il fattore resta 4. Portare T_1 da 100 a 200 K porta T_2 da 400 a 800 K, raddoppio diretto fra preparazioni diverse.', 'T_1=T_2/r^(2/3)=400/4=100 K. Dividere per il fattore di compressione termica non significa dividere per r 8.', 'T_2/T_1=4; r=(4)^(3/2)=(√4)³=2³=8. Ramo r>0 unico; usare una radice negativa non descrive un rapporto di volumi.', 'r_A=8 dà fattore 4, T_2, A400 K. r_B=27 dà fattore 9, T_2, B900 K. Rapporto 900/400=9/4, equivalente a(27/8)^(2/3).', 'Corretto 400 K; proposto 800 K; scarto+400 K. Ottocento usa T_1 r e omette l’esponente 2/3; non si sottraggono letture di coefficienti diversi.', 'T_1=T_2/r^(2/3), r>0. L’inversa è positiva e ha unità K. Scritta coi volumi è T_2(V_2/V_1)^(2/3).', 'Rapporto T_2, B/T_2, A=κ₁κ₂^(2/3), poiché(κ₂r)^(2/3)=κ₂^(2/3)r^(2/3) per fattori reali positivi. Non κ₁κ₂, né rapporto reciproco.', 'B con T_1=200 K, r 27 dà T_2=200·9=1800 K. A400 K. Rapporto 1800/400=9/2; combina fattore 2 su T_1 e 9/4 sulla compressione termica.', 'Media=(400+1800)/2=1100 K. Il modello sugli ingressi medi è invece 150(35/2)^(2/3) K. Non serve approssimarlo: l’uguaglianza a 1100 richiederebbe(35/2)²=(22/3)³, falsa per 33075≠42592 dopo moltiplicazione comune 108.', 'Target T_2, B=(9/2)400=1800 K. Con T_1, B200 K resta r_B^(2/3)=9⇒r_B=27. Rapporto r_B/r_A=27/8, puro.', 'A T_2=400 K, S1200⇒q 3 K⁻¹. S_B5400⇒T_2, B1800 K. Con r 27, T_1, B=1800/9=200 K.', 'Riferimenti 400 K e 1800 K. q=(3601−801)/(1800−400)=2800/1400=2 K⁻¹, b 1. S_C1601⇒T_2, C800 K. r 8 dà T_1, C=800/4=200 K.', 'Vincolo T_1=(25/2 K)r. Ponendo x=∛r>0, T_2=(25/2 K)x^5=400 K⇒x^5=32=2^5. Quindi x 2, r 8, T_1=100 K. Unicità per monotonia stretta su x>0; nessuna radice negativa fisica.']
DISTRACTORS=['800 K usa r 8 alla prima potenza, 200 K solo∛8=2. Il fattore 4 non implica Q entrante: ΔU aumenta per lavoro ricevuto.', 'Rapporto di volumi e potenza sono puri; J, Pa, J/K e K² hanno dimensioni diverse dalla temperatura K.', 'T/r è la legge isobara di campione ideale, non l’adiabatica. T r usa esponente 1, T costante isoterma.5/3 è l’esponente di p V^γ, 2/3 di TV^(γ−1); libera irreversibile esclusa.', '200 K copia nuovo ingresso, 400 ignora aumento.1600 quadrerebbe il fattore 2 fra preparazioni; 600 non moltiplica 200 per 4.', '1600 K applica di nuovo 4 e darebbe finale 6400 K. Dividere per 8 dà 50 K e ricostruisce solo 200 K finale.', '4 è il rapporto termico, 16 il suo quadrato, 2 solo la radice. Rapporti volumetrici negativi non fisici; potenza 3/2 cancella 2/3 solo sul ramo positivo.', '27/8 è il rapporto volumico prima dell’esponente; 3/2 rapporto radici cubiche; 4/9 reciproco; 9 fattore B non rapporto B/A.', '−400 sottrae al contrario, 800 copia proposta, 0 la accetta, 200 non è lo scarto. Differenza in K può avere segno; qui+400.', 'Moltiplicazione applica di nuovo il fattore, dividere perr o r^(3/2) cambia legge; ultima ha K⁻¹. Unicità simbolica per ingressi positivi.', 'κ₁κ₂ omette l’esponente, quoziente inverte dipendenza, κ₁^(2/3)κ₂ scambia ruoli. Somma dà 2 per prove uguali, non 1.', '9/4 ignora raddoppio T₁; 2 ignora variazione r; 27/4 usa 2·27/8 senza esponente 2/3; 2/9 reciproco.', '2200 somma, 550 doppio dimezzamento; 700 metà della differenza; 900 usa il solo fattore B su T₁, A. I dati medi non richiedono approssimare una radice non notevole per questo quesito.', '8/27 reciproco; 9 fattore termico B; 3/2 confronta radici; 9/2 rapporto finali, non volumico. Solo 27/8 ricostruisce il bersaglio con nuovo T₁.', 'Senza q, T₁600 K. Usare 27 anziché 9 al divisore dà 200/3 K e ricostruisce una lettura diversa. Entrambe le operazioni inverse sono necessarie.', '400 K→S3201; 100 K→S801.1601/8 K omette l’offset e ricostruisce S1602.800 K confonde finale con iniziale.', '−8 viola volumi positivi.4 non soddisfa r^(5/3)=32; 32 èla potenza, 2 la radice cubica ausiliaria. Equazione monotona positiva dà il solo valore 8.']
ASSUMPTIONS=['Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.', 'Campione chiuso di gas ideale monoatomico classico con C_V=3 n R/2 e γ=5/3; processo adiabatico reversibile con solo lavoro p d V, senza variazioni macroscopiche di energia fra gli stati di equilibrio. Da(3 n R/2)d T=−n RT d V/V segue d T/T=−(2/3)d V/V, quindi T V^(2/3)=costante. Per r=V_1/V_2>0 si ha T_2=T_1 r^(2/3), con T_1>0 assoluta. Compressione r>1 riscalda; espansione 0<r<1 raffredda. L’inversa r=(T_2/T_1)^(3/2) usa il solo ramo reale positivo; non si applica questa legge alla successiva espansione libera irreversibile.']
UNITS={1: 'K', 2: 'K', 3: 'K', 4: 'K', 5: 'K', 6: '', 7: '', 8: 'K', 9: 'K', 10: '', 11: '', 12: 'K', 13: '', 14: 'K', 15: 'K', 16: ''}
NUMERIC_UNITS={1: 'K', 5: 'K', 6: '1', 14: 'K'}
SUFFIX={8: ' K', 12: ' K', 15: ' K'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti: rettangoli a pari altezza 100 px e larghezze 320/40 px danno volume 8: 1, con V*positivo e freccia soltanto schematica fra equilibri. Temperature 100/400 K, barre 100/400 px da x 130 a 1 px/K. Ramo compressione r 8→fattore termico 4, ΔU>0 e W_del_gas<0. Flowchart∛8=2→2²=4→100·4 con ognuna delle frecce separata, nessuna trasformazione improvvisa o libera implicita. Distinte scale e grandezze.'
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






CANDIDATE_REF='2adf56f740437cf4c1dc37ef594dbb117684e069'
SOURCE_READING='Primaria80 U5-02 prima di candidati/chiavi/opzioni, SHA2568fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65. Fonte prompt soltanto e80 derivazioni individuali persistite. Nessuna chiave anticipata nei messaggi autore: soltantoSHA, file e ipotesi generali. Dopo la primaria, tutti16 candidati finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. SVG XML e rendering nativo completo riletti, leggi/domini e calcoli rifatti. Mapping sui reali corsi/lezioni Cric C3, senza inventareID. Package/binding/asset byte identici al pin finale e al ROOT integrato. Nessun authoring importato; reviewer diverso dall’autore.'
REVIEWED_PACKAGE_SHA256='d8fb5a987b9dc5dd86f43c9ce34ebdac94176454e1ae08062c511680c2e08f25'
REVIEWED_BINDINGS_SHA256='55ae257d3adf9f71d78504cca666cd3126392a0dafa7dfea9c79358f891c2675'
REVIEWED_CANDIDATES={'AR-u5-adiabatic-monatomic-01': '75276499e8e92e3d2428d469a548b6170c1b41ea1c30781df1f5d98cd0efc81c', 'AR-u5-adiabatic-monatomic-02': 'e98d6b58fcdff0e6a2f7d29fcbc926e05e1408e5677fcfb645f70e5f1d1119b4', 'AR-u5-adiabatic-monatomic-03': '11689d32176d3099b06aac815c352d1fe1db6e965cb66db0d5531759c20ccf81', 'AR-u5-adiabatic-monatomic-04': '9ac7c8508936e75a508a0c52f474787f6f8a9b812f2166760a16cb9d0c130e2c', 'AR-u5-adiabatic-monatomic-05': '02388816b8b0de678056482ee610d334bf4dda12bbd174b27200c23e98e0001c', 'AR-u5-adiabatic-monatomic-06': '9bdc21d2297bd869d0fea15b14db5d46ca544fbaf9b0b167795720acb780024f', 'AR-u5-adiabatic-monatomic-07': 'c8fc89e15fedf055fff8e219ff9d5d395a261874c58668a2a7ebb60ee58ddf45', 'AR-u5-adiabatic-monatomic-08': '532a256067f0440c04ee8efefcab3fa8bcbc64bb2a5b82738447f2fdd7f011dd', 'AR-u5-adiabatic-monatomic-09': '85f998cec18daaedb2d87d64214999f9ce57c2b7e31d79cb9cd9b25367b03713', 'AR-u5-adiabatic-monatomic-10': '27a36ffea1b3d496ec24b391b9e38057badfd5c9248a151db59e43ad601c47ec', 'AR-u5-adiabatic-monatomic-11': 'bd821838d42d3daffed0ae62e3eb32932a8dc46ff3e89a106cdf0119c80ee047', 'AR-u5-adiabatic-monatomic-12': '164311f4c4c6d746a317b0d9c1acca11e7a957abd36159001c97f00422ed3cf9', 'AR-u5-adiabatic-monatomic-13': '5446334604cf56b601a710e5ab9ef47e02e7350d0549a8fff05e4d84dd57ff9c', 'AR-u5-adiabatic-monatomic-14': 'b61d95921dfbfcb4ece8fa2411d63659c216132bb02f3cc7c8608335ef9982d8', 'AR-u5-adiabatic-monatomic-15': '939a5a0884233b8e664da1e2d926c2a4a5ecc4b1d3b968b2f75c66344375038c', 'AR-u5-adiabatic-monatomic-16': '96e2c9187fb50f90ed4d2e38ae901eccadce948e8f5c5f2433e9ededca55b9c1'}
READ_SOURCE_SHA256={'u5-adiabatic-monatomic-01': '87fb85661b034f74df06b119bd05f0ddd033aa80130757af1a8441198ec35622', 'u5-adiabatic-monatomic-02': 'dd3cd9d8686f2e5ca50e12da34186ea29a28d0a49b1b14a73e49508ad4ccec74', 'u5-adiabatic-monatomic-03': '5fabc7bea760fb515c85eae8436b334f398123c00860046c0d77e6f20a861922', 'u5-adiabatic-monatomic-04': 'c3d5adb83eaf1c21804cbfc4ba045562d58c6dd2ced812034bd18178624b354c', 'u5-adiabatic-monatomic-05': '4c4d69336256a19b003d4b41049d506742fd6ca92e2a03057673db8e01e07951', 'u5-adiabatic-monatomic-06': '14ebf47bbc61f0f632bc629a17752bcc1c1a0afe535afffd5daddbd16f862bdd', 'u5-adiabatic-monatomic-07': '5f9d1bf0897c6981c5be13daa3f08b27465884a7f3097d7042d9ea1fe215bfa5', 'u5-adiabatic-monatomic-08': '52e658f28885d5dc3b41ae863350669bb4ca3cc544cbe624eafa7a173a40034e', 'u5-adiabatic-monatomic-09': '9511b4ba90bf35274d7bf94ed6b8e7ac98a6243151aa07d0a07ae480b10a14de', 'u5-adiabatic-monatomic-10': 'c503b7459e4e5845d399a63c31eec728f40d8a86c4b01c99af8745b37e757e90', 'u5-adiabatic-monatomic-11': 'cfa9b225b7bf94176acd99be5c14fe6f2b9e36a05705c42b1a53cca2f8b2a5ae', 'u5-adiabatic-monatomic-12': 'fd6a72abdffecbf02db83909b2bbe87598e1e04d64a58e1dd41dd5f6a75d8b32', 'u5-adiabatic-monatomic-13': '1922f60c2aec0824c3eccc8eb57854a359b86ed4e70b084a5fa31fdf70e46a60', 'u5-adiabatic-monatomic-14': '1b630e1a716bf97a30772a2e61042372c6701c19a8c9ab9ae50e7cbd6ae589ac', 'u5-adiabatic-monatomic-15': 'b55b03991275fe9b14285cf10d0c7253c5fe676645094240fa8d46d846b4e3ac', 'u5-adiabatic-monatomic-16': '70f53cc770a935718e43013adf081374dc06929584999fcd2ead41ac20444d8b'}
