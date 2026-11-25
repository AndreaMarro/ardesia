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
FAMILY='venturi-area-ratio'
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
    rho,r,v,V,P=sp.symbols('rho r v V P',positive=True)
    p1,p2=sp.symbols('p1 p2',real=True)
    velocity_two=sp.solve(sp.Eq(v*r,V),V)[0]
    law=sp.solve(sp.Eq(p1+rho*v*v/2,p2+rho*velocity_two**2/2),p1)[0]-p2
    inverse_r=sp.sqrt(sp.solve(sp.Eq(P,law),r*r)[0])
    inverse_v=sp.sqrt(sp.solve(sp.Eq(P,law),v*v)[0])
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.factor(law.subs({r:k*r,v:l*v})/law)
    target_ratio=l*l*(k*k*r*r-1)/(r*r-1)
    if sp.simplify(law-rho*v*v*(r*r-1)/2)!=0 or sp.simplify(ratio-target_ratio)!=0:raise ValueError('Independent Venturi continuity/Bernoulli derivation failed')
    for opts,want in [([sp.sqrt(1+2*P/(rho*v*v)),sp.sqrt(2*P/(rho*v*v)),1+2*P/(rho*v*v),sp.sqrt(1-2*P/(rho*v*v)),-sp.sqrt(1+2*P/(rho*v*v))],inverse_r),
                      ([target_ratio,k*k*l*l,l*(k*k*r*r-1)/(r*r-1),1/target_ratio,k/l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Venturi symbolic alternatives not unique as general laws')
    F=lambda area_ratio,speed:sp.simplify(law.subs({rho:1000,r:area_ratio,v:speed})/1000)
    first,second=F(2,2),F(3,4)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*first+z,13),sp.Eq(q*second+z,129)],(q,z))
    C=(33-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,16):raise ValueError('Venturi affine calibration failed')
    if (first+second)/2-F(sp.Rational(5,2),3)!=sp.Rational(91,8):raise ValueError('Venturi nonlinear mean distinction failed')
    x,y=sp.symbols('x y',real=True)
    roots_y=sp.solve(sp.Eq(y*y-y-12,0),y)
    roots_x=sp.solve(sp.Eq(x**4-x*x-12,0),x)
    if roots_y!=[-3,4] or roots_x!=[-2,2]:raise ValueError('Venturi quartic real branches failed')
    if not (2>1 and F(2,2)==6):raise ValueError('Venturi physical branch filter failed')
    # Candidate fixes downstream static pressure, not upstream: all drops keep p1>100.
    if any(100+F(a,b)<=100 for a,b in [(2,2),(3,2),(2,4),(3,4)]):raise ValueError('Venturi absolute-pressure convention failed')
    u=SI.Quantity
    drop=(u(1000,'kg/m**3')*(u(4,'m/s')**2-u(2,'m/s')**2)/2).to('kPa')
    ratio_square=(1+2*u(6,'kPa')/(u(1000,'kg/m**3')*u(2,'m/s')**2)).to('')
    speed_square=(2*u(6,'kPa')/(u(1000,'kg/m**3')*(u(2,'')**2-1))).to('m**2/s**2')
    gain=(u(18,'')/drop).to('1/kPa')
    constrained_r=(u(1,'s/m')*u(2,'m/s')).to('')
    if (drop.magnitude,ratio_square.magnitude,speed_square.magnitude,gain.magnitude,constrained_r.magnitude)!=(6,4,4,3,2):raise ValueError('Pint Fraction Venturi dimensions failed')
    return [first,'kPa','Il contributo cinetico cresce e la somma di Bernoulli si conserva','Da6 a16 kPa',inverse_r.subs({P:6000,rho:1000,v:2}),inverse_v.subs({P:6000,rho:1000,r:2}),F(2,4)/first,12-first,'r = √(1 + 2Δp/(ρv₁²))','κ₂² D_B / D_A',second/first,(first+second)/2,sp.Integer(2),inverse_r.subs({P:64000,rho:1000,v:4}),inverse_r.subs({P:C*1000,rho:1000,v:2}),roots_x[1]]


MANUAL=['Continuità A₁v₁=A₂v₂ dà v₂=rv₁=4 m/s. Bernoulli orizzontale: Δp=ρ(v₂²−v₁²)/2=1000·12/2 Pa=6 kPa. Nel candidato p₂=100 kPa assoluti e p₁=106 kPa.', 'ρv² ha dimensione M/(LT²); r²−1 è puro. La differenza statica è una pressione in kPa. Nessun calcolo numerico autonomo necessario per il solo riconoscimento dimensionale.', 'Con A₂<A₁ e flusso comune, v₂>v₁. L’aumento ρ(v₂²−v₁²)/2 è compensato dalla diminuzione di p statica: p+ρv²/2 resta costante. Nel modello senza perdite non è calore dissipato.', 'v₁=2 m/s fisso, r da 2 a 3 dà v₂ da 4 a 6 m/s. Differenze dei quadrati 12 e 32 m²/s²; Δp da 6 a 16 kPa.', 'r²=1+2Δp/(ρv₁²)=1+12000/4000=4. Rami ±2; rapporto di aree positivo e maggiore di uno seleziona r=2.', 'v₁²=2Δp/[ρ(r²−1)]=12000/(1000·3)=4 m²/s². v₁=2 m/s nel verso assegnato; v₂=4 m/s è una diversa grandezza.', 'r=2 fisso, v₁ da 2 a 4 m/s: Δp da 6 a 24 kPa, rapporto 4. Con p₂=100, p₁ da 106 a 124 kPa.', 'Corretto 6 kPa, proposta 12: scarto +6 kPa. Dimenticare il fattore 1/2 nella pressione produrrebbe la proposta.', 'r²−1=2Δp/(ρv₁²); aggiungere uno e prendere radice positiva dà r=√(1+2Δp/(ρv₁²))>1. L’argomento è puro e maggiore di uno.', 'D_A=r_A²−1 e D_B=(κ₁r_A)²−1, entrambi positivi. La velocità scala con κ₂ ma la sua energia con κ₂²: rapporto κ₂²D_B/D_A, non κ₁²κ₂².', 'A: (v₁²/2)(r²−1)=2·3=6 kPa. B: 8·8=64 kPa, rapporto 64/6=32/3.', 'Media (6+64)/2=35 kPa. Ingressi medi r=5/2,v₁=3 m/s danno (9/2)(21/4)=189/8 kPa; differenza 35−189/8=91/8 kPa.', 'Target (32/3)·6=64 kPa. Con r=3, energia iniziale per volume richiesta 8 kPa; v₁,B²=16→v₁,B=4 m/s. Rapporto a 2 uguale 2.', 'q=18/(6 kPa)=3 kPa⁻¹. S_B=192→Δp_B=64 kPa; v₁=4 m/s dà contributo 8 kPa, quindi r_B²=1+64/8=9 e r_B=3.', 'Riferimenti 6,64 kPa con letture 13,129: q=116/58=2 kPa⁻¹, offset 1. S_C=33→16 kPa; v₁=2→r_C²=1+16/2=9, r_C=3.', 'Vincolo r=(1 s/m)v₁. x=v₁/(1 m/s)>1; dato 6 kPa porta x⁴−x²−12=0. Con u=x²: (u−4)(u+3)=0. u=−3 non genera x reali; u=4 dà x=±2, ma solo x=2 soddisfa v₁>0 e r>1.']
DISTRACTORS=['2 e 8 sono singoli contributi cinetici; 12 omette 1/2. Accelerazione ideale non prova dissipazione.', 'm/s velocità, m²/s² energia per massa, N forza e 1 puro. Serve la densità per ottenere pressione.', 'Attrito escluso; portata non scompare; quota uguale e velocità maggiore; somma totale non si annulla.', '9 scala r linearmente; 27/2 usa r² senza il meno uno; 6 ignora il cambio; 4 applica effetto inverso.', '−2 non rapporto di aree positive; 4 è r²; senza uno si perde contributo cinetico iniziale.', '4 m/s è v₂; −2 viola verso; r>1 e Δp>0 garantiscono radicando positivo.', '2 linearità in velocità, 1/4 reciproco quadratico, 1/2 reciproco lineare, 1 invarianza falsa.', '−6 ordine invertito; 12 proposta; 0 accetta; 3 metà scarto. La differenza di pressioni non somma le energie cinetiche.', 'Senza uno manca velocità iniziale; senza radice si dà r²; meno dentro radice può essere non reale; radice negativa non r>1.', 'κ₁²κ₂² scalerebbe anche il termine uno, κ₂ senza quadrato errato, reciproco scambia, κ₁/κ₂ non segue dalla differenza.', '3/32 reciproco; 4 sola velocità, 8/3 sola geometria, 64 Δp_B numerica.', '70 somma; 35/2 metà aggiuntiva; 189/8 ingressi medi; 58 differenza.', '1/2 reciproco; 4 rapporto dei quadrati; 32/3 pressione bersaglio; 8/3 solo geometria.', 'S=192 presa come kPa dà r²=1+192/8=25 e r=5. Corretto p₁=164,p₂=100 kPa assoluti.', 'r=2,4,5 a v₁=2 danno letture 13,61,97. r=1 limite senza restringimento, fuori dominio, non risposta.', '−2 reale algebrico ma r negativo; u=−3 non produce x reale. Il ramo x=2 ricostruisce r=2 e Δp=6 kPa. Il testo finale esplicita u=−3, non l’espressione u−3.']
ASSUMPTIONS=['Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.', 'Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.']
UNITS={1: 'kPa', 2: 'kPa', 3: 'kPa', 4: 'kPa', 5: '', 6: 'm/s', 7: '', 8: 'kPa', 9: '', 10: '', 11: '', 12: 'kPa', 13: '', 14: '', 15: '', 16: 'm/s'}
NUMERIC_UNITS={1: 'kPa', 5: '1', 6: 'm/s', 14: '1', 16: 'm/s'}
SUFFIX={8: ' kPa', 12: ' kPa'}
SVG_REVIEW='XML e rendering completo letti. Canale rettangolare di profondità fuori foglio 1 cm, altezze 4/2 cm: 200/100 px a 50 px/cm, aree 4/2 cm² e r=2. Frecce distinte di 80/160 px a 40 px/(m/s) per v₁=2,v₂=4 m/s. Pressioni statiche assolute 106 e 100 kPa; cinetiche 2 e 8. Barre a 4 px/kPa: 424+8=432 px e 400+32=432 px, somma 108 kPa in entrambe le sezioni. Nessuna confusione fra scala geometrica, velocità e pressione.'

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

CANDIDATE_REF='6a708c5cc4960fd7fb262397c581caace10881bb'
SOURCE_READING='All 80 original U3-03 prompts in these five families individually read and solved before opening candidate packages. Disclosure: prior author handoff already exposed 104-06 equal ranges and doubled A speed, plus qualitative information about radicals, a quartic and renamed h/H. These facts independently rederived from source models; no claim of wholly blind key reading for 104-06. All 16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing. Never imports candidate authoring; real C2-L005/L006 lessons reread.'
REVIEWED_PACKAGE_SHA256='c24fbaafee0145c4fba731c5fb589ff9d4f80a1bd6d2b50474fe494fb01be96b'
REVIEWED_BINDINGS_SHA256='1a0b6b112142072f3e8e07bc94a40400169a4be9dcc128e29e1c85ea10e910e3'
REVIEWED_CANDIDATES={'AR-u3-venturi-area-ratio-01': 'e9cbacd14e7ec1006c1d858cf9763a255ffc83d43e7463cf3d2f6e9c6c8ec399', 'AR-u3-venturi-area-ratio-02': '507b8848da6ea77cb191288d14fbbf341fe83df3317d99b13719ea7dc9679c61', 'AR-u3-venturi-area-ratio-03': '12b1af0e47ff04d253733a2efe37112e04f163f62a9cb2e69e89645fdf6547b1', 'AR-u3-venturi-area-ratio-04': 'd94f7cb754a02c1d1927cf475bc791c52064dcbb43d01bf01786126aa4a277a2', 'AR-u3-venturi-area-ratio-05': 'de6430f42451a70029735cd4869cace7453108855e2303f0ade9c269b3154d67', 'AR-u3-venturi-area-ratio-06': 'dbff724293ffed44275ccdf4edcfa5db3568949d1f8c4a21a9c5bd168d074ad1', 'AR-u3-venturi-area-ratio-07': 'ca4c3f2370da4e3169dfb688ccf1428458ae813fab439e37380b18f5de063f77', 'AR-u3-venturi-area-ratio-08': '904735fe0c983975e9e20cc26a1f503b50d93e48842319ef7b3ec27a5306a2d6', 'AR-u3-venturi-area-ratio-09': '66d01d3c881f57090c0702abaf923e113ada6d3f00b7c87f44ae3128b6ef4bc1', 'AR-u3-venturi-area-ratio-10': 'df158e380e76138e04eb4e646780c644f66f813fc597c3c3c2e9c234c88c74fd', 'AR-u3-venturi-area-ratio-11': '0108a51a6af2271e6f5759806ee131ce8667109d84ea2eca1253093002263576', 'AR-u3-venturi-area-ratio-12': '95c397ff1d312d39254175fec7679e3c923b68bdf7b747887bc2b93d926858cb', 'AR-u3-venturi-area-ratio-13': '99aed0c3afb22a35f3b6fc4b7bd32942648a6cb73c4b17ea9f68a8b30010d111', 'AR-u3-venturi-area-ratio-14': '7730529b8433080d178ffea8ac5bef4551519142b1f372d33cf3c6007b4fa610', 'AR-u3-venturi-area-ratio-15': '0192ee879be038de768888ff894ad5158c2bdf8063a5d914bca2b2fcc2eedf40', 'AR-u3-venturi-area-ratio-16': 'f91cd8369e5ef28f592468eb8f0ae4e5af167f8bead7dc1a987f5cfa6bc64f8f'}
READ_SOURCE_SHA256={'u3-venturi-area-ratio-01': '557f39a2df4f41902ae7141efa791f9283a74fb137f028cfa34626666ef83de9', 'u3-venturi-area-ratio-02': 'dba33f116e3456b8b327cbacee13594a0e5165ee92d109b43bbf227a33676cdf', 'u3-venturi-area-ratio-03': 'df180301dbd7407f274cb7ef73ac2193781567965f42f4235d43d9e8e132a8d5', 'u3-venturi-area-ratio-04': '52685c5146170783c16fd885a16e09c1e16a8595c5ecffa4d3785ec55a43115d', 'u3-venturi-area-ratio-05': 'ebc5164763c70a877c3f7872f33d5c4af1556b9bffe1157225bea6a74064ae27', 'u3-venturi-area-ratio-06': 'f0e29a66b73dbf051a5b4ae614f1942306a9faa281b4ffcbf6b86daf24349070', 'u3-venturi-area-ratio-07': '79ac7492d1a3ab68cb58e97937ed52a4fe2ee7e88a2e6d27061fb0ffc1fc8c55', 'u3-venturi-area-ratio-08': 'de171b35617c578bff201b52fbc95f8ab2e9cbb1e443b4fdbfb78f4b7e997976', 'u3-venturi-area-ratio-09': '84d19b2a3707fc34c244b5fc725eac4e568083961af973e427f363834a31fa33', 'u3-venturi-area-ratio-10': '86791f26f21098d98a64375fba2de87afe36f1f14bd991d3a039645607f25f89', 'u3-venturi-area-ratio-11': 'ac7163866f3ed5fc20eb04296dd676851179d6f265ccaf022ed735a42bbc9ee8', 'u3-venturi-area-ratio-12': '48fdd243eefbb91b70e9b162cf86bff3f18f3080ccdbf6584033e5d8d3acbf19', 'u3-venturi-area-ratio-13': '4a0e8a8855ce3b3e1b746656fc3ffbdafc8e5974643ae2823f11cdf8c35192ab', 'u3-venturi-area-ratio-14': '7459169bf2d12e65c9bc56566cb99c162d0b5bacee24b4757cb6d140c69964e8', 'u3-venturi-area-ratio-15': '9a476de7619bc32f9a903c89cd4e03540a44fccf15552ab9bd734130b6639470', 'u3-venturi-area-ratio-16': '24a829793931dc6f3819dd2ec08b5c05aa5a9084cb53ddd47f12661ef22a2201'}
