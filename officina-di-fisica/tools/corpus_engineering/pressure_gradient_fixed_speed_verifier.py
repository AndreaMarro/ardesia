"""Independent U3-04 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-04.json'
FAMILY='pressure-gradient-fixed-speed'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L008'

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

@lru_cache(maxsize=1)
def oracle():

    eta,r,Q,G,v,k,l=sp.symbols('eta r Q G v k l',positive=True)
    # Eliminate Q between continuity (mean speed) and fully developed Poiseuille law.
    solved=sp.solve([sp.Eq(Q,sp.pi*r*r*v),sp.Eq(Q,sp.pi*r**4*G/(8*eta))],(Q,G),dict=True)[0]
    law=solved[G];inv=sp.solve(sp.Eq(G,law),eta)[0];invr=sp.solve(sp.Eq(G,law),r)[0]
    ratio=sp.simplify(law.subs({eta:k*eta,r:l*r})/law)
    unique([G*r*r/(8*v),8*G*v/r**2,G*r/(8*v),8*v/(G*r*r),G*r*r/v],inv)
    unique([k/l**2,k*l**2,k/l**4,k*k/l,l*l/k],ratio)
    # eta inputs are mPa*s, r inputs mm, speed is 1/100 m/s.
    f=lambda visc,radius:law.subs({eta:visc/1000,r:radius/1000,v:sp.Rational(1,100)})
    first,second=f(sp.Integer(1),sp.Integer(1)),f(sp.Integer(2),sp.Integer(2))
    gain,offset=calibrate(first,second,161,81);C=(321-offset)/gain
    if (gain,offset,C)!=(2,1,160):raise ValueError('Independent pressure affine calibration failed')
    if (first+second)/2-f(sp.Rational(3,2),sp.Rational(3,2))!=sp.Rational(20,3):raise ValueError('Independent gradient mean failed')
    x=sp.Symbol('x',positive=True);roots=sp.solve(sp.Eq(first,f(x,x)),x)
    if roots!=[1]:raise ValueError('Independent pressure constrained inverse failed')
    u=SI.Quantity
    if (8*u(1,'mPa*s')*u(Fraction(1,100),'m/s')/u(1,'mm')**2).to('Pa/m').magnitude!=80:raise ValueError('Independent pressure SI conversion failed')
    if u(1,'mPa*s/mm').to('Pa*s/m').magnitude!=1:raise ValueError('Independent pressure constraint units failed')
    re=(u(1,'kg/m**3')*u(1,'m/s')*u(1,'m')/u(1,'Pa*s')).to('')
    if re.magnitude!=1:raise ValueError('Independent Reynolds dimensional proof failed')
    # Mass conservation and incompressibility are independent of viscosity.
    density,volume,mass=sp.symbols('density volume mass',positive=True)
    if sp.solve(sp.Eq(mass,density*volume),density)[0]!=mass/volume:raise ValueError('Independent incompressibility proof failed')
    visc=lambda grad,radius:inv.subs({G:grad,r:radius/1000,v:sp.Rational(1,100)})*1000
    return [first,'Pa/m','La densità di ciascun elemento materiale resta costante; la viscosità può essere non nulla','Da 80 a 160 Pa/m',visc(80,sp.Integer(1)),invr.subs({G:80,eta:sp.Rational(1,1000),v:sp.Rational(1,100)})*1000,f(sp.Integer(1),sp.Integer(2))/first,'1','η = G r² / (8 v̄)','κ₁ / κ₂²',second/first,(first+second)/2,sp.Integer(2),visc(120/(240/first),sp.Integer(2)),visc(C,sp.Integer(1)),roots[0]]

MANUAL=['Q=πr²v̄ e Q=πr⁴G/(8η) danno G=8ηv̄/r². Conversioni: η=10⁻³ Pa·s, v̄=10⁻² m/s e r²=10⁻⁶ m². Pertanto G=8·10^(−3−2+6)=80 Pa/m. Il gradiente orientato dp/dx=−80 Pa/m è distinto dal modulo.', 'G è caduta di pressione su lunghezza, unità Pa/m e dimensione ML⁻²T⁻². Anche ηv̄/r² dà Pa/m. Nessun calcolo numerico autonomo richiesto.', 'Massa di elemento materiale costante e incomprimibilità impongono volume e densità costanti lungo il moto. Non impongono η 0, né pressione o velocità spazialmente uniformi. Nessun calcolo numerico autonomo richiesto.', 'η=1→2 a r 1 e v̄ fissi: G 80→160 Pa/m. Area invariata, quindi Q invariata soltanto in questo confronto.', 'η=Gr²/(8 v̄)=80·10⁻⁶/(8·10⁻²)=10⁻³ Pa·s=1 mPa·s.', 'r²=8 ηv̄/G=10⁻⁶ m². Radice positiva r 10⁻³m=1 mm; r² non raggio.', 'r 1→2 mm a η fissa: G scala 1/4,80→20 Pa/m; Q cresce 4 perchév̄ fissa. La quarta potenza inversa richiederebbe Q fissa.', '[ρv̄D]=(kg/m³)(m/s)m=kg/(m·s)=[η]. Re puro 1, senza calcolo numerico autonomo o soglia di transizione.', 'Moltiplicare G=8 ηv̄/r² per r² e dividere 8 v̄: η=Gr²/(8 v̄), unità Pa·s in SI. Per valori η in mPa·s e r inmm: η_num=G_num r_num²/80.', 'η_B=κ₁η_A, r_B=κ₂r_A a v̄ fissata danno rapporto κ₁/κ₂².', 'η 2, r 2: G=80·2/4=40 Pa/m; rapporto 1/2.', 'Media(80+40)/2=60 Pa/m. Ingressi medi η 3/2, r 3/2 danno 80·(3/2)/(9/4)=160/3; differenza 60−160/3=20/3.', 'Target 40 Pa/m con η 2: (r_B/r_A)²=2/(1/2)=4, radice positiva 2.', 'Gain 240/80=3 m/Pa. S_B 120→G 40 Pa/m; r=2 mm, η=40·4/80=2 mPa·s.', 'Gain(161−81)/(80−40)=2 m/Pa, z 1. S_C 321→G 160 Pa/m; r=1 mm richiede η=2 mPa·s.', 'c 1 mPa·s/mm=1 Pa·s/m. Sostituire η=cr dà G=8 cv̄/r; r=(8/100 Pa)/(80 Pa/m)=10⁻³m=1 mm. η=1 mPa·s, unica soluzione positiva; nessuna radice residua.']
DISTRACTORS=['−80 Pa/m è il gradiente orientato, mentre G è un modulo. 8000 e 0,08 risultano da prefissi o quadrati convertiti in modo incoerente.', 'Pa è caduta di pressione; N forza; m/s velocità; Pa·s viscosità. G e Δp differiscono per una lunghezza.', 'η=0 è ipotesi inviscida. Pressione uniforme e profilo piatto non seguono dall’incomprimibilità; volume materiale fisso non impedisce la traslazione.', '40 usa la viscosità al denominatore, 320 ne quadra il fattore. 80 o zero non mantengono la velocità media assegnata.', '10⁻³ è il valore in Pa·s, non in mPa·s. Il quadrato del millimetro introduce 10⁻⁶ nelle unità SI.', '1 mm² esprime r², non il raggio. La radice negativa è incompatibile con la geometria.', '4 inverte il verso della dipendenza. 1/16 varrebbe a portata imposta; 1/2 perde il quadrato e 1 ignora la modifica del raggio.', 'Pa, m/s, kg/m³ e Pa·s sono unità dimensionali. La cancellazione delle unità di Re non prova che il regime sia laminare.', 'Rimettere r² sotto inverte l’isolamento; un solo r perde una lunghezza. La frazione reciproca è 1/η; perdere otto sovrastima la viscosità di otto volte.', 'Il prodotto inverte l’effetto del raggio. La quarta potenza corrisponde a un controllo diverso, Q imposta. Il quadrato di η è errato e l’ultima scelta è il reciproco.', '2 considera solo η; 1/4 solo il raggio;  1/8 usa r⁴. 40 è il valore finale numerico del gradiente, non il rapporto.', '120 è la somma; 30 dimezza ancora; 160/3 applica il modello agli ingressi medi. 40 è sia la seconda lettura sia la differenza.', '1/2 è il reciproco; 4 è il rapporto dei quadrati. 3/2 darebbe G_B/G_A=8/9; 1 ignora il cambio geometrico.', 'Usare direttamente S=120 come Pa/m inferisce η=6 mPa·s. Prima si corregge la taratura, poi si applica l’inversa fisica.', 'Viscosità 1,4,1/2,3 mPa·s generano letture 161,641,81,481. Solo 2 mPa·s genera 321.', 'Zero è fuori dominio; un raggio negativo imporrebbe anche viscosità negativa. Il vincolo vale fra prove, senza variazione di viscosità lungo il tubo.']
ASSUMPTIONS=['Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.', 'Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.']
UNITS={1: 'Pa/m', 2: 'Pa/m', 3: '', 4: 'Pa/m', 5: 'mPa*s', 6: 'mm', 7: '', 8: '', 9: 'mPa*s', 10: '', 11: '', 12: 'Pa/m', 13: '', 14: 'mPa*s', 15: 'mPa*s', 16: 'mm'}
NUMERIC_UNITS={1: 'Pa/m', 5: 'mPa·s', 6: 'mm', 14: 'mPa·s', 16: 'mm'}
SUFFIX={12: ' Pa/m', 15: ' mPa·s'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 8: 'NO_STUDENT_CALCULATION'}
SVG_REVIEW='XML e rendering completo letti. Raggi disegnati di 40 e 80 px a 40 px/mm per raggi fisici di 1 e 2 mm. Segmenti radiali e due frecce esterne delle velocità medie, lunghe 100 px a 10000 px/(m/s), non un profilo uniforme. Barre di area normalizzata lunghe 80 e 320 px a 80 px per unità: rapporto quattro e stessa scalatura di Q. Grafico della pressione assoluta meno 99900 Pa, origine (100,1540), asse x a 300 px/m e verticale a 3 px/Pa. Ingresso (100,1240) pari a 100000 Pa; uscite (400,1480) e (400,1300) pari a 99920 e 99980 Pa. Pendenze −80 e −20 Pa/m, moduli 80 e 20 Pa/m, offset esplicito.'

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
        if row.get('course')!='C2' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
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


CANDIDATE_REF='22ce296b900b571eb8cceed138c4255908569869'
SOURCE_READING='All80 original U3-04 prompts in B112–116 individually read from pinned Git source and derivations persisted before candidate packages were opened. No numeric result or key was handed off before source-first derivation for this family. All16 final candidates, every option, formula, hint, feedback and figure caption read in full; scientific SVG XML and full native rendering read. Never imports candidate authoring. Real C2-L005/L006/L007/L008/L009 lessons reread during this U3-04 work.'
REVIEWED_PACKAGE_SHA256='9dffb9c8dadf490d92205c047d0f3a1abc2367f083bdbd03f39139a1880f8c18'
REVIEWED_BINDINGS_SHA256='65b8bbe7fe3090e431db60f31c45f52dfbc415c8525b1ae1f95ecea98b9fd775'
REVIEWED_CANDIDATES={'AR-u3-pressure-gradient-fixed-speed-01': 'ed29d49711b06af4bd29c37bed9c0a4ab989c99687e4fb4b17ee4f73e00fef1a', 'AR-u3-pressure-gradient-fixed-speed-02': 'a5754c14c4015e63fb0fbac56ed53cf030a557769dc902ca623162a78c7af601', 'AR-u3-pressure-gradient-fixed-speed-03': '2625eb307641ea42697e69f9cbe08608d8211e56ceb26ce6bb3a7ea747dedce5', 'AR-u3-pressure-gradient-fixed-speed-04': '7380c4fc153d86fb9a0a0dd65b2639179027e227e2581c201d28225f29292822', 'AR-u3-pressure-gradient-fixed-speed-05': '531e664bec05f4297ac0dbc4d7aae17a7695776fa97289f48bcebac3f351c264', 'AR-u3-pressure-gradient-fixed-speed-06': '09e60ea744e6c9d810b709bb5276c89395f43ace82d9ad79abf36324faab9665', 'AR-u3-pressure-gradient-fixed-speed-07': '47c7ca0c17bb41c8da6da89b5454e37f396d58df30584bedcfabf48b9be92483', 'AR-u3-pressure-gradient-fixed-speed-08': '8857c050d91797dabd1f45ffdd00b6f53f841ed9413854c9dc2238707cb4f4a0', 'AR-u3-pressure-gradient-fixed-speed-09': '19e339e9082e4fd996ac8dd0249c2d01ca64a04aaac3e116d5c854401e2823d8', 'AR-u3-pressure-gradient-fixed-speed-10': 'cc7bfef34b2e52d578977e39e692ce90b139e63c74916dc2953ef2822195f92f', 'AR-u3-pressure-gradient-fixed-speed-11': '05b76542b1a4ab4272b2f710b98e7fce97c5eadc0f191e7670fb7551e2fad7c0', 'AR-u3-pressure-gradient-fixed-speed-12': '4e07e00dcea8f0ca1896e85f7a1531bb3c62f0aa05f280483d49d15738f0f011', 'AR-u3-pressure-gradient-fixed-speed-13': '40b5376319da3ef39d1b33600c24e68440edfb1ecdc22be01b31d048f05b6c66', 'AR-u3-pressure-gradient-fixed-speed-14': 'fdd99fef1149c6f20ed9da9f80a603acfdafa1fef350003427e0097ec445a98a', 'AR-u3-pressure-gradient-fixed-speed-15': '7f5ea2c9719f6c5e95fede63f026d49112c52ada6733e490ac36ede15a40a581', 'AR-u3-pressure-gradient-fixed-speed-16': '67220b329c8bb1534c7b34850fe071c01a8205e723ab33c1b6c2df9347459748'}
READ_SOURCE_SHA256={'u3-pressure-gradient-fixed-speed-01': 'f20e95bdc078ceaf0a9acbd4ec695f2e4080bb9273c00dc284037ba2562bbb78', 'u3-pressure-gradient-fixed-speed-02': '905fff01fb813cd1ba520e3dd061c7971d4a9e38934c8cb89fe2bf038b5888a2', 'u3-pressure-gradient-fixed-speed-03': '32f68414554199f5108b678906b43e04801bde9164f4a36bf78f6c05511a20f7', 'u3-pressure-gradient-fixed-speed-04': 'f5df5b10626dff39f19654d3d979ca5af0e7b9c2efdbbf3e2b908423497ad151', 'u3-pressure-gradient-fixed-speed-05': '5aa45fdc0c505a5a35ec26cf9af437a976afc68d0e16924e7bb0fb5b71430106', 'u3-pressure-gradient-fixed-speed-06': 'cf867ccebf85ef8067a91ef4f39e4d31e70be6388edfadfb9f583689870682fe', 'u3-pressure-gradient-fixed-speed-07': 'fa4d08a924474aa0261145c5b456955ff6c3e1a9bce87d7968a294e7e0934554', 'u3-pressure-gradient-fixed-speed-08': 'fa1abfdac1dd5f7d5821815a817d28a2221ba8666261c9a8b8fb7e09760f00b5', 'u3-pressure-gradient-fixed-speed-09': '2cca8f35f5cbfb68c746fb4793a9c0ec5278490e205b82deb6c209a6404f5ba7', 'u3-pressure-gradient-fixed-speed-10': '21dd07ba4a29c9d80aff9a9bdd27469621c5bb56b76ff887ca996503f2d01fcb', 'u3-pressure-gradient-fixed-speed-11': 'e32cfc4419e386d4db0e27c553dea723d68257d76b86329eb234c93f34fc31f7', 'u3-pressure-gradient-fixed-speed-12': 'a7729fe4c3f588d9d937d25f8ad24460c9bd6b16be3c19420277f7a08d0e45e2', 'u3-pressure-gradient-fixed-speed-13': '73c8a480e4af9ea71c4540a7d3499c5745c8578fab6a52ebf0969e879d4f4c9c', 'u3-pressure-gradient-fixed-speed-14': '750c0658bfb5378def2a930914d81a379b79cecc90eda67319299af982c0c591', 'u3-pressure-gradient-fixed-speed-15': '80c0e1d88d574c1d98ac21fcda8b9022a68112c1d1c5b8555187d233fcfac465', 'u3-pressure-gradient-fixed-speed-16': 'af5928066c9be77d7837c3669592b77fc1197bd362640b7a0647534ffb8bdd79'}
