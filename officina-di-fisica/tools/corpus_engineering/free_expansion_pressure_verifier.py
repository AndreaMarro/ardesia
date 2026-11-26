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
FAMILY='free-expansion-pressure'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C3-L07', 2: 'C3-L07', 3: 'C3-L10', 4: 'C3-L07', 5: 'C3-L07', 6: 'C3-L07', 7: 'C3-L07', 8: 'C3-L07', 9: 'C3-L07', 10: 'C3-L07', 11: 'C3-L07', 12: 'C3-L07', 13: 'C3-L07', 14: 'C3-L07', 15: 'C3-L07', 16: 'C3-L07'}
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

def final_pressure(initial,vacuum,initial_volume=sp.Integer(1)):
    if initial<=0 or vacuum<=0 or initial_volume<=0:raise ValueError('Positive absolute pressure and both volumes required')
    return sp.cancel(sp.sympify(initial)*initial_volume/(initial_volume+vacuum))

def vacuum_inverse(initial,final,initial_volume=sp.Integer(1)):
    if not initial>final>0 or initial_volume<=0:raise ValueError('Expansion requires initial>final>0')
    return sp.cancel(initial_volume*(sp.sympify(initial)/final-1))

def constrained_vacuum(final,coefficient=sp.Integer(100),initial_volume=sp.Integer(1)):
    if coefficient<=0 or initial_volume<=0 or not 0<final<coefficient*initial_volume:raise ValueError('Constraint pressure range violated')
    return sp.cancel(final*initial_volume/(coefficient*initial_volume-final))

@lru_cache(maxsize=1)
def oracle():
    p,f,V,v,nR,T,Cv,a,b,d=sp.symbols('p f V v nR T Cv a b d',positive=True)
    # Q=W_external=0, then ideal U(T) with positive heat capacity implies dT=0.
    deltaT=sp.solve(sp.Eq(Cv*sp.Symbol('deltaT'),0),sp.Symbol('deltaT'))[0]
    assert deltaT==0
    final=sp.solve(sp.Eq(f*(V+v)/(nR*T),p*V/(nR*T)),f)[0]
    inverse=sp.solve(sp.Eq(f,final),p)[0]
    inverse_v=sp.solve(sp.Eq(f,final),v)[0]
    ratio=sp.cancel(final.subs({p:a*p,v:b*v})/final)
    unique([f*(V+v)/V,f*V/(V+v),f*v/V,f*(V+v),f/(V+v)],inverse)
    unique([a*(V+v)/(V+b*v),a/b,a*b,(V+b*v)/(a*(V+v)),a*V/(b*v)],ratio)
    entropy=nR*sp.log((V+v)/V)
    assert entropy.subs(v,0)==0 and sp.diff(entropy,v)>0
    assert sp.diff(final,p)>0 and sp.diff(final,v)<0
    first=final_pressure(sp.Integer(100),sp.Integer(1))
    second=final_pressure(sp.Integer(1),sp.Integer(2))
    gain,offset=calibrate(first,second,101,sp.Rational(5,3))
    assert (first,second,gain,offset)==(50,sp.Rational(1,3),2,1)
    target=first/150;target_v=vacuum_inverse(sp.Integer(1),target)
    assert target_v==2
    assert (first+second)/2==sp.Rational(151,6)
    assert final_pressure(sp.Rational(101,2),sp.Rational(3,2))==sp.Rational(101,5)
    constrained=sp.solve(sp.Eq(f,final.subs(p,d*v)),v)[0]
    assert sp.simplify(constrained-f*V/(d*V-f))==0
    assert constrained_vacuum(sp.Integer(50))==1
    Q=SI.Quantity
    assert (Q(100,'kPa')*Q(1,'L')/(Q(1,'L')+Q(1,'L'))).to('kPa').magnitude==50
    assert (Q(50,'kPa')*(Q(1,'L')+Q(1,'L'))/Q(1,'L')).to('kPa').magnitude==100
    assert (Q(50,'kPa')*Q(1,'L')/(Q(100,'kPa/L')*Q(1,'L')-Q(50,'kPa'))).to('L').magnitude==1
    assert SI.Unit('J/K').dimensionality!=SI.Unit('K').dimensionality
    return [first,'kPa','ΔT = 0 e ΔS > 0','Da 50 a 100 kPa',
      inverse.subs({f:first,V:1,v:1}),inverse_v.subs({p:100,f:first,V:1}),
      final_pressure(sp.Integer(100),sp.Integer(3))/first,100-first,
      'p₁ = p_f (V₀ + V_v) / V₀','κ₁ (V₀ + V_v) / (V₀ + κ₂ V_v)',
      second/first,(first+second)/2,target_v,
      inverse.subs({f:1/(150/first),V:1,v:2}),
      inverse.subs({f:(201-offset)/gain,V:1,v:1}),constrained_vacuum(sp.Integer(50))]

MANUAL=['V_f=1 L+1 L=2 L. T invariata e quantità fissa danno p_f=100 k Pa·1/2=50 k Pa, non zero: il vuoto era il comparto prima del rilascio, non il gas finale.', 'Pressione ha unità Pa o k Pa, dimensione energia/volume=forza/area. Il prefisso cambia il numero ma non la dimensione. Il rapporto dei volumi resta puro.', 'Q=0 e lavoro esterno 0 implicano ΔU=0; per gas ideale Tf=T1. Entropia aumenta: ΔS=n R ln(V_f/V_i)>0. Espansione spontanea irreversibile, quindi non si applica TV^(γ−1)=costante né si deduce ΔS=0 dall’adiabaticità. La risposta precisa dipenderà dalla coppia di variazioni che il candidato espliciterà; questi risultati sono fissati prima delle opzioni.', 'Con volume finale 2 L costante, p_f è metà di p_1. Da p_1=100 a 200 k Pa, p_f va da 50 a 100 k Pa. È un confronto fra preparazioni, non una compressione lungo il rilascio.', 'p_1=p_f(V_0+V_v)/V_0=50·2=100 k Pa. Il rapporto di volume è adimensionale e positivo.', 'V_v=V_0(p_1/p_f−1)=1 L·(100/50−1)=1 L. L’inversa è positiva perché p_1>p_f; con p_1≤p_f non descriverebbe il vuoto positivo richiesto.', 'A pf 50 k Pa. B con V_v 3 L occupa 4 L e ha pf 25 k Pa. Rapporto 1/2; il fattore sul solo vuoto è 3, ma il volume finale contiene anche 1 L iniziale.', 'Proposto 100 k Pa meno corretto 50 k Pa dà+50 k Pa. La proposta mantiene il valore iniziale ignorando l’aumento di volume finale a T costante.', 'p_1=p_f(V_0+V_v)/V_0=p_f(1+V_v/V_0), V_0=1 L. L’addizione deve essere fra volumi, non fra 1 puro e un volume senza normalizzazione.', 'p_f, B/p_f, A=κ₁(V_0+V_v)/(V_0+κ₂V_v). Il volume iniziale V_0 resta 1 L e non viene scalato; perciò non si semplifica genericamente a κ₁/κ₂.', 'A50 k Pa. B1 k Pa distribuito su 3 L da 1 L iniziale dà 1/3 k Pa. Rapporto(1/3)/50=1/150. Nessuna divisione decimale necessaria.', 'Media=(50+1/3)/2=151/6 k Pa. Valutando il modello su p_1 medio 101/2 k Pa e V_v medio 3/2 L si ottiene 101/5 k Pa, diverso: 151·5=755 contro 101·6=606. Statistica a pesi uguali distinta dal modello su medie degli ingressi.', 'Targetpf, B=(1/150)50=1/3 k Pa. Con p_1, B1 k Pa: V_v, B=1 L·(3−1)=2 L; rapporto rispetto a 1 L iniziale A è 2.', 'Apf 50 k Pa, S150⇒q 3 k Pa⁻¹. S_B1⇒pf, B1/3 k Pa. V_v 2 L⇒p_1, B=(1/3)·3=1 k Pa. Letture nella stessa scala e nessun offset.', 'Riferimenti pf, A50 k Pa, pf, B1/3 k Pa. q=(101−5/3)/(50−1/3)=2 k Pa⁻¹, b 1. S_C201⇒pf, C100 k Pa. Con V_v 1 L, p_1, C200 k Pa.', 'Vincolo p_1=(100 k Pa/L)V_v. Con x=V_v/(1 L)>0, pf=100 x/(1+x) k Pa=50 k Pa⇒100 x=50+50 x⇒x 1. V_v 1 L, p_1=100 k Pa, unica soluzione positiva. L’uscita ammissibile sotto tale vincolo è 0<pf<100 k Pa.']
DISTRACTORS=['100 k Pa ignora il volume aggiunto; una pressione gas iniziale moltiplicata per ΔV non è lavoro esterno di questa espansione nel vuoto. La legge reversibile p V^γ non si applica.', 'L, J e K non sono pressioni. k Pa/L omette il volume al numeratore; il rapporto fra volumi mantiene k Pa.', 'Q=0 non implica ΔS=0. L’adiabatica reversibile si raffredda compiendo lavoro, ma questo processo irreversibile non compie lavoro esterno. ΔT=0 deriva da U ideale e ΔS>0 dal volume accessibile maggiore. ΔT ha unità K e ΔS J/K.', '25 k Pa rende inversa la dipendenza da p₁, 200 k Pa copia il nuovo ingresso. Zero non segue da volumi finiti positivi; 50 ignora il raddoppio preparato.', '25 k Pa applica ancora il fattore 1/2 e viola p₁>p_f.50 k Pa ignora il cambiamento di volume.100 k Pa restituiscono 50 k Pa finali.', '2 L è il volume finale intero, non il vuoto. Volumi negativi sono esclusi; la differenza di pressioni non ha unità di volume. Il divisore p_f è strettamente positivo.', '1/3 confronta soltanto i vuoti e dimentica V₀.2 capovolge il rapporto delle pressioni; 3 trasforma la dipendenza in una diretta.1 ignora l’espansione ulteriore.', '−50 k Pa scambia i termini, 100 copia la proposta, 0 la accetta, 25 non è lo scarto. Non si inferisce un riscaldamento dalla proposta sbagliata.', 'La seconda espressione ripete la legge diretta. Il solo V_v omette V₀; gli ultimi due prodotti hanno pressione·volume e pressione/volume. Unicità simbolica e dimensionale generale.', 'κ₁/κ₂ scalerebbe tutto il volume finale, ma V₀ resta fisso. Il prodotto inverte l’effetto del volume; la quarta è reciproca e l’ultima omette termini geometrici.', '1/100 segue solo p₁; 2/3 solo il rapporto inverso dei volumi totali; 1/3 copia la pressione B in k Pa; 150 è il reciproco.', '151/3 è somma, 149/6 metà differenza, 25 ignora B.101/5 risponde al modello su ingressi medi, non alla media delle pressioni finali.', '3 è il fattore sul volume totale, non sul vuoto.150 riguarda le pressioni e non passa direttamente a V_v quando cambia anchep₁. Inversa esplicita dà 2 L e rapporto 2.', '3 k Pa tratta S come pressione fisica; 1/3 k Pa èla finale, non l’iniziale. Guadagno e rapporto dei volumi vanno invertiti in successione.', '100 k Pa si ferma alla finale; 201 k Pa omette l’offset e dà S202; 400 k Pa dà S401; 50 k Pa dà S51. Solo 200 k Pa restituiscono S201.', '−1 L viola il dominio; 2 L danno 200/3 k Pa e 1/2 L danno 100/3 k Pa. L’alternativa infinita è confutata dall’equazione lineare con coefficiente positivo 50 k Pa. Denominatore diverso da zero e unica soluzione.']
ASSUMPTIONS=['Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Stesso campione ideale chiuso, recipiente totale rigido e isolato, espansione nel vuoto. Nessun calore o lavoro esterno, energie macroscopiche uguali agli estremi. U dipende da T con capacità positiva, quindi ΔT=0. Il volume aumenta e ΔS=n R ln(V_f/V₀)>0 con n, R positivi definiti. Risposta qualitativa su due componenti: ΔT in K e ΔS in J/K, non un unico scalare dimensionato. Calcolo numerico non richiesto; prova energetica ed entropica specifica sì.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.', 'Gas ideale chiuso, espansione nel vuoto in recipiente totale rigido e termicamente isolato; nessun trasferimento energetico mediante pareti, nessuna altra forma di lavoro, energie cinetiche/potenziali macroscopiche uguali nei due equilibri. Q=0 e W_esterno=0, quindi ΔU=0; per il gas ideale con capacità termica positiva U dipende da T, dunque T_f=T_1. Non si suppone una successione di stati di equilibrio durante l’espansione. Con V_0=1 L, n costante e pressione assoluta p_f=p_1 V_0/(V_0+V_v). V_v>0 implica 0<p_f<p_1. Entropia ΔS=n R ln[(V_0+V_v)/V_0]>0, calcolabile su un percorso reversibile immaginario: l’adiabaticità del percorso reale non impone ΔS=0. L’inversa del vuoto richiede p_1>p_f>0.']
UNITS={1: 'kPa', 2: 'kPa', 3: '', 4: 'kPa', 5: 'kPa', 6: 'L', 7: '', 8: 'kPa', 9: 'kPa', 10: '', 11: '', 12: 'kPa', 13: '', 14: 'kPa', 15: 'kPa', 16: 'L'}
NUMERIC_UNITS={1: 'kPa', 5: 'kPa', 6: 'L', 13: '1', 14: 'kPa'}
SUFFIX={8: ' kPa', 12: ' kPa', 15: ' kPa', 16: ' L'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti: due rettangoli esterni identici 400×140 px, setto iniziale a x 305 metà del segmento 105..505. V₀1 L e V_v 1 L, finali 2 L alla medesima scala; punti schematici non misurano temperatura o probabilità. Pressioni 100/50 k Pa: barre 300/150 px da x 150 a 3 px/k Pa. Nessuna freccia di processo presente: caption 01 finale riletta su 673 d 145 descrive correttamente la sequenza dei pannelli; asset e 15 altri record identici alla prima lettura. ΔU=0 e T_f=T₁ riguardano equilibri estremi; ΔS>0 non è un’adiabatica reversibile.'
NON_NUMERIC_DISTRACTORS={16: {'Infinite quantità positive'}}
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






CANDIDATE_REF='673d14536a72996b52c74f357e21e8042014cee1'
SOURCE_READING='Primaria80 U5-02 prima di candidati/chiavi/opzioni, SHA2568fcf9fac8628518c925d20eb460d5f1c60ef67be4a3cedecd111b84f3a9bce65. Fonte prompt soltanto e80 derivazioni individuali persistite. Nessuna chiave anticipata nei messaggi autore: soltantoSHA, file e ipotesi generali. Dopo la primaria, tutti16 candidati finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. SVG XML e rendering nativo completo riletti, leggi/domini e calcoli rifatti. Mapping sui reali corsi/lezioni Cric C3, senza inventareID. Package/binding/asset byte identici al pin finale e al ROOT integrato. Nessun authoring importato; reviewer diverso dall’autore.'
REVIEWED_PACKAGE_SHA256='46e722ac7b26e32022b6f1561b040fa0549c09a00b636d5d1724eeb79b8c4edb'
REVIEWED_BINDINGS_SHA256='7de19383dab35352da4a34b9c4f11b0eb336dbbe7dcfb3aa556a56f2aed3f50b'
REVIEWED_CANDIDATES={'AR-u5-free-expansion-pressure-01': 'adec70b52f8cefc5493aaee9aed10eda388c67431375e7686865db6fcfb37d8f', 'AR-u5-free-expansion-pressure-02': '451625364dbc1d967af0e85918ace4a8def0b7d2e79328824b7573366ae76e27', 'AR-u5-free-expansion-pressure-03': '889fe3da76998d841ed80f934c76f07370b3652a7332c5d831275d4b52968f77', 'AR-u5-free-expansion-pressure-04': '33306ea12c6beb80d95b4074e4add36255cf1684463596c54a5eb89b0e9cc9ec', 'AR-u5-free-expansion-pressure-05': 'd5e2eaaeeefd1fb21001768d6ca5ed9332f984f49c2a5fbfc5586e16b8d95851', 'AR-u5-free-expansion-pressure-06': '88a9f303529514222b4daebd3ce412851275c3003ffe50747c140d884868203e', 'AR-u5-free-expansion-pressure-07': '03b6aa94c77f800ef631a32425573f8aa4395e8d74c2a0a4af1e6e097165350e', 'AR-u5-free-expansion-pressure-08': '0fc31f77a432d20a0d930afef321b8f5a4fc2c6af0b1aba38671a09a6d0edeb3', 'AR-u5-free-expansion-pressure-09': '0a2abdb81fa7d4ef2b76bd277e7a195eebea542112177e1ba3cb544eafe02060', 'AR-u5-free-expansion-pressure-10': '11624f354587feec859ec7e07a9edf7c0acd5a79c5ecb051e234c646a3875561', 'AR-u5-free-expansion-pressure-11': '4fe4578d62247e81b31bd85589e33ab0a13c6304099f11f5145e095822f776ec', 'AR-u5-free-expansion-pressure-12': '69c45a1c8d84d478574dfde79c1fd86b53c49067be51c71a3dbdea23519b6433', 'AR-u5-free-expansion-pressure-13': '882be0ce26316cbe08d7bdd7ef754cc8aaa813e638eea85f103a67b43148bef9', 'AR-u5-free-expansion-pressure-14': '963b194acef9564cf3a56d7d7953fd551470f09b747ffd4b0d8526b37545bf9b', 'AR-u5-free-expansion-pressure-15': '7aea1f5322c5ee6ecfaed8d0c683b3b9c3b8854aa27ce4458ae92aa775fdd362', 'AR-u5-free-expansion-pressure-16': '48544cd19fb2ee33d22865d9dfb3781eb35a80266d2eac6c492bd0edb1193cb5'}
READ_SOURCE_SHA256={'u5-free-expansion-pressure-01': 'ac9cc9fbdb08793cadf52d7fe98d33fa2ee3450a7ffdb94e412e550a4499604b', 'u5-free-expansion-pressure-02': 'a2e95f26e07bf04aca9202f2744c3e5919835a40e880b5839056d5bc0f42b77c', 'u5-free-expansion-pressure-03': 'e569062a963ca2c5f2b9cebdc0ea0300a6ba92a1350e870477de92cc4ac729fe', 'u5-free-expansion-pressure-04': '37a89c7279a5a6679d5b717eb6448a23000057252dfd5cfdc35e2032248098e4', 'u5-free-expansion-pressure-05': 'ac0537e0a521b87e6c96f1ff671cc28a6a80a3cc88130db63377a2fd0b24c655', 'u5-free-expansion-pressure-06': '1b76d5baac717dceb02e9174e1e978badb5ec00ca2888de86979c3dbd9b274e0', 'u5-free-expansion-pressure-07': 'adfceb2cca6e250ad8d305b1875c57e9bb85b93b0abfc90587201e5e31c61854', 'u5-free-expansion-pressure-08': '3ae70d1dfb91ef3e9ef12a87ae943596e6171f1732539b67724ad6f795563f84', 'u5-free-expansion-pressure-09': '3f0129acce4b141fb8cf821ff48c6735e33db42fe26462b243ed93c7e5aea712', 'u5-free-expansion-pressure-10': '1fa7a5ed316ea85e55ec6e951712a6a815c414fc6134148ec39d47c41b8b186b', 'u5-free-expansion-pressure-11': '9badebb95fdcfc83b0444077d08560e197b5edadf8ebc92c95a36d77db499176', 'u5-free-expansion-pressure-12': '7ab80a0f264560b7e3d259627d0c228d2d4473a408451344cf927ff0a5045d4e', 'u5-free-expansion-pressure-13': '0469e2d39085b13a72104878a523f7927334f9b4460acc47638a64a043061a72', 'u5-free-expansion-pressure-14': '3d0ae637c32a700295c3bd4e609542efc7566d8f618bab05185ee2aba75a0f37', 'u5-free-expansion-pressure-15': '3c60f87a78f7022ad501ed79cc53b36c7df745c40cf47f60fdcb13d6006b4471', 'u5-free-expansion-pressure-16': '4b8de2176a9831632755529d9eb3d4dc7e726ba9555b308601e6eda9754e3d9e'}
