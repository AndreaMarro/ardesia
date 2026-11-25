"""Independent full-record fluid review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json'
FAMILY='bernoulli-height-speed'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

def exact_literal(raw):
    """Bounded arithmetic AST for rational and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\()', '*',raw)
    if not re.fullmatch(r'[0-9r()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
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

@lru_cache(maxsize=1)
def oracle():
    rho,g,h,v,P=sp.symbols('rho g h v P',positive=True)
    ps,pj=sp.symbols('ps pj',real=True)
    law=sp.solve(sp.Eq(ps,pj+rho*g*h+rho*v*v/2),ps)[0]-pj
    inverse=sp.solve(sp.Eq(P,law),h)[0]
    inverse_v=sp.sqrt(sp.solve(sp.Eq(P,law),v*v)[0])
    if sp.simplify(law-rho*g*h-rho*v*v/2)!=0:raise ValueError('Bernoulli height/kinetic energy balance failed')
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.factor(law.subs({h:k*h,v:l*v})/law)
    for opts,want in [([rho*g*h+rho*v*v/2,rho*g*h-rho*v*v/2,rho*v*v/2-rho*g*h,rho*g*h,rho*v*v/2],law),
                      ([(P-rho*v*v/2)/(rho*g),(P+rho*v*v/2)/(rho*g),P/(rho*g),(rho*v*v/2-P)/(rho*g),(P-rho*v*v/2)*rho*g],inverse)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Bernoulli symbolic alternatives not unique')
    U,W=sp.symbols('U W',positive=True)
    factors=(k*U+l*l*W)/(U+W)
    if sp.simplify(ratio.subs({h:U/(rho*g),v:sp.sqrt(2*W/rho)})-factors)!=0:raise ValueError('Bernoulli independent scaling failed')
    F=lambda height,speed:sp.simplify(law.subs({rho:1000,g:10,h:height,v:speed})/1000)
    A,B=F(1,2),F(2,4)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,25),sp.Eq(q*B+z,57)],(q,z))
    C=(45-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,22):raise ValueError('Height Bernoulli affine calibration failed')
    if (A+B)/2-F(sp.Rational(3,2),3)!=sp.Rational(1,2):raise ValueError('Height Bernoulli mean distinction failed')
    x=sp.Symbol('x',real=True);roots=sp.solve(sp.Eq(5*x+x*x/2,12),x)
    if roots!=[-12,2]:raise ValueError('Height Bernoulli physical roots failed')
    u=SI.Quantity
    hydro=(u(1000,'kg/m**3')*u(10,'m/s**2')*u(1,'m')).to('kPa')
    kinetic=(u(1000,'kg/m**3')*u(2,'m/s')**2/2).to('kPa')
    inverse_si=((u(12,'kPa')-kinetic)/(u(1000,'kg/m**3')*u(10,'m/s**2'))).to('m')
    square=(2*(u(12,'kPa')-hydro)/u(1000,'kg/m**3')).to('m**2/s**2')
    gain=(u(36,'')/(hydro+kinetic)).to('1/kPa')
    constrained=(u(Fraction(1,2),'s')*u(2,'m/s')).to('m')
    if (hydro.magnitude,kinetic.magnitude,inverse_si.magnitude,square.magnitude,gain.magnitude,constrained.magnitude)!=(10,2,1,4,3,1):raise ValueError('Pint Fraction Bernoulli dimensional proof failed')
    return [A,'kPa','Δp = ρgh + ρv²/2','Da 12 a 22 kPa',inverse.subs({P:12000,rho:1000,g:10,v:2}),inverse_v.subs({P:12000,rho:1000,g:10,h:1}),F(1,4)/A,24-A,'h = (Δp − ρv²/2) / (ρg)','(κ₁ U + κ₂² W) / (U + W)',B/A,(A+B)/2,sp.Integer(2),inverse.subs({P:28000,rho:1000,g:10,v:4}),inverse.subs({P:C*1000,rho:1000,g:10,v:2}),roots[1]]


MANUAL=['Bernoulli: p_s = p_j + ρgh + ρv²/2. A h=1 m, v=2 m/s: quota 10000 Pa e cinetico 2000 Pa, somma 12000 Pa = 12 kPa; p_s=112 kPa assoluti.', 'ρgh e ρv² hanno dimensione M/(LT²), energia per volume. Pa=N/m²; kPa è la stessa dimensione con fattore 1000. Non occorre un calcolo numerico autonomo oltre al controllo dimensionale.', 'Con z_s=0 e z_j=h>0, superficie quasi ferma e getto in moto, la differenza p_s−p_j deve fornire sia ρgh sia ρv²/2: entrambi i termini positivi.', 'Quota 1→2 m a v=2 m/s porta ρgh da 10 a 20 kPa; termine cinetico fisso 2 kPa. Δp passa da 12 a 22 kPa.', 'Prima si sottraggono i 2 kPa cinetici da 12; h=(10 kPa)/(10 kPa/m)=1 m. Serve Δp>ρv²/2 per h>0.', 'Il residuo cinetico è 2 kPa. v²=2·2000/1000=4 m²/s², rami ±2 m/s; il modulo positivo assegnato è 2 m/s.', 'A 12 kPa, B con stessa quota e velocità 4 m/s: 10+8=18 kPa. Rapporto 18/12=3/2; il termine di quota non quadruplica.', 'Corretto 12 kPa; proposta meno corretto 24−12=+12 kPa. La proposta eccede la somma dei contributi presenti.', 'ρgh=Δp−ρv²/2; dividere per ρg>0 dà h=(Δp−ρv²/2)/(ρg). Numeratore positivo, pressione su pressione per metro lascia metri.', 'U=ρgh_A e W=ρv_A²/2 sono pressioni. In B il primo termine è κ₁U, il secondo κ₂²W. Il rapporto è (κ₁U+κ₂²W)/(U+W).', 'A: 10+2=12 kPa. B: 20+8=28 kPa. Rapporto 28/12=7/3, senza decimalizzazione.', 'Media (12+28)/2=20 kPa. Ingressi medi h=3/2 m, v=3 m/s danno 15+9/2=39/2 kPa, inferiore di 1/2 kPa.', 'Target (7/3)·12=28 kPa. Quota B costa 20 kPa; residuo 8 kPa, v_B²=16 m²/s²→v_B=4 m/s. Rapporto 4/2=2.', 'q=36/(12 kPa)=3 kPa⁻¹. S=84 dà Δp=28 kPa; velocità 4 m/s costa 8 kPa, quota 20 kPa→h=2 m.', 'Riferimenti Δp=12,28 kPa e letture 25,57: q=32/16=2 kPa⁻¹, offset 1. S=45 dà 22 kPa; a v=2 restano 20 kPa→h=2 m.', 'Vincolo h=(1/2 s)v. Per x=v/(1 m/s), Δp/(1 kPa)=5x+x²/2. Dato 12: x²+10x−24=(x−2)(x+12)=0; soltanto x=2 dà h=1 m e v=2 m/s positivi.']
DISTRACTORS=['2 kPa copiano il cinetico e 10 la sola quota; 24 raddoppia la somma. La differenza 12 non è p_s assoluta 112.', 'm/s velocità, m²/s² energia per massa, N forza e kg/m³ densità: solo kPa è pressione.', 'I segni meno farebbero fornire energia all’accelerazione o a una salita; termini singoli trascurano una richiesta energetica assegnata.', '24 raddoppia tutta la differenza, 6 la dimezza, 12 ignora la nuova quota e 14 aggiunge 2 kPa anziché i 10 del metro aggiunto.', 'Senza sottrarre il cinetico h=6/5 m; aggiungendolo h=7/5 m. Entrambi falliscono la ricostruzione 10h+2=12.', '4 è v² nelle unità del quadrato, non v. Il ramo negativo non è il modulo positivo richiesto; residuo cinetico deve essere positivo.', '2 segue v linearmente, 4 attribuisce il quadrato anche alla quota, 2/3 reciproco, 1 ignora il nuovo v.', '−12 inverte lo scarto, 24 proposta, 0 accetta e 6 dimezza ancora il risultato.', 'Il più conta due volte la parte cinetica, l’omissione la attribuisce alla quota, differenza invertita negativa; prodotto per ρg dimensionalmente errato.', 'Prodotto dei κ non descrive una somma; κ₂ senza quadrato perde l’energia cinetica, reciproco inverte, somma dei fattori omette i pesi U,W.', '3/7 reciproco; 2 solo quota; 4 solo cinetico; 28 è la pressione B numerica, non rapporto.', '40 somma, 10 doppia metà, 39/2 ingressi medi, 16 differenza fra uscite.', '1/2 reciproco, 7/3 bersaglio di pressione, 4 rapporto dei quadrati, 4/3 non realizza 28 kPa.', 'S=84 scambiata per kPa darebbe (84−8)/10=38/5 m. Serve prima dividere per q.', 'Quote 1,3/2,5/2,3 m a v=2 danno letture 25,35,55,65; solo 2 m dà 45.', '−12 è vera radice algebrica ma dà velocità e quota negative. Non si elimina per la sua grandezza: è fuori dal dominio.']
ASSUMPTIONS=['Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).', 'Stessa linea di corrente, acqua incomprimibile ideale ρ=1000 kg/m³, g=10 m/s² uniforme, regime stazionario con grande serbatoio e velocità superficiale trascurata. Getto h>0 sopra la superficie, velocità v>0, nessuna macchina o perdita lungo il tratto; acqua liquida. p_j=100 kPa assoluti e p_s=p_j+Δp; differenze nella stessa convenzione. Vincoli fra prove, non h(t).']
UNITS={1: 'kPa', 2: 'kPa', 3: 'kPa', 4: 'kPa', 5: 'm', 6: 'm/s', 7: '', 8: 'kPa', 9: 'm', 10: '', 11: '', 12: 'kPa', 13: '', 14: 'm', 15: 'm', 16: 'm/s'}
NUMERIC_UNITS={1: 'kPa', 5: 'm', 6: 'm/s', 14: 'm', 16: 'm/s'}
SUFFIX={8: ' kPa', 12: ' kPa', 15: ' m'}
SVG_REVIEW='XML e rendering completo letti. Superficie y=300 e getto y=200, dislivello 100 px a 100 px/m. Freccia del getto 60 px a 30 px/(m/s). Δp=12 kPa è somma 10+2: barre 200+40=240 px a 20 px/kPa. Grafico contro v², non v: origine (100,1450), scale 10 px/(m²/s²) e 10 px/kPa; intercetta (100,1350) per 10 kPa, punti (140,1330) per (4,12) e (260,1270) per (16,18). Le frecce degli assi sono path separati. Pressioni assolute esplicite.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u3-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_Bernoulli_continuity_or_ballistic_motion','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='54c5064253058dddcec2c05b8c628c552345fe5c'
SOURCE_READING='All 80 original U3-03 prompts in these five families individually read and solved before opening candidate packages. Disclosure: prior author handoff already exposed 104-06 equal ranges and doubled A speed, plus qualitative information about radicals, a quartic and renamed h/H. These facts independently rederived from source models; no claim of wholly blind key reading for 104-06. All 16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing. Never imports candidate authoring; real C2-L005/L006 lessons reread.'
REVIEWED_PACKAGE_SHA256='66ac52170e47b1a42138d5828259adeb80d767cb80b5bcb77d9871c2c070b622'
REVIEWED_BINDINGS_SHA256='7291abe44c891b306c5698f15ca02fc296035fcba42aaf9f7efe2166cfd8bbcf'
REVIEWED_CANDIDATES={'AR-u3-bernoulli-height-speed-01': '78d8e0b1fb0b127c0a430e6db4007e728a9e47cb9c199a52c8d745b0476ca1c3', 'AR-u3-bernoulli-height-speed-02': '21857ec92daf715b6c02aebbbfdd190aba42bb53447c68b1b67531c001cf3062', 'AR-u3-bernoulli-height-speed-03': '2aab875d3c5af02eb24a9ba1cf05a849d95849d2c24e39968e7a3b8bb2ec705a', 'AR-u3-bernoulli-height-speed-04': 'b1f931595bc545bb39d28ff8dacb86fede18f8a37df36de47a332e2a5c2aa9d4', 'AR-u3-bernoulli-height-speed-05': '7d1edf7ef30af532fdb57fb8ec3cc3f05550ca0c951ae6299b33c5d6162bd5d6', 'AR-u3-bernoulli-height-speed-06': 'fdae18b695adf0f10e8d7b2767d88e52a12bf0d9c61ec7c9f55237b964dfb90c', 'AR-u3-bernoulli-height-speed-07': 'a8a0202b242d316d928d19b5955743b1dfd35c0a671ed4cbaec764832402016b', 'AR-u3-bernoulli-height-speed-08': '8a175207c956ec5c56f6c026f0687838cf392e9d36b941fa6ec3d43626d95c6e', 'AR-u3-bernoulli-height-speed-09': '0dcfa06ad0dad0aa9ea8b0619f0882914abfa83f0ae5f6eacf1a501352ce3a75', 'AR-u3-bernoulli-height-speed-10': 'e35207f4b7b5999a39e1fbd7c84f26f922181b32c38416e69e2a7cd22a6790d7', 'AR-u3-bernoulli-height-speed-11': 'fa899dec952d201c65a3b80fb03ee29838545715bf79f820b46086ea1f798465', 'AR-u3-bernoulli-height-speed-12': 'efb5c10176021f40e1d6d066a0573bc2f5f2b2d50784e2491f1128af9d5a25ea', 'AR-u3-bernoulli-height-speed-13': 'd7aa2500a1752dd81ea9c2635eb435caf4ff6be1c55711b5d14e945dcd66388f', 'AR-u3-bernoulli-height-speed-14': '5b51b48d7cdd06b8234160ca967ad288e2c394244b776ba32f71ee5282a0de39', 'AR-u3-bernoulli-height-speed-15': 'f781c9b45df0c397e1117ed373ccd6563fdcd94dc975ac3a32444d823239ae87', 'AR-u3-bernoulli-height-speed-16': '0d67ac064acd395014926cb729bca2c42ab2806b3400b2e0d6438f1b5b52e643'}
READ_SOURCE_SHA256={'u3-bernoulli-height-speed-01': '807907b9b862a23a9c1ef90c41b203e9c4883f2185ecbfe5e047f7733ac882ac', 'u3-bernoulli-height-speed-02': '36ce67c7970ccdb3c273939f34bfdd307e17921cbd7cd2595e4da1ba13a6b7bf', 'u3-bernoulli-height-speed-03': '1ecea2cfd130d62f4ff61ccfacf196f64fb86862a62d9ca057d4bafa305d84a8', 'u3-bernoulli-height-speed-04': '0d3410dfa485eb3e755e3873938875f8a9bb27953f61ffb2e986dcc5c0199c12', 'u3-bernoulli-height-speed-05': '5bd88733f8421c71eb837fa713a96a2d0dd5e75a772d69d9b8fd34dfa0fa2cb0', 'u3-bernoulli-height-speed-06': '51fa7b4e298fb2a3e7e60d538d498ac3c3b6ec1b80520842208a76041d7ff269', 'u3-bernoulli-height-speed-07': 'c7b95d69f432b0e866526bdd5b5a2e212ef105da1106086da2d2b8bf592d8622', 'u3-bernoulli-height-speed-08': '5f4de4623a72943522a5c7a9acf0ad58aef031a67083fd7173208054eaf03fd6', 'u3-bernoulli-height-speed-09': '581e739dd98bbe058ce654759fe63b62c018e46b2d0795203020998dd25836cd', 'u3-bernoulli-height-speed-10': 'cdb1ec0a2967621ab8029b7a5750040575d2e89bb17a0d712b2a6ca35da578df', 'u3-bernoulli-height-speed-11': '745b8a3e4dc6a956b58fe682c72f8bf9b06a69f610e65fb35aae55b304b23051', 'u3-bernoulli-height-speed-12': 'e2692bcdbb6fcd9aa45dd34236d4a96131083e4e4ee2baae27fb0ba66feb2111', 'u3-bernoulli-height-speed-13': 'b5adaa1ede2b402d0aa1ac31710aad6dc741f589aca942896c97c252e4c199e4', 'u3-bernoulli-height-speed-14': '134d981b472971584f9c823060b0b7c1f130054794c33bbcb1d51486fd61845e', 'u3-bernoulli-height-speed-15': 'b259652f95b080c2c71c41126ba82473c6840bdb2446b562311f0b13c0a7d4c8', 'u3-bernoulli-height-speed-16': '7af945344debae8c8e8c5dba8bfdb2150ef4cab20ae9578c2cd234c728d2e294'}
