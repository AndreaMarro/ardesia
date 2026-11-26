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
FAMILY='freezing-time'
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


def duration(mass,power):
    mass,power=map(sp.sympify,(mass,power))
    if mass<=0 or power<=0:raise ValueError('Positive mass and net constant thermal extraction required')
    return sp.cancel(380*mass/power)
def inverse_mass(time,power):
    if time<=0 or power<=0:raise ValueError('Positive extraction and duration required')
    return sp.cancel(sp.sympify(time)*power/380)
@lru_cache(maxsize=1)
def oracle():
    m,c,d,L,P,t,a,b,z=sp.symbols('m c d L P t a b z',positive=True)
    ceded=-sp.integrate(m*c,(z,d,0))+m*L;law=ceded/P
    unique([m*(c*d+L)/P,m*c*d/P,m*L/P,P/(m*(c*d+L)),m*(c*d-L)/P],law)
    inv=sp.solve(sp.Eq(t,law),m)[0];unique([P*t/(c*d+L),t/(P*(c*d+L)),P*(c*d+L)/t,P*t/L,P*t/(c*d-L)],inv)
    ratio=sp.cancel(law.subs({m:a*m,P:b*P})/law);unique([a/b,b/a,a*b,a*a/b,a-b],ratio)
    A,B=duration(1,10),duration(2,1);gain,offset=calibrate(A,B,77,1521);assert (A,B,gain,offset)==(38,760,2,1)
    assert duration(sp.Rational(3,2),sp.Rational(11,2))==sp.Rational(1140,11) and (A+B)/2==399
    assert sp.cancel(law.subs({m:P/10,c:4,d:20,L:300}))==38
    Q=SI.Quantity;assert ((Q(1,'g')*(Q(4,'J/g/K')*Q(20,'K')+Q(300,'J/g')))/Q(10,'W')).to('s').magnitude==38
    return [A,'s','t = m [c_l (20 K) + L_f] / P','Passa da 38 a 76 s',inverse_mass(38,10),sp.Rational(380,38),duration(1,20)/A,76-A,'m = Pt / [c_l (20 K) + L_f]','κ₁/κ₂',B/A,(A+B)/2,(sp.Rational(760,20*A))/10,inverse_mass(2280/(114/A),1),inverse_mass((153-offset)/gain,10),'Infinite: ogni P>0 con m=dP']

MANUAL=['Un grammo cede 4·20=80 J nel raffreddamento e 300 J nel congelamento: totale 380 J. A 10 W t=38 s, composto da 8 e 30 s.', 'J/W=J/(J/s)=s. La durata non è un’energia o una temperatura; il plateau richiede tempo e calore sottratto non nulli.', 'Con P netta costante, t=(mc_l·20 K+mL_f)/P. I due tempi si sommano, perché entrambi i tratti cedono energia; ci si ferma appena solido a 0 °C.', 'Da 1 a 2 g a potenza 10 W il calore passa 380→760 J e il tempo 38→76 s; entrambi i tratti raddoppiano.', 'Pt=10·38=380 J; a 380 J/g si ottiene m=1 g. Considerare il solo latente perderebbe gli 80 J/g sensibili.', 'P=380 J/(38 s)=10 W termici netti. Il dato non determina l’assorbimento elettrico senza un ulteriore modello del dispositivo.', 'A: 380/10=38 s; B: 380/20=19 s. Rapporto 1/2: più potenza riduce il tempo, senza cambiare il calore totale.', 'Proposta 76 s meno corretto 38 s dà +38 s. Il tempo aggiunto non appartiene al processo arrestato al ghiaccio a zero.', 'm=Pt/[c_l·20 K+L_f]. Il numeratore è un’energia e il denominatore 380 J/g, quindi il risultato è in grammi.', 'Con costo specifico costante fra prove, t_B/t_A=(m_B/m_A)/(P_B/P_A)=κ₁/κ₂. Fattori uguali lasciano la durata invariata.', 'A dura 38 s; B con 2 g e 1 W dura 760 s. Rapporto 20: fattore 2 per massa e 10 per potenza inversa.', 'Media durate (38+760)/2=399 s. I parametri medi 3/2 g e 11/2 W darebbero 1140/11 s, altra operazione.', 'Il tempo bersaglio è 20·38=760 s e il calore per 2 g è 760 J. P_B=1 W, rapporto con 10 W pari a 1/10.', 'S_A=114 su 38 s dà q=3 s⁻¹. S_B=2280 dà 760 s; a 1 W sono 760 J, quindi 2 g.', 'Riferimenti 38 e 760 s, letture 77 e 1521: q=1444/722=2 s⁻¹, b=1. S_C=153 dà 76 s; con 10 W sono 760 J, massa 2 g.', 'Con m=(1/10 g/W)P fra preparazioni, t=d·380 J/g=38 J/W=38 s per ogni P>0. Ogni potenza positiva ha massa positiva corrispondente; nessuna seconda equazione indipendente.']

DISTRACTORS=['8 s e 30 s omettono una fase ciascuno; il plateau continua a sottrarre calore senza cambiare temperatura.', 'J energia, W potenza, J/g costo specifico e K intervallo non sono durata.', 'Il reciproco è s⁻¹; sottrarre il latente tratterebbe il congelamento come assorbimento del campione.', '19 s rende inversa la dipendenza dalla massa; 152 s usa il quadrato, 40 s copia la temperatura iniziale.', '380/300 g usa solo fase; 19/4 g solo sensibile; copiare 38 dimentica energia specifica e potenza.', '300/38 e 80/38 W omettono un tratto; t/Q_c ha unità W⁻¹.', '2 inverte la dipendenza dalla potenza; 1 ignora il cambio, 1/4 e 4 applicano un quadrato.', '−38 s scambia l’ordine, 76 s copia la proposta, zero la accetta, 2 è rapporto senza unità.', 'Dividere per P non ricostruisce Pt; solo L_f omette 80 J/g e differenza 80−300 dà massa negativa.', 'κ₂/κ₁ è reciproco; κ₁κ₂ cresce erroneamente con potenza; κ₁² aggiunge un quadrato; differenza dà zero per prove uguali.', '2 segue massa, 10 segue potenza; 1/5 manca l’inversione della potenza e 1/20 capovolge B/A.', '1140/11 s usa parametri medi; 798 s somma, 361 metà differenza e 399/2 dimezza due volte.', '1/20 ignora massa doppia, 10 inverte il confronto; 20 segue tempo direttamente, 2 soltanto massa.', 'S grezzo come secondi produce 6 g; 20 è rapporto dei tempi ma non delle masse perché cambia P.', '153/76 g omette b e usa 765 J; 4 g danno S=305 e 1 g S=77; 76 g copia la durata.', 'Esempio 1 g e 10 W non è unico; P=0 è esclusa e non può sottrarre energia positiva; 38 g copia il tempo.']

ASSUMPTIONS=['Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Campione di massa positiva conservata, da acqua a 20 °C a ghiaccio completamente solido a 0 °C, pressione atmosferica e assenza di sottoraffreddamento. c_l=4 J/(g K), L_f=300 J/g ideali. Potenza termica netta estratta P>0 costante in entrambi i tratti, distinta dall’assorbimento elettrico; capacità recipiente e altri scambi trascurati. Il processo si arresta alla completa solidificazione senza raffreddare ulteriormente il ghiaccio. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.']

UNITS={1: 's', 2: 's', 3: 's', 4: 's', 5: 'g', 6: 'W', 7: '', 8: 's', 9: 'g', 10: '', 11: '', 12: 's', 13: '', 14: 'g', 15: 'g', 16: ''}

NUMERIC_UNITS={1: 's', 5: 'g', 6: 'W', 11: '1', 14: 'g'}

SUFFIX={8: ' s', 12: ' s', 15: ' g'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='SVG completo letto in XML e rendering nativo a piena altezza. Curva (100,160)→(164,320)→(404,320) a scala 8 coordinate/s e 8 coordinate/K: 20→0 °C in 8 s poi plateau fino a 38 s. Barre energetiche 80+300=380 e barre temporali 64+240=304 per 8+30=38 s, ciascun pannello a scala propria e origine comune. Nessun tratto dopo completa solidificazione.'

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

REVIEWED_PACKAGE_SHA256='f3a6d6b6c12a68a0842c63d30596182bd7529afa287857aeb08d174b5e40b2c1'

REVIEWED_BINDINGS_SHA256='ad04234becc7f715ee6b01200e44113922b82b63f49b87daa6c885a83c74cf4a'

REVIEWED_CANDIDATES={'AR-u5-freezing-time-01': '5162f22ff1cf5477c3dd18e7b9d28d01a3837cedfae137de10ad50be5a383bec', 'AR-u5-freezing-time-02': '4ac2ac0e3129bb4dd83dc3a490201a95fcc0e7b61959ad1269072d109109112d', 'AR-u5-freezing-time-03': 'a405abcd93e5b3c9f0692ca27a15a780ae38151075ab25a8a9264e5f0c9c7084', 'AR-u5-freezing-time-04': '2a91643908577f15157098e6423b00662ef834f3a1b2c8daacc57f04c824c18b', 'AR-u5-freezing-time-05': 'd1c2bdb9650ae2f80e188594a1fe629f98368fc4b03ab3b6417ed6dc534bd4d6', 'AR-u5-freezing-time-06': 'a0a7e7963b9c96d8949e7fcfb8ae132f7fb48d53e60e7a4f212fe8975b4505b8', 'AR-u5-freezing-time-07': '0b599ffc3763fa443ae38aacc0cfaff9f77b5932f402345984f242a7ea0e0682', 'AR-u5-freezing-time-08': '66b234d85aa7abf258d7cd044ee8de410b0cc83d631942787546af85cc5d9f61', 'AR-u5-freezing-time-09': 'a876a126ab72c89122d50856478235f37a185be1f6c49dd22dadc912d2bf2b78', 'AR-u5-freezing-time-10': 'e81888246331754e731102922aae10ae416edcc7c74f04b4b55b9baae3082b21', 'AR-u5-freezing-time-11': 'd6ec4527b21906d91750e4149e3d18da640e534664737a6bb8c720b3eb9e8785', 'AR-u5-freezing-time-12': '7b84018c67c3c8e9febb368f26ef7eb69a25a1a63ccfd23a3e078aec293b31cd', 'AR-u5-freezing-time-13': '6e98f200d33a76983edcb3f56e486897db5aadafbd9defb9162ffd1175bcea08', 'AR-u5-freezing-time-14': '1b33f1e96fffc0d0fcdb354f5662fe2bc12ffa80d64203c620a50891d243991b', 'AR-u5-freezing-time-15': 'e3a492c285e987a3d436a405197bd0f5e45eda373aa396d60686c8d6913fee3c', 'AR-u5-freezing-time-16': 'f57562a678b0db9ef818141e89dbb6f0b4b103937d258fdc34a3abd02d972494'}

READ_SOURCE_SHA256={'u5-freezing-time-01': 'd8573e4f6d1849fac0d68c6a579307bf3b91b8b359be0cf3df30d2baa3398337', 'u5-freezing-time-02': '2726bf881615baf302c1656bd4efd4a2b374533cfeaa8d604b1f4883396c82c2', 'u5-freezing-time-03': '8c7a755e81e452d74e47bd9ac6e6dbab6bcfe2bb7541513ba504256341b57ab4', 'u5-freezing-time-04': '10e1632383911d545fcba9f28d429e526811ed0c4361fa46a9b2b7d0137ed9f3', 'u5-freezing-time-05': '0812acdcb1b6d414638cb8de63a52fa60d8e8d81df0ed31e71412ffc30dc041c', 'u5-freezing-time-06': '81188b283f7368e18675b0a09f19f2dc139a951d07359dfaf4578a5fff26e0fd', 'u5-freezing-time-07': '0f904dd7ec7d19b28f6de433065012005db3e646b616a6e4c1247ba7f1c4ba2e', 'u5-freezing-time-08': '2e1340fe2489f67049a7e683dad99fff11e39d90e21289ee86af2f43a49df613', 'u5-freezing-time-09': '2e887c1815c8ecb4249ab89fd8c1ee77cad8132a225c5f0deeed73800a625e56', 'u5-freezing-time-10': '33127bee010192e64aa108642b58874a2131e761ad3d41c3de88b3934c7411e8', 'u5-freezing-time-11': '720ccf4273eccbd21c9e0c58c834965bf001df6ecc7af2367ce091f512a170ec', 'u5-freezing-time-12': '8375d2af0de8e6521156636dca943d845f422a5c4eed7eef6fae4dac1627e515', 'u5-freezing-time-13': 'dcf83b397d4f37cad5ec84611ef1f0c6708c17f7e2f1646cd2890658590f1190', 'u5-freezing-time-14': '7006ae2cd9c7450f4a9db740189e05724fab3a123c63150486096304104589a0', 'u5-freezing-time-15': 'f4adfa87b099a66956889ce97cd9e680bcc175671ab352ec8fbec79265119b8a', 'u5-freezing-time-16': '1b25d910a0262418985a5668c42930019fb17a2f6625986d681cc94e86475a24'}
