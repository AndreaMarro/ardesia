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
FAMILY='ice-final-temperature'
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


def increment(energy,mass):
    energy,mass=map(sp.sympify,(energy,mass))
    if mass<=0 or not 300*mass<energy<700*mass:raise ValueError('Complete fusion and liquid below boiling required')
    return sp.cancel((energy-300*mass)/(4*mass))
def total_heat(mass,interval):
    mass,interval=map(sp.sympify,(mass,interval))
    if mass<=0 or not 0<interval<100:raise ValueError('Positive liquid increment below boiling required')
    return mass*(300+4*interval)
@lru_cache(maxsize=1)
def oracle():
    m,c,d,L,E,a,b,T0=sp.symbols('m c d L E a b T0',positive=True)
    balance=sp.Eq(E,m*L+m*c*d);law=sp.solve(balance,d)[0];assert law==(E-m*L)/(m*c)
    unique([T0+law,T0+E/(m*c),T0+(m*L-E)/(m*c),T0+(E-m*L)/c,T0+E/(m*L)],T0+law)
    unique([m*(L+c*d),m*c*d,m*L,m*(L-c*d),(L+c*d)/m],sp.solve(balance,E)[0])
    ratio=sp.cancel(law.subs({E:a*E,m:b*m})/law)
    unique([(a*E-b*m*L)/(b*(E-m*L)),a/b,a*b,(a*E-b*m*L)/(E-m*L),a-b],ratio)
    A,B=increment(800,sp.Rational(5,2)),increment(1000,2);gain,offset=calibrate(A,B,11,101);assert (A,B,gain,offset)==(5,50,2,1)
    assert increment(900,sp.Rational(9,4))==25 and (A+B)/2==sp.Rational(55,2)
    assert sp.cancel(law.subs({E:320*m,L:300,c:4}))==5
    assert (SI.Quantity(50,'J')/(SI.Quantity(sp.Rational(5,2),'g')*SI.Quantity(4,'J/g/K'))).to('K').magnitude==5
    assert SI.Quantity(5,'degC').to('kelvin').magnitude==sp.Rational(27815,100)
    return [A,'°C','T_f = T_m + (Q − m L_f) / (m c_l)','Da 5 a 25 °C',total_heat(sp.Rational(5,2),5),sp.Rational(800,320),increment(800,2)/A,10-A,'Q = m (L_f + c_l Θ)','(κ₁ Q_A − κ₂ m_A L_f) / [κ₂ (Q_A − m_A L_f)]',B/A,(A+B)/2,sp.Rational(1000,500)/sp.Rational(5,2),total_heat(2,150/(15/A)),total_heat(sp.Rational(5,2),(51-offset)/gain),'Infinite: ogni m>0 con Q=(320 J/g)m']

MANUAL=['La fusione di 5/2 g costa 750 J. Restano 800−750=50 J su capacità 4·5/2=10 J/K: Θ=5 K, lettura finale 5 °C.', 'Si chiede il punto termometrico T_f in °C. L’incremento Θ è 5 K, mentre il punto assoluto è 278,15 K: numeri distinti.', 'Dal bilancio Q=mL_f+mc_lΘ si ricava Θ=(Q−mL_f)/(mc_l), quindi T_f=T_m+Θ. Il dominio 0<Θ<100 K esclude fasi ulteriori.', 'A: residuo 50 J dà 5 K. B: 1000−750=250 J dà 25 K alla stessa capacità 10 J/K. Letture 5 e 25 °C, non scalate come Q totale.', 'A 5 °C servono 300+4·5=320 J/g; per 5/2 g Q=800 J. Si ricostruiscono latente e sensibile.', 'm=800/(300+4·5)=800/320=5/2 g. Con questa massa 750 J fondono e 50 J riscaldano: entrambe le soglie sono rispettate.', 'A ha lettura 5 °C. Con Q=800 J e massa B=2 g il residuo è 200 J su 8 J/K, lettura 25 °C. Rapporto numerico Celsius 5, uguale qui a quello degli incrementi da 0 °C.', 'Proposta 10 °C meno 5 °C è un intervallo di +5 K. Non si aggiunge 273,15 agli scarti.', 'Moltiplicare Θ per mc_l e aggiungere mL_f dà Q=m(L_f+c_lΘ); la parentesi è in J/g e il prodotto in J.', 'Si rapportano i due residui divisi per le rispettive capacità: (κ₁Q_A−κ₂m_AL_f)/[κ₂(Q_A−m_AL_f)]. Le due finali positive rendono il rapporto definito.', 'B: 1000−2·300=400 J su 8 J/K dà 50 °C; A=5 °C. Rapporto delle letture 10, non delle temperature assolute.', 'Media letture (5+50)/2=55/2 °C. Q medio 900 J e massa media 9/4 g darebbero invece 25 °C; la media statistica non è una nuova mescolanza.', 'Bersaglio 50 °C: costo 300+4·50=500 J/g. Q_B=1000 J dà m_B=2 g e m_B/m_A=4/5; finale sotto ebollizione.', 'Θ_A=5 K, S_A=15 implica q=3 K⁻¹. S_B=150 dà Θ_B=50 K; con 2 g Q_B=2(300+200)=1000 J.', 'Riferimenti Θ=5 e 50 K, S=11 e 101: q=90/45=2 K⁻¹ e b=1. S_C=51 dà Θ_C=25 K; Q_C=(5/2)(300+100)=1000 J.', 'Q=(320 J/g)m cancella m nella legge: Θ=(320−300)/4=5 K. Ogni m>0 con Q=320m è ammesso; ad esempio 1 g/320 J e 5/2 g/800 J. Non identificabile la scala.']

DISTRACTORS=['Q/(mc_l)=80 K omette 750 J latenti; zero ignora 50 J residui; −5 K rovescia il residuo.', 'J è energia, J/g costo specifico, J/K capacità e W potenza; non punti termometrici.', 'Il termine latente va sottratto da Q, poi si divide per tutta la capacità mc_l, non solo c_l.', '25/4 °C scala Q totale perdendo l’offset latente; 100 °C usa tutta l’energia come sensibile.', '50 J è solo sensibile e 750 J solo fusione; entrambi insufficienti al percorso completo.', '2 g danno 25 °C; 8/3 g finiscono alla fusione senza incremento; 40 g non fondono tutti, 1 g supera il ramo.', '4/5 e 5/4 confrontano masse, 1/5 inverte le letture, 2 non ricostruisce i residui.', '−5 K scambia l’ordine; 10 K copia la proposta; zero e 2 K non sono la differenza.', 'Un solo termine omette un tratto, il segno meno toglie energia richiesta; dividere per m dà J/g².', 'Il solo κ₁/κ₂ perde il costo latente; omettere κ₂ perde la capacità finale.', '5/4 segue solo Q, 4/5 solo massa; 1/10 capovolge B/A e 5 appartiene al caso a Q comune.', '25 °C usa gli ingressi medi; 55 °C è somma e 45/2 °C metà differenza; 5 °C ignora B.', '5/4 è il reciproco; 10 è il fattore sulla lettura, 2 il numero della massa B.', 'S=150 come kelvin dà 1800 J e viola il limite liquido; 400 J omette fusione.', '1005 J omette b e produce S=52 anziché 51; 250 e 750 J sono singoli tratti.', 'La coppia di riferimento non è unica; massa zero è esclusa prima della cancellazione e annulla il denominatore.']

ASSUMPTIONS=['Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Ghiaccio a 0 °C, pressione atmosferica, L_f=300 J/g e c_l=4 J/(g K) prescritti. Massa positiva, mL_f<Q<m(L_f+c_l·100 K): fusione completa e acqua finale sotto ebollizione. Recipiente e dispersioni trascurati. Θ è incremento da T_m=0 °C, non temperatura assoluta; i rapporti richiesti sono espressamente di letture Celsius e qui coincidono con quelli di Θ. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.']

UNITS={1: 'K', 2: 'K', 3: 'K', 4: 'K', 5: 'J', 6: 'g', 7: '', 8: 'K', 9: 'J', 10: '', 11: '', 12: 'K', 13: '', 14: 'J', 15: 'J', 16: ''}

NUMERIC_UNITS={1: '°C', 5: 'J', 14: 'J'}

SUFFIX={8: ' K', 12: ' °C', 15: ' J'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='SVG completo letto in XML e rendering nativo a piena altezza. Curva (100,320)→(400,320)→(420,220): 2/5 coordinata/J dà 750 J latenti e 50 J sensibili; 20 coordinate/K dà aumento 5 K. Barre 300/20/320 per 750/50/800 J, origini comuni. Incrementi 5/50/55/2 K con larghezze 20/200/110 a scala 4 coordinate/K; corrispondenti letture Celsius distinte dagli assoluti.'

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


CANDIDATE_REF='5579fe2187e28f34c6dfa8632c07113f46610559'

SOURCE_READING='Primaria indipendente di tutti gli 80 prompt U5-03, prima di candidati, opzioni o chiavi: SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Fonte intera pin 5cf, SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Dopo la primaria, tutti i 16 candidati del lotto letti integralmente, ogni blocco, formula, opzione, hint e feedback, metadati e didascalie. Derivazioni ricontrollate sui dati finali; SVG XML e rendering nativo integrali letti. Catalogo reale C3-L01/L03/L04 verificato. Nessun authoring importato; autore e revisore distinti. ROOT identico ai byte finali B 9d647bca e, per 17309, 5579fe21.'

REVIEWED_PACKAGE_SHA256='cd948a716d1f37b25b2a623cefbe1e44b78ac0df8431228afc903d74f9a28549'

REVIEWED_BINDINGS_SHA256='c6466c2c4457c37597b8286a133779784a356ddc7c096d5bdb10ebd27a2fc15d'

REVIEWED_CANDIDATES={'AR-u5-ice-final-temperature-01': 'e468f36a9d83f91f8d2ca4fcd0563fa36bbfcd745e75fb9d2f81f533496aaf9c', 'AR-u5-ice-final-temperature-02': '30d7c7678cf4b74fbbc99b7ccaa8f1390ce97e67d19cac05ce642865f1f883d2', 'AR-u5-ice-final-temperature-03': '346b5ef3e3ea337ed34e948d140031a3e3a7584c4909296cfb9469404f4361af', 'AR-u5-ice-final-temperature-04': 'ec0271bec1f976f2ce69bff88ae60fdb67c7775f49569b3637e7654eaddbc381', 'AR-u5-ice-final-temperature-05': '47434260a369eec0372ae2eb57e1c4fb592a7eeeed14d8352ac1b184aafaf3e2', 'AR-u5-ice-final-temperature-06': '895bfb675933f229e0f4fb3eefcb808592b1e11e54a849658aed6108831ca211', 'AR-u5-ice-final-temperature-07': '08cefce920019caf468a67f9a14a2f8a00911e678630f9d148fd5b0490e4d940', 'AR-u5-ice-final-temperature-08': 'dba2ace0f9d72e2995ab9fd908914b5b6404c7416a43803efb54a756a17a11ef', 'AR-u5-ice-final-temperature-09': '85aef4f649afd50e9cab4f3c3307956ce07995d0a5a9236034b0a85dfc59f068', 'AR-u5-ice-final-temperature-10': '7bb988578bd5b58477be3792bbf3b54c31d729bc2f6b06457e9fab9d430e0eee', 'AR-u5-ice-final-temperature-11': '5003225ca81b012cd1c0952214c559df319a8c129b6343c6f78386260e6bbf4c', 'AR-u5-ice-final-temperature-12': 'd68a1c1b17a42820d334c16a48a6ca2e2a3665d225a1ebf802c0e8af158b7203', 'AR-u5-ice-final-temperature-13': '376c3c5e7dde9142c7e5d819ee3985ce986e70ce3be6b1775a1dd77c85623289', 'AR-u5-ice-final-temperature-14': '488bde715c5fb44fa6719e70cb621866cd9d2db7801bd8e4446be2718e8e6fe1', 'AR-u5-ice-final-temperature-15': '0966c9892147ecba264e90a7bc3e9a07d9f6b63d144bb339c9b38c2bc6260078', 'AR-u5-ice-final-temperature-16': '7b4eb129c34829256f13a79daa8be29d10c9f4abcd381320c03ddc5b4e6a0d53'}

READ_SOURCE_SHA256={'u5-ice-final-temperature-01': '177d7ac31c401e6610d21924786e9f80acd63e06c6bfc17022886e99fc2a0392', 'u5-ice-final-temperature-02': 'c88b7f7c3cb4f20c6a0902173ee75aefd1a711ada1a6d1fdfe09c8d29cbe9854', 'u5-ice-final-temperature-03': '2be458721a2c549d8d601cdafc01fff661432b3835915906ab48e8cc6bac3502', 'u5-ice-final-temperature-04': '5b0b4dfe3fdc56367832240a4e1b9b0e294cc9c5b2b62ccb62a4476ff4fd682e', 'u5-ice-final-temperature-05': 'dbc6093809052973c05a50f97718a192f295a542387a213a0556da8f0daca64d', 'u5-ice-final-temperature-06': 'f523490baf93342954ac3d8ceb14eaf65d322c0db723661f7e811ff2a9cc962a', 'u5-ice-final-temperature-07': 'f01fc63456aedbd97eee93624ce3349fb6a4082657868b64dcbd94f71b94c015', 'u5-ice-final-temperature-08': '6b93ddc5a027184bc11829e87d11d23be4c2be029b0079881b53f785b0db9861', 'u5-ice-final-temperature-09': 'c80d4a1ab6f235223f03c1d759667937747f9809a16e7b092cea6bbedd814bad', 'u5-ice-final-temperature-10': '0a84aea575c480950d0c82d0b42f12e791c28b9d393c9e8177e5e3ff5b08a405', 'u5-ice-final-temperature-11': '1e67379b0537e10fa0694bb10d144922738b7b829a7e74a0d151ed3f0ba0a219', 'u5-ice-final-temperature-12': '2ed50766f6899aae20cf680300548989afc95f114ec1d26f68a7711afd268713', 'u5-ice-final-temperature-13': 'd002a356647ff6250617c004bf2e82a3cdff2cc8a69ea1f87c4e260d56b910c9', 'u5-ice-final-temperature-14': 'f6b3878d6613e316867a983e4a7ca2857d919c8e477bf234924582cb4f1b4bae', 'u5-ice-final-temperature-15': 'cc752f7ef9239948d21895ab8b1fd26ad875a01a274f0a08fc542bfb5eeb108b', 'u5-ice-final-temperature-16': 'bee7664d0b7f70a934e8282a25d740a964bbece0b63da573082fcd7aa21592e2'}
