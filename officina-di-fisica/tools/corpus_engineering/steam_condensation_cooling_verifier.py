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
FAMILY='steam-condensation-cooling'
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


def heat(mass,interval):
    mass,interval=map(sp.sympify,(mass,interval))
    if mass<=0 or interval<=0:raise ValueError('Positive mass and cooling interval required; liquid margin is checked separately')
    return mass*(2400+4*interval)
def liquid_interval_ok(interval,margin):
    return 0<sp.sympify(interval)<sp.sympify(margin)

def inverse_mass(energy,interval):
    if energy<=0:raise ValueError('Positive ceded heat modulus required')
    return sp.cancel(energy/heat(1,interval))
@lru_cache(maxsize=1)
def oracle():
    m,c,d,L,E,a,b,z=sp.symbols('m c d L E a b z',positive=True)
    signed=-m*L+sp.integrate(m*c,(z,d,0));law=-signed;assert sp.expand(law-m*(L+c*d))==0
    inv=sp.solve(sp.Eq(E,law),m)[0];ratio=sp.cancel(law.subs({m:a*m,d:b*d})/law)
    unique([m*(L+c*d),m*(L-c*d),L+c*d,m*L,m*c*d],law)
    unique([E/(L+c*d),E*(L+c*d),(L+c*d)/E,E/L,E/(c*d)],inv)
    unique([a*(L+c*b*d)/(L+c*d),a*b,a/b,a+b,(L+c*b*d)/(L+c*d)],ratio)
    assert liquid_interval_ok(25,100) and liquid_interval_ok(50,100) and liquid_interval_ok(150,200) and not liquid_interval_ok(100,100)
    A,B=heat(1,25),heat(2,50);gain,offset=calibrate(A,B,5001,10401);assert (gain,offset)==(2,1)
    x=sp.symbols('x',real=True);roots=sp.solve(sp.Eq(x*(2400+4*x)/25,2500),x);assert roots==[-625,25]
    assert (A,B,heat(sp.Rational(3,2),sp.Rational(75,2)))==(2500,5200,3825)
    assert (SI.Quantity(1,'g')*SI.Quantity(2400,'J/g')+SI.Quantity(1,'g')*SI.Quantity(4,'J/g/K')*SI.Quantity(25,'K')).to('J').magnitude==2500
    return [A,'J','Q_c = m (L_v + c_l ΔT)','Da 2500 a 5000 J',inverse_mass(A,25),(A-2400)/4,heat(1,50)/A,5000-A,'m = Q_c / (L_v + c_l ΔT)','κ₁ (L_v + c_l κ₂ ΔT_A) / (L_v + c_l ΔT_A)',B/A,(A+B)/2,((sp.Rational(52,25)*A/2-2400)/4)/25,inverse_mass(15600/(7500/A),50),inverse_mass((10001-offset)/gain,25),next(r for r in roots if r>0)]

MANUAL=['Un grammo cede 2400 J nella condensazione e 4·25=100 J raffreddando il liquido: Q_c=2500 J. Il calore ricevuto con segno è −2500 J.', 'Il modulo Q_c è un’energia in J. J/g descrive un costo specifico e W una potenza; entrambi i contributi mL_v e mc_lΔT sono in J.', 'I due tratti cedono entrambi calore: Q_c=mL_v+mc_lΔT. Si sommano i moduli e si pone Q=−Q_c; non si assume ΔU=Q durante un percorso isobaro.', 'Il costo rimane 2500 J/g. Da 1 a 2 g a pari intervallo di raffreddamento Q_c va da 2500 a 5000 J.', 'm=2500/[2400+4·25]=1 g. Si usa l’energia per unità di massa dell’intero percorso, non il solo costo latente.', 'Q_c/m−L_v=100 J/g; dividendo per 4 J/(g K) si ottiene ΔT=25 K. Il ramo liquido impone inoltre il limite assegnato.', 'A=2500 J, B=2400+4·50=2600 J a massa uguale; rapporto 2600/2500=26/25. Il costo latente è invariato.', 'Proposta 5000 J meno valore corretto 2500 J dà +2500 J. È un errore sul modulo, non il segno del calore del campione.', 'Q_c=m(L_v+c_lΔT) con parentesi positiva J/g. L’inversa m=Q_c/(L_v+c_lΔT) ha unità g.', 'Variare massa e intervallo fra prove dà κ₁(L_v+c_lκ₂ΔT_A)/(L_v+c_lΔT_A), rispettando in entrambe il ramo liquido.', 'A cede 2500 J; B con 2 g e 50 K cede 5200 J. Rapporto 5200/2500=52/25.', 'Media (2500+5200)/2=3850 J. Ingressi medi 3/2 g e 75/2 K danno 3825 J: le due medie differiscono di 25 J.', 'B deve cedere 5200 J con 2 g: 2600 J/g. Togliendo 2400 e dividendo per 4 si ottiene ΔT_B=50 K; rapporto con 25 K pari a 2.', 'A: S=7500 su Q_c=2500 J dà q=3 J⁻¹. B: S=15600 implica 5200 J; a 50 K il costo è 2600 J/g, massa 2 g.', 'Q_A=2500 e Q_B=5200 J, letture 5001 e 10401: q=2 J⁻¹, b=1. S_C=10001 dà 5000 J; a 25 K massa 2 g.', 'Con m=(1/25 g/K)ΔT fra prove, Q_c=2500 J dà x²+600x−15625=0. Si cercano due interi di prodotto −15625 e somma 600: 625 e −25, perché 625·25=15625. Quindi (x−25)(x+625)=0, con radici 25 e −625; soltanto 25 K ha massa positiva e intervallo positivo. Resta il limite liquido esplicito.']

DISTRACTORS=['2400 e 100 J omettono ciascuno un tratto; 2300 J sottrae due cessioni; −2500 J è Q con segno, non Q_c.', 'J/g e J/(g K) sono coefficienti specifici, W potenza, K intervallo.', 'Sottrarre il sensibile è incompatibile con due cessioni; nessun reciproco dà il calore totale.', '2500 J ignora la massa doppia; il quadrato sovrastima entrambi i tratti.', 'Solo L_v produce 25/24 g; solo il sensibile produce 25 g, entrambi errati.', 'Q_c/(mc_l) dà 625 K e salta L_v; il residuo corretto è 100 J/g.', '2 perde il latente costante; 25/26 è il reciproco; 1 ignora il raffreddamento maggiore.', '−2500 J inverte lo scarto; 5000 J copia la proposta e zero la accetta.', 'Il denominatore è energia per massa: reciproco o prodotto non è l’inversa corretta.', 'κ₁κ₂ moltiplica indebitamente L_v per κ₂, mentre L_v resta assegnato.', 'Due segue la sola massa; 26/25 il solo intervallo; 25/52 inverte il risultato.', '3825 J usa ingressi medi; 7700 J è somma; 1350 J metà differenza.', '52/25 non è il rapporto degli intervalli; 2 ricostruisce ΔT_B=50 K.', 'S grezzo produce massa 6 g; occorre q=3 J⁻¹.', 'Senza b si usa 10001/2 J e si ricostruisce S=10002; 4 g e 1 g sono altre letture.', '−625 K ha massa negativa; 50 K dà Q_c=5200 J sotto il vincolo e non 2500.']

ASSUMPTIONS=['Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Vapore saturo secco a pressione costante, massa positiva conservata. Prima condensa completamente alla temperatura T_s, poi il liquido si raffredda di ΔT>0 con ΔT<T_s−T_fus, senza congelare. L_v=2400 J/g e c_l=4 J/(g K) sono valori ideali assegnati. Q_c è il modulo positivo ceduto; Q=−Q_c. Non si identifica questo calore isobaro con ΔU senza considerare il lavoro. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.']

UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'g', 6: 'K', 7: '', 8: 'J', 9: 'g', 10: '', 11: '', 12: 'J', 13: '', 14: 'g', 15: 'g', 16: 'K'}

NUMERIC_UNITS={1: 'J', 5: 'g', 6: 'K', 14: 'g'}

SUFFIX={8: ' J', 12: ' J', 15: ' g', 16: ' K'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='SVG completo letto in XML e rendering nativo a piena altezza. Q_c cumulativo cresce 0→2400→2500 J; plateau alla condensazione e poi T−T_s scende 0→−25 K. Scale intrinseche 3/20 coordinate/J e 4 coordinate/K; barre 360/15/375 per 2400/100/2500 J, confronto 200/416/308 per 2500/5200/3850 J a scala 2/25. Il segno negativo è differenza termica, non temperatura assoluta negativa.'

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

REVIEWED_PACKAGE_SHA256='33422f2a5606da11acebac5829783812d224e3739c95d84938f80d51e2df141f'

REVIEWED_BINDINGS_SHA256='ce3aec7381718958c688edf71b2c482afa3a1b26205c21c8e921398e5687d17b'

REVIEWED_CANDIDATES={'AR-u5-steam-condensation-cooling-01': '0087c2502a4386ac1cd03ede6b1bb1764da9fd27530252f52e31c9671f7f9948', 'AR-u5-steam-condensation-cooling-02': '943a86c1e1d07011777881aae747dddeaf2bcf1cd4edff4382128f586c077977', 'AR-u5-steam-condensation-cooling-03': 'da0de8e2e014c15ffa52bb33c018aaa1278c894d1585e26b882141ec5cea60ca', 'AR-u5-steam-condensation-cooling-04': '23ea44360b7a659bdddc7f3d33ea7cce4a0e99a29d2dd33fd55eb2111adc2856', 'AR-u5-steam-condensation-cooling-05': '6cf20510dd40c29922989576ba8059ba8f2b9d1da414fdbc55bde322fe20f5f9', 'AR-u5-steam-condensation-cooling-06': 'bdde2de6acae11145221c4b827da6fcb57e5f5dfa77a773a9e95e3a9b56b3250', 'AR-u5-steam-condensation-cooling-07': '5b9dc366cf506e3d32cad6418bb436a95d2bc222acb5f1345a334a4a3ca69573', 'AR-u5-steam-condensation-cooling-08': 'a120bcbf477044f8d2011aba4a514b32e1823f74cfcf530c6b663bcc4aa0c261', 'AR-u5-steam-condensation-cooling-09': 'bd423c124864dc05944a8ba3e1afd355435da90f61d8e31b976307b2ac11d298', 'AR-u5-steam-condensation-cooling-10': 'fa697efa2d5ceb469c62f2f22dedd0cbe29b703ed8be226550fd1a17518e9c22', 'AR-u5-steam-condensation-cooling-11': '9cc0277d998c354a1a033357108a74b87a14caeed7dba1dde3135986bc5741c2', 'AR-u5-steam-condensation-cooling-12': 'daab3c1e441e289ed68dc9fb1271550bd9e42fc23bd5430e05b2a464a7b0e9a0', 'AR-u5-steam-condensation-cooling-13': '4992ea2c9c4852323debd339974c6988835d80a8df5b9bce753fde7fef6f0aea', 'AR-u5-steam-condensation-cooling-14': '1d0038fbb84eda124c90558593b18fcf0342a3d701afb25a3b2a99d278623cac', 'AR-u5-steam-condensation-cooling-15': 'd4f17ccc528e7fcaa654e7b268f171a1964e4c77fcc69fe6b44a970d6740e5c3', 'AR-u5-steam-condensation-cooling-16': '5c05c1b9e4e49e69c56bd3e2fc1871046aa83ecb64ddbb70b581b63fe8117222'}

READ_SOURCE_SHA256={'u5-steam-condensation-cooling-01': '05d76179e88d4c238ff1463e1581c015ba5c4956200ef04d1fc33dbaf4bc72d5', 'u5-steam-condensation-cooling-02': 'a14cb03ad5701dc749ade7394231c53758e3653a07c5b9bea79d25b4a0eb1d6c', 'u5-steam-condensation-cooling-03': '6b1cfb59af31482c006455ec56fa0c98b94aec5ce86848e93dbb9ef629ede522', 'u5-steam-condensation-cooling-04': '3da65357b7cc8c55231b4af7a12a3658fe2311adaf8079d927bb96d3cfeb2338', 'u5-steam-condensation-cooling-05': '2153fb046fc0af85d88ad8db8ef2df7db85bf5885d07811d8087f26e7c40fc0f', 'u5-steam-condensation-cooling-06': 'ac6cbb784bcf8d30fef67d6fb2ed3d2243ca279338bfbf23c3769753cc8fe928', 'u5-steam-condensation-cooling-07': '379ef212e8dda176477f1134304dd48e2e3173600199f55a0523025d501e4403', 'u5-steam-condensation-cooling-08': '02d483387ef529103d04975b0dac9475c910431cc6b79025baa6616a39ac6d9c', 'u5-steam-condensation-cooling-09': '970edf22334c4588707c034a59afde9ba3d902310fe4a6e6ffad1ba1313ffcf1', 'u5-steam-condensation-cooling-10': '4d595301d3ad1ee3d233cc87c0a398788bc0bbf9d936106bcb3324cddd9def21', 'u5-steam-condensation-cooling-11': '04fbaf4280e7b34f12305f5822381deb037ad22b685afa0705efc826ac97572e', 'u5-steam-condensation-cooling-12': 'b8cd5e8b2201e1c88e34f0a86261ff88e259fab7f8b60f7ecd4303af20152adc', 'u5-steam-condensation-cooling-13': '14ae2942e3aa0518b177c83609710e9b6fc4f79ca5f40fc9dc690f614942f0c9', 'u5-steam-condensation-cooling-14': '669bd868f4fdf4a25a49e8874f9a09e22349eeeba2747d3b3caec1a5504c81ba', 'u5-steam-condensation-cooling-15': 'f978767139b08cd76abbc23aee5e1039fa56abac35f72717f38ce7892913a210', 'u5-steam-condensation-cooling-16': '22f29dcc7eb9d99a8babb3682d0207f764f115fa19a5e810cfdd9746c3dd77b1'}
